import { vi } from "vitest";
import type { SlackBlock, SlackClient } from "../../src/types.js";

export function createMockSlackClient(): SlackClient & {
  postMessage: ReturnType<typeof vi.fn>;
  postedBlocks: SlackBlock[][];
} {
  const postedBlocks: SlackBlock[][] = [];
  const postMessage = vi.fn(async (_channelId: string, blocks: SlackBlock[]) => {
    postedBlocks.push(blocks);
  });

  return {
    postMessage,
    postedBlocks,
  };
}

export function findActionId(blocks: SlackBlock[], label: string): string | undefined {
  for (const block of blocks) {
    for (const element of block.elements ?? []) {
      if (element.text?.text === label && element.action_id) {
        return element.action_id;
      }
    }
  }
  return undefined;
}
