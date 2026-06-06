import {
  addImportsDir,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";

export interface ModuleOptions {
  apiUrl?: string;
  apiKey?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@agent-firewall/nuxt",
    configKey: "agentFirewall",
  },
  defaults: {
    apiUrl: "",
    apiKey: "",
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.runtimeConfig.public.agentFirewall = {
      apiUrl: options.apiUrl ?? "",
      apiKey: options.apiKey ?? "",
    };
    addImportsDir(resolver.resolve("./runtime/composables"));
  },
});
