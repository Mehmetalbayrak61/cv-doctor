import {
  ActivitySquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react"
import { Suspense, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, Outlet } from "react-router-dom"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { RouteFallback } from "@/components/layout/route-fallback"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { UpgradeModalProvider } from "@/features/pricing/upgrade-modal-provider"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  end?: boolean
  label: string
  icon: LucideIcon
}

function initialsFromUser(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function SidebarNav({ items, alwaysShowLabels }: { items: NavItem[]; alwaysShowLabels: boolean }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg border-l-[2.5px] py-2.5 pr-3 pl-2.5 text-sm font-medium transition-colors duration-150",
              alwaysShowLabels ? "justify-start" : "justify-center lg:justify-start",
              isActive
                ? "border-primary bg-accent text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
            )
          }
        >
          <item.icon className="size-[18px] shrink-0" />
          <span className={alwaysShowLabels ? "" : "hidden lg:inline"}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarFooter({ alwaysShowLabels }: { alwaysShowLabels: boolean }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  return (
    <div className="border-border flex flex-col gap-3 border-t pt-4">
      <Link
        to="/pricing"
        className={cn(
          "bg-accent/60 hover:bg-accent flex items-center justify-between rounded-lg px-2.5 py-2 transition-colors",
          alwaysShowLabels ? "" : "hidden lg:flex"
        )}
      >
        <Badge variant="secondary">{t("plan.freeBadge")}</Badge>
        <span className="text-primary text-xs font-medium">{t("plan.upgradeCta")}</span>
      </Link>
      <div className="flex items-center gap-2.5">
        <Link to="/account" className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar size="sm" className="shrink-0">
            <AvatarFallback>
              {user ? initialsFromUser(user.first_name, user.last_name) : "…"}
            </AvatarFallback>
          </Avatar>
          <div className={cn("min-w-0 flex-1", alwaysShowLabels ? "" : "hidden lg:block")}>
            <p className="truncate text-sm font-medium">{user?.first_name}</p>
          </div>
        </Link>
        <button
          onClick={() => logout()}
          className={cn(
            "text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-xs",
            alwaysShowLabels ? "" : "hidden lg:flex"
          )}
        >
          <LogOut className="size-3" />
          {t("nav.logout")}
        </button>
        <div className={alwaysShowLabels ? "" : "hidden lg:block"}>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}

export function DashboardShell() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems: NavItem[] = [
    { to: "/dashboard", end: true, label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/cvs", label: t("dashboard.title"), icon: FileText },
    { to: "/jobs", label: t("nav.jobMatch"), icon: Target },
  ]
  if (user?.is_admin) {
    navItems.push({ to: "/admin", label: t("nav.admin"), icon: ShieldCheck })
  }

  return (
    <div className="bg-background flex min-h-screen">
      {/* Masaüstü kalıcı sidebar: md-lg arası sadece ikon, lg+ tam etiketli. */}
      <aside className="border-border bg-card hidden shrink-0 flex-col border-r px-3 py-5 md:flex md:w-[76px] lg:w-64 lg:px-4">
        <Link to="/dashboard" className="mb-6 flex items-center gap-2 px-1.5 text-lg font-semibold">
          <ActivitySquare className="text-primary size-5 shrink-0" strokeWidth={2.25} />
          <span className="hidden lg:inline">{t("app.name")}</span>
        </Link>
        <SidebarNav items={navItems} alwaysShowLabels={false} />
        <div className="flex-1" />
        <SidebarFooter alwaysShowLabels={false} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobil/tablet-dar üst çubuk: sadece md altında görünür. */}
        <header className="border-border bg-background/80 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2 text-base font-semibold">
            <ActivitySquare className="text-primary size-5" strokeWidth={2.25} />
            {t("app.name")}
          </Link>
          <div className="flex items-center gap-1">
            <Avatar size="sm">
              <AvatarFallback>
                {user ? initialsFromUser(user.first_name, user.last_name) : "…"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label={t("nav.openMenu")}>
              <Menu />
            </Button>
          </div>
        </header>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="flex w-72 flex-col px-4 py-5">
            <SheetTitle className="mb-6 flex items-center gap-2 px-1.5">
              <ActivitySquare className="text-primary size-5" strokeWidth={2.25} />
              {t("app.name")}
            </SheetTitle>
            <div onClick={() => setMobileOpen(false)}>
              <SidebarNav items={navItems} alwaysShowLabels />
            </div>
            <div className="flex-1" />
            <SidebarFooter alwaysShowLabels />
          </SheetContent>
        </Sheet>

        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <UpgradeModalProvider />
    </div>
  )
}
