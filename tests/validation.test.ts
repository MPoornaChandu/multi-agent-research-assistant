import { describe, expect, it } from "vitest";
import {
  TOPIC_MAX_LENGTH,
  TOPIC_MIN_LENGTH,
  validateTopic
} from "@/lib/validation";

describe("validateTopic", () => {
  it("rejects an empty string", () => {
    expect(validateTopic("   ")).toEqual({
      ok: false,
      error: `Please enter at least ${TOPIC_MIN_LENGTH} characters.`
    });
  });

  it("rejects topics under 10 characters", () => {
    expect(validateTopic("AI news")).toEqual({
      ok: false,
      error: `Please enter at least ${TOPIC_MIN_LENGTH} characters.`
    });
  });

  it("rejects topics over 300 characters", () => {
    const topic = "a".repeat(TOPIC_MAX_LENGTH + 1);

    expect(validateTopic(topic)).toEqual({
      ok: false,
      error: `Topic must be ${TOPIC_MAX_LENGTH} characters or fewer.`
    });
  });

  it("trims whitespace and collapses repeated spaces", () => {
    expect(validateTopic("  Future   of     AI agents  ")).toEqual({
      ok: true,
      topic: "Future of AI agents"
    });
  });

  it("accepts a valid topic", () => {
    expect(
      validateTopic("Future of AI agents in software engineering internships")
    ).toEqual({
      ok: true,
      topic: "Future of AI agents in software engineering internships"
    });
  });
});
