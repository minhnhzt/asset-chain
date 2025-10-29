import { useState } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Award,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner';

interface Arbitrator {
  id: string;
  authority: string;
  pubkey: string;
  stakeAmount: number;
  stakeVault: string;
  isActive: boolean;
  reputationScore: number;
  casesResolved: number;
  casesDisputed: number;
  successRate: number;
  joinDate: string;
  lastActive: string;
}

const mockArbitrators: Arbitrator[] = [
  {
    id: 'ARB-001',
    authority: 'John Validator',
    pubkey: '7xKp...3mN9',
    stakeAmount: 15000,
    stakeVault: 'VAULT...2kR4',
    isActive: true,
    reputationScore: 950,
    casesResolved: 127,
    casesDisputed: 3,
    successRate: 97.6,
    joinDate: '2025-01-15',
    lastActive: '2025-10-27T14:30:00',
  },
  {
    id: 'ARB-002',
    authority: 'Sarah Oracle',
    pubkey: '9kLm...8pQ2',
    stakeAmount: 12000,
    stakeVault: 'VAULT...5mL3',
    isActive: true,
    reputationScore: 880,
    casesResolved: 94,
    casesDisputed: 5,
    successRate: 94.7,
    joinDate: '2025-02-20',
    lastActive: '2025-10-27T15:45:00',
  },
  {
    id: 'ARB-003',
    authority: 'Mike Consensus',
    pubkey: '3kM2...9nL5',
    stakeAmount: 10000,
    stakeVault: 'VAULT...8pQ9',
    isActive: true,
    reputationScore: 920,
    casesResolved: 105,
    casesDisputed: 2,
    successRate: 98.1,
    joinDate: '2025-03-10',
    lastActive: '2025-10-27T13:20:00',
  },
  {
    id: 'ARB-004',
    authority: 'Emily Guardian',
    pubkey: '8pQ4...2mK7',
    stakeAmount: 20000,
    stakeVault: 'VAULT...3nP2',
    isActive: true,
    reputationScore: 990,
    casesResolved: 156,
    casesDisputed: 1,
    successRate: 99.4,
    joinDate: '2025-01-05',
    lastActive: '2025-10-27T16:00:00',
  },
  {
    id: 'ARB-005',
    authority: 'David Arbiter',
    pubkey: '4mN8...7pL2',
    stakeAmount: 8000,
    stakeVault: 'VAULT...9kM4',
    isActive: false,
    reputationScore: 650,
    casesResolved: 45,
    casesDisputed: 8,
    successRate: 84.9,
    joinDate: '2025-05-15',
    lastActive: '2025-10-20T10:00:00',
  },
];

