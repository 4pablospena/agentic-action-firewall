import type { SlackClient } from "./types.js";

/**
 * Creates a SlackClient backed by @slack/web-api (peer dependency).
 */
export async function createWebApiSlackClient(botToken: string): Promise<SlackClient> {
  const { WebClient } = await import("@slack/web-api");
  const web = new WebClient(botToken);

  return {
    postMessage: async (channelId, blocks) => {
      await web.chat.postMessage({
        channel: channelId,
        blocks: blocks as never,
      });
    },
  };
}
