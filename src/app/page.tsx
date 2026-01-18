import { HeroSection } from '@/components/home/hero-section'
import { InteractiveSection } from '@/components/home/interactive-section'
import { SampleGallery } from '@/components/home/sample-gallery'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { FeaturesSection } from '@/components/home/features-section'
import { FAQSection } from '@/components/home/faq-section'
import { CTASection } from '@/components/home/cta-section'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden">
      <div className="relative container max-w-5xl px-4 py-12 sm:py-16">
        <HeroSection />
        <div className="mx-auto mt-12 max-w-3xl space-y-12 sm:mt-16 sm:space-y-16">
          <InteractiveSection />
          <SampleGallery />
        </div>
      </div>

      <HowItWorksSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
    </main>
  )
}
