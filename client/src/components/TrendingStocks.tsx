import { Vote, Users, Shield, Scale, Heart } from 'lucide-react';
import { governanceOpportunities } from '@/lib/mock-data';

export function TrendingStocks() {
  const getFocusIcon = (focus: string) => {
    switch (focus) {
      case 'ESG':
        return <Shield className="h-4 w-4" />;
      case 'Executive Compensation':
        return <Scale className="h-4 w-4" />;
      case 'Board Changes':
        return <Users className="h-4 w-4" />;
      case 'Climate Action':
        return <Shield className="h-4 w-4" />;
      case 'AI Policy':
        return <Vote className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getFocusColor = (focus: string) => {
    switch (focus) {
      case 'ESG':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Executive Compensation':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Board Changes':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Climate Action':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'AI Policy':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-500',
      'Healthcare': 'bg-red-500',
      'Financial Services': 'bg-green-500',
      'Consumer Discretionary': 'bg-gray-500',
      'Consumer Staples': 'bg-yellow-500',
    };
    return colors[sector] || 'bg-gray-500';
  };

  const getParticipationBadge = (level: string) => {
    switch (level) {
      case 'High':
        return 'border-green-200 bg-green-50 dark:bg-green-950/30';
      case 'Medium':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30';
      case 'Low':
        return 'border-red-200 bg-red-50 dark:bg-red-950/30';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  return (
    <section className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            S&P 500 Governance Opportunities
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Your stake equals your voice. See where SPY DAO is making the biggest impact across corporate America.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {governanceOpportunities.map((company) => (
            <div
              key={company.symbol}
              className={`group relative rounded-xl border p-5 shadow-sm transition-all hover:shadow-lg glass-card ${getParticipationBadge(company.participationLevel)}`}
            >
              {/* Heart Icon - Top Right */}
              <button className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
              </button>

              <div className="flex items-start justify-between mb-3 pr-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">$</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                      {company.symbol}
                    </h3>
                    <div className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${getFocusColor(company.governanceFocus)}`}>
                      {getFocusIcon(company.governanceFocus)}
                      <span className="text-ellipsis overflow-hidden max-w-16">{company.governanceFocus}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {company.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {company.votingPower}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    voting power
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Governance</div>
                  <div className="font-medium text-gray-900 dark:text-white">{company.governanceScore}/100</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${getSectorColor(company.sector)}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{company.sector}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full rounded-lg bg-black hover:bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors">
                  Vote Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All 500 S&P companies under one governance umbrella. 
            Your share equals your collective vote.
          </p>
        </div>
      </div>
    </section>
  );
}