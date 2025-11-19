import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useAdmin } from '@/hooks/use-admin';
import { useVault } from '@/hooks/use-vault';
import { useGovernance } from '@/hooks/use-governance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, DollarSign, Database, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { DAppHeader } from '@/components/DAppHeader';
import { Link } from 'wouter';

export default function Admin() {
  const { address, provider, connectWallet, truncateAddress, isCorrectNetwork, switchToRaylsDevnet } = useWallet();
  const admin = useAdmin(provider, address);
  const vault = useVault(provider, address);
  const governance = useGovernance(provider, address);

  // Oracle state
  const [newPrice, setNewPrice] = useState('');

  // Synthetic holdings state
  const [syntheticAmount, setSyntheticAmount] = useState('');
  const [syntheticReason, setSyntheticReason] = useState('');

  // Broker withdrawal state
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [maxWithdrawal, setMaxWithdrawal] = useState('');

  // Compliance state
  const [complianceAddress, setComplianceAddress] = useState('');
  const [kycStatus, setKycStatus] = useState('true');
  const [blockedStatus, setBlockedStatus] = useState('false');
  const [complianceReason, setComplianceReason] = useState('');

  // Rewards funding state
  const [rewardAmount, setRewardAmount] = useState('');

  if (!address) {
    return (
      <>
        <DAppHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Shield className="w-16 h-16 text-primary" data-testid="icon-admin" />
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2" data-testid="text-title">Admin Panel</h1>
              <p className="text-muted-foreground mb-6" data-testid="text-description">
                Connect your wallet to access admin functions
              </p>
            </div>
            <Button onClick={connectWallet} size="lg" data-testid="button-connect">
              Connect Wallet
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DAppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold" data-testid="text-page-title">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Connected:</span>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid="text-address">
                {truncateAddress(address)}
              </code>
            </div>
          </div>
          <p className="text-muted-foreground" data-testid="text-subtitle">
            Manage vault operations, oracle prices, and governance rewards
          </p>
        </div>

        {!isCorrectNetwork && (
          <Alert className="mb-6" variant="destructive" data-testid="alert-wrong-network">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You're connected to the wrong network. Please switch to Rayls Testnet (Chain ID: 123123).</span>
              <Button 
                onClick={switchToRaylsDevnet} 
                variant="outline" 
                size="sm"
                data-testid="button-switch-network"
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {admin.data && (
          <div className="grid gap-4 mb-6 grid-cols-1 md:grid-cols-3">
            <Card data-testid="card-role-admin">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Role</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-role-admin">
                  {admin.data.hasAdminRole ? (
                    <Badge variant="default" className="text-base">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-base">None</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-role-executor">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Executor Role</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-role-executor">
                  {admin.data.hasExecutorRole ? (
                    <Badge variant="default" className="text-base">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-base">None</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-role-compliance">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Role</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-role-compliance">
                  {admin.data.hasComplianceRole ? (
                    <Badge variant="default" className="text-base">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-base">None</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="oracle" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="oracle" data-testid="tab-oracle">Oracle</TabsTrigger>
            <TabsTrigger value="vault" data-testid="tab-vault">Vault Admin</TabsTrigger>
            <TabsTrigger value="governance" data-testid="tab-governance">Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="oracle" className="space-y-4">
            <Card data-testid="card-oracle-price">
              <CardHeader>
                <CardTitle>Mock SPY Oracle Price</CardTitle>
                <CardDescription>
                  Set the mock SPY price for testing (8 decimals precision)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vault.data && (
                  <Alert data-testid="alert-current-price">
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Current SPY Price: <strong>${vault.data.spyPrice}</strong>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="newPrice">New Price (USD)</Label>
                  <Input
                    id="newPrice"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 480.50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    data-testid="input-new-price"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the price in USD (e.g., 480.50). Will be converted to 8 decimal format.
                  </p>
                </div>

                <Button
                  onClick={() => admin.setOraclePrice(newPrice)}
                  disabled={!newPrice || parseFloat(newPrice) <= 0}
                  className="w-full"
                  data-testid="button-set-price"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Set Oracle Price
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vault" className="space-y-4">
            <Card data-testid="card-synthetic-holdings">
              <CardHeader>
                <CardTitle>Synthetic Holdings Management</CardTitle>
                <CardDescription>
                  Update the synthetic SPY share balance (EXECUTOR_ROLE required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vault.data && (
                  <Alert data-testid="alert-current-synthetic">
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Current Synthetic Shares: <strong>{vault.data.syntheticShares}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="syntheticAmount">New Synthetic Balance</Label>
                  <Input
                    id="syntheticAmount"
                    type="number"
                    step="1"
                    placeholder="e.g., 100"
                    value={syntheticAmount}
                    onChange={(e) => setSyntheticAmount(e.target.value)}
                    data-testid="input-synthetic-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syntheticReason">Reason</Label>
                  <Textarea
                    id="syntheticReason"
                    placeholder="Explain the change..."
                    value={syntheticReason}
                    onChange={(e) => setSyntheticReason(e.target.value)}
                    data-testid="textarea-synthetic-reason"
                  />
                </div>

                <Button
                  onClick={() => admin.setSyntheticHoldings(syntheticAmount, syntheticReason)}
                  disabled={!syntheticAmount || !syntheticReason}
                  className="w-full"
                  data-testid="button-set-synthetic"
                >
                  Update Synthetic Holdings
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-broker-withdrawal">
              <CardHeader>
                <CardTitle>Broker Withdrawal Management</CardTitle>
                <CardDescription>
                  Schedule, execute, or cancel broker withdrawals (EXECUTOR_ROLE required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {admin.data && admin.data.brokerWithdrawal && (
                  <Alert data-testid="alert-pending-withdrawal">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>Pending Amount: <strong>{admin.data.brokerWithdrawal.pendingAmount} mUSD</strong></div>
                        <div>Can Execute: <strong>{admin.data.brokerWithdrawal.canExecute ? 'Yes' : `No (wait ${admin.data.brokerWithdrawal.timeRemaining}s)`}</strong></div>
                        <div>Max Single Withdrawal: <strong>{admin.data.brokerWithdrawal.maxSingleWithdrawal} mUSD</strong></div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="withdrawalAmount">Withdrawal Amount (mUSD)</Label>
                  <Input
                    id="withdrawalAmount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1000"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    data-testid="input-withdrawal-amount"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => admin.scheduleBrokerWithdrawal(withdrawalAmount)}
                    disabled={!withdrawalAmount}
                    className="flex-1"
                    data-testid="button-schedule-withdrawal"
                  >
                    Schedule Withdrawal
                  </Button>
                  
                  <Button
                    onClick={() => admin.executeBrokerWithdrawal()}
                    disabled={!admin.data?.brokerWithdrawal?.canExecute}
                    className="flex-1"
                    data-testid="button-execute-withdrawal"
                  >
                    Execute Withdrawal
                  </Button>

                  <Button
                    onClick={() => admin.cancelBrokerWithdrawal()}
                    disabled={!admin.data?.brokerWithdrawal || admin.data.brokerWithdrawal.pendingAmount === '0'}
                    variant="destructive"
                    className="flex-1"
                    data-testid="button-cancel-withdrawal"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="maxWithdrawal">Update Max Single Withdrawal</Label>
                  <Input
                    id="maxWithdrawal"
                    type="number"
                    step="1"
                    placeholder="e.g., 100000"
                    value={maxWithdrawal}
                    onChange={(e) => setMaxWithdrawal(e.target.value)}
                    data-testid="input-max-withdrawal"
                  />
                  <Button
                    onClick={() => admin.setMaxSingleWithdrawal(maxWithdrawal)}
                    disabled={!maxWithdrawal}
                    variant="outline"
                    className="w-full"
                    data-testid="button-set-max-withdrawal"
                  >
                    Update Max Withdrawal
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-compliance">
              <CardHeader>
                <CardTitle>Compliance Management</CardTitle>
                <CardDescription>
                  Manage user KYC status and sanctions blocking (COMPLIANCE_ROLE required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complianceAddress">User Address</Label>
                  <Input
                    id="complianceAddress"
                    placeholder="0x..."
                    value={complianceAddress}
                    onChange={(e) => setComplianceAddress(e.target.value)}
                    data-testid="input-compliance-address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kycStatus">KYC Status</Label>
                    <Select value={kycStatus} onValueChange={setKycStatus}>
                      <SelectTrigger id="kycStatus" data-testid="select-kyc-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Completed</SelectItem>
                        <SelectItem value="false">Not Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blockedStatus">Blocked Status</Label>
                    <Select value={blockedStatus} onValueChange={setBlockedStatus}>
                      <SelectTrigger id="blockedStatus" data-testid="select-blocked-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Not Blocked</SelectItem>
                        <SelectItem value="true">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complianceReason">Reason</Label>
                  <Textarea
                    id="complianceReason"
                    placeholder="Reason for status change..."
                    value={complianceReason}
                    onChange={(e) => setComplianceReason(e.target.value)}
                    data-testid="textarea-compliance-reason"
                  />
                </div>

                <Button
                  onClick={() => admin.setComplianceStatus(
                    complianceAddress,
                    kycStatus === 'true',
                    blockedStatus === 'true',
                    complianceReason
                  )}
                  disabled={!complianceAddress || !complianceReason}
                  className="w-full"
                  data-testid="button-set-compliance"
                >
                  Update Compliance Status
                </Button>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => admin.setGlobalPause(true)}
                    variant="destructive"
                    className="w-full mb-2"
                    data-testid="button-pause-vault"
                  >
                    Pause Vault Globally
                  </Button>
                  <Button
                    onClick={() => admin.setGlobalPause(false)}
                    variant="outline"
                    className="w-full"
                    data-testid="button-unpause-vault"
                  >
                    Unpause Vault
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <Card data-testid="card-rewards-pool">
              <CardHeader>
                <CardTitle>Rewards Pool Management</CardTitle>
                <CardDescription>
                  Fund the governance rewards pool with mUSD tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {governance.totalRewards && (
                  <Alert data-testid="alert-rewards-info">
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>Total Rewards Distributed: <strong>{governance.totalRewards} mUSD</strong></div>
                        <div>Reward Per Vote: <strong>{governance.rewardPerVote} mUSD</strong></div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="rewardAmount">Amount to Fund (mUSD)</Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 10000"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    data-testid="input-reward-amount"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will transfer mUSD to the governor contract to fund voting rewards.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => admin.approveRewardToken(rewardAmount)}
                    disabled={!rewardAmount}
                    variant="outline"
                    className="w-full"
                    data-testid="button-approve-rewards"
                  >
                    1. Approve mUSD
                  </Button>

                  <Button
                    onClick={() => admin.fundRewardsPool(rewardAmount)}
                    disabled={!rewardAmount}
                    className="w-full"
                    data-testid="button-fund-rewards"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    2. Fund Rewards Pool
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
