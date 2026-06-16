import { getGeminiModel, messageContentToString } from "@/lib/gemini";
import { isFastMode } from "@/lib/env";

type QuestionObject = {
  questions?: unknown;
  subQuestions?: unknown;
};

function stripMarkdownFences(input: string): string {
  return input
    .replace(/```(?:json|JSON)?/g, "")
    .replace(/```/g, "")
    .trim();
}

function cleanQuestion(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  const cleaned = input
    .replace(/^\s*[-*\u2022]\s*/u, "")
    .replace(/^\s*\d+[\).\]:-]\s*/, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();

  if (!cleaned) {
    return "";
  }

  return cleaned.endsWith("?") ? cleaned : `${cleaned}?`;
}

function fallbackQuestions(topic: string): string[] {
  return createFastSubQuestions(topic);
}

export function createFastSubQuestions(topic: string): string[] {
  return [
    `What is the current state and background of ${topic}?`,
    `What are the main opportunities, risks, and challenges related to ${topic}?`,
    `What future trends, implications, and recommendations are emerging around ${topic}?`
  ];
}

function coerceQuestions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(cleanQuestion).filter(Boolean);
  }

  if (value && typeof value === "object") {
    const objectValue = value as QuestionObject;
    if (Array.isArray(objectValue.questions)) {
      return objectValue.questions.map(cleanQuestion).filter(Boolean);
    }

    if (Array.isArray(objectValue.subQuestions)) {
      return objectValue.subQuestions.map(cleanQuestion).filter(Boolean);
    }
  }

  return [];
}

function exactlyThree(questions: string[], topic: string): string[] {
  const seen = new Set<string>();
  const cleaned = questions
    .map(cleanQuestion)
    .filter(Boolean)
    .filter((question) => {
      const key = question.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  for (const fallback of fallbackQuestions(topic)) {
    if (cleaned.length >= 3) {
      break;
    }

    if (!seen.has(fallback.toLowerCase())) {
      cleaned.push(fallback);
      seen.add(fallback.toLowerCase());
    }
  }

  return cleaned.slice(0, 3);
}

function tryParseJson(candidate: string): unknown | null {
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function lineBasedExtraction(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*\u2022]|\d+[\).\]:-]/u.test(line))
    .map(cleanQuestion)
    .filter(Boolean);
}

export function parseSupervisorQuestions(raw: string, topic: string): string[] {
  const stripped = stripMarkdownFences(raw);

  const direct = tryParseJson(stripped);
  const directQuestions = coerceQuestions(direct);
  if (directQuestions.length > 0) {
    return exactlyThree(directQuestions, topic);
  }

  const arrayMatch = stripped.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    const arrayQuestions = coerceQuestions(tryParseJson(arrayMatch[0]));
    if (arrayQuestions.length > 0) {
      return exactlyThree(arrayQuestions, topic);
    }
  }

  const objectMatch = stripped.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    const objectQuestions = coerceQuestions(tryParseJson(objectMatch[0]));
    if (objectQuestions.length > 0) {
      return exactlyThree(objectQuestions, topic);
    }
  }

  const lineQuestions = lineBasedExtraction(stripped);
  if (lineQuestions.length > 0) {
    return exactlyThree(lineQuestions, topic);
  }

  return fallbackQuestions(topic);
}

export async function runSupervisor(topic: string): Promise<string[]> {
  if (isFastMode()) {
    return createFastSubQuestions(topic);
  }

  const model = getGeminiModel();
  const response = await model.invoke(`You are a research planning supervisor.
Break the topic into exactly 3 focused research sub-questions.
Each sub-question should cover a different angle of the topic.
Return JSON only as:
["question 1", "question 2", "question 3"]
Do not include markdown, commentary, or numbering.

Topic: ${topic}`);

  return parseSupervisorQuestions(messageContentToString(response.content), topic);
}
