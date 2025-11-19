import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useVault } from '@/hooks/use-vault';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Coins, TrendingUp, Users, AlertCircle, CheckCircle, XCircle, Shield, HelpCircle } from 'lucide-react';
import { Link } from 'wouter';
import { DAppHeader } from '@/components/DAppHeader';

export default function Vault() {
  const { address, provider, connectWallet, truncateAddress, isCorrectNetwork, switchToRaylsDevnet } = useWallet();
  const vault = useVault(provider, address);
  const admin = useAdmin(provider, address);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [delegateAddress, setDelegateAddress] = useState('');

  if (!address) {
    return (
      <>
        <DAppHeader />
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Coins className="w-16 h-16 text-foreground/60" data-testid="icon-vault" />
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2" data-testid="text-title">SPY Vault</h1>
              <p className="text-muted-foreground mb-6" data-testid="text-description">
                Connect your wallet to access the SPY DAO Vault
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

  const needsKYC = vault.data && !vault.data.isKYCCompleted;
  const isBlocked = vault.data?.isBlocked;
  const isPaused = vault.data?.isPaused;

  return (
    <>
      <DAppHeader />
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-page-title">SPY Vault</h1>
          <div className="flex flex-col items-end gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Connected:</span>
              <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md border" data-testid="text-address">
                {truncateAddress(address)}
              </code>
            </div>
            {isCorrectNetwork && vault.data && (
              <div className="flex items-center gap-2 mt-1" data-testid="card-quick-actions">
                <Button
                  onClick={vault.claimFromFaucet}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  data-testid="button-faucet"
                >
                  <ArrowDown className="h-3 w-3 mr-1" />
                  Faucet
                </Button>
                <Button
                  onClick={vault.refresh}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  data-testid="button-refresh"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-lg" data-testid="text-subtitle">
          Deposit assets and receive governance-enabled spDAO shares
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
              className="ml-4"
              data-testid="button-switch-network"
            >
              Switch Network
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isCorrectNetwork && admin.data && (
        <div className="mb-3 flex items-center justify-end gap-4 text-xs" data-testid="card-roles">
          <span className="text-muted-foreground font-medium">Roles:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground">Admin:</span>
              {admin.data.hasAdminRole ? (
                <Badge variant="default" className="h-5 px-1.5 text-xs font-semibold" data-testid="badge-admin-role">
                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                  Active
                </Badge>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground">Executor:</span>
              {admin.data.hasExecutorRole ? (
                <Badge variant="default" className="h-5 px-1.5 text-xs font-semibold" data-testid="badge-executor-role">
                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                  Active
                </Badge>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground">Compliance:</span>
              {admin.data.hasComplianceRole ? (
                <Badge variant="default" className="h-5 px-1.5 text-xs font-semibold" data-testid="badge-compliance-role">
                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                  Active
                </Badge>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </span>
          </div>
        </div>
      )}

      {isCorrectNetwork && (needsKYC || isBlocked || isPaused) && (
        <Alert className={`mb-6 ${needsKYC && !isBlocked && !isPaused ? 'bg-black text-white border-black py-3' : ''}`} variant={isBlocked ? "destructive" : "default"} data-testid="alert-status">
          {needsKYC && !isBlocked && !isPaused ? (
            <HelpCircle className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={`text-sm flex items-center justify-between ${needsKYC && !isBlocked && !isPaused ? 'text-white' : ''}`}>
            <span>
              {isBlocked && "Your address is blocked from vault operations."}
              {isPaused && "The vault is currently paused."}
              {needsKYC && !isBlocked && !isPaused && "KYC verification required. If you have admin permissions (COMPLIANCE_ROLE), use the button to complete KYC. Otherwise, contact an admin for approval."}
            </span>
            {needsKYC && !isBlocked && !isPaused && vault.data && (
              <Button
                onClick={vault.completeKYC}
                variant="default"
                size="sm"
                className="ml-4 h-7 text-xs px-3 bg-white text-black hover:bg-gray-100"
                data-testid="button-complete-kyc"
              >
                <CheckCircle className="mr-1.5 h-3 w-3" />
                Complete KYC
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!isCorrectNetwork ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
          <AlertCircle className="w-16 h-16 text-foreground/60" />
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Wrong Network</h2>
            <p className="text-muted-foreground mb-4">
              Please switch to Rayls Testnet to access the SPY Vault
            </p>
            <Button onClick={switchToRaylsDevnet} data-testid="button-switch-network-main">
              Switch to Rayls Testnet
            </Button>
          </div>
        </div>
      ) : vault.isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
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
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card data-testid="card-spdao-balance" className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide">spDAO Balance</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1" data-testid="text-spdao-balance">
                  {parseFloat(vault.data.spDAOBalance).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Governance shares</p>
              </CardContent>
            </Card>

            <Card data-testid="card-musd-balance" className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide">mUSD Balance</CardTitle>
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1" data-testid="text-musd-balance">
                  {parseFloat(vault.data.mUSDBalance).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Available to deposit</p>
              </CardContent>
            </Card>

            <Card data-testid="card-voting-power" className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide">Voting Power</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1" data-testid="text-voting-power">
                  {parseFloat(vault.data.votingPower).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {vault.data.delegate ? `Delegated to ${truncateAddress(vault.data.delegate)}` : 'Self-delegated'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-6">
              <Card data-testid="card-vault-stats" className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Vault Statistics</CardTitle>
                  <CardDescription className="text-sm">Current vault metrics and pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground font-medium">Share Price:</span>
                    <span className="text-sm font-semibold" data-testid="text-share-price">
                      ${parseFloat(vault.data.sharePrice).toFixed(6)} mUSD
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground font-medium">TVL (Total Value Locked):</span>
                    <span className="text-sm font-semibold" data-testid="text-tvl">
                      ${parseFloat(vault.data.tvlUSD).toLocaleString(undefined, {maximumFractionDigits: 2})} mUSD
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground font-medium">Total Supply:</span>
                    <span className="text-sm font-semibold" data-testid="text-total-supply">
                      {parseFloat(vault.data.totalSupply).toFixed(4)} spDAO
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground font-medium">SPY Price:</span>
                    <span className="text-sm font-semibold" data-testid="text-spy-price">
                      ${parseFloat(vault.data.spyPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">KYC Status:</span>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      {vault.data.isKYCCompleted ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Not Verified</span>
                        </>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-synthetic-exposure" className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Synthetic SPY Exposure</CardTitle>
                  <CardDescription className="text-sm">Off-chain SPY holdings tracked in the vault</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground font-medium">Synthetic Shares:</span>
                    <span className="text-sm font-semibold" data-testid="text-synthetic-shares">
                      {vault.data.syntheticShares} SPY
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground font-medium">Exposure Value:</span>
                    <span className="text-sm font-semibold" data-testid="text-synthetic-value">
                      ${parseFloat(vault.data.syntheticExposureUSD).toLocaleString(undefined, {maximumFractionDigits: 2})} mUSD
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground font-medium">% of TVL:</span>
                    <span className="text-sm font-semibold" data-testid="text-synthetic-percent">
                      {parseFloat(vault.data.syntheticExposurePercent).toFixed(2)}%
                    </span>
                  </div>
                  <Alert data-testid="alert-synthetic-info">
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Synthetic holdings represent real SPY shares held by the broker wallet off-chain, tracked on-chain for transparency.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div>
              <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit" data-testid="tab-deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw" data-testid="tab-withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="delegate" data-testid="tab-delegate">Delegate</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-6">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Deposit Assets</CardTitle>
                  <CardDescription className="text-sm">Deposit mUSD to receive spDAO shares</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Amount (mUSD)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      data-testid="input-deposit-amount"
                    />
                    <p className="text-xs text-muted-foreground">
                      Available: {parseFloat(vault.data.mUSDBalance).toFixed(2)} mUSD
                    </p>
                  </div>

                  {vault.data.mUSDAllowance < BigInt(parseFloat(depositAmount || '0') * 1e6) && (
                    <Button
                      onClick={() => vault.approveUSD(depositAmount)}
                      variant="outline"
                      className="w-full"
                      disabled={!depositAmount || needsKYC || isBlocked || isPaused}
                      data-testid="button-approve"
                    >
                      Approve mUSD
                    </Button>
                  )}

                  <Button
                    onClick={() => vault.deposit(depositAmount)}
                    className="w-full"
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

            <TabsContent value="withdraw" className="mt-6">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Withdraw Assets</CardTitle>
                  <CardDescription className="text-sm">Burn spDAO shares to withdraw mUSD</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount (mUSD)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      data-testid="input-withdraw-amount"
                    />
                    <p className="text-xs text-muted-foreground">
                      spDAO Balance: {parseFloat(vault.data.spDAOBalance).toFixed(4)}
                    </p>
                  </div>

                  <Button
                    onClick={() => vault.withdraw(withdrawAmount)}
                    className="w-full"
                    disabled={!withdrawAmount || needsKYC || isBlocked || isPaused}
                    data-testid="button-withdraw"
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delegate" className="mt-6">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Delegate Voting Power</CardTitle>
                  <CardDescription className="text-sm">
                    Delegate your voting power to another address or yourself
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="delegate-address">Delegate Address</Label>
                    <Input
                      id="delegate-address"
                      type="text"
                      placeholder="0x..."
                      value={delegateAddress}
                      onChange={(e) => setDelegateAddress(e.target.value)}
                      data-testid="input-delegate-address"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current delegate: {vault.data.delegate || 'Self'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => vault.delegateVotes(delegateAddress)}
                      className="flex-1"
                      disabled={!delegateAddress}
                      data-testid="button-delegate-custom"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Delegate
                    </Button>
                    <Button
                      onClick={() => vault.delegateVotes(address)}
                      variant="outline"
                      className="flex-1"
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
          </div>
        </>
      ) : (
        <Alert variant="destructive" data-testid="alert-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {vault.error || 'Failed to load vault data. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
    </>
  );
}
