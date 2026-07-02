export const TOPIC_MIN_LENGTH = 10;
export const TOPIC_MAX_LENGTH = 300;

export function normalizeTopic(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input.trim().replace(/\s+/g, " ");
}

export function validateTopic(
  input: unknown
): { ok: boolean; topic?: string; error?: string } {
  const topic = normalizeTopic(input);

  if (!topic) {
    return { ok: false, error: `Please enter at least ${TOPIC_MIN_LENGTH} characters.` };
  }

  if (topic.length < TOPIC_MIN_LENGTH) {
    return {
      ok: false,
      error: `Please enter at least ${TOPIC_MIN_LENGTH} characters.`
    };
  }

  if (topic.length > TOPIC_MAX_LENGTH) {
    return {
      ok: false,
      error: `Topic must be ${TOPIC_MAX_LENGTH} characters or fewer.`
    };
  }

  return { ok: true, topic };
}
