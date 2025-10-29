/**
 * Maintenance Logs Page
 * View and manage maintenance logs for assets
 */

'use client';

import { useState } from 'react';
import { useMaintenanceLogs, useAddMaintenanceLog } from '@/app/hooks/useAssets';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Loader2, Plus, Clock, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenanceLogsPage() {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [inputAssetId, setInputAssetId] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  
  const { logs, loading, error, refetch } = useMaintenanceLogs(selectedAssetId);
  const { addLog, loading: adding } = useAddMaintenanceLog();

  const handleLoadLogs = () => {
    if (!inputAssetId.trim()) {
      toast.error('Please enter an asset ID');
      return;
    }
    setSelectedAssetId(inputAssetId.trim());
  };

  const handleAddLog = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    if (!selectedAssetId) {
      toast.error('Please select an asset first');
      return;
    }

    try {
      const result = await addLog(selectedAssetId, newNote);
      toast.success('Maintenance log added successfully!');
      toast.info(`Transaction: ${result.signature.slice(0, 8)}...`);
      setNewNote('');
      refetch();
    } catch (err) {
      toast.error('Failed to add maintenance log');
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Maintenance Logs</h1>
        <p className="text-gray-600 mt-1">
          Track maintenance history for your assets
        </p>
      </div>

      {/* Asset Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter asset public key..."
              value={inputAssetId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputAssetId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleLoadLogs} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Load Logs'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Log */}
      {selectedAssetId && (
        <Card>
          <CardHeader>
            <CardTitle>Add Maintenance Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Maintenance Note
              </label>
              <Textarea
                placeholder="Enter maintenance details..."
                value={newNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleAddLog} disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Log Entry
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Logs Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Error loading logs</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && !logs && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading logs...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {logs && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance History</CardTitle>
            <p className="text-sm text-gray-600">
              {logs.entries.length} {logs.entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </CardHeader>
          <CardContent>
            {logs.entries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No maintenance logs found for this asset
              </div>
            ) : (
              <div className="space-y-4">
                {logs.entries.map((entry, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 font-mono">
                            {entry.performer.slice(0, 8)}...{entry.performer.slice(-8)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <p className="text-sm">{entry.note}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp * 1000).toLocaleString()}
                          </span>
                        </div>
                        {entry.ipfs_cid && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              IPFS: {entry.ipfs_cid.slice(0, 10)}...
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
