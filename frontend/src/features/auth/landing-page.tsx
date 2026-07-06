import { Navigate } from "react-router-dom"

import { FaqSection } from "./components/landing/faq-section"
import { FeatureGrid } from "./components/landing/feature-grid"
import { FinalCtaSection } from "./components/landing/final-cta-section"
import { HeroSection } from "./components/landing/hero-section"
import { HowItWorks } from "./components/landing/how-it-works"
import { TrustBar } from "./components/landing/trust-bar"
import { useAuth } from "./hooks/use-auth"

export function LandingPage() {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div>
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <FeatureGrid />
      <FaqSection />
      <FinalCtaSection />
    </div>
  )
}
