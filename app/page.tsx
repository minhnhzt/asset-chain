/**
 * Home Page - Landing page with navigation to main features
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="text-slate-900 font-bold text-lg">⛓️</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Asset Manager
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/assets"
              className="px-4 py-2 rounded-lg border border-blue-500/50 hover:bg-blue-500/10 text-blue-400 font-medium transition-colors"
            >
              Assets
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Manage Your Assets
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              On Solana Blockchain
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Register, track, and manage physical and digital assets with blockchain-powered 
            immutability, multi-signature approvals, and comprehensive audit trails.
          </p>

          <div className="flex gap-4 justify-center pt-6">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg shadow-lg shadow-blue-500/50 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/assets"
              className="px-8 py-4 rounded-lg border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-blue-400 font-bold text-lg transition-all"
            >
              View Assets
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Asset Registry</h3>
            <p className="text-slate-300">
              Register and tokenize physical and digital assets on Solana blockchain with immutable records.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Maintenance Tracking</h3>
            <p className="text-slate-300">
              Log maintenance activities with IPFS storage and on-chain proof for complete audit trails.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Multi-Sig Approvals</h3>
            <p className="text-slate-300">
              Secure asset operations with multi-signature governance and voting mechanisms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
