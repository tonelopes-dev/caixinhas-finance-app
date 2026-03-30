"use client"

import {
    BenefitsSection,
    CTASection,
    FAQSection,
    FeaturesSection,
    Footer,
    Header,
    HeroSection,
    HowItWorksSection,
    NewsSection,
    PricingSection,
    ProblemSolutionSection,
    StorySection,
    useScrollAnimations
} from "@/components/landing-page"

export function LandingPageClient() {
  const { scrollY, isVisible } = useScrollAnimations()

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection scrollY={scrollY} />
      <div className="relative z-10 bg-background">
        <ProblemSolutionSection isVisible={isVisible} />
        <HowItWorksSection isVisible={isVisible} />
        <FeaturesSection isVisible={isVisible} />
        <BenefitsSection isVisible={isVisible} />
        <StorySection isVisible={isVisible} />
        <PricingSection isVisible={isVisible} />
        <NewsSection />
        {/* <PWASection isVisible={isVisible} /> */}
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}
