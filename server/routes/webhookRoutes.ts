import { Router } from 'express';
import WebhookService from '../services/webhookService.js';

const router = Router();
const webhookService = new WebhookService();

// Webhook endpoints for contract events
router.post('/deposit', async (req, res) => {
  await webhookService.handleDepositWebhook(req, res);
});

router.post('/withdrawal-scheduled', async (req, res) => {
  await webhookService.handleWithdrawalScheduledWebhook(req, res);
});

router.post('/withdrawal-executed', async (req, res) => {
  await webhookService.handleWithdrawalExecutedWebhook(req, res);
});

// API endpoints for monitoring
router.get('/health', async (req, res) => {
  try {
    const health = await webhookService.getSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Manual rebalancing endpoint
router.post('/rebalance', async (req, res) => {
  try {
    const { force = false } = req.body;
    
    const rebalancer = (await import('../services/portfolioRebalancer.js')).default;
    const reb = new rebalancer();
    
    if (force) {
      const result = await reb.executeRebalancing();
      res.json({ success: true, result });
    } else {
      const report = await reb.getRebalanceReport();
      res.json({ success: true, report });
    }
  } catch (error) {
    console.error('Rebalancing failed:', error);
    res.status(500).json({ error: 'Rebalancing failed' });
  }
});

// Portfolio status endpoint
router.get('/portfolio/status', async (req, res) => {
  try {
    const rebalancer = (await import('../services/portfolioRebalancer.js')).default;
    const reb = new rebalancer();
    const report = await reb.getRebalanceReport();
    
    res.json({
      success: true,
      data: {
        totalValue: report.currentHoldings.totalValue,
        cash: report.currentHoldings.cash,
        positions: Array.from(report.currentHoldings.positions.values()),
        isBalanced: report.isBalanced,
        targetAllocation: report.targetAllocation,
        suggestedTrades: report.suggestedTrades,
      }
    });
  } catch (error) {
    console.error('Error getting portfolio status:', error);
    res.status(500).json({ error: 'Failed to get portfolio status' });
  }
});

// Alpaca account status
router.get('/alpaca/account', async (req, res) => {
  try {
    const AlpacaService = (await import('../services/alpacaService.js')).default;
    const alpaca = new AlpacaService();
    const account = await alpaca.getAccount();
    
    res.json({ success: true, data: account });
  } catch (error) {
    console.error('Error getting Alpaca account:', error);
    res.status(500).json({ error: 'Failed to get account info' });
  }
});

// Portfolio positions
router.get('/alpaca/positions', async (req, res) => {
  try {
    const AlpacaService = (await import('../services/alpacaService.js')).default;
    const alpaca = new AlpacaService();
    const positions = await alpaca.getPositions();
    
    res.json({ success: true, data: positions });
  } catch (error) {
    console.error('Error getting positions:', error);
    res.status(500).json({ error: 'Failed to get positions' });
  }
});

// SPY composition
router.get('/spy/composition', async (req, res) => {
  try {
    const SPYTrackerService = (await import('../services/spyTrackerService.js')).default;
    const tracker = new SPYTrackerService();
    const composition = await tracker.getSPYComposition();
    
    res.json({ success: true, data: composition });
  } catch (error) {
    console.error('Error getting SPY composition:', error);
    res.status(500).json({ error: 'Failed to get SPY composition' });
  }
});

export default router;