
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


export const OutcomeBadge: typeof import("../components/OutcomeBadge.vue")['default']
export const RiskBadge: typeof import("../components/RiskBadge.vue")['default']
export const LayoutAppHeader: typeof import("../components/layout/AppHeader.vue")['default']
export const LayoutAppSidebar: typeof import("../components/layout/AppSidebar.vue")['default']
export const LayoutColorModeToggle: typeof import("../components/layout/ColorModeToggle.vue")['default']
export const AuthState: typeof import("../../../node_modules/.pnpm/nuxt-auth-utils@0.5.29_magicast@0.5.3/node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue")['default']
export const NuxtWelcome: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const ColorScheme: typeof import("../../../node_modules/.pnpm/@nuxtjs+color-mode@4.0.0_magicast@0.5.3/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']
export const Alert: typeof import("../components/ui/alert/index")['Alert']
export const AlertTitle: typeof import("../components/ui/alert/index")['AlertTitle']
export const AlertDescription: typeof import("../components/ui/alert/index")['AlertDescription']
export const Badge: typeof import("../components/ui/badge/index")['Badge']
export const Button: typeof import("../components/ui/button/index")['Button']
export const Card: typeof import("../components/ui/card/index")['Card']
export const CardHeader: typeof import("../components/ui/card/index")['CardHeader']
export const CardTitle: typeof import("../components/ui/card/index")['CardTitle']
export const CardDescription: typeof import("../components/ui/card/index")['CardDescription']
export const CardContent: typeof import("../components/ui/card/index")['CardContent']
export const CardFooter: typeof import("../components/ui/card/index")['CardFooter']
export const DropdownMenu: typeof import("../components/ui/dropdown-menu/index")['DropdownMenu']
export const DropdownMenuTrigger: typeof import("../components/ui/dropdown-menu/index")['DropdownMenuTrigger']
export const DropdownMenuContent: typeof import("../components/ui/dropdown-menu/index")['DropdownMenuContent']
export const DropdownMenuItem: typeof import("../components/ui/dropdown-menu/index")['DropdownMenuItem']
export const Input: typeof import("../components/ui/input/index")['Input']
export const Label: typeof import("../components/ui/label/index")['Label']
export const Separator: typeof import("../components/ui/separator/index")['Separator']
export const Sheet: typeof import("../components/ui/sheet/index")['Sheet']
export const SheetContent: typeof import("../components/ui/sheet/index")['SheetContent']
export const SheetTitle: typeof import("../components/ui/sheet/index")['SheetTitle']
export const SheetDescription: typeof import("../components/ui/sheet/index")['SheetDescription']
export const Table: typeof import("../components/ui/table/index")['Table']
export const TableHeader: typeof import("../components/ui/table/index")['TableHeader']
export const TableBody: typeof import("../components/ui/table/index")['TableBody']
export const TableRow: typeof import("../components/ui/table/index")['TableRow']
export const TableHead: typeof import("../components/ui/table/index")['TableHead']
export const TableCell: typeof import("../components/ui/table/index")['TableCell']
export const Tabs: typeof import("../components/ui/tabs/index")['Tabs']
export const TabsList: typeof import("../components/ui/tabs/index")['TabsList']
export const TabsTrigger: typeof import("../components/ui/tabs/index")['TabsTrigger']
export const TabsContent: typeof import("../components/ui/tabs/index")['TabsContent']
export const Textarea: typeof import("../components/ui/textarea/index")['Textarea']
export const NuxtPage: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyOutcomeBadge: LazyComponent<typeof import("../components/OutcomeBadge.vue")['default']>
export const LazyRiskBadge: LazyComponent<typeof import("../components/RiskBadge.vue")['default']>
export const LazyLayoutAppHeader: LazyComponent<typeof import("../components/layout/AppHeader.vue")['default']>
export const LazyLayoutAppSidebar: LazyComponent<typeof import("../components/layout/AppSidebar.vue")['default']>
export const LazyLayoutColorModeToggle: LazyComponent<typeof import("../components/layout/ColorModeToggle.vue")['default']>
export const LazyAuthState: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt-auth-utils@0.5.29_magicast@0.5.3/node_modules/nuxt-auth-utils/dist/runtime/app/components/AuthState.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyColorScheme: LazyComponent<typeof import("../../../node_modules/.pnpm/@nuxtjs+color-mode@4.0.0_magicast@0.5.3/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue")['default']>
export const LazyAlert: LazyComponent<typeof import("../components/ui/alert/index")['Alert']>
export const LazyAlertTitle: LazyComponent<typeof import("../components/ui/alert/index")['AlertTitle']>
export const LazyAlertDescription: LazyComponent<typeof import("../components/ui/alert/index")['AlertDescription']>
export const LazyBadge: LazyComponent<typeof import("../components/ui/badge/index")['Badge']>
export const LazyButton: LazyComponent<typeof import("../components/ui/button/index")['Button']>
export const LazyCard: LazyComponent<typeof import("../components/ui/card/index")['Card']>
export const LazyCardHeader: LazyComponent<typeof import("../components/ui/card/index")['CardHeader']>
export const LazyCardTitle: LazyComponent<typeof import("../components/ui/card/index")['CardTitle']>
export const LazyCardDescription: LazyComponent<typeof import("../components/ui/card/index")['CardDescription']>
export const LazyCardContent: LazyComponent<typeof import("../components/ui/card/index")['CardContent']>
export const LazyCardFooter: LazyComponent<typeof import("../components/ui/card/index")['CardFooter']>
export const LazyDropdownMenu: LazyComponent<typeof import("../components/ui/dropdown-menu/index")['DropdownMenu']>
export const LazyDropdownMenuTrigger: LazyComponent<typeof import("../components/ui/dropdown-menu/index")['DropdownMenuTrigger']>
export const LazyDropdownMenuContent: LazyComponent<typeof import("../components/ui/dropdown-menu/index")['DropdownMenuContent']>
export const LazyDropdownMenuItem: LazyComponent<typeof import("../components/ui/dropdown-menu/index")['DropdownMenuItem']>
export const LazyInput: LazyComponent<typeof import("../components/ui/input/index")['Input']>
export const LazyLabel: LazyComponent<typeof import("../components/ui/label/index")['Label']>
export const LazySeparator: LazyComponent<typeof import("../components/ui/separator/index")['Separator']>
export const LazySheet: LazyComponent<typeof import("../components/ui/sheet/index")['Sheet']>
export const LazySheetContent: LazyComponent<typeof import("../components/ui/sheet/index")['SheetContent']>
export const LazySheetTitle: LazyComponent<typeof import("../components/ui/sheet/index")['SheetTitle']>
export const LazySheetDescription: LazyComponent<typeof import("../components/ui/sheet/index")['SheetDescription']>
export const LazyTable: LazyComponent<typeof import("../components/ui/table/index")['Table']>
export const LazyTableHeader: LazyComponent<typeof import("../components/ui/table/index")['TableHeader']>
export const LazyTableBody: LazyComponent<typeof import("../components/ui/table/index")['TableBody']>
export const LazyTableRow: LazyComponent<typeof import("../components/ui/table/index")['TableRow']>
export const LazyTableHead: LazyComponent<typeof import("../components/ui/table/index")['TableHead']>
export const LazyTableCell: LazyComponent<typeof import("../components/ui/table/index")['TableCell']>
export const LazyTabs: LazyComponent<typeof import("../components/ui/tabs/index")['Tabs']>
export const LazyTabsList: LazyComponent<typeof import("../components/ui/tabs/index")['TabsList']>
export const LazyTabsTrigger: LazyComponent<typeof import("../components/ui/tabs/index")['TabsTrigger']>
export const LazyTabsContent: LazyComponent<typeof import("../components/ui/tabs/index")['TabsContent']>
export const LazyTextarea: LazyComponent<typeof import("../components/ui/textarea/index")['Textarea']>
export const LazyNuxtPage: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../../../node_modules/.pnpm/nuxt@3.21.7_@parcel+watcher@2.5.6_@types+node@22.19.20_@vue+compiler-sfc@3.5.35_cac@6.7.14_db_b4rlyht22rszybuvn6lxrkhigq/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