export function ArbitratorsPage() {
  const [arbitrators, setArbitrators] = useState<Arbitrator[]>(mockArbitrators);
  const [selectedArbitrator, setSelectedArbitrator] = useState<Arbitrator | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showSlashDialog, setShowSlashDialog] = useState(false);

  const activeArbitrators = arbitrators.filter((a) => a.isActive);
  const totalStaked = arbitrators.reduce((sum, a) => sum + a.stakeAmount, 0);
  const avgReputation =
    arbitrators.reduce((sum, a) => sum + a.reputationScore, 0) / arbitrators.length;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Arbitrator Network</h1>
          <p className="text-sm text-gray-500">Stake-based dispute resolution validators</p>
        </div>
        <Button
          onClick={() => setShowRegisterDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Lock className="h-4 w-4 mr-2" />
          Register as Arbitrator
        </Button>
      </div>

      {/* Stake & Slash Architecture */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <h3 className="text-lg text-gray-900 mb-4">Stake & Slash Mechanism</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Stake */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Lock className="h-10 w-10 text-blue-600" />
            </div>
            <div className="text-sm text-gray-900 mb-2">1. Stake Collateral</div>
            <div className="text-xs text-gray-600">
              Arbitrators must stake minimum 10,000 USDC as economic security
            </div>
          </div>

          {/* Step 2: Verify */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-sm text-gray-900 mb-2">2. Verify Cases</div>
            <div className="text-xs text-gray-600">
              Participate in M-of-N consensus to verify loan returns and disputes
            </div>
          </div>

          {/* Step 3: Slash */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="text-sm text-gray-900 mb-2">3. Slash Fraudsters</div>
            <div className="text-xs text-gray-600">
              If found fraudulent, stake is slashed and transferred to DAO treasury
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-purple-200">
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-purple-900 mb-1">Economic Security</div>
              <div className="text-xs text-purple-700">
                Arbitrators lose stake if they collude or provide false verification
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Award className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-blue-900 mb-1">Reputation System</div>
              <div className="text-xs text-blue-700">
                Higher reputation from accurate verifications earns more cases and fees
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">{activeArbitrators.length}</div>
              <div className="text-sm text-gray-600">Active Arbitrators</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">${(totalStaked / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">Total Staked</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">{Math.round(avgReputation)}</div>
              <div className="text-sm text-gray-600">Avg Reputation</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">
                {arbitrators.reduce((sum, a) => sum + a.casesResolved, 0)}
              </div>
              <div className="text-sm text-gray-600">Cases Resolved</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Arbitrators Table */}
      <Card className="p-6 bg-white border-gray-200">
        <h3 className="text-lg text-gray-900 mb-4">Registered Arbitrators</h3>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arbitrator</TableHead>
                <TableHead>Stake Amount</TableHead>
                <TableHead>Reputation</TableHead>
                <TableHead>Cases</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arbitrators.map((arbitrator) => (
                <TableRow key={arbitrator.id}>
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">{arbitrator.authority}</div>
                      <div className="text-xs text-gray-500 font-mono">{arbitrator.pubkey}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900">
                        ${arbitrator.stakeAmount.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{arbitrator.reputationScore}</span>
                        <Award
                          className={`h-4 w-4 ${
                            arbitrator.reputationScore > 900
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <Progress
                        value={(arbitrator.reputationScore / 1000) * 100}
                        className="h-1"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div className="text-gray-900">
                        <CheckCircle className="h-3 w-3 inline mr-1 text-green-600" />
                        {arbitrator.casesResolved} resolved
                      </div>
                      <div className="text-red-600">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        {arbitrator.casesDisputed} disputed
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        arbitrator.successRate > 95
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : arbitrator.successRate > 90
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }
                    >
                      {arbitrator.successRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {arbitrator.isActive ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedArbitrator(arbitrator)}
                      >
                        View
                      </Button>
                      {arbitrator.successRate < 85 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedArbitrator(arbitrator);
                            setShowSlashDialog(true);
                          }}
                        >
                          Slash
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Arbitrator Details Dialog */}
      <Dialog open={!!selectedArbitrator && !showSlashDialog} onOpenChange={() => setSelectedArbitrator(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Arbitrator Details</DialogTitle>
            <DialogDescription>{selectedArbitrator?.id}</DialogDescription>
          </DialogHeader>
          {selectedArbitrator && <ArbitratorDetails arbitrator={selectedArbitrator} />}
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Register as Arbitrator</DialogTitle>
            <DialogDescription>
              Stake USDC collateral to become a trusted dispute resolver
            </DialogDescription>
          </DialogHeader>
          <RegisterArbitratorForm onClose={() => setShowRegisterDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Slash Dialog */}
      <Dialog open={showSlashDialog} onOpenChange={setShowSlashDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Slash Arbitrator Stake</DialogTitle>
            <DialogDescription>
              Penalize fraudulent behavior by slashing staked collateral
            </DialogDescription>
          </DialogHeader>
          {selectedArbitrator && (
            <SlashArbitratorForm
              arbitrator={selectedArbitrator}
              onClose={() => {
                setShowSlashDialog(false);
                setSelectedArbitrator(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArbitratorDetails({ arbitrator }: { arbitrator: Arbitrator }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Arbitrator ID</Label>
          <div className="text-sm text-gray-900">{arbitrator.id}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Status</Label>
          <Badge
            className={
              arbitrator.isActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }
          >
            {arbitrator.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Public Key</Label>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-900 font-mono break-all">{arbitrator.pubkey}</div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Stake Vault (PDA)</Label>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-900">Locked Collateral</span>
          </div>
          <div className="text-sm text-purple-700 font-mono break-all mb-2">
            {arbitrator.stakeVault}
          </div>
          <div className="text-xl text-purple-900">
            ${arbitrator.stakeAmount.toLocaleString()} USDC
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Reputation Score</Label>
          <div className="flex items-center gap-2">
            <Progress value={(arbitrator.reputationScore / 1000) * 100} className="flex-1" />
            <span className="text-sm text-gray-900">{arbitrator.reputationScore}/1000</span>
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Success Rate</Label>
          <div className="text-2xl text-gray-900">{arbitrator.successRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-xs text-gray-500">Cases Resolved</Label>
          <div className="text-xl text-green-900">{arbitrator.casesResolved}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Disputed</Label>
          <div className="text-xl text-red-900">{arbitrator.casesDisputed}</div>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Join Date</Label>
          <div className="text-sm text-gray-900">
            {new Date(arbitrator.joinDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Last Active</Label>
        <div className="text-sm text-gray-900">
          {new Date(arbitrator.lastActive).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function RegisterArbitratorForm({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('10000');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(stakeAmount);
    if (amount < 10000) {
      toast.error('Minimum stake required', {
        description: 'You must stake at least 10,000 USDC',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      toast.success('Arbitrator registration successful', {
        description: `Staked $${amount.toLocaleString()} USDC in vault`,
      });

      onClose();
    } catch (error) {
      toast.error('Registration failed', {
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
              <strong>Economic Security:</strong> Your stake acts as collateral. If you provide
              false verification or collude with malicious actors, your stake will be slashed.
            </p>
            <p>
              Maintain high reputation by accurate verifications to earn fees and participate in
              high-value cases.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stake-amount">Stake Amount (USDC) *</Label>
        <Input
          id="stake-amount"
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          min="10000"
          step="1000"
          required
        />
        <div className="text-xs text-gray-500">Minimum: 10,000 USDC</div>
      </div>

      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-900">
          <strong>Note:</strong> Your stake will be locked in a PDA vault. You can withdraw after
          deactivating your arbitrator status (requires 7-day cooling period).
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
              Registering...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Stake & Register
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function SlashArbitratorForm({
  arbitrator,
  onClose,
}: {
  arbitrator: Arbitrator;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slashAmount, setSlashAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(slashAmount);
    if (amount > arbitrator.stakeAmount) {
      toast.error('Invalid amount', {
        description: 'Cannot slash more than staked amount',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Arbitrator slashed', {
        description: `$${amount.toLocaleString()} USDC transferred to DAO treasury`,
      });

      onClose();
    } catch (error) {
      toast.error('Slash failed', {
        description: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="text-xs text-red-900">
            <p className="mb-2">
              <strong>Warning:</strong> Slashing is a severe penalty for fraudulent behavior.
              Ensure you have evidence from dispute resolution before proceeding.
            </p>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">Arbitrator</Label>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-900 mb-1">{arbitrator.authority}</div>
          <div className="text-xs text-gray-500">
            Current Stake: ${arbitrator.stakeAmount.toLocaleString()} USDC
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slash-amount">Slash Amount (USDC) *</Label>
        <Input
          id="slash-amount"
          type="number"
          value={slashAmount}
          onChange={(e) => setSlashAmount(e.target.value)}
          max={arbitrator.stakeAmount}
          step="100"
          placeholder={`Max: ${arbitrator.stakeAmount}`}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Slashing...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Slash Stake
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
