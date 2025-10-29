import { useState } from 'react';
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  User,
  Users,
  Calendar,
  Hash,
  Lock,
  Unlock,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

// Solana Program Configuration
const PROGRAM_ID = 'AssetLend11111111111111111111111111111111111';
const API_BASE_URL = 'https://api.solarwinds.example.com/v1';

interface LoanEscrow {
  id: string;
  owner: string;
  ownerPubkey: string;
  borrower: string;
  borrowerPubkey: string;
  assetName: string;
  assetMint: string;
  escrowPDA: string;
  loanStartTime: string;
  loanEndTime: string;
  loanDurationDays: number;
  status: 'active' | 'return_pending' | 'returned' | 'reclaimed' | 'revoked';
  transactionHash: string | null;
  // M-of-N Verification
  arbitratorSet: string[];
  requiredApprovals: number;
  currentApprovals: string[];
}

const mockLoans: LoanEscrow[] = [
  {
    id: 'LOAN-001',
    owner: 'Sarah Johnson',
    ownerPubkey: '7xKp...3mN9',
    borrower: 'Mike Chen',
    borrowerPubkey: '9kLm...8pQ2',
    assetName: 'MacBook Pro 16" - NFT #1247',
    assetMint: '5Hy8...2kR4',
    escrowPDA: 'ESCw...7nP3',
    loanStartTime: '2025-10-20T10:00:00',
    loanEndTime: '2025-11-20T10:00:00',
    loanDurationDays: 31,
    status: 'active',
    transactionHash: '4mKn...9pL2',
  },
  {
    id: 'LOAN-002',
    owner: 'David Lee',
    ownerPubkey: '3kM2...9nL5',
    borrower: 'Emily Davis',
    borrowerPubkey: '8pQ4...2mK7',
    assetName: 'iPad Pro 12.9" - NFT #0892',
    assetMint: '2Lp9...5kM3',
    escrowPDA: 'ESCw...2mQ8',
    loanStartTime: '2025-10-25T14:00:00',
    loanEndTime: '2025-10-30T14:00:00',
    loanDurationDays: 5,
    status: 'active',
    transactionHash: '7nL3...4kP9',
  },
  {
    id: 'LOAN-003',
    owner: 'Sarah Johnson',
    ownerPubkey: '7xKp...3mN9',
    borrower: 'John Doe',
    borrowerPubkey: '4mN8...7pL2',
    assetName: 'Dell Monitor 27" - NFT #0567',
    assetMint: '9Kp2...3mL8',
    escrowPDA: 'ESCw...9nK4',
    loanStartTime: '2025-10-15T09:00:00',
    loanEndTime: '2025-10-25T09:00:00',
    loanDurationDays: 10,
    status: 'returned',
    transactionHash: '2mL8...5kN3',
  },
];

