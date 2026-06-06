export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user: githubUser }) {
    if (!githubUser.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "GitHub account must expose a verified email",
      });
    }

    const user = await ensureUserWorkspace({
      id: String(githubUser.id),
      email: githubUser.email,
      name: githubUser.name ?? githubUser.login,
    });

    await setUserSession(event, { user });
    return sendRedirect(event, "/audit");
  },
});
