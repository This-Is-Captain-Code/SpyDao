import { ethers } from 'ethers';
import { sql } from 'drizzle-orm';
import PortfolioRebalancer from './portfolioRebalancer.js';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { deposits, withdrawals, vaultState } from '../db/schema.js';
import { holdings, transactions, portfolioSnapshots } from '../models/portfolio.js';

interface DepositEvent {
  transactionHash: string;
  user: string;
  assets: string;
  shares: string;
  blockNumber: number;
  timestamp: number;
}

interface WithdrawalScheduledEvent {
  transactionHash: string;
  user: string;
  assets: string;
  shares: string;
  scheduledTime: number;
  blockNumber: number;
}

interface WithdrawalExecutedEvent {
  transactionHash: string;
  user: string;
  assets: string;
  shares: string;
  blockNumber: number;
  timestamp: number;
}

class WebhookService {
  private rebalancer: PortfolioRebalancer;
  private db: ReturnType<typeof drizzle>;
  private provider: ethers.Provider | null = null;
  private contract: ethers.Contract | null = null;
  private processedTransactions: Set<string> = new Set();
  private isListening: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private maxProcessedTransactions: number = 1000; // Keep last 1000 tx hashes

  constructor() {
    console.log('🔧 WebhookService constructor called');
    this.rebalancer = new PortfolioRebalancer();
    
    // Initialize database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
    
    console.log('🔧 About to call initializeEthereum()');
    // Initialize Ethereum connection
    this.initializeEthereum();
    console.log('🔧 Finished calling initializeEthereum()');
  }

