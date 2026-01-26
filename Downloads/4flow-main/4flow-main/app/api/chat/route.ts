import { streamText, UIMessage, convertToModelMessages } from "ai";
import { z } from "zod";
import { createClient } from "v0-sdk";

const v0 = createClient({
  apiKey: process.env.V0_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: {
    messages: UIMessage[];
    model: string;
    webSearch: boolean;
  } = await req.json();

  const result = streamText({
    model: webSearch ? "perplexity/sonar" : model || "openai/gpt-4o",
    messages: convertToModelMessages(messages),
    system:
      "You are a helpful assistant that can answer questions and help with tasks",
    tools: {
      generate_ui: {
        description: "Generate a UI component based on a prompt",
        inputSchema: z.object({
          prompt: z.string().describe("The description of the UI to generate"),
        }),
        execute: async ({ prompt }) => {
          const result = await v0.chats.create({
            system: "You are an expert coder",
            message: prompt,
            modelConfiguration: {
              modelId: "v0-1.5-sm",
              imageGenerations: false,
              thinking: false,
            },
          });

          if ("latestVersion" in result) {
            return {
              demo: result.latestVersion?.demoUrl,
              webUrl: result.webUrl,
            };
          }

          return {
            demo: null,
            webUrl: null,
          };
        },
      },
    },
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
