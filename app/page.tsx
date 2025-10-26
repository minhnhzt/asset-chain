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
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50 transition font-semibold text-sm"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/50">
                <span className="text-blue-300 text-sm font-semibold">🚀 Powered by Solana</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Manage Assets with
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Blockchain Trust
                </span>
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                Register, track, and manage your physical and digital assets on Solana blockchain. 
                Immutable audit trails, multi-signature approvals, and real-time maintenance tracking.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">✨ Core Features:</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0 text-sm mt-0.5">✓</span>
                  <span><strong>Multi-Signature Approvals</strong> - M-of-N threshold voting with audit trails</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0 text-sm mt-0.5">✓</span>
                  <span><strong>Blockchain Proof Anchoring</strong> - Optional on-chain proof recording</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0 text-sm mt-0.5">✓</span>
                  <span><strong>Maintenance Logging</strong> - Track repairs and asset lifecycle</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0 text-sm mt-0.5">✓</span>
                  <span><strong>Immutable Audit Trail</strong> - Complete history on Solana blockchain</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/dashboard"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 text-center"
              >
                Launch Dashboard
              </Link>
              <a
                href="#features"
                className="px-8 py-3 rounded-lg border border-slate-500 text-slate-300 font-semibold hover:bg-slate-800/50 transition text-center"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Visual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/60 transition">
              <div className="text-3xl mb-3">📦</div>
              <h4 className="font-semibold text-blue-200 mb-2">Asset Registry</h4>
              <p className="text-sm text-slate-300">Create and tokenize assets</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/60 transition mt-8">
              <div className="text-3xl mb-3">✍️</div>
              <h4 className="font-semibold text-cyan-200 mb-2">Maintenance Logs</h4>
              <p className="text-sm text-slate-300">Track repairs and updates</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/60 transition">
              <div className="text-3xl mb-3">🔐</div>
              <h4 className="font-semibold text-emerald-200 mb-2">Multi-Sig Safety</h4>
              <p className="text-sm text-slate-300">Approval-based governance</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition mt-8">
              <div className="text-3xl mb-3">⛓️</div>
              <h4 className="font-semibold text-purple-200 mb-2">Blockchain Proofs</h4>
              <p className="text-sm text-slate-300">Immutable on-chain records</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32 space-y-12">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-white mb-4">Advanced Features</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Enterprise-grade asset management with blockchain security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🚀',
                title: 'Quick Setup',
                desc: 'Connect wallet and register assets in minutes',
              },
              {
                icon: '📊',
                title: 'Real-time Dashboard',
                desc: 'Monitor asset status and maintenance schedules',
              },
              {
                icon: '🔄',
                title: 'Workflow Automation',
                desc: 'Automate approval workflows and notifications',
              },
              {
                icon: '📱',
                title: 'Mobile Ready',
                desc: 'Responsive design for all devices',
              },
              {
                icon: '💾',
                title: 'Data Security',
                desc: 'Multi-signature verification and audit logs',
              },
              {
                icon: '📈',
                title: 'Analytics',
                desc: 'Track KPIs and generate compliance reports',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-blue-500/50 transition group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition">{item.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-32 space-y-12">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-white mb-4">How It Works</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              From asset registration to blockchain verification in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Connect', desc: 'Link your Phantom wallet' },
              { step: '2', title: 'Register', desc: 'Add asset details & metadata' },
              { step: '3', title: 'Approve', desc: 'Multi-sig review & voting' },
              { step: '4', title: 'Track', desc: 'Monitor and manage lifecycle' },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-slate-900 flex items-center justify-center text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-32 grid md:grid-cols-4 gap-6">
          {[
            { label: '100%', desc: 'On-Chain Immutability' },
            { label: 'M-of-N', desc: 'Multi-Signature Voting' },
            { label: 'Real-Time', desc: 'Status Updates' },
            { label: 'Forever', desc: 'Audit Trail' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-8 text-center hover:border-blue-500/50 transition"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.label}
              </div>
              <div className="text-slate-400">{stat.desc}</div>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="mt-32 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-12 text-center backdrop-blur-sm">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Connect your wallet and start managing assets with enterprise-grade security
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105"
          >
            Launch Dashboard
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#features" className="hover:text-slate-200 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-200 transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Asset Manager. Built with ❤️ on Solana blockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