export function LendingPage() {
  const [loans, setLoans] = useState<LoanEscrow[]>(mockLoans);
  const [selectedLoan, setSelectedLoan] = useState<LoanEscrow | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">NFT Asset Lending</h1>
          <p className="text-sm text-gray-500">Trustless lending using Solana PDA Escrow</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Lock className="h-4 w-4 mr-2" />
          Create Loan
        </Button>
      </div>

      {/* Architecture Diagram */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <h3 className="text-lg text-gray-900 mb-4">PDA Escrow Architecture</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
          {/* Step 1: Owner */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="text-sm text-gray-900 mb-1">Owner</div>
            <div className="text-xs text-gray-500">Has NFT Asset</div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-300" />
          </div>

          {/* Step 2: PDA Escrow */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-3 border-4 border-purple-300">
              <Shield className="h-10 w-10 text-purple-600" />
            </div>
            <div className="text-sm text-gray-900 mb-1">PDA Escrow</div>
            <div className="text-xs text-gray-500">Program Control</div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-300" />
          </div>

          {/* Step 3: Borrower */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <User className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-sm text-gray-900 mb-1">Borrower</div>
            <div className="text-xs text-gray-500">Authorized User</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-purple-200">
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-purple-900 mb-1">Trustless</div>
              <div className="text-xs text-purple-700">
                NFT locked in program-controlled PDA, not transferred to borrower
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-blue-900 mb-1">Time-Locked</div>
              <div className="text-xs text-blue-700">
                Owner can reclaim only after loan_end_time expires
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-green-900 mb-1">Verifiable</div>
              <div className="text-xs text-green-700">
                All actions recorded on Solana blockchain immutably
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">
                {loans.filter((l) => l.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Loans</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">
                {loans.filter((l) => l.status === 'returned').length}
              </div>
              <div className="text-sm text-gray-600">Returned</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">
                {loans.filter((l) => {
                  const now = new Date();
                  const endTime = new Date(l.loanEndTime);
                  return l.status === 'active' && now > endTime;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">{loans.length}</div>
              <div className="text-sm text-gray-600">Total Escrows</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Loans List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Active ({loans.filter((l) => l.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            Returned ({loans.filter((l) => l.status === 'returned').length})
          </TabsTrigger>
          <TabsTrigger value="all">All Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {loans
            .filter((l) => l.status === 'active')
            .map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onViewDetails={() => setSelectedLoan(loan)}
              />
            ))}
        </TabsContent>

        <TabsContent value="returned" className="mt-4 space-y-4">
          {loans
            .filter((l) => l.status === 'returned')
            .map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onViewDetails={() => setSelectedLoan(loan)}
              />
            ))}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onViewDetails={() => setSelectedLoan(loan)} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Loan Details Dialog */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>{selectedLoan?.id}</DialogDescription>
          </DialogHeader>
          {selectedLoan && <LoanDetails loan={selectedLoan} />}
        </DialogContent>
      </Dialog>

      {/* Create Loan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create NFT Loan (Lend Asset)</DialogTitle>
            <DialogDescription>
              Lock your NFT asset in a PDA escrow for trustless lending
            </DialogDescription>
          </DialogHeader>
          <CreateLoanForm onClose={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoanCard({
  loan,
  onViewDetails,
}: {
  loan: LoanEscrow;
  onViewDetails: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const now = new Date();
  const endTime = new Date(loan.loanEndTime);
  const isExpired = now > endTime;
  const daysRemaining = Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const handleReturn = async () => {
    setIsProcessing(true);
    try {
      // Simulate Solana transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success('Asset returned successfully', {
        description: 'NFT transferred from PDA escrow back to owner',
      });
    } catch (error) {
      toast.error('Failed to return asset', {
        description: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReclaim = async () => {
    if (!isExpired) {
      toast.error('Cannot reclaim yet', {
        description: 'Loan period has not expired',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate Solana transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success('Asset reclaimed successfully', {
        description: 'NFT recovered from PDA escrow',
      });
    } catch (error) {
      toast.error('Failed to reclaim asset', {
        description: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async () => {
    setIsProcessing(true);
    try {
      // Simulate Solana transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success('Loan revoked successfully', {
        description: 'NFT returned to owner, loan cancelled',
      });
    } catch (error) {
      toast.error('Failed to revoke loan', {
        description: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (loan.status === 'returned') {
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Returned</Badge>;
    }
    if (loan.status === 'reclaimed') {
      return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Reclaimed</Badge>;
    }
    if (loan.status === 'revoked') {
      return <Badge className="bg-red-50 text-red-700 border-red-200">Revoked</Badge>;
    }
    if (isExpired) {
      return <Badge className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
    }
    return <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
  };

  return (
    <Card className="p-5 bg-white border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-900">{loan.assetName}</div>
                <div className="text-xs text-gray-500">{loan.id}</div>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3 w-3 text-blue-600" />
              <span className="text-gray-600">Owner:</span>
              <span className="text-gray-900">{loan.owner}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3 w-3 text-green-600" />
              <span className="text-gray-600">Borrower:</span>
              <span className="text-gray-900">{loan.borrower}</span>
            </div>
          </div>

          {/* Escrow Info */}
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-900">PDA Escrow Account</span>
            </div>
            <div className="text-xs text-purple-700 font-mono break-all">{loan.escrowPDA}</div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Start: {new Date(loan.loanStartTime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>End: {new Date(loan.loanEndTime).toLocaleDateString()}</span>
            </div>
          </div>

          {loan.status === 'active' && (
            <div className="mt-3">
              {isExpired ? (
                <div className="text-xs text-red-600">⚠️ Loan expired - Owner can reclaim</div>
              ) : (
                <div className="text-xs text-gray-600">
                  ⏱️ {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex flex-col gap-2 lg:min-w-[200px]">
          {loan.status === 'active' && (
            <>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleReturn}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-1" />
                    Return Asset
                  </>
                )}
              </Button>

              {isExpired && (
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={handleReclaim}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      Reclaim Asset
                    </>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleRevoke}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Revoke Loan
              </Button>
            </>
          )}

          {loan.transactionHash && (
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-1 text-xs text-gray-700 mb-1">
                <Hash className="h-3 w-3" />
                <span>Transaction</span>
              </div>
              <div className="text-xs text-gray-600 font-mono truncate">
                {loan.transactionHash}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-1 text-xs"
                onClick={() =>
                  window.open(
                    `https://explorer.solana.com/tx/${loan.transactionHash}`,
                    '_blank'
                  )
                }
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Explorer
              </Button>
            </div>
          )}

          <Button size="sm" variant="ghost" onClick={onViewDetails}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

function LoanDetails({ loan }: { loan: LoanEscrow }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Loan ID</Label>
          <div className="text-sm text-gray-900">{loan.id}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Status</Label>
          <Badge
            className={
              loan.status === 'active'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }
          >
            {loan.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">NFT Asset</Label>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-900 mb-1">{loan.assetName}</div>
          <div className="text-xs text-gray-500">Mint: {loan.assetMint}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">Owner</Label>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-900 mb-1">{loan.owner}</div>
            <div className="text-xs text-blue-700 font-mono break-all">{loan.ownerPubkey}</div>
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">Borrower</Label>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-900 mb-1">{loan.borrower}</div>
            <div className="text-xs text-green-700 font-mono break-all">
              {loan.borrowerPubkey}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">PDA Escrow Account</Label>
        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-900">Program Derived Address</span>
          </div>
          <div className="text-xs text-purple-700 font-mono break-all mb-2">
            {loan.escrowPDA}
          </div>
          <div className="text-xs text-purple-600">
            ✓ Asset locked in program-controlled account
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Loan Start</Label>
          <div className="text-sm text-gray-900">
            {new Date(loan.loanStartTime).toLocaleString()}
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Loan End</Label>
          <div className="text-sm text-gray-900">
            {new Date(loan.loanEndTime).toLocaleString()}
          </div>
        </div>
      </div>

      {loan.transactionHash && (
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">Transaction Hash</Label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-900 font-mono break-all mb-2">
              {loan.transactionHash}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() =>
                window.open(`https://explorer.solana.com/tx/${loan.transactionHash}`, '_blank')
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Solana Explorer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateLoanForm({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate Solana program interaction
      await new Promise((resolve) => setTimeout(resolve, 2500));

      toast.success('Loan created successfully', {
        description: 'NFT locked in PDA escrow, loan is now active',
      });

      onClose();
    } catch (error) {
      toast.error('Failed to create loan', {
        description: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="text-xs text-purple-900">
            <p className="mb-2">
              <strong>Trustless Escrow:</strong> Your NFT will be transferred to a Program Derived
              Address (PDA) controlled by the smart contract, not to the borrower directly.
            </p>
            <p>
              This ensures the asset can only be recovered by you after the loan period expires or
              when the borrower returns it.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset-mint">NFT Asset Mint Address *</Label>
        <Input
          id="asset-mint"
          placeholder="e.g., 5Hy8K2mN9pL3kR4..."
          required
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset-name">Asset Name</Label>
        <Input id="asset-name" placeholder='e.g., MacBook Pro 16" - NFT #1247' required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="borrower-pubkey">Borrower Public Key *</Label>
        <Input
          id="borrower-pubkey"
          placeholder="e.g., 9kLm8pQ2..."
          required
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="loan-duration">Loan Duration (Days) *</Label>
        <Input id="loan-duration" type="number" placeholder="e.g., 30" required min="1" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" placeholder="Add any additional information..." rows={3} />
      </div>

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-900">
          <strong>Program ID:</strong>{' '}
          <span className="font-mono text-blue-700">{PROGRAM_ID}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Escrow...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Create Loan & Lock NFT
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
