import { pgTable, serial, varchar, text, timestamp, integer, numeric, boolean, jsonb } from 'drizzle-orm/pg-core';

// Vault and contract interaction tables
export const vaultState = pgTable('vault_state', {
  id: serial('id').primaryKey(),
  contractAddress: varchar('contract_address', { length: 42 }).unique().notNull(),
  totalAssets: numeric('total_assets', { precision: 20, scale: 8 }).notNull().default('0'),
  totalShares: numeric('total_shares', { precision: 20, scale: 8 }).notNull().default('0'),
  sharePrice: numeric('share_price', { precision: 10, scale: 6 }).notNull().default('1'),
  syntheticShares: numeric('synthetic_shares', { precision: 20, scale: 8 }).notNull().default('0'),
  pendingWithdrawal: numeric('pending_withdrawal', { precision: 20, scale: 8 }).notNull().default('0'),
  lastUpdate: timestamp('last_update').defaultNow(),
});

export const deposits = pgTable('deposits', {
  id: serial('id').primaryKey(),
  transactionHash: varchar('transaction_hash', { length: 66 }).unique().notNull(),
  userAddress: varchar('user_address', { length: 42 }).notNull(),
  assets: numeric('assets', { precision: 20, scale: 8 }).notNull(),
  sharesReceived: numeric('shares_received', { precision: 20, scale: 8 }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  processed: boolean('processed').default(false),
  rebalanceTriggered: boolean('rebalance_triggered').default(false),
});

export const withdrawals = pgTable('withdrawals', {
  id: serial('id').primaryKey(),
  transactionHash: varchar('transaction_hash', { length: 66 }).unique().notNull(),
  userAddress: varchar('user_address', { length: 42 }).notNull(),
  shares: numeric('shares', { precision: 20, scale: 8 }).notNull(),
  assets: numeric('assets', { precision: 20, scale: 8 }).notNull(),
  scheduledTimestamp: timestamp('scheduled_timestamp').notNull(),
  executedTimestamp: timestamp('executed_timestamp'),
  pending: boolean('pending').default(true),
  processed: boolean('processed').default(false),
});

// Administrative and utility tables
export const systemConfig = pgTable('system_config', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Indexes
export const dbIndexes = [
  `CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_address)`,
  `CREATE INDEX IF NOT EXISTS idx_deposits_processed ON deposits(processed)`,
  `CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_address)`,
  `CREATE INDEX IF NOT EXISTS idx_withdrawals_pending ON withdrawals(pending)`,
  `CREATE INDEX IF NOT EXISTS idx_withdrawals_scheduled ON withdrawals(scheduled_timestamp)`,
];