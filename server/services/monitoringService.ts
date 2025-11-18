// Simple logger implementation without winston
import PortfolioRebalancer from './portfolioRebalancer.js';
import AlpacaService from './alpacaService.js';
import SPYTrackerService from './spyTrackerService.js';

// Fix for child_process import issue - use a custom logger without winston
class SimpleLogger {
  private logLevel: string;

  constructor(level = 'info') {
    this.logLevel = level;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private format(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const argsStr = args.length > 0 ? ` ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${argsStr}`;
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, ...args));
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, ...args));
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, ...args));
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, ...args));
    }
  }
}

interface SystemMetrics {
  timestamp: Date;
  portfolioValue: number;
  cashBalance: number;
  positions: number;
  spyDeviation: number;
  lastRebalance: Date | null;
  pendingOrders: number;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  details?: Record<string, any>;
  error?: string;
}

class MonitoringService {
  private logger: SimpleLogger;
  private al: AlpacaService;
  private tracker: SPYTrackerService;
  private rebalancer: PortfolioRebalancer;
  private healthChecks: Map<string, HealthStatus> = new Map();
  private metrics: SystemMetrics | null = null;

  constructor() {
    this.logger = new SimpleLogger(process.env.LOG_LEVEL || 'info');
    this.al = new AlpacaService();
    this.tracker = new SPYTrackerService();
    this.rebalancer = new PortfolioRebalancer();

    this.startMonitoring();
  }

