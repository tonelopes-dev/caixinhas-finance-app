'use client';

import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Testimonials } from '@/components/landing/testimonials';
import { Faq } from '@/components/landing/faq';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { FullyCustomizable } from '@/components/landing/fully-customizable';

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeatureHighlights />
        <Features />
        <FullyCustomizable />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
