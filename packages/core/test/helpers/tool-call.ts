import type { ToolCall } from "../../src/types.js";

let callCounter = 0;

const DEFAULT_AGENT = "test-agent";
const DEFAULT_SESSION = "test-session";
const BASE_TIME = new Date("2026-02-01T14:00:00.000Z").getTime();

export function resetToolCallIds(): void {
  callCounter = 0;
}

export function makeToolCall(
  overrides: Partial<ToolCall> & Pick<ToolCall, "name">,
): ToolCall {
  callCounter += 1;
  const offsetMs = overrides.timestamp
    ? new Date(overrides.timestamp).getTime() - BASE_TIME
    : callCounter * 1000;

  return {
    agentId: DEFAULT_AGENT,
    sessionId: DEFAULT_SESSION,
    timestamp: new Date(BASE_TIME + offsetMs).toISOString(),
    arguments: {},
    ...overrides,
  };
}

export function makeDeleteBatch(batchSize: number, overrides?: Partial<ToolCall>): ToolCall {
  return makeToolCall({
    name: "gmail.delete",
    arguments: { batch_size: batchSize },
    ...overrides,
  });
}

export function makeSendEmail(overrides?: Partial<ToolCall>): ToolCall {
  return makeToolCall({
    name: "gmail.send",
    arguments: { to: "user@example.com", subject: "Hello" },
    recipients: ["user@example.com"],
    ...overrides,
  });
}

export function makeReadInbox(overrides?: Partial<ToolCall>): ToolCall {
  return makeToolCall({
    name: "gmail.read",
    arguments: { label: "INBOX" },
    ...overrides,
  });
}

/** Fixed 384-dim unit vector for repetition tests (cosine similarity 1.0 with itself). */
export function unitEmbedding(value = 1 / Math.sqrt(384)): number[] {
  return Array.from({ length: 384 }, () => value);
}

export function makeSimilarSend(recipient: string, embedding?: number[]): ToolCall {
  return makeToolCall({
    name: "gmail.send",
    arguments: { to: recipient, body: "template message" },
    recipients: [recipient],
    payloadEmbedding: embedding ?? unitEmbedding(),
  });
}
