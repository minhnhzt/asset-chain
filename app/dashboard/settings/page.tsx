'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    walletAddress: '9B5X...4kPo',
    autoApproveThreshold: 3,
    notificationsEnabled: true,
    maintenanceInterval: '30',
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Wallet Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Wallet</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Connected Wallet Address</label>
            <input
              type="text"
              value={settings.walletAddress}
              disabled
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>
          <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition font-medium text-sm">
            Disconnect Wallet
          </button>
        </div>
      </div>

      {/* Approval Settings */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Multi-Signature Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Auto-Approval Threshold</label>
            <p className="text-xs text-slate-500 mb-3">
              Minimum number of approvals required to automatically execute requests
            </p>
            <input
              type="number"
              value={settings.autoApproveThreshold}
              onChange={(e) => setSettings({ ...settings, autoApproveThreshold: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Maintenance Interval (days)</label>
            <p className="text-xs text-slate-500 mb-3">
              Default reminder interval for scheduled maintenance
            </p>
            <input
              type="number"
              value={settings.maintenanceInterval}
              onChange={(e) => setSettings({ ...settings, maintenanceInterval: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { id: 'approvals', label: 'Pending Approvals', desc: 'Notify me of new approval requests' },
            { id: 'maintenance', label: 'Maintenance Reminders', desc: 'Remind me when maintenance is due' },
            { id: 'transactions', label: 'Transaction Updates', desc: 'Notify me of blockchain transactions' },
          ].map((notif) => (
            <label key={notif.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition">
              <input
                type="checkbox"
                defaultChecked={settings.notificationsEnabled}
                className="w-4 h-4 rounded border-slate-600 text-blue-500 mt-1"
              />
              <div>
                <p className="text-sm font-medium text-white">{notif.label}</p>
                <p className="text-xs text-slate-500">{notif.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Blockchain Proof Settings */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Blockchain Proofs</h2>
        <div className="space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200">
              ℹ️ Blockchain proof anchoring is optional and adds immutability to your approval decisions.
            </p>
          </div>
          <label className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-white">Enable Blockchain Proofs by Default</p>
              <p className="text-xs text-slate-500">Automatically anchor proofs to Solana (~$0.0001 SOL per request)</p>
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-slate-400 mb-4">
          These actions are permanent and cannot be undone.
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition font-medium text-sm">
            Reset All Settings
          </button>
          <button className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition font-medium text-sm">
            Delete Account
          </button>
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-6 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:text-white transition font-medium">
          Cancel
        </button>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition font-medium">
          Save Changes
        </button>
      </div>
    </div>
  );
}
