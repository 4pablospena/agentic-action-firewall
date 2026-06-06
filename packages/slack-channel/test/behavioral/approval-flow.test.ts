import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { wrapLangChainTools } from "@agent-firewall/langchain";
import { actionIds, createSlackApprovalChannel } from "../../src/index.js";
import {
  createTestFirewall,
  TEST_SLACK_CONFIG,
  TEST_WRAP_CONTEXT,
} from "../helpers/firewall.js";
import { createMockSlackClient, findActionId } from "../helpers/mock-slack.js";
import {
  makeDeleteBatch,
  makeSendEmail,
  makeToolCall,
} from "../../../core/test/helpers/index.js";

describe("createSlackApprovalChannel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T14:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow R3 gmail.delete after Slack approve interaction", async () => {
    const slack = createMockSlackClient();
    const channel = createSlackApprovalChannel(TEST_SLACK_CONFIG, slack);
    const firewall = createTestFirewall({
      onApprovalNeeded: (event) => channel.onApprovalNeeded(event),
    });

    const evaluatePromise = firewall.evaluate(makeDeleteBatch(1));
    await vi.waitFor(() => expect(slack.postMessage).toHaveBeenCalledOnce());

    const blocks = slack.postedBlocks[0]!;
    const approveActionId = findActionId(blocks, "Approve");
    expect(approveActionId).toBeDefined();

    await channel.handleInteraction({
      user: { id: "U-APPROVER" },
      actions: [{ action_id: approveActionId! }],
    });

    const decision = await evaluatePromise;
    expect(decision.outcome).toBe("allow");
    expect(decision.byLayer).toBe(4);

    const entry = firewall.getAuditEntries().at(-1);
    expect(entry?.approver).toBe("U-APPROVER");
  });

  it("should keep R3 pending when Slack deny is clicked", async () => {
    const slack = createMockSlackClient();
    const channel = createSlackApprovalChannel(TEST_SLACK_CONFIG, slack);
    const firewall = createTestFirewall({
      onApprovalNeeded: (event) => channel.onApprovalNeeded(event),
    });

    const evaluatePromise = firewall.evaluate(makeDeleteBatch(1));
    await vi.waitFor(() => expect(slack.postMessage).toHaveBeenCalledOnce());

    const blocks = slack.postedBlocks[0]!;
    const denyActionId = findActionId(blocks, "Deny")!;
    const approvalId = denyActionId.split(":").pop()!;

    await channel.handleInteraction({
      user: { id: "U-APPROVER" },
      actions: [{ action_id: actionIds(approvalId).deny }],
    });

    const decision = await evaluatePromise;
    expect(decision.outcome).toBe("pending");
  });

  it("should keep R3 pending when approval times out", async () => {
    const slack = createMockSlackClient();
    const channel = createSlackApprovalChannel(
      { ...TEST_SLACK_CONFIG, approvalTimeoutMs: 1_000 },
      slack,
    );
    const firewall = createTestFirewall({
      onApprovalNeeded: (event) => channel.onApprovalNeeded(event),
    });

    const evaluatePromise = firewall.evaluate(makeDeleteBatch(1));
    await vi.waitFor(() => expect(slack.postMessage).toHaveBeenCalledOnce());

    await vi.advanceTimersByTimeAsync(1_500);

    const decision = await evaluatePromise;
    expect(decision.outcome).toBe("pending");
  });

  it("should allow R4 stripe.charge only for MFA allowlisted approver", async () => {
    const slack = createMockSlackClient();
    const channel = createSlackApprovalChannel(TEST_SLACK_CONFIG, slack);
    const firewall = createTestFirewall({
      onApprovalNeeded: (event) => channel.onApprovalNeeded(event),
    });

    const call = makeToolCall({
      name: "stripe.charge",
      arguments: { amount: 5000, currency: "usd" },
    });

    let resolved = false;
    const evaluatePromise = firewall.evaluate(call).then((decision) => {
      resolved = true;
      return decision;
    });

    await vi.waitFor(() => expect(slack.postMessage).toHaveBeenCalledOnce());

    const blocks = slack.postedBlocks[0]!;
    const mfaActionId = findActionId(blocks, "Approve (MFA verified)")!;

    await channel.handleInteraction({
      user: { id: "U-NOT-ALLOWED" },
      actions: [{ action_id: mfaActionId }],
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(resolved).toBe(false);

    await channel.handleInteraction({
      user: { id: "U-MFA-OK" },
      actions: [{ action_id: mfaActionId }],
    });

    const decision = await evaluatePromise;
    expect(decision.outcome).toBe("allow");
    expect(firewall.getAuditEntries().at(-1)?.approver).toBe("U-MFA-OK");
  });

  it("should post R2 notify-only message and ignore inline approve return", async () => {
    const slack = createMockSlackClient();
    const channel = createSlackApprovalChannel(TEST_SLACK_CONFIG, slack);
    const firewall = createTestFirewall({
      onApprovalNeeded: async (event) => {
        await channel.onApprovalNeeded(event);
        return { approved: true, approver: "should-be-ignored" };
      },
    });

    const decision = await firewall.evaluate(makeSendEmail());

    expect(decision.outcome).toBe("pending");
    expect(decision.riskTier).toBe("R2");
    expect(slack.postMessage).toHaveBeenCalledOnce();
    expect(slack.postedBlocks[0]?.some((b) => b.type === "actions")).toBe(false);
  });

  it("should complete wrapped LangChain invoke after Slack R3 approval", async () => {
    const slack = createMockSlackClient();
    const channel = createSlackApprovalChannel(TEST_SLACK_CONFIG, slack);
    const handler = vi.fn(async () => "deleted");
    const firewall = createTestFirewall({
      onApprovalNeeded: (event) => channel.onApprovalNeeded(event),
    });

    const [tool] = wrapLangChainTools(
      firewall,
      [{ name: "gmail.delete", invoke: handler }],
      TEST_WRAP_CONTEXT,
    );

    const invokePromise = tool!.invoke({ batch_size: 1 });
    await vi.waitFor(() => expect(slack.postMessage).toHaveBeenCalledOnce());

    const blocks = slack.postedBlocks[0]!;
    const approveActionId = findActionId(blocks, "Approve")!;

    await channel.handleInteraction({
      user: { id: "U-LANGCHAIN" },
      actions: [{ action_id: approveActionId }],
    });

    await expect(invokePromise).resolves.toBe("deleted");
    expect(handler).toHaveBeenCalledOnce();
  });
});
