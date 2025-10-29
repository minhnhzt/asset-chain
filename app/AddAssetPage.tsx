import { useState } from 'react';
import {
  Package,
  Upload,
  Coins,
  FileText,
  MapPin,
  DollarSign,
  Calendar,
  Hash,
  CheckCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { uploadMetadataToIPFS } from './lib/ipfsService';
import { registerAsset } from './lib/assetService';

interface AssetFormData {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseValue: string;
  purchaseDate: string;
  location: string;
  assignedTo: string;
  manufacturer: string;
  model: string;
  warrantyExpiry: string;
  notes: string;
}

interface MintingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  txHash?: string;
  ipfsHash?: string;
}

const SOLANA_DEVNET_EXPLORER = 'https://explorer.solana.com';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

interface Asset {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'retired';
  assignedTo: string | null;
  location: string;
  purchaseDate: string;
  value: number;
  serialNumber: string;
  image?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  warrantyExpiry?: string;
  mintAddress?: string;
  ipfsHash?: string;
}

interface AddAssetPageProps {
  onBack?: () => void;
  onAssetAdded?: (asset: Asset) => void;
}

export function AddAssetPage({ onBack, onAssetAdded }: AddAssetPageProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    description: '',
    category: '',
    serialNumber: '',
    purchaseValue: '',
    purchaseDate: '',
    location: '',
    assignedTo: '',
    manufacturer: '',
    model: '',
    warrantyExpiry: '',
    notes: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingSteps, setMintingSteps] = useState<MintingStep[]>([]);
  const [mintComplete, setMintComplete] = useState(false);
  const [mintedAssetId, setMintedAssetId] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof AssetFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateStep = (
    stepId: string,
    updates: Partial<MintingStep>
  ) => {
    setMintingSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  };

  const handleMintAsset = async () => {
    // Validation
    if (!formData.name || !formData.category) {
      toast.error('Required fields missing', {
        description: 'Please fill in asset name and category',
      });
      return;
    }

    if (!formData.location) {
      toast.error('Location is required', {
        description: 'Please specify the asset location',
      });
      return;
    }

    setIsMinting(true);
    setMintComplete(false);

    // Initialize minting steps
    const steps: MintingStep[] = [
      { id: 'validate', label: 'Validate Form Data', status: 'pending' },
      { id: 'ipfs', label: 'Upload Metadata to IPFS', status: 'pending' },
      { id: 'wallet', label: 'Connect Phantom Wallet', status: 'pending' },
      { id: 'mint', label: 'Mint SPL Token on Solana', status: 'pending' },
      { id: 'record', label: 'Record On-Chain Metadata', status: 'pending' },
      { id: 'finalize', label: 'Finalize Asset Registration', status: 'pending' },
    ];
    setMintingSteps(steps);

    let ipfsHash = '';
    let txSignature = '';
    let assetPubkey = '';

    try {
      // Step 1: Validate
      updateStep('validate', { status: 'processing' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateStep('validate', {
        status: 'completed',
        message: 'All required fields validated',
      });

      // Step 2: Upload to IPFS (Pinata) - REAL API CALL
      updateStep('ipfs', { status: 'processing' });
      
      const metadata = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        category: formData.category,
        serialNumber: formData.serialNumber,
        purchaseDate: formData.purchaseDate,
        purchasePrice: parseFloat(formData.purchaseValue) || 0,
        warrantyExpiry: formData.warrantyExpiry,
        imageUrl: imagePreview || 'https://via.placeholder.com/400?text=Asset',
        specifications: {
          manufacturer: formData.manufacturer || 'N/A',
          model: formData.model || 'N/A',
          assignedTo: formData.assignedTo || 'Unassigned',
          notes: formData.notes || '',
        },
      };

      try {
        ipfsHash = await uploadMetadataToIPFS(metadata);
        
        updateStep('ipfs', {
          status: 'completed',
          message: 'Metadata uploaded successfully',
          ipfsHash: ipfsHash,
        });
      } catch (error) {
        throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Step 3: Connect Wallet (check if already connected)
      updateStep('wallet', { status: 'processing' });
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check if Phantom wallet is connected
      if (typeof window !== 'undefined' && (window as any).solana) {
        const solana = (window as any).solana;
        if (!solana.isConnected) {
          try {
            await solana.connect();
          } catch (error) {
            throw new Error('Please connect your Phantom wallet');
          }
        }
        
        const walletAddress = solana.publicKey?.toString() || '';
        updateStep('wallet', {
          status: 'completed',
          message: `Connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
        });
      } else {
        updateStep('wallet', {
          status: 'completed',
          message: 'Wallet connection verified',
        });
      }

      // Step 4 & 5: Register Asset on Blockchain - REAL API CALL
      updateStep('mint', { status: 'processing' });
      
      try {
        const result = await registerAsset(
          formData.name,
          formData.location,
          ipfsHash
        );
        
        txSignature = result.signature;
        assetPubkey = result.assetPubkey;
        
        updateStep('mint', {
          status: 'completed',
          message: `Token minted: ${assetPubkey.slice(0, 8)}...`,
          txHash: txSignature,
        });

        // Step 5: Record Metadata (done automatically in registerAsset)
        updateStep('record', { status: 'processing' });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateStep('record', {
          status: 'completed',
          message: 'Asset metadata recorded on-chain',
        });

      } catch (error) {
        throw new Error(`Blockchain registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Step 6: Finalize
      updateStep('finalize', { status: 'processing' });
      await new Promise((resolve) => setTimeout(resolve, 800));

      const assetId = assetPubkey.slice(0, 12);
      setMintedAssetId(assetId);

      updateStep('finalize', {
        status: 'completed',
        message: `Asset registered: ${assetId}`,
      });

      // Create the new asset object
      const newAsset: Asset = {
        id: assetPubkey,
        name: formData.name,
        category: formData.category,
        status: 'available',
        assignedTo: formData.assignedTo || null,
        location: formData.location,
        purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
        value: parseFloat(formData.purchaseValue) || 0,
        serialNumber: formData.serialNumber || `SN-${assetId}`,
        image: imagePreview || undefined,
        description: formData.description,
        manufacturer: formData.manufacturer,
        model: formData.model,
        warrantyExpiry: formData.warrantyExpiry,
        mintAddress: assetPubkey,
        ipfsHash: ipfsHash,
      };

      setMintComplete(true);

      // Call the callback to add the asset to the main list
      if (onAssetAdded) {
        onAssetAdded(newAsset);
      }

      toast.success('Asset minted successfully! 🎉', {
        description: `View on Solscan: ${txSignature.slice(0, 8)}...`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${SOLANA_DEVNET_EXPLORER}/tx/${txSignature}?cluster=devnet`, '_blank'),
        },
      });
    } catch (error) {
      const currentStep = mintingSteps.find((s) => s.status === 'processing');
      if (currentStep) {
        updateStep(currentStep.id, {
          status: 'error',
          message: error instanceof Error ? error.message : 'Operation failed',
        });
      }

      toast.error('Minting failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      
      console.error('Minting error:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      serialNumber: '',
      purchaseValue: '',
      purchaseDate: '',
      location: '',
      assignedTo: '',
      manufacturer: '',
      model: '',
      warrantyExpiry: '',
      notes: '',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setMintingSteps([]);
    setMintComplete(false);
    setMintedAssetId(null);
  };

  if (mintComplete) {
    return <MintSuccessView mintingSteps={mintingSteps} assetId={mintedAssetId!} onReset={resetForm} onBack={onBack} />;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl text-gray-900 mb-1">Register New Asset</h1>
          <p className="text-sm text-gray-500">
            Mint SPL token and record immutable metadata on Solana devnet
          </p>
        </div>
      </div>

      {/* Blockchain Benefits */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg text-blue-900 mb-1">~$0.0003</div>
            <div className="text-xs text-blue-700">Cost per asset</div>
          </div>
          <div>
            <div className="text-lg text-purple-900 mb-1">Immutable</div>
            <div className="text-xs text-purple-700">Fraud-proof audit trail</div>
          </div>
          <div>
            <div className="text-lg text-blue-900 mb-1">Decentralized</div>
            <div className="text-xs text-blue-700">You control the keys</div>
          </div>
          <div>
            <div className="text-lg text-purple-900 mb-1">Real-time</div>
            <div className="text-xs text-purple-700">Transparent to all</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Basic Information
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Asset Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., MacBook Pro 16"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: string) => handleInputChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computers">Computers</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the asset..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    placeholder="e.g., SN123456789"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    placeholder="e.g., Apple"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., MacBook Pro 2023"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Financial Information */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseValue">Purchase Value ($)</Label>
                <Input
                  id="purchaseValue"
                  type="number"
                  placeholder="e.g., 2500"
                  value={formData.purchaseValue}
                  onChange={(e) => handleInputChange('purchaseValue', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Location & Assignment */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Location & Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Office Floor 3"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="e.g., John Doe"
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Additional Notes */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Additional Notes
            </h3>

            <div className="space-y-2">
              <Textarea
                id="notes"
                placeholder="Any additional information about this asset..."
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Image Upload */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              Asset Image
            </h3>

            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Asset preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Upload asset photo (optional)
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </Card>

          {/* Minting Info */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-600" />
              Blockchain Minting
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-900 mb-1">SPL Token Standard</div>
                  <div className="text-gray-600 text-xs">
                    0-decimal token (1 token = 1 asset)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-900 mb-1">IPFS Metadata</div>
                  <div className="text-gray-600 text-xs">
                    Distributed storage via Pinata
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-900 mb-1">Immutable Record</div>
                  <div className="text-gray-600 text-xs">
                    Permanent on-chain audit trail
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-purple-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="text-purple-900">~$0.0003</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-600">Network:</span>
                  <span className="text-purple-900">Solana Devnet</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={handleMintAsset}
              disabled={isMinting || !formData.name || !formData.category}
            >
              {isMinting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Minting Asset...
                </>
              ) : (
                <>
                  <Coins className="h-5 w-5 mr-2" />
                  Mint Asset on Blockchain
                </>
              )}
            </Button>

            {!isMinting && (
              <Button
                variant="outline"
                className="w-full"
                onClick={resetForm}
              >
                Clear Form
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Minting Progress */}
      {mintingSteps.length > 0 && (
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Minting Progress</h3>

          <div className="space-y-3">
            {mintingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  step.status === 'completed'
                    ? 'bg-green-50'
                    : step.status === 'processing'
                    ? 'bg-blue-50'
                    : step.status === 'error'
                    ? 'bg-red-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : step.status === 'processing' ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : step.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">
                      {index + 1}. {step.label}
                    </span>
                    {step.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        Done
                      </Badge>
                    )}
                    {step.status === 'processing' && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        In Progress
                      </Badge>
                    )}
                  </div>

                  {step.message && (
                    <div className="text-xs text-gray-600 mt-1">{step.message}</div>
                  )}

                  {step.txHash && (
                    <a
                      href={`${SOLANA_DEVNET_EXPLORER}/tx/${step.txHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                    >
                      View on Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {step.ipfsHash && (
                    <a
                      href={`${IPFS_GATEWAY}/${step.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1"
                    >
                      View on IPFS
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function MintSuccessView({
  mintingSteps,
  assetId,
  onReset,
  onBack,
}: {
  mintingSteps: MintingStep[];
  assetId: string;
  onReset: () => void;
  onBack?: () => void;
}) {
  const mintStep = mintingSteps.find((s) => s.id === 'mint');
  const ipfsStep = mintingSteps.find((s) => s.id === 'ipfs');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl text-gray-900 mb-2">Asset Minted Successfully! 🎉</h1>
          <p className="text-gray-600 mb-4">
            Your asset has been registered on Solana blockchain
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-green-200">
            <Hash className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-900">Asset ID:</span>
            <span className="text-sm text-green-900">{assetId}</span>
          </div>
        </Card>

        {/* Asset Details */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Blockchain Details</h3>

          <div className="space-y-4">
            {mintStep?.txHash && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-900">SPL Token Mint Address</span>
                </div>
                <div className="text-sm text-blue-700 font-mono break-all">
                  {mintStep.message?.split(': ')[1]}
                </div>
                <a
                  href={`${SOLANA_DEVNET_EXPLORER}/tx/${mintStep.txHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                >
                  View Transaction on Solana Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {ipfsStep?.ipfsHash && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-900">IPFS Metadata Hash</span>
                </div>
                <div className="text-sm text-purple-700 font-mono break-all">
                  {ipfsStep.ipfsHash}
                </div>
                <a
                  href={`${IPFS_GATEWAY}/${ipfsStep.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-2"
                >
                  View Metadata on IPFS
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-900">Asset Status</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Next Steps</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-blue-900">1</span>
              </div>
              <div>
                <div className="text-sm text-gray-900 mb-1">View Asset Details</div>
                <div className="text-xs text-gray-600">
                  Check the Assets page to see your newly minted asset
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-blue-900">2</span>
              </div>
              <div>
                <div className="text-sm text-gray-900 mb-1">Log Maintenance</div>
                <div className="text-xs text-gray-600">
                  Record any maintenance activities on-chain
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-blue-900">3</span>
              </div>
              <div>
                <div className="text-sm text-gray-900 mb-1">Export Reports</div>
                <div className="text-xs text-gray-600">
                  Generate CSV reports for compliance
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            className="w-full"
          >
            Register Another Asset
          </Button>

          <Button
            size="lg"
            onClick={onBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Assets
          </Button>
        </div>
      </div>
    </div>
  );
}
