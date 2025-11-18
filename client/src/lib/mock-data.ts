export interface SP500GovernanceOpportunity {
  symbol: string;
  name: string;
  marketCap: string;
  sector: string;
  governanceFocus: 'ESG' | 'Executive Compensation' | 'Board Changes' | 'Climate Action' | 'AI Policy';
  votingPower: string;
  governanceScore: number;
  upcomingVote: string;
  participationLevel: 'High' | 'Medium' | 'Low';
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

export const governanceOpportunities: SP500GovernanceOpportunity[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    marketCap: '$3.42T',
    sector: 'Technology',
    governanceFocus: 'ESG',
    votingPower: '5.2M shares',
    governanceScore: 92,
    upcomingVote: 'Board Diversity Standards',
    participationLevel: 'High'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    marketCap: '$3.58T',
    sector: 'Technology',
    governanceFocus: 'AI Policy',
    votingPower: '8.7M shares',
    governanceScore: 88,
    upcomingVote: 'Responsible AI Framework',
    participationLevel: 'High'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    marketCap: '$3.14T',
    sector: 'Technology',
    governanceFocus: 'Climate Action',
    votingPower: '12.4M shares',
    governanceScore: 95,
    upcomingVote: 'Carbon Neutral by 2030',
    participationLevel: 'High'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    marketCap: '$2.14T',
    sector: 'Technology',
    governanceFocus: 'Executive Compensation',
    votingPower: '9.1M shares',
    governanceScore: 84,
    upcomingVote: 'CEO Compensation Package',
    participationLevel: 'Medium'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase',
    marketCap: '$648B',
    sector: 'Financial Services',
    governanceFocus: 'Board Changes',
    votingPower: '6.8M shares',
    governanceScore: 79,
    upcomingVote: 'Board Independence Policy',
    participationLevel: 'Medium'
  },
  {
    symbol: 'UNH',
    name: 'UnitedHealth Group',
    marketCap: '$523B',
    sector: 'Healthcare',
    governanceFocus: 'ESG',
    votingPower: '4.3M shares',
    governanceScore: 86,
    upcomingVote: 'Healthcare Access Metrics',
    participationLevel: 'Low'
  },
  {
    symbol: 'HD',
    name: 'Home Depot',
    marketCap: '$412B',
    sector: 'Consumer Discretionary',
    governanceFocus: 'Climate Action',
    votingPower: '3.9M shares',
    governanceScore: 91,
    upcomingVote: 'Sustainable Supply Chain',
    participationLevel: 'Medium'
  },
  {
    symbol: 'PG',
    name: 'Procter & Gamble',
    marketCap: '$389B',
    sector: 'Consumer Staples',
    governanceFocus: 'ESG',
    votingPower: '2.7M shares',
    governanceScore: 89,
    upcomingVote: 'Plastic Reduction Initiative',
    participationLevel: 'High'
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