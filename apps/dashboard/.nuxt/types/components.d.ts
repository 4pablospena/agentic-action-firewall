
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AppHeader: typeof import("../../components/layout/AppHeader.vue")['default']
  AppSidebar: typeof import("../../components/layout/AppSidebar.vue")['default']
  ColorModeToggle: typeof import("../../components/layout/ColorModeToggle.vue")['default']
  AuthState: typeof import("../../../../node_modules/.pnpm/nuxt-auth-utils@0.5.29_magicast@0.5.3/node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue")['default']
  NuxtWelcome: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  ColorScheme: typeof import("../../../../node_modules/.pnpm/@nuxtjs+color-mode@4.0.0_magicast@0.5.3/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']
  Alert: typeof import("../../components/ui/alert/index")['Alert']
  AlertTitle: typeof import("../../components/ui/alert/index")['AlertTitle']
  AlertDescription: typeof import("../../components/ui/alert/index")['AlertDescription']
  Badge: typeof import("../../components/ui/badge/index")['Badge']
  Button: typeof import("../../components/ui/button/index")['Button']
  Card: typeof import("../../components/ui/card/index")['Card']
  CardHeader: typeof import("../../components/ui/card/index")['CardHeader']
  CardTitle: typeof import("../../components/ui/card/index")['CardTitle']
  CardDescription: typeof import("../../components/ui/card/index")['CardDescription']
  CardContent: typeof import("../../components/ui/card/index")['CardContent']
  CardFooter: typeof import("../../components/ui/card/index")['CardFooter']
  DropdownMenu: typeof import("../../components/ui/dropdown-menu/index")['DropdownMenu']
  DropdownMenuTrigger: typeof import("../../components/ui/dropdown-menu/index")['DropdownMenuTrigger']
  DropdownMenuContent: typeof import("../../components/ui/dropdown-menu/index")['DropdownMenuContent']
  DropdownMenuItem: typeof import("../../components/ui/dropdown-menu/index")['DropdownMenuItem']
  Input: typeof import("../../components/ui/input/index")['Input']
  Label: typeof import("../../components/ui/label/index")['Label']
  Separator: typeof import("../../components/ui/separator/index")['Separator']
  Table: typeof import("../../components/ui/table/index")['Table']
  TableHeader: typeof import("../../components/ui/table/index")['TableHeader']
  TableBody: typeof import("../../components/ui/table/index")['TableBody']
  TableRow: typeof import("../../components/ui/table/index")['TableRow']
  TableHead: typeof import("../../components/ui/table/index")['TableHead']
  TableCell: typeof import("../../components/ui/table/index")['TableCell']
  Tabs: typeof import("../../components/ui/tabs/index")['Tabs']
  TabsList: typeof import("../../components/ui/tabs/index")['TabsList']
  TabsTrigger: typeof import("../../components/ui/tabs/index")['TabsTrigger']
  TabsContent: typeof import("../../components/ui/tabs/index")['TabsContent']
  Textarea: typeof import("../../components/ui/textarea/index")['Textarea']
  Sheet: typeof import("../../components/ui/sheet/index")['Sheet']
  SheetContent: typeof import("../../components/ui/sheet/index")['SheetContent']
  SheetTitle: typeof import("../../components/ui/sheet/index")['SheetTitle']
  SheetDescription: typeof import("../../components/ui/sheet/index")['SheetDescription']
  NuxtPage: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAppHeader: LazyComponent<typeof import("../../components/layout/AppHeader.vue")['default']>
  LazyAppSidebar: LazyComponent<typeof import("../../components/layout/AppSidebar.vue")['default']>
  LazyColorModeToggle: LazyComponent<typeof import("../../components/layout/ColorModeToggle.vue")['default']>
  LazyAuthState: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt-auth-utils@0.5.29_magicast@0.5.3/node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyColorScheme: LazyComponent<typeof import("../../../../node_modules/.pnpm/@nuxtjs+color-mode@4.0.0_magicast@0.5.3/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']>
  LazyAlert: LazyComponent<typeof import("../../components/ui/alert/index")['Alert']>
  LazyAlertTitle: LazyComponent<typeof import("../../components/ui/alert/index")['AlertTitle']>
  LazyAlertDescription: LazyComponent<typeof import("../../components/ui/alert/index")['AlertDescription']>
  LazyBadge: LazyComponent<typeof import("../../components/ui/badge/index")['Badge']>
  LazyButton: LazyComponent<typeof import("../../components/ui/button/index")['Button']>
  LazyCard: LazyComponent<typeof import("../../components/ui/card/index")['Card']>
  LazyCardHeader: LazyComponent<typeof import("../../components/ui/card/index")['CardHeader']>
  LazyCardTitle: LazyComponent<typeof import("../../components/ui/card/index")['CardTitle']>
  LazyCardDescription: LazyComponent<typeof import("../../components/ui/card/index")['CardDescription']>
  LazyCardContent: LazyComponent<typeof import("../../components/ui/card/index")['CardContent']>
  LazyCardFooter: LazyComponent<typeof import("../../components/ui/card/index")['CardFooter']>
  LazyDropdownMenu: LazyComponent<typeof import("../../components/ui/dropdown-menu/index")['DropdownMenu']>
  LazyDropdownMenuTrigger: LazyComponent<typeof import("../../components/ui/dropdown-menu/index")['DropdownMenuTrigger']>
  LazyDropdownMenuContent: LazyComponent<typeof import("../../components/ui/dropdown-menu/index")['DropdownMenuContent']>
  LazyDropdownMenuItem: LazyComponent<typeof import("../../components/ui/dropdown-menu/index")['DropdownMenuItem']>
  LazyInput: LazyComponent<typeof import("../../components/ui/input/index")['Input']>
  LazyLabel: LazyComponent<typeof import("../../components/ui/label/index")['Label']>
  LazySeparator: LazyComponent<typeof import("../../components/ui/separator/index")['Separator']>
  LazyTable: LazyComponent<typeof import("../../components/ui/table/index")['Table']>
  LazyTableHeader: LazyComponent<typeof import("../../components/ui/table/index")['TableHeader']>
  LazyTableBody: LazyComponent<typeof import("../../components/ui/table/index")['TableBody']>
  LazyTableRow: LazyComponent<typeof import("../../components/ui/table/index")['TableRow']>
  LazyTableHead: LazyComponent<typeof import("../../components/ui/table/index")['TableHead']>
  LazyTableCell: LazyComponent<typeof import("../../components/ui/table/index")['TableCell']>
  LazyTabs: LazyComponent<typeof import("../../components/ui/tabs/index")['Tabs']>
  LazyTabsList: LazyComponent<typeof import("../../components/ui/tabs/index")['TabsList']>
  LazyTabsTrigger: LazyComponent<typeof import("../../components/ui/tabs/index")['TabsTrigger']>
  LazyTabsContent: LazyComponent<typeof import("../../components/ui/tabs/index")['TabsContent']>
  LazyTextarea: LazyComponent<typeof import("../../components/ui/textarea/index")['Textarea']>
  LazySheet: LazyComponent<typeof import("../../components/ui/sheet/index")['Sheet']>
  LazySheetContent: LazyComponent<typeof import("../../components/ui/sheet/index")['SheetContent']>
  LazySheetTitle: LazyComponent<typeof import("../../components/ui/sheet/index")['SheetTitle']>
  LazySheetDescription: LazyComponent<typeof import("../../components/ui/sheet/index")['SheetDescription']>
  LazyNuxtPage: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
