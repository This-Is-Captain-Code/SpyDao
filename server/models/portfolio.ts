import { pgTable, serial, varchar, numeric, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const holdings = pgTable('holdings', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  shares: numeric('shares', { precision: 20, scale: 8 }).notNull(),
  avgEntryPrice: numeric('avg_entry_price', { precision: 20, scale: 8 }).notNull(),
  marketValue: numeric('market_value', { precision: 20, scale: 8 }).notNull(),
  currentPrice: numeric('current_price', { precision: 20, scale: 8 }).notNull(),
  unrealizedPnl: numeric('unrealized_pnl', { precision: 20, scale: 8 }).default('0'),
  weight: numeric('weight', { precision: 5, scale: 2 }).default('0'), // Portfolio weight in %
  sector: varchar('sector', { length: 50 }),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  hash: varchar('hash', { length: 66 }).unique(), // Transaction hash for tracking
  type: varchar('type', { length: 20 }).notNull(), // buy, sell, deposit, withdrawal
  symbol: varchar('symbol', { length: 10 }).notNull(),
  shares: numeric('shares', { precision: 20, scale: 8 }),
  price: numeric('price', { precision: 20, scale: 8 }).notNull(),
  total: numeric('total', { precision: 20, scale: 8 }).notNull(),
  fees: numeric('fees', { precision: 20, scale: 8 }).default('0'),
  alpacaOrderId: varchar('alpaca_order_id', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending'), // pending, filled, cancelled, failed
  executedAt: timestamp('executed_at'),
  metadata: jsonb('metadata'), // Additional data like order details
  createdAt: timestamp('created_at').defaultNow(),
});

export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow(),
  totalValue: numeric('total_value', { precision: 20, scale: 8 }).notNull(),
  cash: numeric('cash', { precision: 20, scale: 8 }).notNull(),
  holdingsCount: integer('holdings_count').notNull(),
  spyDeviation: numeric('spy_deviation', { precision: 5, scale: 2 }).notNull(), // Difference from SPY (%)
  data: jsonb('data').notNull(), // Complete holdings data
});

export const rebalancingEvents = pgTable('rebalancing_events', {
  id: serial('id').primaryKey(),
  trigger: varchar('trigger', { length: 50 }).notNull(), // deposit, withdrawal, scheduled, manual
  totalTrades: integer('total_trades').notNull(),
  totalBuyAmount: numeric('total_buy_amount', { precision: 20, scale: 8 }).default('0'),
  totalSellAmount: numeric('total_sell_amount', { precision: 20, scale: 8 }).default('0'),
  executed: boolean('executed').default(false),
  errors: jsonb('errors'),
  beforeSnapshot: jsonb('before_snapshot'),
  afterSnapshot: jsonb('after_snapshot'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contractEvents = pgTable('contract_events', {
  id: serial('id').primaryKey(),
  transactionHash: varchar('transaction_hash', { length: 66 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // Deposit, Withdraw, Buy, Sell
  user: varchar('user', { length: 42 }).notNull(), // Ethereum address
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  processed: boolean('processed').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Indexes for better query performance
export const indexes = [
  sql`CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol)`,
  sql`CREATE INDEX IF NOT EXISTS idx_holdings_sector ON holdings(sector)`,
  sql`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`,
  sql`CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol)`,
  sql`CREATE INDEX IF NOT EXISTS idx_transactions_executed_at ON transactions(executed_at)`,
  sql`CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_timestamp ON portfolio_snapshots(timestamp DESC)`,
  sql`CREATE INDEX IF NOT EXISTS idx_contract_events_processed ON contract_events(processed)`,
  sql`CREATE INDEX IF NOT EXISTS idx_contract_events_transaction_hash ON contract_events(transaction_hash)`,
];