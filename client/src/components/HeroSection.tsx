import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

export function HeroSection() {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <section className="relative py-16 flex items-start justify-center overflow-hidden pt-32 sm:pt-36">
      {/* Glassmorphism Container - Centered */}
      <div className="relative z-10 w-[90%] max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-container-enhanced rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Main Content - Left Side */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 dark:text-black leading-tight mb-6">
                Democratizing Corporate Governance for Index Investors
              </h1>
              
              <p className="text-base sm:text-lg text-gray-800 dark:text-gray-900 leading-relaxed mb-8">
                Unlock $55 trillion in voting power across the S&P 500. Your shares, your voice, collectively powered through decentralized governance.
              </p>
              
              {/* Button and Explore Link - Side by Side */}
              <div className="flex items-center gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-black hover:bg-gray-800 text-white text-base font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Explore Link */}
                <div className="flex items-center gap-3 text-gray-900 dark:text-black cursor-pointer group">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-900 dark:border-black flex items-center justify-center group-hover:border-gray-700 dark:group-hover:border-gray-800 transition-colors">
                    <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
                  </div>
                  <span className="font-medium group-hover:text-gray-700 dark:group-hover:text-gray-800 transition-colors">
                    Explore
                  </span>
                </div>
              </div>
            </div>

            {/* Animated SVG Illustration - Right Side */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md h-80 lg:h-96 flex items-center justify-center relative overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0, 0, 0, 0.1)" />
                      <stop offset="100%" stopColor="rgba(0, 0, 0, 0.05)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Animated background circles */}
                  <circle cx="200" cy="200" r="150" fill="url(#grad1)" className="animate-pulse" />
                  
                  {/* Animated voting/gov nodes */}
                  <g style={{ animation: 'bounce-slow 3s ease-in-out infinite' }}>
                    <circle cx="150" cy="150" r="20" fill="rgba(0, 0, 0, 0.15)" />
                    <circle cx="150" cy="150" r="8" fill="rgba(0, 0, 0, 0.3)" />
                  </g>
                  
                  <g style={{ animation: 'bounce-slow 3s ease-in-out infinite 1s' }}>
                    <circle cx="250" cy="150" r="20" fill="rgba(0, 0, 0, 0.15)" />
                    <circle cx="250" cy="150" r="8" fill="rgba(0, 0, 0, 0.3)" />
                  </g>
                  
                  <g style={{ animation: 'bounce-slow 3s ease-in-out infinite 2s' }}>
                    <circle cx="200" cy="250" r="20" fill="rgba(0, 0, 0, 0.15)" />
                    <circle cx="200" cy="250" r="8" fill="rgba(0, 0, 0, 0.3)" />
                  </g>
                  
                  {/* Animated connecting lines */}
                  <line 
                    x1="150" 
                    y1="150" 
                    x2="200" 
                    y2="250" 
                    stroke="rgba(0, 0, 0, 0.2)" 
                    strokeWidth="2"
                    style={{ animation: 'pulse-slow 2s ease-in-out infinite' }}
                  />
                  <line 
                    x1="250" 
                    y1="150" 
                    x2="200" 
                    y2="250" 
                    stroke="rgba(0, 0, 0, 0.2)" 
                    strokeWidth="2"
                    style={{ animation: 'pulse-slow 2s ease-in-out infinite 0.5s' }}
                  />
                  <line 
                    x1="150" 
                    y1="150" 
                    x2="250" 
                    y2="150" 
                    stroke="rgba(0, 0, 0, 0.2)" 
                    strokeWidth="2"
                    style={{ animation: 'pulse-slow 2s ease-in-out infinite 1s' }}
                  />
                  
                  {/* Central governance hub */}
                  <circle 
                    cx="200" 
                    cy="200" 
                    r="40" 
                    fill="rgba(0, 0, 0, 0.1)" 
                    style={{ animation: 'pulse-slow 2.5s ease-in-out infinite' }}
                  />
                  <circle cx="200" cy="200" r="15" fill="rgba(0, 0, 0, 0.25)" />
                  
                  {/* Rotating outer ring */}
                  <g transform="translate(200, 200)">
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="100" 
                      fill="none" 
                      stroke="rgba(0, 0, 0, 0.1)" 
                      strokeWidth="2"
                      strokeDasharray="10 5"
                      style={{ animation: 'spin-slow 20s linear infinite' }}
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}