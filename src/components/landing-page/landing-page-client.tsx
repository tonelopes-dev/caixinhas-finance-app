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
  NewsSection,
  FAQSection,
  CTASection,
  Footer,
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
