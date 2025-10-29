import { useState } from 'react';
import {
  AlertTriangle,
  Scale,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Gavel,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  Shield,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface DisputeCase {
  id: string;
  loanId: string;
  assetName: string;
  complainant: string;
  complainantRole: 'owner' | 'borrower';
  complainantPubkey: string;
  evidenceLink: string;
  description: string;
  status: 'open' | 'voting' | 'resolved';
  createdAt: string;
  votingDeadline: string;
  appealVotesFor: number;
  appealVotesAgainst: number;
  totalVoters: number;
  requiredVotes: number;
  votedMembers: string[];
  resolution: string | null;
  slashedArbitrators: string[] | null;
}

const mockDisputes: DisputeCase[] = [
  {
    id: 'DISPUTE-001',
    loanId: 'LOAN-001',
    assetName: 'MacBook Pro 16" - NFT #1247',
    complainant: 'Sarah Johnson',
    complainantRole: 'owner',
    complainantPubkey: '7xKp...3mN9',
    evidenceLink: 'https://arweave.net/abc123...',
    description:
      'Asset was returned damaged with screen crack. Arbitrators incorrectly verified as "OK". Photographic evidence attached.',
    status: 'voting',
    createdAt: '2025-10-26T10:00:00',
    votingDeadline: '2025-10-28T10:00:00',
    appealVotesFor: 12,
    appealVotesAgainst: 3,
    totalVoters: 20,
    requiredVotes: 11,
    votedMembers: [],
    resolution: null,
    slashedArbitrators: null,
  },
  {
    id: 'DISPUTE-002',
    loanId: 'LOAN-015',
    assetName: 'iPad Pro 12.9" - NFT #0892',
    complainant: 'Mike Chen',
    complainantRole: 'borrower',
    complainantPubkey: '9kLm...8pQ2',
    evidenceLink: 'https://ipfs.io/ipfs/Qm...',
    description:
      'Asset was returned in perfect condition with video proof. Arbitrators falsely claimed damage to extort payment.',
    status: 'open',
    createdAt: '2025-10-27T14:00:00',
    votingDeadline: '2025-10-29T14:00:00',
    appealVotesFor: 0,
    appealVotesAgainst: 0,
    totalVoters: 20,
    requiredVotes: 11,
    votedMembers: [],
    resolution: null,
    slashedArbitrators: null,
  },
  {
    id: 'DISPUTE-003',
    loanId: 'LOAN-008',
    assetName: 'Dell Monitor 27" - NFT #0567',
    complainant: 'Emily Davis',
    complainantRole: 'owner',
    description:
      'Borrower failed to return asset but arbitrators marked as returned. Clear collusion detected.',
    complainantPubkey: '8pQ4...2mK7',
    evidenceLink: 'https://arweave.net/def456...',
    status: 'resolved',
    createdAt: '2025-10-20T09:00:00',
    votingDeadline: '2025-10-22T09:00:00',
    appealVotesFor: 18,
    appealVotesAgainst: 2,
    totalVoters: 20,
    requiredVotes: 11,
    votedMembers: [],
    resolution: 'Complainant wins. Arbitrators ARB-005, ARB-007 slashed 50% stake each.',
    slashedArbitrators: ['ARB-005', 'ARB-007'],
  },
];

export function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeCase[]>(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [showRaiseDialog, setShowRaiseDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('voting');

  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'voting');
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Dispute Resolution</h1>
          <p className="text-sm text-gray-500">DAO-governed appeals for disputed verifications</p>
        </div>
        <Button
          onClick={() => setShowRaiseDialog(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Raise Dispute
        </Button>
      </div>

      {/* Dispute Resolution Flow */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-100">
        <h3 className="text-lg text-gray-900 mb-4">3-Layer Dispute Resolution</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Layer 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Users className="h-10 w-10 text-blue-600" />
            </div>
            <div className="text-sm text-gray-900 mb-2">Layer 1: M-of-N Arbitrators</div>
            <div className="text-xs text-gray-600">
              Initial verification by 3-of-5 staked arbitrators
            </div>
          </div>

          {/* Layer 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
            <div className="text-sm text-gray-900 mb-2">Layer 2: Raise Dispute</div>
            <div className="text-xs text-gray-600">
              24-hour window to challenge with evidence (requires deposit)
            </div>
          </div>

          {/* Layer 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Gavel className="h-10 w-10 text-purple-600" />
            </div>
            <div className="text-sm text-gray-900 mb-2">Layer 3: DAO Appeal Council</div>
            <div className="text-xs text-gray-600">
              High-reputation members vote, fraudulent arbitrators slashed
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-orange-200">
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-orange-900 mb-1">Time-Bound</div>
              <div className="text-xs text-orange-700">
                24-hour dispute window, 48-hour voting period
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
            <Shield className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-red-900 mb-1">Slash Penalties</div>
              <div className="text-xs text-red-700">
                Fraudulent arbitrators lose 50-100% of stake
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Scale className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-blue-900 mb-1">Fair Process</div>
              <div className="text-xs text-blue-700">
                Evidence-based voting by independent council
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">{openDisputes.length}</div>
              <div className="text-sm text-gray-600">Active Disputes</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">
                {disputes.filter((d) => d.status === 'voting').length}
              </div>
              <div className="text-sm text-gray-600">In Voting</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">{resolvedDisputes.length}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">
                {disputes
                  .filter((d) => d.slashedArbitrators)
                  .reduce((sum, d) => sum + (d.slashedArbitrators?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Arbitrators Slashed</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Disputes List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="voting">
            Voting ({disputes.filter((d) => d.status === 'voting').length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open ({disputes.filter((d) => d.status === 'open').length})
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedDisputes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="voting" className="mt-4 space-y-4">
          {disputes
            .filter((d) => d.status === 'voting')
            .map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onViewDetails={() => setSelectedDispute(dispute)}
              />
            ))}
        </TabsContent>

        <TabsContent value="open" className="mt-4 space-y-4">
          {disputes
            .filter((d) => d.status === 'open')
            .map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onViewDetails={() => setSelectedDispute(dispute)}
              />
            ))}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-4">
          {resolvedDisputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onViewDetails={() => setSelectedDispute(dispute)}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Dispute Details Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>{selectedDispute?.id}</DialogDescription>
          </DialogHeader>
          {selectedDispute && <DisputeDetails dispute={selectedDispute} />}
        </DialogContent>
      </Dialog>

      {/* Raise Dispute Dialog */}
      <Dialog open={showRaiseDialog} onOpenChange={setShowRaiseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Raise Dispute</DialogTitle>
            <DialogDescription>
              Challenge arbitrator decision with evidence (requires 100 USDC deposit)
            </DialogDescription>
          </DialogHeader>
          <RaiseDisputeForm onClose={() => setShowRaiseDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DisputeCard({
  dispute,
  onViewDetails,
}: {
  dispute: DisputeCase;
  onViewDetails: () => void;
}) {
  const [isVoting, setIsVoting] = useState(false);
  const votePercentage = (dispute.appealVotesFor / dispute.totalVoters) * 100;
  const hasQuorum = dispute.appealVotesFor >= dispute.requiredVotes;

  const handleVote = async (voteFor: boolean) => {
    setIsVoting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Vote cast: ${voteFor ? 'Support' : 'Reject'} complainant`, {
        description: 'Your vote has been recorded on-chain',
      });
    } catch (error) {
      toast.error('Vote failed', {
        description: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="p-5 bg-white border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-900">{dispute.assetName}</div>
                <div className="text-xs text-gray-500">
                  {dispute.id} • {dispute.loanId}
                </div>
              </div>
            </div>
            <Badge
              className={
                dispute.status === 'voting'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : dispute.status === 'open'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }
            >
              {dispute.status}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-4">{dispute.description}</p>

          {/* Complainant */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Complainant: {dispute.complainant}</span>
              <Badge
                className={
                  dispute.complainantRole === 'owner'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 text-xs'
                    : 'bg-green-50 text-green-700 border-green-200 text-xs'
                }
              >
                {dispute.complainantRole}
              </Badge>
            </div>
          </div>

          {/* Voting Progress */}
          {dispute.status === 'voting' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Votes: {dispute.appealVotesFor + dispute.appealVotesAgainst} / {dispute.totalVoters}
                </span>
                <span className="text-gray-500">
                  Support: {dispute.appealVotesFor} ({Math.round(votePercentage)}%)
                </span>
              </div>
              <Progress value={votePercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Required: {dispute.requiredVotes} votes
                </span>
                {hasQuorum ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Quorum reached
                  </span>
                ) : (
                  <span className="text-orange-600">
                    {dispute.requiredVotes - dispute.appealVotesFor} more needed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Resolution */}
          {dispute.status === 'resolved' && dispute.resolution && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 mt-3">
              <div className="flex items-start gap-2">
                <Gavel className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-green-900">{dispute.resolution}</div>
              </div>
            </div>
          )}

          {/* Evidence Link */}
          <div className="mt-3">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => window.open(dispute.evidenceLink, '_blank')}
            >
              <FileText className="h-3 w-3 mr-1" />
              View Evidence
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex flex-col gap-2 lg:min-w-[200px]">
          {dispute.status === 'voting' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleVote(true)}
                disabled={isVoting}
              >
                {isVoting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ThumbsUp className="h-4 w-4 mr-1" />
                )}
                Support
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleVote(false)}
                disabled={isVoting}
              >
                {isVoting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ThumbsDown className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
            </>
          )}

          {dispute.status === 'voting' && (
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-1 text-xs text-blue-700 mb-1">
                <Clock className="h-3 w-3" />
                <span>Deadline</span>
              </div>
              <div className="text-xs text-blue-900">
                {new Date(dispute.votingDeadline).toLocaleString()}
              </div>
            </div>
          )}

          <Button size="sm" variant="outline" onClick={onViewDetails}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DisputeDetails({ dispute }: { dispute: DisputeCase }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Dispute ID</Label>
          <div className="text-sm text-gray-900">{dispute.id}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Status</Label>
          <Badge
            className={
              dispute.status === 'voting'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : dispute.status === 'open'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }
          >
            {dispute.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Related Loan</Label>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-900 mb-1">{dispute.assetName}</div>
          <div className="text-xs text-gray-500">{dispute.loanId}</div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Complainant</Label>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-blue-900">{dispute.complainant}</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
              {dispute.complainantRole}
            </Badge>
          </div>
          <div className="text-xs text-blue-700 font-mono">{dispute.complainantPubkey}</div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Description</Label>
        <p className="text-sm text-gray-900">{dispute.description}</p>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Evidence</Label>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-xs text-purple-900 font-mono break-all mb-2">
            {dispute.evidenceLink}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => window.open(dispute.evidenceLink, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Evidence Link
          </Button>
        </div>
      </div>

      {(dispute.status === 'voting' || dispute.status === 'resolved') && (
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">Voting Results</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Support Complainant</span>
              <span className="text-sm text-green-900">{dispute.appealVotesFor} votes</span>
            </div>
            <Progress
              value={(dispute.appealVotesFor / dispute.totalVoters) * 100}
              className="h-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reject Dispute</span>
              <span className="text-sm text-red-900">{dispute.appealVotesAgainst} votes</span>
            </div>
            <Progress
              value={(dispute.appealVotesAgainst / dispute.totalVoters) * 100}
              className="h-2"
            />
            <div className="p-3 bg-gray-50 rounded-lg mt-2">
              <div className="text-xs text-gray-600">
                Quorum: {dispute.requiredVotes} of {dispute.totalVoters} votes
              </div>
            </div>
          </div>
        </div>
      )}

      {dispute.status === 'resolved' && (
        <>
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Resolution</Label>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <Gavel className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-900">{dispute.resolution}</div>
              </div>
            </div>
          </div>

          {dispute.slashedArbitrators && dispute.slashedArbitrators.length > 0 && (
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Slashed Arbitrators</Label>
              <div className="space-y-2">
                {dispute.slashedArbitrators.map((arbId) => (
                  <div
                    key={arbId}
                    className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200"
                  >
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-900">{arbId}</span>
                    <Badge className="bg-red-100 text-red-800 border-red-200 ml-auto text-xs">
                      Slashed 50%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Created</Label>
          <div className="text-sm text-gray-900">
            {new Date(dispute.createdAt).toLocaleString()}
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Voting Deadline</Label>
          <div className="text-sm text-gray-900">
            {new Date(dispute.votingDeadline).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function RaiseDisputeForm({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Dispute raised successfully', {
        description: 'DAO Appeal Council will review your case',
      });

      onClose();
    } catch (error) {
      toast.error('Failed to raise dispute', {
        description: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="text-xs text-orange-900">
            <p className="mb-2">
              <strong>24-Hour Window:</strong> You can only raise a dispute within 24 hours of
              the arbitrator decision.
            </p>
            <p>
              <strong>Deposit Required:</strong> 100 USDC deposit (refunded if you win, forfeited
              if you lose) to prevent spam.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="loan-id">Loan ID *</Label>
        <Input id="loan-id" placeholder="e.g., LOAN-001" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Explain why the arbitrator decision is incorrect..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="evidence">Evidence Link *</Label>
        <Input
          id="evidence"
          placeholder="IPFS/Arweave URL with photos, videos, or documents"
          required
        />
        <div className="text-xs text-gray-500">
          Upload evidence to IPFS (ipfs.io) or Arweave (arweave.net) and paste the link
        </div>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-900">
          <strong>Voting Process:</strong> The DAO Appeal Council (20 high-reputation members)
          will review your evidence and vote. 11+ votes in your favor will result in:
          <ul className="list-disc ml-4 mt-2">
            <li>Asset returned to you</li>
            <li>Fraudulent arbitrators slashed</li>
            <li>Your deposit refunded</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Raise Dispute (100 USDC)
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
