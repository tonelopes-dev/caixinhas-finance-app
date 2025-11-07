'use client';

import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Testimonials } from '@/components/landing/testimonials';
import { Faq } from '@/components/landing/faq';
import { Cta } from '@/components/landing/cta';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { FullyCustomizable } from '@/components/landing/fully-customizable';
import { AnimatedDiv } from '@/components/ui/animated-div';

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col text-foreground">
      <main className="flex-1">
        <AnimatedDiv>
          <Hero />
        </AnimatedDiv>
        <AnimatedDiv>
          <FeatureHighlights />
        </AnimatedDiv>
        <AnimatedDiv>
          <Features />
        </AnimatedDiv>
        <AnimatedDiv>
          <FullyCustomizable />
        </AnimatedDiv>
        <AnimatedDiv>
          <Testimonials />
        </AnimatedDiv>
        <AnimatedDiv>
          <Faq />
        </AnimatedDiv>
        <AnimatedDiv>
          <Cta />
        </AnimatedDiv>
      </main>
    </div>
  );
}
