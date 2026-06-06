export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (to.meta.auth === false) {
    return;
  }

  if (!loggedIn.value && to.path !== "/login") {
    return navigateTo("/login");
  }
});
