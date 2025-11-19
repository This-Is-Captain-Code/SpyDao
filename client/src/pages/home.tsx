import { HeroSection } from '@/components/HeroSection';
import { InteractiveGradient } from '@/components/InteractiveGradient';
import { Marquee } from '@/components/Marquee';
import { QuoteSection } from '@/components/QuoteSection';
import { TrendingStocks } from '@/components/TrendingStocks';
import { MeetingsCalendar } from '@/components/MeetingsCalendar';
import { ValueProps } from '@/components/ValueProps';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Interactive Gradient Background */}
      <InteractiveGradient />
      
      {/* Dot Pattern Overlay */}
      <div className="fixed inset-0 -z-10 bg-dot-pattern-sparse opacity-25"></div>
      
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-nav rounded-2xl w-[85%]">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Name */}
            <div className="flex items-center">
              <span className="text-gray-900 dark:text-black font-semibold text-lg">spy.dao</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-4 text-sm lg:text-base">
              <a href="#" className="text-gray-900 dark:text-black hover:text-gray-700 dark:hover:text-gray-800 transition-colors">About us</a>
              <a href="/vault" className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">Dapp</a>
            </div>
          </div>
        </div>
      </nav>
      
      <HeroSection />
      <Marquee />
      <QuoteSection />
      <TrendingStocks />
      <MeetingsCalendar />
      <ValueProps />
      <CTASection />
      <Footer />
    </div>
  );
}
