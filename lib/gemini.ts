import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getGeminiModelName, getGoogleApiKey } from "@/lib/env";

type MessageContentPart = {
  text?: string;
  type?: string;
  [key: string]: unknown;
};

export function getGeminiModel() {
  const googleApiKey = getGoogleApiKey();

  return new ChatGoogleGenerativeAI({
    model: getGeminiModelName(),
    temperature: 0.2,
    maxOutputTokens: 1800,
    apiKey: googleApiKey
  });
}

export function messageContentToString(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        const typedPart = part as MessageContentPart;
        if (typeof typedPart.text === "string") {
          return typedPart.text;
        }

        return JSON.stringify(part);
      })
      .join("\n");
  }

  if (content == null) {
    return "";
  }

  return String(content);
}
