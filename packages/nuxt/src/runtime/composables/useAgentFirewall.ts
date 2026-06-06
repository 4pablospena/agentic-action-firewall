/// <reference types="@nuxt/schema" />

import type { AuditEntry } from "@agent-firewall/core";

export function useAgentFirewall() {
  const config = useRuntimeConfig();
  return {
    apiUrl: config.public.agentFirewall?.apiUrl as string,
    apiKey: config.public.agentFirewall?.apiKey as string,
  };
}

export function useAuditIngest() {
  const { apiUrl, apiKey } = useAgentFirewall();

  async function ingestEntry(entry: AuditEntry): Promise<AuditEntry> {
    if (!apiUrl) {
      throw new Error("agentFirewall.apiUrl is not configured");
    }

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (apiKey) {
      headers.authorization = `Bearer ${apiKey}`;
    }

    const response = await $fetch<{ entry: AuditEntry }>(
      `${apiUrl.replace(/\/$/, "")}/api/v1/audit/entries`,
      {
        method: "POST",
        body: entry,
        headers,
      },
    );

    return response.entry;
  }

  return { ingestEntry };
}
