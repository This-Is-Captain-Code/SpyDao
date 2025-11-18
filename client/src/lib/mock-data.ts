export interface SPTrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  sector: string;
  trend: 'hot' | 'trending' | 'upcoming';
}

export interface ShareholderMeeting {
  company: string;
  symbol: string;
  date: string;
  time: string;
  timezone: string;
  type: 'Annual' | 'Special';
  agenda: string[];
  proxyStatementUrl: string;
  important: boolean;
}

export const trendingStocks: SPTrendingStock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 225.12,
    change: 3.45,
    changePercent: 1.56,
    marketCap: '$3.42T',
    sector: 'Technology',
    trend: 'hot'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 145.80,
    change: 12.15,
    changePercent: 9.09,
    marketCap: '$3.58T',
    sector: 'Technology',
    trend: 'hot'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 422.85,
    change: 2.47,
    changePercent: 0.59,
    marketCap: '$3.14T',
    sector: 'Technology',
    trend: 'trending'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 175.12,
    change: -1.23,
    changePercent: -0.70,
    marketCap: '$2.14T',
    sector: 'Technology',
    trend: 'trending'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 202.77,
    change: 4.12,
    changePercent: 2.07,
    marketCap: '$2.11T',
    sector: 'Consumer Discretionary',
    trend: 'upcoming'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 423.89,
    change: 8.76,
    changePercent: 2.11,
    marketCap: '$1.35T',
    sector: 'Consumer Discretionary',
    trend: 'upcoming'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 576.89,
    change: -5.43,
    changePercent: -0.93,
    marketCap: '$1.47T',
    sector: 'Communication Services',
    trend: 'trending'
  },
  {
    symbol: 'BRK-B',
    name: 'Berkshire Hathaway',
    price: 487.23,
    change: 1.89,
    changePercent: 0.39,
    marketCap: '$1.34T',
    sector: 'Financial Services',
    trend: 'upcoming'
  }
];

export const upcomingMeetings: ShareholderMeeting[] = [
  {
    company: 'Apple Inc.',
    symbol: 'AAPL',
    date: '2024-12-20',
    time: '09:00 AM',
    timezone: 'PST',
    type: 'Annual',
    agenda: [
      'Elect Directors',
      'Approve Executive Compensation',
      'Ratify Auditor Appointment',
      'Shareholder Proposals'
    ],
    proxyStatementUrl: 'https://investor.apple.com/sec-filings/default.aspx',
    important: true
  },
  {
    company: 'NVIDIA Corporation',
    symbol: 'NVDA',
    date: '2024-12-22',
    time: '11:00 AM',
    timezone: 'PST',
    type: 'Annual',
    agenda: [
      'Elect Directors',
      'Approve Executive Compensation',
      'Stock Split Proposal',
      'Sustainability Committee'
    ],
    proxyStatementUrl: 'https://investor.nvidia.com/sec-filings/default.aspx',
    important: true
  },
  {
    company: 'Microsoft Corporation',
    symbol: 'MSFT',
    date: '2024-12-28',
    time: '08:00 AM',
    timezone: 'PST',
    type: 'Annual',
    agenda: [
      'Elect Directors',
      'Approve Executive Compensation',
      'ESG Reporting Requirements',
      'Diversity & Inclusion Metrics'
    ],
    proxyStatementUrl: 'https://www.microsoft.com/en-us/investor/sec-filings',
    important: false
  },
  {
    company: 'Tesla Inc.',
    symbol: 'TSLA',
    date: '2025-01-15',
    time: '02:30 PM',
    timezone: 'CST',
    type: 'Special',
    agenda: [
      'CEO Compensation Package',
      'Autonomous Driving Strategy',
      'Expansion into Energy Storage',
      'Gigafactory Locations'
    ],
    proxyStatementUrl: 'https://ir.tesla.com/sec-filings',
    important: true
  },
  {
    company: 'Amazon.com Inc.',
    symbol: 'AMZN',
    date: '2025-01-22',
    time: '09:00 AM',
    timezone: 'PST',
    type: 'Special',
    agenda: [
      'AWS Spin-off Proposal',
      'Prime Membership Fee Adjustment',
      'Worker Safety Standards',
      'Carbon Neutrality Timeline'
    ],
    proxyStatementUrl: 'https://ir.aboutamazon.com/sec-filings',
    important: true
  }
];

export const stats = {
  totalMarketCap: '$55T',
  companies: 500,
  governanceRights: '100%',
  participants: '10,000+'
};