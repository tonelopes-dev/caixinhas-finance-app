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
} from "@/components/landing-page"
import { AnimatedMarqueeHero } from "../landing/animated-marquee-hero"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function LandingPageClient() {
  const { scrollY, isVisible } = useScrollAnimations()
  const marqueeImages = PlaceHolderImages.filter(
    (img) => img.id.startsWith("feature") || img.id.startsWith("cta")
  ).map((img) => img.imageUrl);

  return (
    <div className="min-h-screen">
      <Header />
      <AnimatedMarqueeHero
        tagline="Sonhar juntos é o primeiro passo para conquistar"
        title={
          <>
            Tome as Melhores{" "}
            <span className="text-primary relative">Decisões</span> Financeiras
          </>
        }
        description="Transforme a gestão do dinheiro em uma jornada colaborativa. Com o Caixinhas, vocês organizam despesas, criam metas e realizam sonhos, juntos."
        ctaText="Começar Agora"
        images={marqueeImages}
      />
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