  private initializeEthereum() {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://devnet-rpc.rayls.com';
    const contractAddress = process.env.CONTRACT_ADDRESS || '0x2181BaAAb16e8a4E08c7fFAB8DA1780B53eD05D2';
    
    if (!rpcUrl || !contractAddress) {
      console.warn('Ethereum configuration missing, blockchain services disabled');
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Basic contract ABI for the events we need
      const contractABI = [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)",
        "event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
        "event ScheduledBrokerWithdrawal(uint256 amount, uint256 executeAfter)"
      ];
      
      this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
      
      console.log('Ethereum connection initialized');
      
      // Start listening for blockchain events
      this.startListening();
    } catch (error) {
      console.error('Error initializing Ethereum connection:', error);
    }
  }

  /**
   * Start listening to blockchain events in real-time
   */
  async startListening(): Promise<void> {
    if (!this.contract || !this.provider) {
      console.warn('Cannot start listening: Ethereum connection not initialized');
      return;
    }

    if (this.isListening) {
      console.log('Already listening to blockchain events');
      return;
    }

    try {
      console.log('🎧 Starting blockchain event listener...');
      this.isListening = true;
      this.reconnectAttempts = 0;

      // Listen for Deposit events
      this.contract.on('Deposit', async (caller, owner, assets, shares, event) => {
        try {
          const txHash = event.transactionHash;
          
          // Skip if already processed
          if (this.processedTransactions.has(txHash)) {
            console.log(`Skipping duplicate deposit: ${txHash}`);
            return;
          }

          console.log(`📥 Deposit event detected: ${txHash}`);
          
          const block = await event.getBlock();
          
          await this.processDepositEvent({
            transactionHash: txHash,
            user: owner,
            assets: assets.toString(),
            shares: shares.toString(),
            blockNumber: event.blockNumber,
            timestamp: block.timestamp,
          });

          this.processedTransactions.add(txHash);
          this.pruneProcessedTransactions();
        } catch (error) {
          console.error('Error processing deposit event:', error);
        }
      });

      // Listen for Withdraw events (executed withdrawals)
      this.contract.on('Withdraw', async (caller, receiver, owner, assets, shares, event) => {
        try {
          const txHash = event.transactionHash;
          
          // Skip if already processed
          if (this.processedTransactions.has(txHash)) {
            console.log(`Skipping duplicate withdrawal: ${txHash}`);
            return;
          }

          console.log(`📤 Withdrawal event detected: ${txHash}`);
          
          const block = await event.getBlock();
          
          await this.processWithdrawalExecutedEvent({
            transactionHash: txHash,
            user: owner,
            assets: assets.toString(),
            shares: shares.toString(), // Include actual shares from event
            blockNumber: event.blockNumber,
            timestamp: block.timestamp,
          });

          this.processedTransactions.add(txHash);
          this.pruneProcessedTransactions();
        } catch (error) {
          console.error('Error processing withdrawal event:', error);
        }
      });

      // Listen for ScheduledBrokerWithdrawal events
      this.contract.on('ScheduledBrokerWithdrawal', async (amount, executeAfter, event) => {
        try {
          const txHash = event.transactionHash;
          
          if (this.processedTransactions.has(txHash)) {
            console.log(`Skipping duplicate broker withdrawal: ${txHash}`);
            return;
          }

          const amountUSD = ethers.formatUnits(amount, 6);
          const executionDate = new Date(Number(executeAfter) * 1000);
          
          console.log(`🏦 Broker withdrawal scheduled: ${txHash}`);
          console.log(`   Amount: ${amountUSD} mUSD`);
          console.log(`   Execution: ${executionDate.toISOString()}`);
          
          // Broker withdrawals are administrative (vault → Alpaca broker)
          // They don't go through the user withdrawal schema
          // Just track for monitoring and auditing purposes
          
          this.processedTransactions.add(txHash);
          this.pruneProcessedTransactions();
        } catch (error) {
          console.error('Error processing broker withdrawal event:', error);
        }
      });

      // Handle provider errors and reconnection
      this.provider.on('error', (error) => {
        console.error('Provider error:', error);
        this.handleDisconnection();
      });

      console.log('✅ Blockchain event listener active');
      console.log('   - Listening for Deposit events');
      console.log('   - Listening for Withdraw events');
      console.log('   - Listening for ScheduledBrokerWithdrawal events');

    } catch (error) {
      console.error('Error starting event listener:', error);
      this.isListening = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Prune processed transactions cache to prevent memory leaks
   */
  private pruneProcessedTransactions(): void {
    if (this.processedTransactions.size > this.maxProcessedTransactions) {
      // Convert to array, remove oldest entries, convert back to Set
      const entries = Array.from(this.processedTransactions);
      const toKeep = entries.slice(-this.maxProcessedTransactions);
      this.processedTransactions = new Set(toKeep);
      console.log(`Pruned processed transactions cache (kept ${toKeep.length} most recent)`);
    }
  }

  /**
   * Stop listening to blockchain events
   */
  stopListening(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
      console.log('Stopped listening to blockchain events');
    }
    this.isListening = false;
  }

  /**
   * Handle provider disconnection and attempt reconnection
   */
  private handleDisconnection(): void {
    console.warn('Blockchain connection lost');
    this.isListening = false;
    this.stopListening();
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Manual intervention required.`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30 seconds
    
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay/1000}s...`);
    
    setTimeout(() => {
      console.log('Attempting to reconnect to blockchain...');
      this.initializeEthereum();
    }, delay);
  }

  async processDepositEvent(event: DepositEvent): Promise<void> {
    try {
      console.log(`Processing deposit: ${event.transactionHash}`);

      // Store deposit in database
      await this.db.insert(deposits).values({
        transactionHash: event.transactionHash,
        userAddress: event.user,
        assets: event.assets,
        sharesReceived: event.shares,
        timestamp: new Date(event.timestamp * 1000),
        processed: false,
        rebalanceTriggered: false,
      });

      // Execute rebalancing with new capital
      const capital = parseFloat(ethers.formatUnits(event.assets, 6)); // Assuming 6 decimals for USD
      await this.rebalancer.handleNewCapital(capital);

      // Mark as processed
      await this.db.update(deposits)
        .set({ 
          processed: true, 
          rebalanceTriggered: true 
        })
        .where(sql`${deposits.transactionHash} = ${event.transactionHash}`);

      console.log(`Deposit processed successfully: ${event.transactionHash}`);
    } catch (error) {
      console.error('Error processing deposit event:', error);
      throw error;
    }
  }

  async processWithdrawalScheduledEvent(event: WithdrawalScheduledEvent): Promise<void> {
    try {
      console.log(`Processing withdrawal scheduled: ${event.transactionHash}`);

      // Store withdrawal in database
      await this.db.insert(withdrawals).values({
        transactionHash: event.transactionHash,
        userAddress: event.user,
        assets: event.assets,
        shares: event.shares,
        scheduledTimestamp: new Date(event.scheduledTime * 1000),
        pending: true,
        processed: false,
      });

      console.log(`Withdrawal scheduled stored: ${event.transactionHash}`);
    } catch (error) {
      console.error('Error processing withdrawal scheduled event:', error);
      throw error;
    }
  }

  async processWithdrawalExecutedEvent(event: WithdrawalExecutedEvent): Promise<void> {
    try {
      console.log(`Processing withdrawal executed: ${event.transactionHash}`);

      // Share price when the withdrawal was executed
      const withdrawalAmount = parseFloat(ethers.formatUnits(event.assets, 6));
      
      // SPYVault has immediate withdrawals (no scheduling step)
      // Upsert the withdrawal record to handle both new and duplicate events
      await this.db.insert(withdrawals).values({
        transactionHash: event.transactionHash,
        userAddress: event.user,
        assets: event.assets,
        shares: event.shares,
        executedTimestamp: new Date(event.timestamp * 1000),
        scheduledTimestamp: null, // NULL for immediate withdrawals (no scheduling step)
        pending: false,
        processed: false, // Will be set to true after rebalancing
      }).onConflictDoUpdate({
        target: withdrawals.transactionHash,
        set: {
          executedTimestamp: new Date(event.timestamp * 1000),
          processed: false, // Reset to allow reprocessing
        },
      });

      // Rebalance after selling to fund withdrawal
      await this.rebalancer.handleWithdrawal(withdrawalAmount);

      // Mark as processed after successful rebalancing
      await this.db.update(withdrawals)
        .set({ processed: true })
        .where(sql`${withdrawals.transactionHash} = ${event.transactionHash}`);

      console.log(`Withdrawal executed and rebalanced: ${event.transactionHash}`);
    } catch (error) {
      console.error('Error processing withdrawal executed event:', error);
      throw error;
    }
  }

  // API endpoints for webhook handling
  async handleDepositWebhook(req: any, res: any): Promise<void> {
    try {
      const { transactionHash, user, assets, shares, timestamp } = req.body;

      if (!transactionHash || !user || !assets || !shares || !timestamp) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      await this.processDepositEvent({
        transactionHash,
        user,
        assets,
        shares,
        blockNumber: 0,
        timestamp,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  async handleWithdrawalScheduledWebhook(req: any, res: any): Promise<void> {
    try {
      const { transactionHash, user, assets, shares, scheduledTime } = req.body;

      if (!transactionHash || !user || !assets || !shares || !scheduledTime) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      await this.processWithdrawalScheduledEvent({
        transactionHash,
        user,
        assets,
        shares,
        scheduledTime,
        blockNumber: 0,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  async handleWithdrawalExecutedWebhook(req: any, res: any): Promise<void> {
    try {
      const { transactionHash, user, assets, timestamp } = req.body;

      if (!transactionHash || !user || !assets || !timestamp) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      await this.processWithdrawalExecutedEvent({
        transactionHash,
        user,
        assets,
        blockNumber: 0,
        timestamp,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  // Startup rebalancing check
  async startupRebalanceCheck(): Promise<void> {
    try {
      console.log('Performing startup rebalancing check...');
      
      const report = await this.rebalancer.getRebalanceReport();
      
      if (report.isBalanced) {
        console.log('Portfolio is already balanced with SPY');
      } else {
        console.log('Portfolio needs rebalancing');
        console.log(`Suggested trades: ${report.suggestedTrades.length}`);
        
        // Execute rebalancing if we're too far from SPY allocation
        const deviation = Object.values(report.suggestedTrades)
          .reduce((sum, trade) => sum + Math.abs(trade.difference), 0) / report.currentHoldings.totalValue;

        if (deviation > 0.05) { // 5% deviation threshold
          console.log('Deviation > 5%, executing rebalancing');
          await this.rebalancer.executeRebalancing();
        } else {
          console.log('Deviation within acceptable range (≤ 5%)');
        }
      }
    } catch (error) {
      console.error('Error during startup rebalancing check:', error);
    }
  }

  // Health check for monitoring
  async getSystemHealth(): Promise<{
    database: boolean;
    alpaca: boolean;
    ethereum: boolean;
    pendingDeposits: number;
    pendingWithdrawals: number;
    lastRebalance: Date | null;
  }> {
    try {
      // Check database connection
      const dbHealthy = await this.checkDatabaseConnection();

      // Check Alpaca connection
      const alpacaHealthy = await this.checkAlpacaConnection();

      // Check Ethereum connection
      const ethereumHealthy = !!this.contract;

      // Get pending operations
      const pendingDeposits = await this.db.select({ count: sql<number>`count(*)` })
        .from(deposits)
        .where(sql`${deposits.processed} = false`);

      const pendingWithdrawals = await this.db.select({ count: sql<number>`count(*)` })
        .from(withdrawals)
        .where(sql`${withdrawals.pending} = true`);

      return {
        database: dbHealthy,
        alpaca: alpacaHealthy,
        ethereum: ethereumHealthy,
        pendingDeposits: Number(pendingDeposits[0]?.count || 0),
        pendingWithdrawals: Number(pendingWithdrawals[0]?.count || 0),
        lastRebalance: new Date(), // TODO: Get from database
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        database: false,
        alpaca: false,
        ethereum: false,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
        lastRebalance: null,
      };
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }

  private async checkAlpacaConnection(): Promise<boolean> {
    try {
      const al = new (await import('./alpacaService.js')).default();
      await al.getAccount();
      return true;
    } catch {
      return false;
    }
  }
}

export default WebhookService;
export type { DepositEvent, WithdrawalScheduledEvent, WithdrawalExecutedEvent };