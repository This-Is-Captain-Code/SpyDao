import { Button } from '@/components/ui/button';
import { ArrowRight, Landmark, Users, Globe } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

export function HeroSection() {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative px-4 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl animate-fade-in-up">
              SPY DAO
            </h1>
            <p className="mt-6 text-xl leading-8 text-blue-100 sm:text-2xl animate-fade-in-up animation-delay-200">
              Democratizing Corporate Governance for Index Investors
            </p>
            <p className="mt-4 text-lg text-blue-200 animate-fade-in-up animation-delay-400">
              Unlock $55 trillion in voting power across the S&P 500. 
              Your shares, your voice, collectively powered.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
            <Button
              size="lg"
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 text-lg font-semibold px-8 py-4 rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 transition-all duration-300"
            >
              Join the Revolution
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 text-lg px-8 py-4 rounded-xl"
            >
              Learn More
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center mx-auto max-w-4xl">
            <div className="animate-fade-in-up animation-delay-800">
              <Landmark className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold">500 Companies</h3>
              <p className="text-blue-200 mt-2">One deposit, complete market access</p>
            </div>
            <div className="animate-fade-in-up animation-delay-1000">
              <Users className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold">Delegated Power</h3>
              <p className="text-blue-200 mt-2">Your shares. Your voice. Our collective strength.</p>
            </div>
            <div className="animate-fade-in-up animation-delay-1200">
              <Globe className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold">Global Access</h3>
              <p className="text-blue-200 mt-2">Permissionless governance at internet scale</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}