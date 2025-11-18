import axios from 'axios';

interface AlpacaConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
  asset_marginable: boolean;
}

interface OrderRequest {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: string;
  stop_price?: string;
  trail_price?: string;
  trail_percent?: string;
}

interface OrderResponse {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  replaced_by?: string;
  replaces?: string;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price?: string;
  order_class: string;
  order_type: string;
  type: string;
  side: string;
  time_in_force: string;
  limit_price?: string;
  stop_price?: string;
  status: string;
  extended_hours: boolean;
  trail_percent?: string;
  trail_price?: string;
  hwm?: string;
  subtag?: string;
}

class AlpacaService {
  private config: AlpacaConfig;

  constructor() {
    const apiKey = process.env.ALPACA_API_KEY;
    const apiSecret = process.env.ALPACA_API_SECRET;
    const mode = process.env.ALPACA_MODE || 'paper';

    if (!apiKey || !apiSecret) {
      throw new Error('Alpaca API keys are required');
    }

    const baseUrl = mode === 'live' 
      ? 'https://api.alpaca.markets' 
      : 'https://paper-api.alpaca.markets';

    this.config = { apiKey, apiSecret, baseUrl };
  }

  private getHeaders() {
    return {
      'APCA-API-KEY-ID': this.config.apiKey,
      'APCA-API-SECRET-KEY': this.config.apiSecret,
      'Content-Type': 'application/json',
    };
  }

  async getAccount() {
    try {
      const response = await axios.get(`${this.config.baseUrl}/v2/account`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting account information:', error);
      throw error;
    }
  }

  async getPositions(): Promise<Position[]> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/v2/positions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }

  async getPosition(symbol: string) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/v2/positions/${symbol}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting position for ${symbol}:`, error);
      throw error;
    }
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await axios.post(`${this.config.baseUrl}/v2/orders`, order, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/v2/orders/${orderId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting order ${orderId}:`, error);
      throw error;
    }
  }

  async cancelOrder(orderId: string) {
    try {
      await axios.delete(`${this.config.baseUrl}/v2/orders/${orderId}`, {
        headers: this.getHeaders(),
      });
      return true;
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
      throw error;
    }
  }

  async getOrders(options: {
    status?: 'open' | 'closed' | 'all';
    until?: string;
    after?: string;
    limit?: number;
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.until) params.append('until', options.until);
      if (options.after) params.append('after', options.after);
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await axios.get(`${this.config.baseUrl}/v2/orders?${params}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  async getAssets() {
    try {
      const response = await axios.get(`${this.config.baseUrl}/v2/assets`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting assets:', error);
      throw error;
    }
  }

  async getAsset(symbol: string) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/v2/assets/${symbol}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting asset ${symbol}:`, error);
      throw error;
    }
  }

  async buyMarket(symbol: string, amount: number): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      notional: amount,
      side: 'buy',
      type: 'market',
      time_in_force: 'day',
    });
  }

  async sellMarket(symbol: string, amount: number): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      notional: amount,
      side: 'sell',
      type: 'market',
      time_in_force: 'day',
    });
  }

  async buyShares(symbol: string, shares: number): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      qty: shares,
      side: 'buy',
      type: 'market',
      time_in_force: 'day',
    });
  }

  async sellShares(symbol: string, shares: number): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      qty: shares,
      side: 'sell',
      type: 'market',
      time_in_force: 'day',
    });
  }
}

export default AlpacaService;