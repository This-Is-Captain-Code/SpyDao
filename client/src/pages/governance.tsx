import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useGovernance } from '@/hooks/use-governance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Vote, TrendingUp, Award, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { VoteSupport, ProposalState } from '@/lib/contracts';
import { Link } from 'wouter';
import { DAppHeader } from '@/components/DAppHeader';

export default function Governance() {
  const { address, provider, connectWallet, truncateAddress, isCorrectNetwork, switchToRaylsDevnet } = useWallet();
  const governance = useGovernance(provider, address);

  const [newProposal, setNewProposal] = useState({
    ticker: '',
    proposalId: '',
    voteFor: 'true',
    description: '',
  });

  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteReason, setVoteReason] = useState('');

  if (!address) {
    return (
      <>
        <DAppHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <Vote className="w-16 h-16 text-primary" data-testid="icon-governance" />
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2" data-testid="text-title">Governance</h1>
              <p className="text-muted-foreground mb-6" data-testid="text-description">
                Connect your wallet to participate in SPY DAO governance
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

  const getStateBadge = (state: ProposalState) => {
    const variants: Record<ProposalState, { variant: any; icon: any }> = {
      [ProposalState.Pending]: { variant: 'secondary', icon: Clock },
      [ProposalState.Active]: { variant: 'default', icon: Vote },
      [ProposalState.Canceled]: { variant: 'destructive', icon: XCircle },
      [ProposalState.Defeated]: { variant: 'destructive', icon: XCircle },
      [ProposalState.Succeeded]: { variant: 'default', icon: CheckCircle },
      [ProposalState.Queued]: { variant: 'secondary', icon: Clock },
      [ProposalState.Expired]: { variant: 'secondary', icon: XCircle },
      [ProposalState.Executed]: { variant: 'default', icon: CheckCircle },
    };

    const config = variants[state];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {ProposalState[state]}
      </Badge>
    );
  };

  return (
    <>
      <DAppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold" data-testid="text-page-title">Governance</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Connected:</span>
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid="text-address">
              {truncateAddress(address)}
            </code>
          </div>
        </div>
        <p className="text-muted-foreground" data-testid="text-subtitle">
          Vote on S&P 500 shareholder proposals and earn rewards
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

      {!isCorrectNetwork ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Wrong Network</h2>
            <p className="text-muted-foreground mb-4">
              Please switch to Rayls Testnet to access governance features
            </p>
            <Button onClick={switchToRaylsDevnet} data-testid="button-switch-network-main">
              Switch to Rayls Testnet
            </Button>
          </div>
        </div>
      ) : (
        <>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card data-testid="card-total-proposals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-proposals">
              {governance.proposals.length}
            </div>
            <p className="text-xs text-muted-foreground">Active governance votes</p>
          </CardContent>
        </Card>

        <Card data-testid="card-rewards-distributed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-rewards">
              {parseFloat(governance.totalRewards).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">mUSD distributed</p>
          </CardContent>
        </Card>

        <Card data-testid="card-reward-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-reward-rate">
              {parseFloat(governance.rewardPerVote).toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground">mUSD per vote</p>
          </CardContent>
        </Card>
      </div>

      {governance.config && (
        <Card className="mb-8" data-testid="card-governance-config">
          <CardHeader>
            <CardTitle>Governance Configuration</CardTitle>
            <CardDescription>Governor contract parameters</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Voting Delay:</span>
              <span className="text-sm font-medium" data-testid="text-voting-delay">
                {governance.config.votingDelay} blocks
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Voting Period:</span>
              <span className="text-sm font-medium" data-testid="text-voting-period">
                {governance.config.votingPeriod} blocks
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quorum:</span>
              <span className="text-sm font-medium" data-testid="text-quorum">
                {parseFloat(governance.config.quorum).toFixed(4)} spDAO
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Proposal Threshold:</span>
              <span className="text-sm font-medium" data-testid="text-proposal-threshold">
                {parseFloat(governance.config.proposalThreshold).toFixed(4)} spDAO
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proposals" data-testid="tab-proposals">Proposals</TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">Create Proposal</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-6">
          {governance.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-96" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : governance.proposals.length === 0 ? (
            <Alert data-testid="alert-no-proposals">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No proposals yet. Be the first to create one!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {governance.proposals.map((proposal) => (
                <Card key={proposal.id} data-testid={`card-proposal-${proposal.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl" data-testid={`text-proposal-ticker-${proposal.id}`}>
                            {proposal.companyTicker} - Proposal #{proposal.shareholderProposalId}
                          </CardTitle>
                          {getStateBadge(proposal.state)}
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span>
                            Vote: {proposal.voteFor ? 'FOR' : 'AGAINST'}
                          </span>
                          <span>•</span>
                          <span>Total Votes: {parseFloat(proposal.totalVotes).toFixed(2)}</span>
                          {proposal.hasVoted && (
                            <>
                              <span>•</span>
                              <Badge variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                You Voted
                              </Badge>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter className="flex gap-2 flex-wrap">
                    {proposal.state === ProposalState.Active && !proposal.hasVoted && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedProposal(proposal.id)}
                            data-testid={`button-vote-${proposal.id}`}
                          >
                            <Vote className="mr-2 h-4 w-4" />
                            Cast Vote
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cast Your Vote</DialogTitle>
                            <DialogDescription>
                              Vote on {proposal.companyTicker} Proposal #{proposal.shareholderProposalId}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Your Vote</Label>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    governance.castVote(proposal.id, VoteSupport.For, voteReason);
                                    setVoteReason('');
                                  }}
                                  data-testid={`button-vote-for-${proposal.id}`}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Vote For
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    governance.castVote(proposal.id, VoteSupport.Against, voteReason);
                                    setVoteReason('');
                                  }}
                                  data-testid={`button-vote-against-${proposal.id}`}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Vote Against
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="vote-reason">Reason (Optional)</Label>
                              <Textarea
                                id="vote-reason"
                                placeholder="Share your reasoning..."
                                value={voteReason}
                                onChange={(e) => setVoteReason(e.target.value)}
                                data-testid="input-vote-reason"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {proposal.state === ProposalState.Succeeded && !proposal.executed && (
                      <Button
                        onClick={() => governance.executeProposal(
                          proposal.id,
                          proposal.companyTicker,
                          proposal.shareholderProposalId,
                          proposal.voteFor,
                          proposal.description // Use the EXACT original description from ProposalCreated event
                        )}
                        variant="default"
                        data-testid={`button-execute-${proposal.id}`}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Execute Proposal
                      </Button>
                    )}

                    {parseFloat(proposal.availableReward) > 0 && !proposal.hasClaimed && (
                      <Button
                        onClick={() => governance.claimReward(proposal.id)}
                        variant="outline"
                        data-testid={`button-claim-${proposal.id}`}
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Claim {parseFloat(proposal.availableReward).toFixed(4)} mUSD
                      </Button>
                    )}

                    {proposal.hasClaimed && (
                      <Badge variant="outline">
                        <Award className="h-3 w-3 mr-1" />
                        Reward Claimed
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button onClick={governance.refresh} variant="outline" data-testid="button-refresh">
              <TrendingUp className="mr-2 h-4 w-4" />
              Refresh Proposals
            </Button>
            <Link href="/vault">
              <Button variant="outline" data-testid="button-vault">
                View Vault
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Proposal</CardTitle>
              <CardDescription>
                Submit a new S&P 500 shareholder proposal for DAO voting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-ticker">Company Ticker</Label>
                <Input
                  id="company-ticker"
                  placeholder="AAPL"
                  value={newProposal.ticker}
                  onChange={(e) => setNewProposal({ ...newProposal, ticker: e.target.value.toUpperCase() })}
                  data-testid="input-ticker"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposal-id">Shareholder Proposal ID</Label>
                <Input
                  id="proposal-id"
                  placeholder="12345"
                  value={newProposal.proposalId}
                  onChange={(e) => setNewProposal({ ...newProposal, proposalId: e.target.value })}
                  data-testid="input-proposal-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vote-recommendation">DAO Recommendation</Label>
                <Select
                  value={newProposal.voteFor}
                  onValueChange={(value) => setNewProposal({ ...newProposal, voteFor: value })}
                >
                  <SelectTrigger id="vote-recommendation" data-testid="select-vote-recommendation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Vote FOR</SelectItem>
                    <SelectItem value="false">Vote AGAINST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the shareholder proposal..."
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  rows={6}
                  data-testid="input-description"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  governance.createProposal(
                    newProposal.ticker,
                    newProposal.proposalId,
                    newProposal.voteFor === 'true',
                    newProposal.description
                  );
                  setNewProposal({ ticker: '', proposalId: '', voteFor: 'true', description: '' });
                }}
                className="w-full"
                disabled={!newProposal.ticker || !newProposal.proposalId || !newProposal.description}
                data-testid="button-create-proposal"
              >
                <Vote className="mr-2 h-4 w-4" />
                Create Proposal
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      </>
      )}
      </div>
    </>
  );
}
