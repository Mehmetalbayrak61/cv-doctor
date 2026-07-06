import { createBrowserRouter } from "react-router-dom"

import { ProtectedRoute } from "./protected-route"
import { AppLayout } from "@/components/layout/app-layout"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AccountPage } from "@/features/account/account-page"
import { AdminPage } from "@/features/admin/admin-page"
import { AiOutputPage } from "@/features/ai-output/ai-output-page"
import { CvDetailPage } from "@/features/cv-analysis/cv-detail-page"
import { CvListPage } from "@/features/dashboard/cv-list-page"
import { OverviewPage } from "@/features/dashboard/overview-page"
import { ForgotPasswordPage } from "@/features/auth/forgot-password-page"
import { LandingPage } from "@/features/auth/landing-page"
import { LoginPage } from "@/features/auth/login-page"
import { RegisterPage } from "@/features/auth/register-page"
import { ResetPasswordPage } from "@/features/auth/reset-password-page"
import { VerifyEmailPage } from "@/features/auth/verify-email-page"
import { JobMatchPage } from "@/features/job-match/job-match-page"
import { MatchResultPage } from "@/features/job-match/match-result-page"
import { PrivacyPage } from "@/features/legal/privacy-page"
import { TermsPage } from "@/features/legal/terms-page"
import { PricingPage } from "@/features/pricing/pricing-page"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/pricing", element: <PricingPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardShell />,
        children: [
          { path: "/dashboard", element: <OverviewPage /> },
          { path: "/cvs", element: <CvListPage /> },
          { path: "/cvs/:cvId", element: <CvDetailPage /> },
          { path: "/cvs/:cvId/outputs/:outputId", element: <AiOutputPage /> },
          { path: "/jobs", element: <JobMatchPage /> },
          { path: "/jobs/:jobId/match/:cvId", element: <MatchResultPage /> },
          { path: "/jobs/:jobId/match/:cvId/outputs/:outputId", element: <AiOutputPage /> },
          { path: "/admin", element: <AdminPage /> },
          { path: "/account", element: <AccountPage /> },
        ],
      },
    ],
  },
])
