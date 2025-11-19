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
import { Link } from 'wouter';
import { DAppHeader } from '@/components/DAppHeader';

export default function Vault() {
  const { address, provider, connectWallet, truncateAddress, isCorrectNetwork, switchToRaylsDevnet } = useWallet();
  const vault = useVault(provider, address);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [delegateAddress, setDelegateAddress] = useState('');
  
  // Only show KYC button to deployer/admin (set via env var or hardcoded for testing)
  const DEPLOYER_ADDRESS = import.meta.env.VITE_DEPLOYER_ADDRESS?.toLowerCase() || '0x2bc3cfae99ea16c5abf55a7b5e36e43f3e3ec3ab';
  const isAdmin = address?.toLowerCase() === DEPLOYER_ADDRESS;

  if (!address) {
    return (
      <>
        <DAppHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Coins className="w-16 h-16 text-primary" data-testid="icon-vault" />
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold" data-testid="text-page-title">SPY Vault</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Connected:</span>
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid="text-address">
              {truncateAddress(address)}
            </code>
          </div>
        </div>
        <p className="text-muted-foreground" data-testid="text-subtitle">
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

      {isCorrectNetwork && (needsKYC || isBlocked || isPaused) && (
        <Alert className="mb-6" variant={isBlocked ? "destructive" : "default"} data-testid="alert-status">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isBlocked && "Your address is blocked from vault operations."}
            {isPaused && "The vault is currently paused."}
            {needsKYC && !isBlocked && !isPaused && (
              isAdmin 
                ? "KYC verification required. Use the 'Complete KYC' button below to approve yourself."
                : "KYC verification required to deposit/withdraw. Contact admin for approval."
            )}
          </AlertDescription>
        </Alert>
      )}

      {!isCorrectNetwork ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
          <AlertCircle className="w-16 h-16 text-destructive" />
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
            <Card data-testid="card-spdao-balance">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">spDAO Balance</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-spdao-balance">
                  {parseFloat(vault.data.spDAOBalance).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">Governance shares</p>
              </CardContent>
            </Card>

            <Card data-testid="card-musd-balance">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">mUSD Balance</CardTitle>
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-musd-balance">
                  {parseFloat(vault.data.mUSDBalance).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Available to deposit</p>
              </CardContent>
            </Card>

            <Card data-testid="card-voting-power">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voting Power</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-voting-power">
                  {parseFloat(vault.data.votingPower).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {vault.data.delegate ? `Delegated to ${truncateAddress(vault.data.delegate)}` : 'Self-delegated'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card data-testid="card-vault-stats">
              <CardHeader>
                <CardTitle>Vault Statistics</CardTitle>
                <CardDescription>Current vault metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Assets:</span>
                  <span className="text-sm font-medium" data-testid="text-total-assets">
                    {parseFloat(vault.data.totalAssets).toFixed(2)} mUSD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">SPY Price:</span>
                  <span className="text-sm font-medium" data-testid="text-spy-price">
                    ${parseFloat(vault.data.spyPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Synthetic SPY Shares:</span>
                  <span className="text-sm font-medium" data-testid="text-synthetic-shares">
                    {vault.data.syntheticShares}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">KYC Status:</span>
                  <span className="flex items-center gap-1 text-sm font-medium">
                    {vault.data.isKYCCompleted ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">Not Verified</span>
                      </>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={vault.claimFromFaucet}
                  variant="outline"
                  className="w-full"
                  data-testid="button-faucet"
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Claim 1000 mUSD from Faucet
                </Button>
                {needsKYC && isAdmin && (
                  <Button
                    onClick={vault.completeKYC}
                    variant="default"
                    className="w-full"
                    data-testid="button-complete-kyc"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Complete KYC (Admin Only)
                  </Button>
                )}
                <Button
                  onClick={vault.refresh}
                  variant="outline"
                  className="w-full"
                  data-testid="button-refresh"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
                <Link href="/governance">
                  <Button variant="default" className="w-full" data-testid="button-governance">
                    <Users className="mr-2 h-4 w-4" />
                    View Governance
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit" data-testid="tab-deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw" data-testid="tab-withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="delegate" data-testid="tab-delegate">Delegate</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Assets</CardTitle>
                  <CardDescription>Deposit mUSD to receive spDAO shares</CardDescription>
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
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Assets</CardTitle>
                  <CardDescription>Burn spDAO shares to withdraw mUSD</CardDescription>
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
              <Card>
                <CardHeader>
                  <CardTitle>Delegate Voting Power</CardTitle>
                  <CardDescription>
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