  async startMonitoring(): Promise<void> {
    this.logger.info('Starting monitoring service');
    
    // Initial health check
    await this.performHealthChecks();
    
    // Start periodic checks
    const checkInterval = parseInt(process.env.MONITORING_INTERVAL || '300000'); // 5 minutes
    
    setInterval(async () => {
      try {
        await this.performHealthChecks();
        await this.collectMetrics();
      } catch (error) {
        this.logger.error('Periodic health check failed:', error);
      }
    }, checkInterval);

    // Start portfolio sync every 15 minutes
    setInterval(async () => {
      try {
        await this.syncPortfolioMetrics();
      } catch (error) {
        this.logger.error('Portfolio sync failed:', error);
      }
    }, 15 * 60 * 1000);

    // Rebalance check daily
    setInterval(async () => {
      try {
        await this.checkRebalancingNeeded();
      } catch (error) {
        this.logger.error('Rebalancing check failed:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }

  async performHealthChecks(): Promise<void> {
    const checks = [
      this.checkAlpacaService(),
      this.checkSPYTrackerService(),
      this.checkPortfolioRebalancer(),
      this.checkSystemResources(),
    ];

    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      const services = ['Alpaca API', 'SPY Tracker', 'Portfolio Rebalancer', 'System Resources'];
      const service = services[index];
      
      if (result.status === 'fulfilled') {
        this.healthChecks.set(service, result.value);
        this.logger.debug(`${service} health check passed`);
      } else {
        this.healthChecks.set(service, {
          service,
          status: 'unhealthy',
          lastCheck: new Date(),
          error: result.reason.message || 'Health check failed',
          details: result.reason,
        });
        this.logger.error(`${service} health check failed:`, result.reason);
      }
    });
  }

  private async checkAlpacaService(): Promise<HealthStatus> {
    try {
      const account = await this.al.getAccount();
      const positions = await this.al.getPositions();
      
      return {
        service: 'Alpaca API',
        status: 'healthy',
        lastCheck: new Date(),
        details: {
          accountType: account.account_type,
          cash: parseFloat(String(account.cash)),
          equity: parseFloat(String(account.equity)),
          positionsCount: positions.length,
          buyingPower: parseFloat(String(account.buying_power)),
        },
      };
    } catch (error: any) {
      return {
        service: 'Alpaca API',
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error.message,
      };
    }
  }

  private async checkSPYTrackerService(): Promise<HealthStatus> {
    try {
      const composition = await this.tracker.getSPYComposition();
      
      return {
        service: 'SPY Tracker',
        status: 'healthy',
        lastCheck: new Date(),
        details: {
          totalHoldings: composition.totalHoldings,
          totalMarketValue: composition.totalMarketValue,
          lastUpdated: composition.lastUpdated,
        },
      };
    } catch (error: any) {
      return {
        service: 'SPY Tracker',
        status: 'degraded', // Use mock data as fallback
        lastCheck: new Date(),
        error: error.message,
      };
    }
  }

  private async checkPortfolioRebalancer(): Promise<HealthStatus> {
    try {
      const report = await this.rebalancer.getRebalanceReport();
      
      return {
        service: 'Portfolio Rebalancer',
        status: 'healthy',
        lastCheck: new Date(),
        details: {
          isBalanced: report.isBalanced,
          positionsCount: report.currentHoldings.positions.size,
          totalValue: report.currentHoldings.totalValue,
          cash: report.currentHoldings.cash,
          suggestedTrades: report.suggestedTrades.length,
        },
      };
    } catch (error: any) {
      return {
        service: 'Portfolio Rebalancer',
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error.message,
      };
    }
  }

  private async checkSystemResources(): Promise<HealthStatus> {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      service: 'System Resources',
      status: 'healthy',
      lastCheck: new Date(),
      details: {
        memoryUsage: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
          external: Math.round(memory.external / 1024 / 1024),
        },
        uptime: Math.round(uptime),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  }

  private async collectMetrics(): Promise<void> {
    try {
      const account = await this.al.getAccount();
      const positions = await this.al.getPositions();
      
      this.metrics = {
        timestamp: new Date(),
        portfolioValue: parseFloat(String(account.equity)),
        cashBalance: parseFloat(String(account.cash)),
        positions: positions.length,
        spyDeviation: 0, // TODO: Calculate actual deviation
        lastRebalance: null, // TODO: Get from database
        pendingOrders: 0, // TODO: Get from Alpaca
        performance: {
          daily: parseFloat(String(account.change_today || 0)) || 0,
          weekly: parseFloat(String(account.portfolio_value || 0)) * 0.01 || 0, // Placeholder
          monthly: parseFloat(String(account.portfolio_value || 0)) * 0.05 || 0, // Placeholder
        },
      };
      
      this.logger.info('Metrics collected', this.metrics);
    } catch (error) {
      this.logger.error('Failed to collect metrics:', error);
    }
  }

  private async syncPortfolioMetrics(): Promise<void> {
    try {
      const report = await this.rebalancer.getRebalanceReport();
      
      // Calculate SPY deviation
      const spyComposition = await this.tracker.getSPYComposition();
      const currentHoldings = report.currentHoldings;
      
      let deviation = 0;
      const targetAllocation = report.targetAllocation;
      
      for (const [symbol, targetAmount] of Object.entries(targetAllocation)) {
        const currentAmount = currentHoldings.positions.get(symbol)?.marketValue || 0;
        const targetPercent = targetAmount / currentHoldings.totalValue;
        const actualPercent = currentAmount / currentHoldings.totalValue;
        
        deviation += Math.abs(targetPercent - actualPercent);
      }
      
      deviation = deviation * 100; // Convert to percentage
      
      this.logger.info('Portfolio metrics synchronized', {
        totalValue: currentHoldings.totalValue,
        spyDeviation: deviation.toFixed(2) + '%',
        isBalanced: report.isBalanced,
      });
    } catch (error) {
      this.logger.error('Failed to sync portfolio metrics:', error);
    }
  }

  private async checkRebalancingNeeded(): Promise<void> {
    try {
      const report = await this.rebalancer.getRebalanceReport();
      
      if (!report.isBalanced) {
        this.logger.info('Automatic rebalancing triggered by schedule');
        await this.rebalancer.executeRebalancing();
      } else {
        this.logger.info('Portfolio remains balanced, no rebalancing needed');
      }
    } catch (error) {
      this.logger.error('Error checking rebalancing needs:', error);
    }
  }

  // Get current system health
  getHealthStatus(): Map<string, HealthStatus> {
    return new Map(this.healthChecks);
  }

  getCurrentMetrics(): SystemMetrics | null {
    return this.metrics;
  }

  getLogSummary(lastMinutes = 10) {
    const summary = {
      totalLogs: 0,
      errors: 0,
      warnings: 0,
      lastUpdate: new Date(),
    };

    // Note: In production, this would query a log aggregation service
    return summary;
  }

  // Ready for shutdown
  async shutdown() {
    this.logger.info('Shutting down monitoring service');
    // Clean up any resources
  }
}

export default MonitoringService;