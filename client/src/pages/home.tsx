import { HeroSection } from '@/components/HeroSection';
import { TrendingStocks } from '@/components/TrendingStocks';
import { MeetingsCalendar } from '@/components/MeetingsCalendar';
import { ValueProps } from '@/components/ValueProps';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrendingStocks />
      <MeetingsCalendar />
      <ValueProps />
      <CTASection />
      <Footer />
    </div>
  );
}
