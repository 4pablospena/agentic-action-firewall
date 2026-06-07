export async function syncKillSwitchToControlPlane(
  scope: string,
  reason: string,
): Promise<void> {
  const config = useRuntimeConfig();
  const baseUrl = config.controlPlaneUrl;
  if (!baseUrl) {
    return;
  }

  try {
    await $fetch(`${baseUrl}/kill`, {
      method: "POST",
      body: { scope, reason },
    });
  } catch (error) {
    console.error("[dashboard] control plane kill sync failed:", error);
  }
}
