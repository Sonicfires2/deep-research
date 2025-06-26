// app/api/sse/route.ts
import { NextResponse, type NextRequest } from "next/server";
import DeepResearch from "@/utils/deep-research";
import { multiApiKeyPolling } from "@/utils/model";
import {
  getAIProviderBaseURL,
  getAIProviderApiKey,
  getSearchProviderBaseURL,
  getSearchProviderApiKey,
} from "../utils";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const preferredRegion = [
  "cle1", "iad1", "pdx1", "sfo1",
  "sin1", "syd1", "hnd1", "kix1",
];

// 1) Preflight handler
export function OPTIONS(_: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// 2) Main SSE handler
export async function POST(req: NextRequest) {
  const {
    query,
    provider,
    thinkingModel,
    taskModel,
    searchProvider,
    language,
    maxResult,
    enableCitationImage = true,
    enableReferences = true,
  } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: async (controller) => {
      // initial infor event
      controller.enqueue(
        encoder.encode(
          `event: infor\ndata: ${JSON.stringify({
            name: "deep-research",
            version: "0.1.0",
          })}\n\n`
        )
      );

      const deepResearch = new DeepResearch({
        language,
        AIProvider: {
          baseURL: getAIProviderBaseURL(provider),
          apiKey: multiApiKeyPolling(getAIProviderApiKey(provider)),
          provider,
          thinkingModel,
          taskModel,
        },
        searchProvider: {
          baseURL: getSearchProviderBaseURL(searchProvider),
          apiKey: multiApiKeyPolling(getSearchProviderApiKey(searchProvider)),
          provider: searchProvider,
          maxResult,
        },
        onMessage: (event, data) => {
          // enqueue each SSE event
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            )
          );

          // auto-close on final-report
          if (event === "progress" &&
              data.step === "final-report" &&
              data.status === "end") {
            controller.close();
          }
        },
      });

      req.signal.addEventListener("abort", () => controller.close());

      try {
        await deepResearch.start(query, enableCitationImage, enableReferences);
      } catch (err) {
        console.error(err);
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",

      // 💥 CORS headers on the actual response
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}