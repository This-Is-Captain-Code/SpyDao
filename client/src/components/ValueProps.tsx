import { useState, useEffect } from 'react';
import { 
  Vote, 
  Users, 
  Shield, 
  TrendingUp 
} from 'lucide-react';

const features = [
  {
    icon: Vote,
    title: "Democratic Governance",
    description: "One token equals one vote across all 500 S&P companies. Your stake in the index gives you real voting power.",
    details: "Every spDAO token you hold represents a proportional share of voting rights across the entire S&P 500. Unlike traditional index funds where institutions control all votes, SPY DAO ensures your voice is heard in every shareholder meeting, proxy vote, and governance decision."
  },
  {
    icon: Users,
    title: "Collective Power",
    description: "Pool voting rights with thousands of other investors. Together, we command institutional-level influence.",
    details: "By aggregating voting power from thousands of individual investors, SPY DAO creates a collective voice that rivals institutional shareholders. This pooled approach means your individual stake contributes to meaningful change across corporate America, from ESG initiatives to executive compensation."
  },
  {
    icon: Shield,
    title: "Transparent Ownership",
    description: "Verified on-chain ownership aligned with actual SPY shares through transparent protocols and regulated intermediaries.",
    details: "All ownership and voting rights are verified on-chain through zero-knowledge proofs and transparent protocols. Every spDAO token is backed by real SPY shares held by regulated custodians, ensuring your governance rights are legitimate, verifiable, and enforceable."
  },
  {
    icon: TrendingUp,
    title: "Market Returns",
    description: "Get exposure to the entire S&P 500 performance while gaining governance rights. Win-win for passive investors.",
    details: "Maintain full exposure to S&P 500 market performance while gaining unprecedented governance capabilities. Your investment tracks the index's returns while you participate in shaping the future of America's largest corporations through active voting and proposal submission."
  }
];

export function ValueProps() {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentFeature = features[selectedFeature];

  // Auto-rotate features every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedFeature((prev) => (prev + 1) % features.length);
        setIsTransitioning(false);
      }, 300); // Half of transition duration
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side - Hero Text with Selectors */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Transform Index Investing
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Finally, you can have both passive returns and active governance rights. Choose a feature to explore:
            </p>

            {/* Feature Selectors */}
            <div className="space-y-1.5">
              {features.map((feature, index) => (
                <button
                  key={feature.title}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setSelectedFeature(index);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  className={`w-full text-left rounded-lg p-2 transition-all ${
                    selectedFeature === index
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      selectedFeature === index ? 'bg-white/20' : 'bg-white dark:bg-gray-700'
                    }`}>
                      <feature.icon className="h-3.5 w-3.5 text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Feature Explanation */}
          <div className="flex flex-col justify-center">
            <div 
              className={`p-8 md:p-12 transition-opacity duration-500 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ transitionDuration: '600ms' }}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {currentFeature.title}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {currentFeature.description}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {currentFeature.details}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}