import { 
  Vote, 
  Users, 
  DollarSign, 
  Shield, 
  Globe, 
  TrendingUp 
} from 'lucide-react';

const features = [
  {
    icon: Vote,
    title: "Democratic Governance",
    description: "One token equals one vote across all 500 S&P companies. Your stake in the index gives you real voting power.",
    color: "text-blue-600"
  },
  {
    icon: Users,
    title: "Collective Power",
    description: "Pool voting rights with thousands of other investors. Together, we command institutional-level influence.",
    color: "text-green-600"
  },
  {
    icon: DollarSign,
    title: "Passive Income + Governance",
    description: "Earn market returns while actively participating in corporate governance. Get double the value from your investment.",
    color: "text-yellow-600"
  },
  {
    icon: Shield,
    title: "Transparent Ownership",
    description: "Verified on-chain ownership aligned with actual SPY shares through transparent protocols and regulated intermediaries.",
    color: "text-purple-600"
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Participate in American corporate governance through decentralized protocols. Accessible governance for all qualified investors.",
    color: "text-indigo-600"
  },
  {
    icon: TrendingUp,
    title: "Market Returns",
    description: "Get exposure to the entire S&P 500 performance while gaining governance rights. Win-win for passive investors.",
    color: "text-red-600"
  }
];

export function ValueProps() {
  return (
    <section className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Transform Index Investing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Finally, you can have both passive returns and active governance rights
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:bg-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">The $55 Trillion Opportunity</h3>
            <p className="text-blue-100 mb-6">
              That's the current market cap of S&P 500 index funds. Today, all that voting power is controlled by a few institutions.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400">500</div>
                <div className="text-sm text-blue-200">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">10,000+</div>
                <div className="text-sm text-blue-200">Participants</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">100%</div>
                <div className="text-sm text-blue-200">Governance Rights</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}