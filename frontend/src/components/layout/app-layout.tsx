import { ActivitySquare, Briefcase, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react"
import { Suspense } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { RouteFallback } from "@/components/layout/route-fallback"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/layout/footer"

function initialsFromUser(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function AppLayout() {
  const { t } = useTranslation()
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="bg-background text-foreground focus:ring-ring sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-2"
      >
        {t("common.skipToContent")}
      </a>
      <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <ActivitySquare className="text-primary size-5" strokeWidth={2.25} />
            {t("app.name")}
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/pricing">{t("nav.pricing")}</Link>
            </Button>
            {token && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/jobs">
                  <Briefcase className="size-4" />
                  {t("nav.jobMatch")}
                </Link>
              </Button>
            )}
            <div className="hidden items-center gap-1 sm:flex">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            {token ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 gap-2 px-1.5">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {user ? initialsFromUser(user.first_name, user.last_name) : "…"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm sm:inline">{user?.first_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-muted-foreground font-normal">
                    {user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate("/dashboard")}>
                    <LayoutDashboard /> {t("nav.dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="sm:hidden" onSelect={() => navigate("/jobs")}>
                    <Briefcase /> {t("nav.jobMatch")}
                  </DropdownMenuItem>
                  {user?.is_admin && (
                    <DropdownMenuItem onSelect={() => navigate("/admin")}>
                      <ShieldCheck /> {t("nav.admin")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      // navigate() çağırmıyoruz: token düşünce ProtectedRoute zaten
                      // kendiliğinden /login'e yönlendirir (logout her zaman korumalı bir
                      // sayfadan tetiklenir), ayrıca manuel navigate ile aralarında kazanan
                      // belirsiz bir yarış durumu oluşmasını da önlemiş oluyoruz.
                      logout()
                    }}
                  >
                    <LogOut /> {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" className="px-2 sm:px-3">
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link to="/register">{t("nav.register")}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
