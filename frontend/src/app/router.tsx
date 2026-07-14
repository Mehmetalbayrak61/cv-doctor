/* oxlint-disable react/only-export-components -- route-level lazy factories are intentionally colocated */
import { lazy } from "react"
import { createBrowserRouter } from "react-router-dom"

import { ProtectedRoute } from "./protected-route"
import { AppLayout } from "@/components/layout/app-layout"
import { DashboardShell } from "@/components/layout/dashboard-shell"

const AccountPage = lazy(() =>
  import("@/features/account/account-page").then((m) => ({ default: m.AccountPage }))
)
const AdminPage = lazy(() =>
  import("@/features/admin/admin-page").then((m) => ({ default: m.AdminPage }))
)
const AiOutputPage = lazy(() =>
  import("@/features/ai-output/ai-output-page").then((m) => ({ default: m.AiOutputPage }))
)
const CvDetailPage = lazy(() =>
  import("@/features/cv-analysis/cv-detail-page").then((m) => ({ default: m.CvDetailPage }))
)
const CvListPage = lazy(() =>
  import("@/features/dashboard/cv-list-page").then((m) => ({ default: m.CvListPage }))
)
const OverviewPage = lazy(() =>
  import("@/features/dashboard/overview-page").then((m) => ({ default: m.OverviewPage }))
)
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/forgot-password-page").then((m) => ({
    default: m.ForgotPasswordPage,
  }))
)
const LandingPage = lazy(() =>
  import("@/features/auth/landing-page").then((m) => ({ default: m.LandingPage }))
)
const LoginPage = lazy(() =>
  import("@/features/auth/login-page").then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import("@/features/auth/register-page").then((m) => ({ default: m.RegisterPage }))
)
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/reset-password-page").then((m) => ({ default: m.ResetPasswordPage }))
)
const VerifyEmailPage = lazy(() =>
  import("@/features/auth/verify-email-page").then((m) => ({ default: m.VerifyEmailPage }))
)
const JobMatchPage = lazy(() =>
  import("@/features/job-match/job-match-page").then((m) => ({ default: m.JobMatchPage }))
)
const MatchResultPage = lazy(() =>
  import("@/features/job-match/match-result-page").then((m) => ({ default: m.MatchResultPage }))
)
const AccountDeletionPage = lazy(() =>
  import("@/features/legal/account-deletion-page").then((m) => ({
    default: m.AccountDeletionPage,
  }))
)
const PrivacyPage = lazy(() =>
  import("@/features/legal/privacy-page").then((m) => ({ default: m.PrivacyPage }))
)
const TermsPage = lazy(() =>
  import("@/features/legal/terms-page").then((m) => ({ default: m.TermsPage }))
)
const PricingPage = lazy(() =>
  import("@/features/pricing/pricing-page").then((m) => ({ default: m.PricingPage }))
)
const RefundPage = lazy(() =>
  import("@/features/legal/refund-page").then((m) => ({ default: m.RefundPage }))
)
const ContactPage = lazy(() =>
  import("@/features/contact/contact-page").then((m) => ({ default: m.ContactPage }))
)
const AboutPage = lazy(() =>
  import("@/features/about/about-page").then((m) => ({ default: m.AboutPage }))
)

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
      { path: "/account-deletion", element: <AccountDeletionPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/refund", element: <RefundPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/about", element: <AboutPage /> },
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
