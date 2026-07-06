import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/features/auth/hooks/use-auth"

/** Token yoksa /login'e yönlendirir; kullanıcı bilgisi yüklenirken kısa bir bekleme ekranı gösterir. */
export function ProtectedRoute() {
  const { token, isLoadingUser } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isLoadingUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-muted border-t-primary size-8 animate-spin rounded-full border-4" />
      </div>
    )
  }

  return <Outlet />
}
