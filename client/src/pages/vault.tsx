import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useVault } from '@/hooks/use-vault';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Coins, TrendingUp, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { DAppHeader } from '@/components/DAppHeader';
import { InteractiveGradient } from '@/components/InteractiveGradient';

export default function Vault() {
  const { address, provider, connectWallet, truncateAddress, isCorrectNetwork, switchToRaylsDevnet } = useWallet();
  const vault = useVault(provider, address);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [delegateAddress, setDelegateAddress] = useState('');

  if (!address) {
    return (
      <>
        <div className="min-h-screen relative">
          <InteractiveGradient />
          <div className="fixed inset-0 -z-10 bg-dot-pattern-sparse opacity-25"></div>
          <DAppHeader />
          <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <Coins className="w-16 h-16 text-black" data-testid="icon-vault" />
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white" data-testid="text-title">SPY Vault</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6" data-testid="text-description">
                  Connect your wallet to access the SPY DAO Vault
                </p>
              </div>
              <Button onClick={connectWallet} size="lg" className="bg-black hover:bg-gray-800 text-white" data-testid="button-connect">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const needsKYC = vault.data && !vault.data.isKYCCompleted;
  const isBlocked = vault.data?.isBlocked;
  const isPaused = vault.data?.isPaused;

  return (
    <>
      <div className="min-h-screen relative">
        <InteractiveGradient />
        <div className="fixed inset-0 -z-10 bg-dot-pattern-sparse opacity-25"></div>
        <DAppHeader />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl pt-32">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-page-title">
                  SPY Vault
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400" data-testid="text-subtitle">
                  Deposit assets and receive governance-enabled spDAO shares
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected:</span>
                <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700" data-testid="text-address">
                  {truncateAddress(address)}
                </code>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="mb-8 space-y-4">
            {!isCorrectNetwork && (
              <Alert className="glass-card border-gray-300 dark:border-gray-700" data-testid="alert-wrong-network">
                <AlertCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-900 dark:text-white">
                  <span className="text-sm">You're connected to the wrong network. Please switch to Rayls Testnet (Chain ID: 123123).</span>
                  <Button 
                    onClick={switchToRaylsDevnet} 
                    size="sm"
                    className="bg-black hover:bg-gray-800 text-white shrink-0"
                    data-testid="button-switch-network"
                  >
                    Switch Network
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isCorrectNetwork && (needsKYC || isBlocked || isPaused) && (
              <Alert className="glass-card border-gray-300 dark:border-gray-700" data-testid="alert-status">
                <AlertCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                <AlertDescription className="text-sm text-gray-900 dark:text-white">
                  {isBlocked && "Your address is blocked from vault operations."}
                  {isPaused && "The vault is currently paused."}
                  {needsKYC && !isBlocked && !isPaused && "KYC verification required. If you have admin permissions (COMPLIANCE_ROLE), use the 'Complete KYC' button below. Otherwise, contact an admin for approval."}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Main Content */}
          {!isCorrectNetwork ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
              <div className="glass-card rounded-2xl p-12 text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-gray-900 dark:text-white mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Wrong Network</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please switch to Rayls Testnet to access the SPY Vault
                </p>
                <Button onClick={switchToRaylsDevnet} className="bg-black hover:bg-gray-800 text-white" data-testid="button-switch-network-main">
                  Switch to Rayls Testnet
                </Button>
              </div>
            </div>
          ) : vault.isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass-card">
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : vault.data ? (
            <>
              {/* Balance Cards */}
              <div className="grid gap-6 md:grid-cols-3 mb-10">
                <Card data-testid="card-spdao-balance" className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">spDAO Balance</CardTitle>
                    <Coins className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-spdao-balance">
                      {parseFloat(vault.data.spDAOBalance).toFixed(4)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Governance shares</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-musd-balance" className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">mUSD Balance</CardTitle>
                    <ArrowDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-musd-balance">
                      {parseFloat(vault.data.mUSDBalance).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Available to deposit</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-voting-power" className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Voting Power</CardTitle>
                    <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-voting-power">
                      {parseFloat(vault.data.votingPower).toFixed(4)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {vault.data.delegate ? `Delegated to ${truncateAddress(vault.data.delegate)}` : 'Self-delegated'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Stats and Actions Grid */}
              <div className="grid gap-6 lg:grid-cols-3 mb-10">
                <Card data-testid="card-vault-stats" className="glass-card lg:col-span-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Vault Statistics</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Current vault metrics and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Assets</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-total-assets">
                          {parseFloat(vault.data.totalAssets).toFixed(2)} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">mUSD</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">SPY Price</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-spy-price">
                          ${parseFloat(vault.data.spyPrice).toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Synthetic SPY Shares</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-synthetic-shares">
                          {vault.data.syntheticShares}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">KYC Status</p>
                        <div className="flex items-center gap-1.5">
                          {vault.data.isKYCCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                              <span className="text-lg font-bold text-gray-900 dark:text-white">Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                              <span className="text-lg font-bold text-gray-900 dark:text-white">Not Verified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-quick-actions" className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Manage your position</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <Button
                      onClick={vault.claimFromFaucet}
                      className="w-full bg-black hover:bg-gray-800 text-white h-10 text-sm font-medium"
                      data-testid="button-faucet"
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Claim mUSD
                    </Button>
                    {needsKYC && (
                      <Button
                        onClick={vault.completeKYC}
                        className="w-full bg-black hover:bg-gray-800 text-white h-10 text-sm font-medium"
                        data-testid="button-complete-kyc"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete KYC
                      </Button>
                    )}
                    <Button
                      onClick={vault.refresh}
                      className="w-full bg-black hover:bg-gray-800 text-white h-10 text-sm font-medium"
                      data-testid="button-refresh"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Refresh Data
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Tabs */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transactions</h2>
                <Tabs defaultValue="deposit" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 glass-card mb-6">
                    <TabsTrigger value="deposit" className="text-sm font-medium text-gray-900 dark:text-white data-[state=active]:bg-black data-[state=active]:text-white" data-testid="tab-deposit">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw" className="text-sm font-medium text-gray-900 dark:text-white data-[state=active]:bg-black data-[state=active]:text-white" data-testid="tab-withdraw">Withdraw</TabsTrigger>
                    <TabsTrigger value="delegate" className="text-sm font-medium text-gray-900 dark:text-white data-[state=active]:bg-black data-[state=active]:text-white" data-testid="tab-delegate">Delegate</TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="mt-0">
                    <Card className="glass-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Deposit Assets</CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Deposit mUSD to receive spDAO shares</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="space-y-2.5">
                          <Label htmlFor="deposit-amount" className="text-sm font-semibold text-gray-900 dark:text-white">Amount (mUSD)</Label>
                          <Input
                            id="deposit-amount"
                            type="number"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base border-gray-300 dark:border-gray-700"
                            data-testid="input-deposit-amount"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Available: <span className="font-semibold">{parseFloat(vault.data.mUSDBalance).toFixed(2)} mUSD</span>
                          </p>
                        </div>

                        {vault.data.mUSDAllowance < BigInt(parseFloat(depositAmount || '0') * 1e6) && (
                          <Button
                            onClick={() => vault.approveUSD(depositAmount)}
                            className="w-full bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold"
                            disabled={!depositAmount || needsKYC || isBlocked || isPaused}
                            data-testid="button-approve"
                          >
                            Approve mUSD
                          </Button>
                        )}

                        <Button
                          onClick={() => vault.deposit(depositAmount)}
                          className="w-full bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold"
                          disabled={
                            !depositAmount ||
                            vault.data.mUSDAllowance < BigInt(parseFloat(depositAmount || '0') * 1e6) ||
                            needsKYC ||
                            isBlocked ||
                            isPaused
                          }
                          data-testid="button-deposit"
                        >
                          <ArrowDown className="mr-2 h-4 w-4" />
                          Deposit
                        </Button>
                </CardContent>
              </Card>
            </TabsContent>

                  <TabsContent value="withdraw" className="mt-0">
                    <Card className="glass-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Withdraw Assets</CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Burn spDAO shares to withdraw mUSD</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="space-y-2.5">
                          <Label htmlFor="withdraw-amount" className="text-sm font-semibold text-gray-900 dark:text-white">Amount (mUSD)</Label>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base border-gray-300 dark:border-gray-700"
                            data-testid="input-withdraw-amount"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            spDAO Balance: <span className="font-semibold">{parseFloat(vault.data.spDAOBalance).toFixed(4)}</span>
                          </p>
                        </div>

                        <Button
                          onClick={() => vault.withdraw(withdrawAmount)}
                          className="w-full bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold"
                          disabled={!withdrawAmount || needsKYC || isBlocked || isPaused}
                          data-testid="button-withdraw"
                        >
                          <ArrowUp className="mr-2 h-4 w-4" />
                          Withdraw
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="delegate" className="mt-0">
                    <Card className="glass-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Delegate Voting Power</CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                          Delegate your voting power to another address or yourself
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="space-y-2.5">
                          <Label htmlFor="delegate-address" className="text-sm font-semibold text-gray-900 dark:text-white">Delegate Address</Label>
                          <Input
                            id="delegate-address"
                            type="text"
                            placeholder="0x..."
                            value={delegateAddress}
                            onChange={(e) => setDelegateAddress(e.target.value)}
                            className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base border-gray-300 dark:border-gray-700"
                            data-testid="input-delegate-address"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Current delegate: <span className="font-semibold">{vault.data.delegate || 'Self'}</span>
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => vault.delegateVotes(delegateAddress)}
                            className="flex-1 bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold"
                            disabled={!delegateAddress}
                            data-testid="button-delegate-custom"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Delegate
                          </Button>
                          <Button
                            onClick={() => vault.delegateVotes(address)}
                            className="flex-1 bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold"
                            data-testid="button-delegate-self"
                          >
                            Delegate to Self
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
        </>
            ) : (
              <Alert className="glass-card border-gray-300 dark:border-gray-700" data-testid="alert-error">
                <AlertCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                <AlertDescription className="text-gray-900 dark:text-white">
                  {vault.error || 'Failed to load vault data. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </>
    );
  }
