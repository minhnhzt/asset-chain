import { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Wrench,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Hash,
  FileText,
  ExternalLink,
  Coins,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  XCircle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface MaintenanceLog {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection' | 'upgrade';
  description: string;
  performedBy: string;
  cost?: number;
  notes?: string;
}

interface AssetDetailModalProps {
  asset: Asset;
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedAsset: Asset) => void;
  onDelete?: (assetId: string) => void;
}

const SOLANA_DEVNET_EXPLORER = 'https://explorer.solana.com';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export function AssetDetailModal({
  asset,
  open,
  onClose,
  onUpdate,
  onDelete,
}: AssetDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<Asset>(asset);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([
    {
      id: 'log-1',
      date: '2024-09-15',
      type: 'routine',
      description: 'Routine maintenance check',
      performedBy: 'John Tech',
      cost: 50,
      notes: 'All systems functioning normally',
    },
  ]);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState<Partial<MaintenanceLog>>({
    type: 'routine',
    date: new Date().toISOString().split('T')[0],
    performedBy: 'Current User',
  });

  const handleEdit = () => {
    setEditedAsset(asset);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editedAsset);
    setIsEditing(false);
    toast.success('Asset updated successfully', {
      description: `${editedAsset.name} has been updated`,
    });
  };

  const handleCancel = () => {
    setEditedAsset(asset);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${asset.name}?`)) {
      onDelete?.(asset.id);
      onClose();
      toast.success('Asset deleted', {
        description: `${asset.name} has been removed`,
      });
    }
  };

  const handleAddLog = () => {
    if (!newLog.description) {
      toast.error('Description required', {
        description: 'Please provide a maintenance description',
      });
      return;
    }

    const log: MaintenanceLog = {
      id: `log-${Date.now()}`,
      date: newLog.date || new Date().toISOString().split('T')[0],
      type: newLog.type as MaintenanceLog['type'],
      description: newLog.description,
      performedBy: newLog.performedBy || 'Unknown',
      cost: newLog.cost,
      notes: newLog.notes,
    };

    setMaintenanceLogs((prev) => [log, ...prev]);
    setIsAddingLog(false);
    setNewLog({
      type: 'routine',
      date: new Date().toISOString().split('T')[0],
      performedBy: 'Current User',
    });

    toast.success('Maintenance log added', {
      description: 'Log has been recorded',
    });
  };

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case 'checked-out':
        return (
          <Badge className="bg-orange-50 text-orange-700 border-orange-200">
            <Package className="h-3 w-3 mr-1" />
            Checked Out
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
      case 'retired':
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Retired
          </Badge>
        );
    }
  };

  const getLogTypeBadge = (type: MaintenanceLog['type']) => {
    switch (type) {
      case 'routine':
        return <Badge variant="outline">Routine</Badge>;
      case 'repair':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Repair</Badge>;
      case 'inspection':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Inspection</Badge>;
      case 'upgrade':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Upgrade</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {isEditing ? (
                  <Input
                    value={editedAsset.name}
                    onChange={(e) =>
                      setEditedAsset({ ...editedAsset, name: e.target.value })
                    }
                    className="text-2xl"
                  />
                ) : (
                  asset.name
                )}
              </DialogTitle>
              <DialogDescription className="sr-only">
                View and manage asset details, including information, blockchain data, and maintenance logs
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                {isEditing ? (
                  <Select
                    value={editedAsset.status}
                    onValueChange={(value: Asset['status']) =>
                      setEditedAsset({ ...editedAsset, status: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="checked-out">Checked Out</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getStatusBadge(asset.status)
                )}
                <Badge variant="outline" className="text-xs">
                  {asset.id}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="maintenance">
              Maintenance
              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                {maintenanceLogs.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {/* Image */}
            {asset.image && (
              <Card className="p-4">
                <ImageWithFallback
                  src={asset.image}
                  alt={asset.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </Card>
            )}

            {/* Basic Information */}
            <Card className="p-4">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Category</Label>
                  {isEditing ? (
                    <Select
                      value={editedAsset.category}
                      onValueChange={(value) =>
                        setEditedAsset({ ...editedAsset, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computers">Computers</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Vehicles">Vehicles</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{asset.category}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Serial Number</Label>
                  {isEditing ? (
                    <Input
                      value={editedAsset.serialNumber}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, serialNumber: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm font-mono">{asset.serialNumber}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Manufacturer</Label>
                  {isEditing ? (
                    <Input
                      value={editedAsset.manufacturer || ''}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, manufacturer: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{asset.manufacturer || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Model</Label>
                  {isEditing ? (
                    <Input
                      value={editedAsset.model || ''}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, model: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{asset.model || 'N/A'}</p>
                  )}
                </div>
              </div>
              {asset.description && (
                <div className="mt-4">
                  <Label className="text-xs text-gray-500">Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedAsset.description}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, description: e.target.value })
                      }
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{asset.description}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Financial Information */}
            <Card className="p-4">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Financial Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Purchase Value</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedAsset.value}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, value: parseFloat(e.target.value) })
                      }
                    />
                  ) : (
                    <p className="text-sm">${asset.value.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Purchase Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedAsset.purchaseDate}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, purchaseDate: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {asset.warrantyExpiry && (
                  <div>
                    <Label className="text-xs text-gray-500">Warranty Expiry</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedAsset.warrantyExpiry || ''}
                        onChange={(e) =>
                          setEditedAsset({ ...editedAsset, warrantyExpiry: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm">
                        {new Date(asset.warrantyExpiry).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Location & Assignment */}
            <Card className="p-4">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Location & Assignment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Location</Label>
                  {isEditing ? (
                    <Input
                      value={editedAsset.location}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, location: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">{asset.location}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Assigned To</Label>
                  {isEditing ? (
                    <Input
                      value={editedAsset.assignedTo || ''}
                      onChange={(e) =>
                        setEditedAsset({ ...editedAsset, assignedTo: e.target.value || null })
                      }
                    />
                  ) : (
                    <p className="text-sm">{asset.assignedTo || 'Unassigned'}</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain" className="space-y-4">
            {asset.mintAddress ? (
              <>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg text-blue-900">SPL Token Mint Address</h3>
                  </div>
                  <p className="text-sm text-blue-700 font-mono break-all mb-3">
                    {asset.mintAddress}
                  </p>
                  <a
                    href={`${SOLANA_DEVNET_EXPLORER}/address/${asset.mintAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View on Solana Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Card>

                {asset.ipfsHash && (
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg text-purple-900">IPFS Metadata Hash</h3>
                    </div>
                    <p className="text-sm text-purple-700 font-mono break-all mb-3">
                      {asset.ipfsHash}
                    </p>
                    <a
                      href={`${IPFS_GATEWAY}/${asset.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      View Metadata on IPFS
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Card>
                )}

                <Card className="p-4">
                  <h3 className="text-lg mb-4">Blockchain Properties</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Token Standard:</span>
                      <span className="font-mono">SPL Token</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Decimals:</span>
                      <span className="font-mono">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Supply:</span>
                      <span className="font-mono">1 (NFT-style)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Network:</span>
                      <span className="font-mono">Solana Devnet</span>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg text-gray-900 mb-2">Not on Blockchain</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This asset has not been minted on the blockchain yet.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Coins className="h-4 w-4 mr-2" />
                  Mint on Blockchain
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Maintenance Logs
                </h3>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setIsAddingLog(!isAddingLog)}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Add Log
                </Button>
              </div>

              {/* Add Log Form */}
              {isAddingLog && (
                <Card className="p-4 mb-4 bg-gray-50 border-2 border-orange-200">
                  <h4 className="text-sm mb-3">New Maintenance Log</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={newLog.type}
                          onValueChange={(value: MaintenanceLog['type']) =>
                            setNewLog({ ...newLog, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                            <SelectItem value="upgrade">Upgrade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={newLog.date}
                          onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Description *</Label>
                      <Textarea
                        value={newLog.description || ''}
                        onChange={(e) =>
                          setNewLog({ ...newLog, description: e.target.value })
                        }
                        placeholder="What maintenance was performed?"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Performed By</Label>
                        <Input
                          value={newLog.performedBy}
                          onChange={(e) =>
                            setNewLog({ ...newLog, performedBy: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Cost ($)</Label>
                        <Input
                          type="number"
                          value={newLog.cost || ''}
                          onChange={(e) =>
                            setNewLog({
                              ...newLog,
                              cost: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={newLog.notes || ''}
                        onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                        placeholder="Additional information..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleAddLog}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Log
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingLog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Logs List */}
              <div className="space-y-3">
                {maintenanceLogs.length > 0 ? (
                  maintenanceLogs.map((log) => (
                    <Card
                      key={log.id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getLogTypeBadge(log.type)}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{log.description}</p>
                        </div>
                        {log.cost && (
                          <Badge variant="outline" className="text-green-700">
                            ${log.cost}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.performedBy}
                        </span>
                        {log.notes && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {log.notes}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No maintenance logs yet</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
