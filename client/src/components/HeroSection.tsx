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
                    <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(0, 0, 0, 0.15)" />
                      <stop offset="100%" stopColor="rgba(0, 0, 0, 0.05)" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Background grid pattern */}
                  <g opacity="0.1">
                    <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="1" />
                    <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="1" />
                    <line x1="0" y1="300" x2="400" y2="300" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="1" />
                    <line x1="100" y1="0" x2="100" y2="400" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="1" />
                    <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="1" />
                    <line x1="300" y1="0" x2="300" y2="400" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="1" />
                  </g>
                  
                  {/* Central governance hub */}
                  <g>
                    <circle 
                      cx="200" 
                      cy="200" 
                      r="50" 
                      fill="url(#nodeGradient)" 
                      style={{ animation: 'pulse-slow 3s ease-in-out infinite' }}
                    />
                    <circle 
                      cx="200" 
                      cy="200" 
                      r="30" 
                      fill="rgba(0, 0, 0, 0.2)" 
                      style={{ animation: 'pulse-slow 2s ease-in-out infinite 0.5s' }}
                    />
                    <circle cx="200" cy="200" r="12" fill="rgba(0, 0, 0, 0.4)" filter="url(#glow)" />
                  </g>
                  
                  {/* Network nodes - Top row */}
                  <g style={{ animation: 'bounce-slow 4s ease-in-out infinite' }}>
                    <circle cx="100" cy="100" r="20" fill="rgba(0, 0, 0, 0.12)" />
                    <circle cx="100" cy="100" r="8" fill="rgba(0, 0, 0, 0.3)" />
                  </g>
                  
                  <g style={{ animation: 'bounce-slow 4s ease-in-out infinite 0.7s' }}>
                    <circle cx="300" cy="100" r="20" fill="rgba(0, 0, 0, 0.12)" />
                    <circle cx="300" cy="100" r="8" fill="rgba(0, 0, 0, 0.3)" />
                  </g>
                  
                  {/* Network nodes - Bottom row */}
                  <g style={{ animation: 'bounce-slow 4s ease-in-out infinite 1.4s' }}>
                    <circle cx="100" cy="300" r="20" fill="rgba(0, 0, 0, 0.12)" />
                    <circle cx="100" cy="300" r="8" fill="rgba(0, 0, 0, 0.3)" />
                  </g>
                  
                  <g style={{ animation: 'bounce-slow 4s ease-in-out infinite 2.1s' }}>
                    <circle cx="300" cy="300" r="20" fill="rgba(0, 0, 0, 0.12)" />
                    <circle cx="300" cy="300" r="8" fill="rgba(0, 0, 0, 0.3)" />
                  </g>
                  
                  {/* Side nodes */}
                  <g style={{ animation: 'bounce-slow 4s ease-in-out infinite 0.35s' }}>
                    <circle cx="50" cy="200" r="18" fill="rgba(0, 0, 0, 0.1)" />
                    <circle cx="50" cy="200" r="7" fill="rgba(0, 0, 0, 0.25)" />
                  </g>
                  
                  <g style={{ animation: 'bounce-slow 4s ease-in-out infinite 1.75s' }}>
                    <circle cx="350" cy="200" r="18" fill="rgba(0, 0, 0, 0.1)" />
                    <circle cx="350" cy="200" r="7" fill="rgba(0, 0, 0, 0.25)" />
                  </g>
                  
                  {/* Connecting lines - Network structure */}
                  <g opacity="0.3">
                    <line 
                      x1="200" 
                      y1="200" 
                      x2="100" 
                      y2="100" 
                      stroke="rgba(0, 0, 0, 0.2)" 
                      strokeWidth="2"
                      style={{ animation: 'pulse-slow 2.5s ease-in-out infinite' }}
                    />
                    <line 
                      x1="200" 
                      y1="200" 
                      x2="300" 
                      y2="100" 
                      stroke="rgba(0, 0, 0, 0.2)" 
                      strokeWidth="2"
                      style={{ animation: 'pulse-slow 2.5s ease-in-out infinite 0.3s' }}
                    />
                    <line 
                      x1="200" 
                      y1="200" 
                      x2="100" 
                      y2="300" 
                      stroke="rgba(0, 0, 0, 0.2)" 
                      strokeWidth="2"
                      style={{ animation: 'pulse-slow 2.5s ease-in-out infinite 0.6s' }}
                    />
                    <line 
                      x1="200" 
                      y1="200" 
                      x2="300" 
                      y2="300" 
                      stroke="rgba(0, 0, 0, 0.2)" 
                      strokeWidth="2"
                      style={{ animation: 'pulse-slow 2.5s ease-in-out infinite 0.9s' }}
                    />
                    <line 
                      x1="200" 
                      y1="200" 
                      x2="50" 
                      y2="200" 
                      stroke="rgba(0, 0, 0, 0.2)" 
                      strokeWidth="2"
                      style={{ animation: 'pulse-slow 2.5s ease-in-out infinite 1.2s' }}
                    />
                    <line 
                      x1="200" 
                      y1="200" 
                      x2="350" 
                      y2="200" 
                      stroke="rgba(0, 0, 0, 0.2)" 
                      strokeWidth="2"
                      style={{ animation: 'pulse-slow 2.5s ease-in-out infinite 1.5s' }}
                    />
                  </g>
                  
                  {/* Inter-node connections */}
                  <g opacity="0.15">
                    <line 
                      x1="100" 
                      y1="100" 
                      x2="300" 
                      y2="100" 
                      stroke="rgba(0, 0, 0, 0.15)" 
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                      style={{ animation: 'pulse-slow 3s ease-in-out infinite' }}
                    />
                    <line 
                      x1="100" 
                      y1="300" 
                      x2="300" 
                      y2="300" 
                      stroke="rgba(0, 0, 0, 0.15)" 
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                      style={{ animation: 'pulse-slow 3s ease-in-out infinite 1s' }}
                    />
                  </g>
                  
                  {/* Rotating outer ring */}
                  <g transform="translate(200, 200)">
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="120" 
                      fill="none" 
                      stroke="rgba(0, 0, 0, 0.08)" 
                      strokeWidth="2"
                      strokeDasharray="8 4"
                      style={{ animation: 'spin-slow 25s linear infinite' }}
                    />
                  </g>
                  
                  {/* Voting/Governance symbols - Small checkmarks */}
                  <g opacity="0.4">
                    <path 
                      d="M 150 150 L 160 160 L 180 140" 
                      stroke="rgba(0, 0, 0, 0.3)" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeLinecap="round"
                      style={{ animation: 'pulse-slow 2s ease-in-out infinite' }}
                    />
                    <path 
                      d="M 250 150 L 260 160 L 280 140" 
                      stroke="rgba(0, 0, 0, 0.3)" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeLinecap="round"
                      style={{ animation: 'pulse-slow 2s ease-in-out infinite 0.5s' }}
                    />
                    <path 
                      d="M 150 250 L 160 260 L 180 240" 
                      stroke="rgba(0, 0, 0, 0.3)" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeLinecap="round"
                      style={{ animation: 'pulse-slow 2s ease-in-out infinite 1s' }}
                    />
                    <path 
                      d="M 250 250 L 260 260 L 280 240" 
                      stroke="rgba(0, 0, 0, 0.3)" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeLinecap="round"
                      style={{ animation: 'pulse-slow 2s ease-in-out infinite 1.5s' }}
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