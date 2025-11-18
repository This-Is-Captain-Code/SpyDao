import AlpacaService from './alpacaService.js';
import SPYTrackerService from './spyTrackerService.js';
import { ethers } from 'ethers';

interface RebalancingTrade {
  symbol: string;
  targetAmount: number;
  currentAmount: number;
  difference: number;
  action: 'buy' | 'sell';
  shares: number;
  currentPrice: number;
}

interface PortfolioState {
  cash: number;
  positions: Map<string, {
    symbol: string;
    shares: number;
    marketValue: number;
    entryPrice: number;
  }>;
  totalValue: number;
}

interface RebalancingResult {
  trades: RebalancingTrade[];
  totalBuyAmount: number;
  totalSellAmount: number;
  executed: boolean;
  errors: string[];
}

class PortfolioRebalancer {
  private alpacaService: AlpacaService;
  private spyTrackerService: SPYTrackerService;
  private minTradeAmount = 10; // Minimum $10 per trade
  private maxDeviation = 0.01; // 1% deviation allowed before rebalancing

  constructor() {
    this.alpacaService = new AlpacaService();
    this.spyTrackerService = new SPYTrackerService();
  }

  async getCurrentPortfolioState(): Promise<PortfolioState> {
    try {
      // Get account information
      const account = await this.alpacaService.getAccount();
      const cash = parseFloat(account.cash) || 0;

      // Get current positions
      const positions = await this.alpacaService.getPositions();
      const positionsMap = new Map();
      
      positions.forEach(position => {
        positionsMap.set(position.symbol, {
          symbol: position.symbol,
          shares: parseFloat(position.qty),
          marketValue: parseFloat(position.market_value),
          entryPrice: parseFloat(position.avg_entry_price),
        });
      });

      const totalValue = positions.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0) + cash;

      return {
        cash,
        positions: positionsMap,
        totalValue,
      };
    } catch (error) {
      console.error('Error getting current portfolio state:', error);
      throw new Error('Failed to get portfolio state');
    }
  }

  async calculateRebalancingTrades(): Promise<RebalancingTrade[]> {
    try {
      // Get current portfolio state
      const portfolio = await this.getCurrentPortfolioState();
      
      // Get SPY composition
      const spyComposition = await this.spyTrackerService.getSPYComposition();
      
      // Get current prices for all SPY holdings
      const symbols = spyComposition.holdings.map(h => h.symbol);
      const prices = await this.spyTrackerService.getCurrentPrices(symbols);

      // Calculate target allocation based on available capital
      const totalInvestableValue = portfolio.totalValue;
      const targetAllocation = this.spyTrackerService.calculateTargetAllocation(
        totalInvestableValue,
        spyComposition
      );

      const trades: RebalancingTrade[] = [];

      // Calculate trades for each symbol in SPY
      targetAllocation.forEach((targetAmount, symbol) => {
        const currentPosition = portfolio.positions.get(symbol);
        let currentAmount = 0;

        if (currentPosition) {
          currentAmount = currentPosition.marketValue;
        }

        const price = prices.get(symbol)?.price || 100;
        const difference = targetAmount - currentAmount;

        // Check if rebalancing is needed (considering minimum threshold)
        const deviation = Math.abs(difference) / Math.max(targetAmount, currentAmount, 1);
        
        if (Math.abs(difference) > this.minTradeAmount && deviation > this.maxDeviation) {
          const shares = Math.ceil(Math.abs(difference) / price);
          
          trades.push({
            symbol,
            targetAmount,
            currentAmount,
            difference,
            action: difference > 0 ? 'buy' : 'sell',
            shares,
            currentPrice: price,
          });
        }
      });

      // Check for positions that should be sold (not in SPY anymore)
      portfolio.positions.forEach((position: any, symbol: string) => {
        if (!targetAllocation.has(symbol)) {
          trades.push({
            symbol,
            targetAmount: 0,
            currentAmount: position.marketValue,
            difference: -position.marketValue,
            action: 'sell',
            shares: position.shares,
            currentPrice: position.marketValue / position.shares,
          });
        }
      });

      return trades.sort((a: any, b: any) => Math.abs(b.difference) - Math.abs(a.difference));
    } catch (error) {
      console.error('Error calculating rebalancing trades:', error);
      throw new Error('Failed to calculate rebalancing trades');
    }
  }

  async executeRebalancing(): Promise<RebalancingResult> {
    let result: RebalancingResult = {
      trades: [],
      totalBuyAmount: 0,
      totalSellAmount: 0,
      executed: false,
      errors: [],
    };

    try {
      // Get rebalancing trades
      const trades = await this.calculateRebalancingTrades();
      result.trades = trades;

      if (trades.length === 0) {
        console.log('No rebalancing trades needed');
        return result;
      }

      // Calculate totals for logging
      result.totalBuyAmount = trades
        .filter(t => t.action === 'buy')
        .reduce((sum, t) => sum + Math.abs(t.difference), 0);

      result.totalSellAmount = trades
        .filter(t => t.action === 'sell')
        .reduce((sum, t) => sum + Math.abs(t.difference), 0);

      console.log(`Executing ${trades.length} rebalancing trades`);
      console.log(`Total buy amount: $${result.totalBuyAmount.toFixed(2)}`);
      console.log(`Total sell amount: $${result.totalSellAmount.toFixed(2)}`);

      // Execute trades in batches
      const executeBatch = async (tradeBatch: RebalancingTrade[]) => {
        for (const trade of tradeBatch) {
          try {
            let order;
            if (trade.action === 'buy') {
              order = await this.alpacaService.buyShares(trade.symbol, trade.shares);
            } else {
              order = await this.alpacaService.sellShares(trade.symbol, trade.shares);
            }

            console.log(`${trade.action.toUpperCase()} order placed: ${trade.symbol} ${trade.shares} shares - Order ID: ${order.id}`);

            // Small delay between trades to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error executing ${trade.action} for ${trade.symbol}:`, error);
            result.errors.push(`Failed to execute ${trade.action} for ${trade.symbol}: ${error}`);
          }
        }
      };

      // Execute sell trades first to generate cash for buys
      const sellTrades = trades.filter(t => t.action === 'sell');
      const buyTrades = trades.filter(t => t.action === 'buy');

      if (sellTrades.length > 0) {
        console.log(`Executing ${sellTrades.length} sell trades...`);
        await executeBatch(sellTrades);
      }

      if (buyTrades.length > 0) {
        console.log(`Executing ${buyTrades.length} buy trades...`);
        await executeBatch(buyTrades);
      }

      result.executed = true;
      return result;
    } catch (error) {
      console.error('Error executing rebalancing:', error);
      result.errors.push(`Rebalancing failed: ${error}`);
      return result;
    }
  }

  async getRebalanceReport(): Promise<{
    currentHoldings: PortfolioState;
    targetAllocation: Record<string, number>;
    suggestedTrades: RebalancingTrade[];
    isBalanced: boolean;
  }> {
    try {
      const [currentHoldings, trades] = await Promise.all([
        this.getCurrentPortfolioState(),
        this.calculateRebalancingTrades(),
      ]);

      // Get SPY composition for target allocation
      const spyComposition = await this.spyTrackerService.getSPYComposition();
      const targetAllocation = Object.fromEntries(
        this.spyTrackerService.calculateTargetAllocation(
          currentHoldings.totalValue,
          spyComposition
        )
      );

      const isBalanced = trades.length === 0;

      return {
        currentHoldings,
        targetAllocation,
        suggestedTrades: trades,
        isBalanced,
      };
    } catch (error) {
      console.error('Error generating rebalance report:', error);
      throw new Error('Failed to generate report');
    }
  }

  async handleNewCapital(capital: number): Promise<void> {
    console.log(`Handling new capital: $${capital}`);
    
    if (capital < this.minTradeAmount) {
      console.log('Insufficient capital for rebalancing');
      return;
    }

    try {
      await this.executeRebalancing();
    } catch (error) {
      console.error('Error handling new capital:', error);
      throw error;
    }
  }

  async handleWithdrawal(amount: number): Promise<void> {
    console.log(`Handling withdrawal: $${amount}`);
    
    try {
      // First, check if we have enough cash
      const portfolio = await this.getCurrentPortfolioState();
      
      if (portfolio.cash >= amount) {
        console.log('Sufficient cash available for withdrawal');
        return;
      }

      // Calculate how much we need to sell
      const cashNeeded = amount - portfolio.cash;
      console.log(`Need to sell $${cashNeeded} worth of stocks`);

      // Rebalance portfolio after withdrawal
      await this.executeRebalancing();
    } catch (error) {
      console.error('Error handling withdrawal:', error);
      throw error;
    }
  }
}

export default PortfolioRebalancer;
export type { RebalancingTrade, PortfolioState, RebalancingResult };