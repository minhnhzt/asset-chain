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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🔗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Asset Manager</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Manage Your Assets on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Solana</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Register, track, and manage your physical and digital assets with blockchain immutability. 
                Full audit trails, maintenance logging, and real-time status tracking.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</span>
                  SPL Token Minting - Unique token for each asset
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</span>
                  Immutable History - All changes logged on-chain
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</span>
                  Maintenance Tracking - Log repairs and maintenance
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</span>
                  Status Management - ACTIVE, MAINTENANCE, RETIRED, DISPOSED
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition transform hover:scale-105 text-center">
                Go to Dashboard
              </Link>
              <a href="#how-it-works" className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition text-center">
                Learn More
              </a>
            </div>
          </div>

          {/* Right Visual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-2">📦</div>
              <h4 className="font-semibold text-gray-900 mb-1">Register Assets</h4>
              <p className="text-sm text-gray-600">Create unique SPL tokens for each asset</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition mt-8">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900 mb-1">Track & Monitor</h4>
              <p className="text-sm text-gray-600">Real-time status and maintenance logs</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-semibold text-gray-900 mb-1">Secure & Immutable</h4>
              <p className="text-sm text-gray-600">Blockchain-backed ownership proofs</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition mt-8">
              <div className="text-3xl mb-2">⛓️</div>
              <h4 className="font-semibold text-gray-900 mb-1">On-Chain History</h4>
              <p className="text-sm text-gray-600">Complete audit trail on Solana</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-32 space-y-12">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to get your assets on the blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Connect Wallet', desc: 'Link your Phantom wallet' },
              { step: '2', title: 'Register Asset', desc: 'Enter asset details & metadata' },
              { step: '3', title: 'Mint Token', desc: 'Unique SPL token created' },
              { step: '4', title: 'Start Tracking', desc: 'Log maintenance & updates' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center shadow-xl">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Deploy to Solana devnet and start managing your assets with blockchain security
          </p>
          <Link href="/dashboard" className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105">
            Launch Dashboard
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">API Docs</a></li>
                <li><a href="#" className="hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Twitter</a></li>
                <li><a href="#" className="hover:text-gray-900">Discord</a></li>
                <li><a href="#" className="hover:text-gray-900">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 Solana Asset Manager. Built with ❤️ on Solana devnet.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
