import axios from 'axios';
// import * as cheerio from 'cheerio'; // Commented out - using mock data for now

interface SPYHolding {
  symbol: string;
  name: string;
  shares: number;
  weight: number;
  marketValue: number;
  sector: string;
}

interface SPYComposition {
  totalMarketValue: number;
  holdings: SPYHolding[];
  totalHoldings: number;
  lastUpdated: string;
}

interface StockPriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

class SPYTrackerService {
  private cache: Map<string, any> = new Map();
  private CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  private getCacheKey(key: string): string {
    return `spy_${key}`;
  }

  private isCached(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    if (Date.now() - cached.timestamp > this.CACHE_TIMEOUT) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getSPYComposition(): Promise<SPYComposition> {
    const cacheKey = this.getCacheKey('composition');
    
    if (this.isCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    // Using mock data for now (cheerio scraping disabled)
    console.log('Using mock SPY composition data...');
    const composition = this.getMockSPYComposition();
    this.setCache(cacheKey, composition);
    return composition;
  }

  private getMockSPYComposition(): SPYComposition {
    // Mock SPY composition based on actual S&P 500 weights (simplified)
    const mockData = [
      { symbol: 'AAPL', name: 'Apple Inc', weight: 7.2, sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 6.8, sector: 'Technology' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 5.4, sector: 'Technology' },
      { symbol: 'AMZN', name: 'Amazon.com Inc', weight: 3.5, sector: 'Consumer Discretionary' },
      { symbol: 'META', name: 'Meta Platforms Inc', weight: 2.8, sector: 'Communication Services' },
      { symbol: 'GOOGL', name: 'Alphabet Inc Class A', weight: 2.4, sector: 'Communication Services' },
      { symbol: 'GOOG', name: 'Alphabet Inc Class C', weight: 2.3, sector: 'Communication Services' },
      { symbol: 'TSLA', name: 'Tesla Inc', weight: 1.9, sector: 'Consumer Discretionary' },
      { symbol: 'BRK.B', name: 'Berkshire Hathaway Class B', weight: 1.8, sector: 'Financial Services' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co', weight: 1.4, sector: 'Financial Services' },
      // Add more stocks for realistic simulation
      { symbol: 'JNJ', name: 'Johnson & Johnson', weight: 1.2, sector: 'Healthcare' },
      { symbol: 'V', name: 'Visa Inc', weight: 1.1, sector: 'Financial Services' },
      { symbol: 'PG', name: 'Procter & Gamble', weight: 1.0, sector: 'Consumer Staples' },
      { symbol: 'UNH', name: 'UnitedHealth Group', weight: 1.2, sector: 'Healthcare' },
      { symbol: 'HD', name: 'Home Depot', weight: 0.9, sector: 'Consumer Discretionary' },
      { symbol: 'DIS', name: 'Walt Disney', weight: 0.8, sector: 'Communication Services' },
      { symbol: 'NFLX', name: 'Netflix Inc', weight: 0.6, sector: 'Communication Services' },
      { symbol: 'ADBE', name: 'Adobe Inc', weight: 0.5, sector: 'Technology' },
      { symbol: 'CRM', name: 'Salesforce Inc', weight: 0.5, sector: 'Technology' },
      { symbol: 'PYPL', name: 'PayPal Holdings', weight: 0.4, sector: 'Financial Services' },
    ];

    // Calculate market value for each holding assuming $1M total
    const totalMarketValue = 1_000_000;
    const holdings: SPYHolding[] = mockData.map(item => ({
      symbol: item.symbol,
      name: item.name,
      weight: item.weight,
      marketValue: (item.weight / 100) * totalMarketValue,
      shares: Math.floor(((item.weight / 100) * totalMarketValue) / 100), // Assume $100 per share for mock
      sector: item.sector,
    }));

    return {
      totalMarketValue,
      holdings,
      totalHoldings: holdings.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getCurrentPrices(symbols: string[]): Promise<Map<string, StockPriceData>> {
    const cacheKey = this.getCacheKey(`prices_${symbols.join('_')}`);
    
    if (this.isCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      const prices = new Map<string, StockPriceData>();
      
      // Get stock prices using a free API
      const promises = symbols.map(async (symbol) => {
        try {
          const response = await axios.get(`https://api.alpaca.markets/v1beta1/crypto/quotes/${symbol}`, {
            headers: {
              'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
              'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
            },
            timeout: 5000,
          });
          
          return response.data;
        } catch (error) {
          // Use mock data for development
          return {
            symbol,
            price: 100 + Math.random() * 200,
            change: (Math.random() - 0.5) * 10,
            changePercent: (Math.random() - 0.5) * 5,
            volume: Math.floor(Math.random() * 10000000),
            marketCap: Math.floor(Math.random() * 500000000000),
          };
        }
      });

      const results = await Promise.allSettled(promises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const data = result.value;
          prices.set(data.symbol, {
            symbol: data.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            marketCap: data.marketCap,
          });
        }
      });

      this.setCache(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error('Error getting stock prices:', error);
      
      // Return mock data for development
      const mockPrices = new Map<string, StockPriceData>();
      symbols.forEach(symbol => {
        mockPrices.set(symbol, {
          symbol,
          price: 100 + Math.random() * 200,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 10000000),
          marketCap: Math.floor(Math.random() * 500000000000),
        });
      });
      
      return mockPrices;
    }
  }

  async getSPYPrice(): Promise<number> {
    const cacheKey = this.getCacheKey('spy_price');
    
    if (this.isCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      const response = await axios.get('https://api.alpaca.markets/v1beta1/crypto/quotes/SPY', {
        headers: {
          'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
          'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
        },
        timeout: 5000,
      });

      const price = response.data.price || 480;
      this.setCache(cacheKey, price);
      return price;
    } catch (error) {
      console.error('Error getting SPY price:', error);
      
      // Use mock SPY price for development
      return 480;
    }
  }

  calculateTargetAllocation(totalCapital: number, spyComposition: SPYComposition): Map<string, number> {
    const targetAllocation = new Map<string, number>();
    
    spyComposition.holdings.forEach(holding => {
      // Calculate target investment amount for each stock
      const targetAmount = (holding.weight / 100) * totalCapital;
      targetAllocation.set(holding.symbol, targetAmount);
    });
    
    return targetAllocation;
  }
}

export default SPYTrackerService;