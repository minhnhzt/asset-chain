'use client';

import { useState } from 'react';

export default function MaintenancePage() {
  const [logs] = useState([
    {
      id: 1,
      asset: 'Generator 500KW',
      type: 'Preventive Maintenance',
      performer: 'John Smith',
      date: '2 hours ago',
      status: 'COMPLETED',
      notes: 'Oil change, filter replacement',
    },
    {
      id: 2,
      asset: 'Pump System',
      type: 'Repair',
      performer: 'Jane Doe',
      date: '1 day ago',
      status: 'COMPLETED',
      notes: 'Fixed seal leak, pressure tested',
    },
    {
      id: 3,
      asset: 'Excavator XL-2000',
      type: 'Inspection',
      performer: 'Mike Johnson',
      date: '3 days ago',
      status: 'PENDING_APPROVAL',
      notes: 'Hydraulic system inspection',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance Logs</h1>
          <p className="text-slate-400 mt-1">Track maintenance and repair activities</p>
        </div>
        <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition">
          + Log Maintenance
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Total Logs', value: '24', icon: '📝' },
          { label: 'Completed', value: '22', icon: '✓' },
          { label: 'Pending', value: '2', icon: '⏳' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Maintenance Logs */}
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{log.asset}</h3>
                <p className="text-slate-400 text-sm">{log.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                {log.status.replace('_', ' ')}
              </span>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-4 mb-4">
              <p className="text-slate-300">{log.notes}</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <div>
                  <span className="text-slate-500">Performed by:</span> <span className="text-white">{log.performer}</span>
                </div>
                <div>
                  <span className="text-slate-500">Date:</span> <span className="text-white">{log.date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-400 hover:text-blue-300 transition">View</button>
                {log.status === 'PENDING_APPROVAL' && (
                  <>
                    <button className="text-emerald-400 hover:text-emerald-300 transition">Approve</button>
                    <button className="text-red-400 hover:text-red-300 transition">Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
