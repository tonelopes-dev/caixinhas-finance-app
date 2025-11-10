"use client"

import { Header, HeroSection, ProblemSolutionSection, FeaturesSection, PWASection, BenefitsSection, HowItWorksSection, StorySection, PricingSection, CTASection, useScrollAnimations } from "@/components/landing-page"

export default function LandingPage() {
  const { scrollY, isVisible } = useScrollAnimations()

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection scrollY={scrollY} />
      <ProblemSolutionSection isVisible={isVisible} />
      <FeaturesSection isVisible={isVisible} />
      <PWASection isVisible={isVisible} />
      <BenefitsSection isVisible={isVisible} />
      <HowItWorksSection isVisible={isVisible} />
      <StorySection isVisible={isVisible} />
      <PricingSection isVisible={isVisible} />
      <CTASection />
    </div>
  )
}
