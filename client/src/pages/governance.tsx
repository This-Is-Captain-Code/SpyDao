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
import { InteractiveGradient } from '@/components/InteractiveGradient';

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
        <div className="min-h-screen relative">
          <InteractiveGradient />
          <div className="fixed inset-0 -z-10 bg-dot-pattern-sparse opacity-25"></div>
          <DAppHeader />
          <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <Vote className="w-16 h-16 text-black" data-testid="icon-governance" />
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white" data-testid="text-title">Governance</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6" data-testid="text-description">
                  Connect your wallet to participate in SPY DAO governance
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

  const getStateBadge = (state: ProposalState) => {
    const icons: Record<ProposalState, any> = {
      [ProposalState.Pending]: Clock,
      [ProposalState.Active]: Vote,
      [ProposalState.Canceled]: XCircle,
      [ProposalState.Defeated]: XCircle,
      [ProposalState.Succeeded]: CheckCircle,
      [ProposalState.Queued]: Clock,
      [ProposalState.Expired]: XCircle,
      [ProposalState.Executed]: CheckCircle,
    };

    const Icon = icons[state];

    return (
      <Badge className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
        <Icon className="h-3 w-3" />
        {ProposalState[state]}
      </Badge>
    );
  };

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
                  Governance
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400" data-testid="text-subtitle">
                  Vote on S&P 500 shareholder proposals and earn rewards
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
          </div>

          {/* Main Content */}
          {!isCorrectNetwork ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
              <div className="glass-card rounded-2xl p-12 text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-gray-900 dark:text-white mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Wrong Network</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please switch to Rayls Testnet to access governance features
                </p>
                <Button onClick={switchToRaylsDevnet} className="bg-black hover:bg-gray-800 text-white" data-testid="button-switch-network-main">
                  Switch to Rayls Testnet
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3 mb-10">
                <Card data-testid="card-total-proposals" className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Total Proposals</CardTitle>
                    <Vote className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-total-proposals">
                      {governance.proposals.length}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Active governance votes</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-rewards-distributed" className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Total Rewards</CardTitle>
                    <Award className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-total-rewards">
                      {parseFloat(governance.totalRewards).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">mUSD distributed</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-reward-rate" className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Reward Rate</CardTitle>
                    <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-reward-rate">
                      {parseFloat(governance.rewardPerVote).toFixed(4)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">mUSD per vote</p>
                  </CardContent>
                </Card>
              </div>

              {/* Proposals Tabs */}
              <Tabs defaultValue="proposals" className="w-full">
                <TabsList className="grid w-full grid-cols-2 glass-card mb-6">
                  <TabsTrigger value="proposals" className="text-sm font-medium text-gray-900 dark:text-white data-[state=active]:bg-black data-[state=active]:text-white" data-testid="tab-proposals">Proposals</TabsTrigger>
                  <TabsTrigger value="create" className="text-sm font-medium text-gray-900 dark:text-white data-[state=active]:bg-black data-[state=active]:text-white" data-testid="tab-create">Create Proposal</TabsTrigger>
                </TabsList>

                <TabsContent value="proposals" className="mt-0">
                  {governance.isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="glass-card">
                          <CardHeader>
                            <Skeleton className="h-6 w-64" />
                            <Skeleton className="h-4 w-96" />
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : governance.proposals.length === 0 ? (
                    <Alert className="glass-card border-gray-300 dark:border-gray-700" data-testid="alert-no-proposals">
                      <AlertCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                      <AlertDescription className="text-gray-900 dark:text-white">
                        No proposals yet. Be the first to create one!
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {governance.proposals.map((proposal) => (
                        <Card key={proposal.id} data-testid={`card-proposal-${proposal.id}`} className="glass-card">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white" data-testid={`text-proposal-ticker-${proposal.id}`}>
                                    {proposal.companyTicker} - Proposal #{proposal.shareholderProposalId}
                                  </CardTitle>
                                  {getStateBadge(proposal.state)}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">
                                    Vote: <span className="font-bold text-gray-900 dark:text-white">{proposal.voteFor ? 'FOR' : 'AGAINST'}</span>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Total Votes: <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(proposal.totalVotes).toFixed(2)}</span>
                                  </span>
                                  {proposal.hasVoted && (
                                    <>
                                      <span>•</span>
                                      <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        You Voted
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardFooter className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {proposal.state === ProposalState.Active && !proposal.hasVoted && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => setSelectedProposal(proposal.id)}
                                    className="bg-black hover:bg-gray-800 text-white"
                                    data-testid={`button-vote-${proposal.id}`}
                                  >
                                    <Vote className="mr-2 h-4 w-4" />
                                    Cast Vote
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="glass-card border-gray-300 dark:border-gray-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-gray-900 dark:text-white">Cast Your Vote</DialogTitle>
                                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                                      Vote on {proposal.companyTicker} Proposal #{proposal.shareholderProposalId}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-5 py-4">
                                    <div className="space-y-2.5">
                                      <Label className="text-sm font-semibold text-gray-900 dark:text-white">Your Vote</Label>
                                      <div className="flex gap-3">
                                        <Button
                                          className="flex-1 bg-black hover:bg-gray-800 text-white h-12"
                                          onClick={() => {
                                            governance.castVote(proposal.id, VoteSupport.For, voteReason);
                                            setVoteReason('');
                                          }}
                                          data-testid={`button-vote-for-${proposal.id}`}
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Vote For
                                        </Button>
                                        <Button
                                          className="flex-1 bg-black hover:bg-gray-800 text-white h-12"
                                          onClick={() => {
                                            governance.castVote(proposal.id, VoteSupport.Against, voteReason);
                                            setVoteReason('');
                                          }}
                                          data-testid={`button-vote-against-${proposal.id}`}
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Vote Against
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-2.5">
                                      <Label htmlFor="vote-reason" className="text-sm font-semibold text-gray-900 dark:text-white">Reason (Optional)</Label>
                                      <Textarea
                                        id="vote-reason"
                                        placeholder="Share your reasoning..."
                                        value={voteReason}
                                        onChange={(e) => setVoteReason(e.target.value)}
                                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                                        data-testid="input-vote-reason"
                                      />
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}

                            {parseFloat(proposal.availableReward) > 0 && !proposal.hasClaimed && (
                              <Button
                                onClick={() => governance.claimReward(proposal.id)}
                                className="bg-black hover:bg-gray-800 text-white"
                                data-testid={`button-claim-${proposal.id}`}
                              >
                                <Award className="mr-2 h-4 w-4" />
                                Claim {parseFloat(proposal.availableReward).toFixed(4)} mUSD
                              </Button>
                            )}

                            {proposal.hasClaimed && (
                              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700">
                                <Award className="h-3 w-3 mr-1" />
                                Reward Claimed
                              </Badge>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Button onClick={governance.refresh} className="bg-black hover:bg-gray-800 text-white" data-testid="button-refresh">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Refresh Proposals
                    </Button>
                    <Link href="/vault">
                      <Button className="bg-black hover:bg-gray-800 text-white" data-testid="button-vault">
                        View Vault
                      </Button>
                    </Link>
                  </div>
                </TabsContent>

                <TabsContent value="create" className="mt-0">
                  <Card className="glass-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Create New Proposal</CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        Submit a new S&P 500 shareholder proposal for DAO voting
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2.5">
                        <Label htmlFor="company-ticker" className="text-sm font-semibold text-gray-900 dark:text-white">Company Ticker</Label>
                        <Input
                          id="company-ticker"
                          placeholder="AAPL"
                          value={newProposal.ticker}
                          onChange={(e) => setNewProposal({ ...newProposal, ticker: e.target.value.toUpperCase() })}
                          className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base border-gray-300 dark:border-gray-700"
                          data-testid="input-ticker"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="proposal-id" className="text-sm font-semibold text-gray-900 dark:text-white">Shareholder Proposal ID</Label>
                        <Input
                          id="proposal-id"
                          placeholder="12345"
                          value={newProposal.proposalId}
                          onChange={(e) => setNewProposal({ ...newProposal, proposalId: e.target.value })}
                          className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base border-gray-300 dark:border-gray-700"
                          data-testid="input-proposal-id"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="vote-recommendation" className="text-sm font-semibold text-gray-900 dark:text-white">DAO Recommendation</Label>
                        <Select
                          value={newProposal.voteFor}
                          onValueChange={(value) => setNewProposal({ ...newProposal, voteFor: value })}
                        >
                          <SelectTrigger id="vote-recommendation" className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" data-testid="select-vote-recommendation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                            <SelectItem value="true" className="text-gray-900 dark:text-white">Vote FOR</SelectItem>
                            <SelectItem value="false" className="text-gray-900 dark:text-white">Vote AGAINST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-900 dark:text-white">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the shareholder proposal..."
                          value={newProposal.description}
                          onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                          rows={6}
                          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                          data-testid="input-description"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        className="w-full bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold"
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
      </div>
    </>
  );
}
