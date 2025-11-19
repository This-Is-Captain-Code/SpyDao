import PortfolioRebalancer from './services/portfolioRebalancer.js';
import WebhookService from './services/webhookService.js';
import MonitoringService from './services/monitoringService.js';

class TradingWorker {
  private rebalancer: PortfolioRebalancer;
  private webhookService: WebhookService;
  private monitoring: MonitoringService;
  private isRunning: boolean = false;

  constructor() {
    this.rebalancer = new PortfolioRebalancer();
    this.webhookService = new WebhookService();
    this.monitoring = new MonitoringService();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Trading worker is already running');
      return;
    }

    console.log('Starting SpyDAO trading worker...');
    this.isRunning = true;

    try {
      // Initialize services
      await this.initializeServices();
      
      // Perform startup rebalancing check
      await this.webhookService.startupRebalanceCheck();
      
      // Schedule periodic rebalancing (8 AM EST daily)
      this.scheduleDailyRebalancing();
      
      // Schedule weekly full rebalance (Sunday 8 AM EST)
      this.scheduleWeeklyRebalancing();
      
      console.log('Trading worker started successfully');
      
    } catch (error) {
      console.error('Failed to start trading worker:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Trading worker is not running');
      return;
    }

    console.log('Stopping trading worker...');
    
    try {
      await this.monitoring.shutdown();
      this.isRunning = false;
      console.log('Trading worker stopped');
    } catch (error) {
      console.error('Error stopping trading worker:', error);
      throw error;
    }
  }

  private async initializeServices(): Promise<void> {
    console.log('Initializing services...');
    
    // Test Alpaca connection
    try {
      await this.rebalancer.getCurrentPortfolioState();
      console.log('✓ Alpaca connection established');
    } catch (error) {
      console.error('✗ Alpaca connection failed:', error);
    }

    // Test SPY tracker (optional - uses cheerio which may not be needed for core features)
    try {
      const SPYTrackerModule = await import('./services/spyTrackerService.js');
      const SPYTrackerService = SPYTrackerModule.default;
      const tracker = new SPYTrackerService();
      const composition = await tracker.getSPYComposition();
      console.log('✓ SPY tracker service working');
    } catch (error) {
      console.warn('⚠ SPY tracker service not available (cheerio may not be installed) - this is optional:', error instanceof Error ? error.message : error);
    }

    console.log('Services initialized');
  }

  private scheduleDailyRebalancing(): void {
    const schedule = () => {
      const now = new Date();
      const easternHour = this.getEasternHour(now);
      
      if (easternHour === 8) { // 8 AM EST
        console.log('Running daily rebalancing check...');
        this.rebalancer.executeRebalancing().catch(error => {
          console.error('Daily rebalancing failed:', error);
        });
      }
    };

    // Check every minute during market hours (9:30 AM - 4:00 PM EST)
    setInterval(schedule, 60 * 1000);
    console.log('Daily rebalancing scheduled');
  }

  private scheduleWeeklyRebalancing(): void {
    const schedule = () => {
      const now = new Date();
      const easternDay = this.getEasternDay(now);
      const easternHour = this.getEasternHour(now);
      
      if (easternDay === 0 && easternHour === 8) { // Sunday 8 AM EST
        console.log('Running weekly full rebalancing...');
        this.performFullRebalancing().catch(error => {
          console.error('Weekly full rebalancing failed:', error);
        });
      }
    };

    // Check every hour
    setInterval(schedule, 60 * 60 * 1000);
    console.log('Weekly rebalancing scheduled');
  }

  private async performFullRebalancing(): Promise<void> {
    console.log('Starting full portfolio rebalancing...');
    
    try {
      const report = await this.rebalancer.getRebalanceReport();
      
      if (report.isBalanced) {
        console.log('Portfolio already balanced, no changes needed');
        return;
      }

      console.log(`Executing ${report.suggestedTrades.length} trades for full rebalancing`);
      const result = await this.rebalancer.executeRebalancing();
      
      console.log('Full rebalancing completed:', {
        trades: result.trades.length,
        executed: result.executed,
        errors: result.errors.length,
        totalBuyAmount: result.totalBuyAmount,
        totalSellAmount: result.totalSellAmount,
      });

    } catch (error) {
      console.error('Full rebalancing failed:', error);
      throw error;
    }
  }

  private getEasternHour(date: Date): number {
    // This is a simplified EST calculation
    // In production, use a proper timezone library
    const offset = -5; // EST offset from UTC
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (offset * 3600000)).getHours();
  }

  private getEasternDay(date: Date): number {
    const offset = -5; // EST offset from UTC
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (offset * 3600000)).getDay();
  }

  isMarketOpen(): boolean {
    const now = new Date();
    const easternHour = this.getEasternHour(now);
    const easternDay = this.getEasternDay(now);
    
    // Market open: Mon-Fri, 9:30 AM - 4:00 PM EST
    return easternDay >= 1 && easternDay <= 5 && 
           easternHour >= 9 && (easternHour < 16 || (easternHour === 9 && now.getMinutes() >= 30));
  }

  async getCurrentPortfolioSummary(): Promise<any> {
    try {
      const [portfolioStatus, spyComposition, account] = await Promise.all([
        this.rebalancer.getRebalanceReport(),
        new (await import('./services/spyTrackerService.js')).default().getSPYComposition(),
        new (await import('./services/alpacaService.js')).default().getAccount(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        status: 'active',
        portfolio: {
          totalValue: portfolioStatus.currentHoldings.totalValue,
          cash: portfolioStatus.currentHoldings.cash,
          positions: portfolioStatus.currentHoldings.positions.size,
          isBalanced: portfolioStatus.isBalanced,
        },
        spy: {
          holdings: spyComposition.totalHoldings,
          totalValue: spyComposition.totalMarketValue,
          trackingInfo: spyComposition.lastUpdated,
        },
        account: {
          status: account.status,
          equity: parseFloat(account.equity),
          cash: parseFloat(account.cash),
          buyingPower: parseFloat(account.buying_power),
        },
        monitoring: {
          isRunning: this.isRunning,
          healthChecks: 0, // TODO: Integrate with monitoring service
        },
      };
    } catch (error) {
      console.error('Failed to get portfolio summary:', error);
      throw error;
    }
  }

  async emergencyStop(): Promise<void> {
    console.log('EMERGENCY STOP triggered');
    
    // Cancel all pending orders
    try {
      const orders = await this.rebalancer['alpacaService'].getOrders({ status: 'open' });
      for (const order of orders) {
        await this.rebalancer['alpacaService'].cancelOrder(order.id);
        console.log(`Cancelled order: ${order.symbol}-${order.side} (${order.id})`);
      }
    } catch (error) {
      console.error('Error cancelling orders during emergency stop:', error);
    }

    // Stop the worker
    await this.stop();
  }

  // Graceful shutdown handler
  async handleSignal(signal: string): Promise<void> {
    console.log(`Received signal: ${signal}`);
    
    if (signal === 'SIGTERM' || signal === 'SIGINT') {
      console.log('Performing graceful shutdown...');
      await this.stop();
      process.exit(0);
    } else if (signal === 'SIGUSR2') {
      console.log('Emergency stop triggered');
      await this.emergencyStop();
      process.exit(1);
    }
  }
}

// Singleton instance
let workerInstance: TradingWorker | null = null;

export function getTradingWorker(): TradingWorker {
  if (!workerInstance) {
    workerInstance = new TradingWorker();
  }
  return workerInstance;
}

// Export for direct usage
export default TradingWorker;