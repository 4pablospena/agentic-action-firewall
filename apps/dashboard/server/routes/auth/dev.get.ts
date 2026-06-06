export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.devAuthBypass) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  const user = await ensureUserWorkspace({
    id: "dev-local-user",
    email: "dev@localhost",
    name: "Dev User",
  });

  await setUserSession(event, { user });
  return sendRedirect(event, "/audit");
});
