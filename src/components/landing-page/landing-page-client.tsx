"use client"

import {
  Header,
  ProblemSolutionSection,
  FeaturesSection,
  PWASection,
  BenefitsSection,
  HowItWorksSection,
  StorySection,
  PricingSection,
  CTASection,
  useScrollAnimations,
  HeroSection,
} from "@/components/landing-page"

export function LandingPageClient() {
  const { scrollY, isVisible } = useScrollAnimations()

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection scrollY={scrollY} />
      <div className="relative z-10 bg-background">
        <ProblemSolutionSection isVisible={isVisible} />
        <FeaturesSection isVisible={isVisible} />
        <PWASection isVisible={isVisible} />
        <BenefitsSection isVisible={isVisible} />
        <HowItWorksSection isVisible={isVisible} />
        <StorySection isVisible={isVisible} />
        <PricingSection isVisible={isVisible} />
        <CTASection />
      </div>
    </div>
  )
}
