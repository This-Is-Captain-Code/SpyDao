import { TrendingUp, TrendingDown, Flame, Clock } from 'lucide-react';
import { trendingStocks } from '@/lib/mock-data';

export function TrendingStocks() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'hot':
        return <Flame className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendBadgeClass = (trend: string) => {
    switch (trend) {
      case 'hot':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'trending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'upcoming':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-500',
      'Consumer Discretionary': 'bg-purple-500',
      'Financial Services': 'bg-green-500',
      'Communication Services': 'bg-orange-500',
    };
    return colors[sector] || 'bg-gray-500';
  };

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Hot & Trending in S&P 500
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            See what's moving the markets and track S&P 500 companies in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendingStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {stock.symbol}
                    </h3>
                    <div className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getTrendBadgeClass(stock.trend)}`}>
                      {getTrendIcon(stock.trend)}
                      <span className="capitalize">{stock.trend}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stock.name}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stock.price.toFixed(2)}
                  </span>
                  <div className={`flex items-center space-x-1 ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Market Cap: {stock.marketCap}
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${getSectorColor(stock.sector)}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{stock.sector}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Track Governance
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            View All S&P 500 Companies
          </button>
        </div>
      </div>
    </section>
  );
}