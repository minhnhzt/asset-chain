import { useState } from 'react';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  ChevronRight,
  ArrowDown,
  Hash,
  FileCheck,
  History,
  AlertCircle,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface MultisigRequest {
  id: string;
  type: 'disposal' | 'transfer' | 'purchase' | 'maintenance';
  assetId: string;
  assetName: string;
  description: string;
  requester: string;
  created: string;
  threshold: number;
  approvals: number;
  voters: {
    name: string;
    voted: boolean;
    approved: boolean | null;
    timestamp: string | null;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  executionPath: 'fast' | 'compliance' | null;
  blockchainProof: string | null;
}

const mockRequests: MultisigRequest[] = [
  {
    id: 'REQ-2025-001',
    type: 'disposal',
    assetId: 'AST-1247',
    assetName: 'MacBook Pro 16" (2019)',
    description: 'Asset has reached end of life and requires disposal according to company policy',
    requester: 'Sarah Johnson',
    created: '2025-10-27T10:30:00',
    threshold: 2,
    approvals: 2,
    voters: [
      { name: 'John Doe', voted: true, approved: true, timestamp: '2025-10-27T10:45:00' },
      { name: 'Emily Davis', voted: true, approved: true, timestamp: '2025-10-27T11:20:00' },
      { name: 'Mike Chen', voted: false, approved: null, timestamp: null },
    ],
    status: 'approved',
    executionPath: 'fast',
    blockchainProof: null,
  },
  {
    id: 'REQ-2025-002',
    type: 'transfer',
    assetId: 'AST-0892',
    assetName: 'Dell Monitor 27"',
    description: 'Transfer asset to new location: Marketing Floor 2',
    requester: 'Mike Chen',
    created: '2025-10-27T14:15:00',
    threshold: 2,
    approvals: 1,
    voters: [
      { name: 'John Doe', voted: true, approved: true, timestamp: '2025-10-27T14:30:00' },
      { name: 'Emily Davis', voted: false, approved: null, timestamp: null },
      { name: 'Mike Chen', voted: false, approved: null, timestamp: null },
    ],
    status: 'pending',
    executionPath: null,
    blockchainProof: null,
  },
  {
    id: 'REQ-2025-003',
    type: 'purchase',
    assetId: 'NEW',
    assetName: 'MacBook Pro 16" M3 (x5)',
    description: 'Purchase 5 new MacBook Pro for Engineering team - Total: $12,495',
    requester: 'David Lee',
    created: '2025-10-26T09:00:00',
    threshold: 3,
    approvals: 3,
    voters: [
      { name: 'John Doe', voted: true, approved: true, timestamp: '2025-10-26T09:30:00' },
      { name: 'Emily Davis', voted: true, approved: true, timestamp: '2025-10-26T10:15:00' },
      { name: 'Mike Chen', voted: true, approved: true, timestamp: '2025-10-26T11:00:00' },
    ],
    status: 'executed',
    executionPath: 'compliance',
    blockchainProof: '7x9k2m...8pq4n',
  },
];

export function GovernancePage() {
  const [requests, setRequests] = useState<MultisigRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<MultisigRequest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const handleVote = async (requestId: string, approve: boolean) => {
    toast.success(approve ? 'Vote approved' : 'Vote rejected', {
      description: `Request ${requestId} has been ${approve ? 'approved' : 'rejected'}`,
    });
  };

  const handleExecute = async (requestId: string, path: 'fast' | 'compliance') => {
    if (path === 'fast') {
      toast.success('Request executed instantly', {
        description: 'Decision executed via Fast Path in <1s',
      });
    } else {
      toast.success('Request executed with blockchain proof', {
        description: 'Approval proof recorded on Solana blockchain',
      });
    }
  };

  const getStatusColor = (status: MultisigRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'executed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getTypeIcon = (type: MultisigRequest['type']) => {
    switch (type) {
      case 'disposal':
        return <FileText className="h-4 w-4" />;
      case 'transfer':
        return <ArrowDown className="h-4 w-4 rotate-45" />;
      case 'purchase':
        return <FileCheck className="h-4 w-4" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Multi-Signature Governance</h1>
          <p className="text-sm text-gray-500">Manage asset decisions with multi-party approval</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Create Request
        </Button>
      </div>

      {/* Workflow Visualization */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-100">
        <h3 className="text-lg text-gray-900 mb-4">Approval Workflow</h3>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-sm text-gray-900 mb-1">1. User Action</div>
            <div className="text-xs text-gray-500">Asset Disposal</div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <ChevronRight className="h-6 w-6 text-gray-300" />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-sm text-gray-900 mb-1">2. Collect Votes</div>
            <div className="text-xs text-gray-500">Layer 1 (Off-Chain)</div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <ChevronRight className="h-6 w-6 text-gray-300" />
          </div>

          {/* Step 3 - Decision Point */}
          <div className="flex flex-col items-center text-center lg:col-span-2">
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Fast Path */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-sm text-gray-900 mb-1">Fast Path</div>
                <div className="text-xs text-gray-500">&lt;1s • $0</div>
              </div>

              {/* Compliance Path */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-sm text-gray-900 mb-1">Compliance</div>
                <div className="text-xs text-gray-500">~5s • On-Chain</div>
              </div>
            </div>
          </div>
        </div>

        {/* Path Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-orange-200">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Zap className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-green-900 mb-1">Fast Path (Default)</div>
              <div className="text-xs text-green-700">
                Immediate execution • Zero cost • Perfect for routine operations
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-purple-900 mb-1">Compliance Path (Optional)</div>
              <div className="text-xs text-purple-700">
                Blockchain proof • SHA256 hash • Immutable audit trail • ~5 seconds
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">1</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">1</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">1</div>
              <div className="text-sm text-gray-600">Executed</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">1</div>
              <div className="text-sm text-gray-600">On-Chain Proofs</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Requests List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({requests.filter((r) => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({requests.filter((r) => r.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {requests
            .filter((r) => r.status === 'pending')
            .map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onVote={handleVote}
                onExecute={handleExecute}
                onViewDetails={() => setSelectedRequest(request)}
              />
            ))}
          {requests.filter((r) => r.status === 'pending').length === 0 && (
            <Card className="p-12 bg-white border-gray-200 text-center">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending requests</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-4">
          {requests
            .filter((r) => r.status === 'approved')
            .map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onVote={handleVote}
                onExecute={handleExecute}
                onViewDetails={() => setSelectedRequest(request)}
              />
            ))}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onVote={handleVote}
              onExecute={handleExecute}
              onViewDetails={() => setSelectedRequest(request)}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>{selectedRequest?.id}</DialogDescription>
          </DialogHeader>
          {selectedRequest && <RequestDetails request={selectedRequest} />}
        </DialogContent>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Multi-Signature Request</DialogTitle>
            <DialogDescription>
              Submit a request that requires approval from multiple parties
            </DialogDescription>
          </DialogHeader>
          <CreateRequestForm onClose={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({
  request,
  onVote,
  onExecute,
  onViewDetails,
}: {
  request: MultisigRequest;
  onVote: (id: string, approve: boolean) => void;
  onExecute: (id: string, path: 'fast' | 'compliance') => void;
  onViewDetails: () => void;
}) {
  const approvalPercentage = (request.approvals / request.threshold) * 100;

  return (
    <Card className="p-5 bg-white border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                {request.type === 'disposal' && <FileText className="h-5 w-5 text-orange-600" />}
                {request.type === 'transfer' && (
                  <ArrowDown className="h-5 w-5 text-blue-600 rotate-45" />
                )}
                {request.type === 'purchase' && <FileCheck className="h-5 w-5 text-green-600" />}
              </div>
              <div>
                <div className="text-sm text-gray-900">{request.assetName}</div>
                <div className="text-xs text-gray-500">
                  {request.id} • {request.assetId}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
          </div>

          <p className="text-sm text-gray-600 mb-4">{request.description}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span>Requested by {request.requester}</span>
            <span>•</span>
            <span>{new Date(request.created).toLocaleString()}</span>
          </div>

          {/* Approval Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                Approvals: {request.approvals} of {request.threshold}
              </span>
              <span className="text-gray-500">{Math.round(approvalPercentage)}%</span>
            </div>
            <Progress value={approvalPercentage} className="h-2" />
            <div className="flex flex-wrap gap-2 mt-3">
              {request.voters.map((voter, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    voter.voted
                      ? voter.approved
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {voter.voted ? (
                    voter.approved ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span>{voter.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex flex-col gap-2 lg:min-w-[200px]">
          {request.status === 'pending' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onVote(request.id, true)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onVote(request.id, false)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}

          {request.status === 'approved' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onExecute(request.id, 'fast')}
              >
                <Zap className="h-4 w-4 mr-1" />
                Execute Fast
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onExecute(request.id, 'compliance')}
              >
                <Shield className="h-4 w-4 mr-1" />
                With Proof
              </Button>
            </>
          )}

          {request.blockchainProof && (
            <div className="p-2 bg-purple-50 rounded border border-purple-200">
              <div className="flex items-center gap-1 text-xs text-purple-700 mb-1">
                <Hash className="h-3 w-3" />
                <span>On-Chain</span>
              </div>
              <div className="text-xs text-purple-600 font-mono truncate">
                {request.blockchainProof}
              </div>
            </div>
          )}

          <Button size="sm" variant="ghost" onClick={onViewDetails}>
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

function RequestDetails({ request }: { request: MultisigRequest }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Request ID</Label>
          <div className="text-sm text-gray-900">{request.id}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Asset ID</Label>
          <div className="text-sm text-gray-900">{request.assetId}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Type</Label>
          <div className="text-sm text-gray-900 capitalize">{request.type}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Status</Label>
          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Description</Label>
        <p className="text-sm text-gray-900">{request.description}</p>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Voting History</Label>
        <div className="space-y-2">
          {request.voters.map((voter, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {voter.voted ? (
                  voter.approved ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-900">{voter.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {voter.timestamp
                  ? new Date(voter.timestamp).toLocaleString()
                  : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {request.executionPath && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            {request.executionPath === 'fast' ? (
              <Zap className="h-5 w-5 text-blue-600" />
            ) : (
              <Shield className="h-5 w-5 text-purple-600" />
            )}
            <span className="text-sm text-blue-900">
              Executed via {request.executionPath === 'fast' ? 'Fast Path' : 'Compliance Path'}
            </span>
          </div>
          {request.blockchainProof && (
            <div className="mt-2">
              <Label className="text-xs text-gray-600">Blockchain Proof</Label>
              <div className="text-xs text-gray-900 font-mono break-all">
                {request.blockchainProof}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'executed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function CreateRequestForm({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Request created successfully', {
      description: 'Your request has been submitted for approval',
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="request-type">Request Type</Label>
        <Select required>
          <SelectTrigger id="request-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disposal">Asset Disposal</SelectItem>
            <SelectItem value="transfer">Asset Transfer</SelectItem>
            <SelectItem value="purchase">Asset Purchase</SelectItem>
            <SelectItem value="maintenance">Maintenance Request</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset-id">Asset ID</Label>
        <Input id="asset-id" placeholder="e.g., AST-1247" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset-name">Asset Name</Label>
        <Input id="asset-name" placeholder='e.g., MacBook Pro 16"' required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Provide details about this request..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="threshold">Approval Threshold</Label>
        <Select defaultValue="2" required>
          <SelectTrigger id="threshold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 of 3 approvals</SelectItem>
            <SelectItem value="2">2 of 3 approvals</SelectItem>
            <SelectItem value="3">3 of 3 approvals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Request'}
        </Button>
      </div>
    </form>
  );
}
