/**
 * Solana Configuration
 * Centralized configuration for Solana network and program IDs
 */

export const SOLANA_CONFIG = {
  // Network Configuration
  network: (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as 'localnet' | 'devnet' | 'testnet' | 'mainnet-beta',
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  wsUrl: process.env.NEXT_PUBLIC_SOLANA_WS_URL || 'wss://api.devnet.solana.com',

  // Program IDs
  programs: {
    assetManager: process.env.NEXT_PUBLIC_ASSET_MANAGER_PROGRAM_ID || '99GdmczATUfVdHEPVea3vgLSzyaGEMFJtuDgVUXmufe7',
    assetRegistry: process.env.NEXT_PUBLIC_ASSET_REGISTRY_PROGRAM_ID || 'Fmis8h1QohoXVrWjE98cYgoNZTrCuivRPLXmr2NTw6o3',
  },

  // Feature Flags
  features: {
    enableBlockchain: process.env.NEXT_PUBLIC_ENABLE_BLOCKCHAIN === 'true',
    enableMultisig: process.env.NEXT_PUBLIC_ENABLE_MULTISIG === 'true',
    enableMaintenanceLogs: process.env.NEXT_PUBLIC_ENABLE_MAINTENANCE_LOGS === 'true',
    maxMaintenanceLogs: parseInt(process.env.NEXT_PUBLIC_MAX_MAINTENANCE_LOGS || '10', 10),
  },

  // IPFS Configuration
  ipfs: {
    gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
    pinataApiKey: process.env.PINATA_API_KEY || '',
    pinataApiSecret: process.env.PINATA_API_SECRET || '',
    pinataJWT: process.env.PINATA_JWT || '',
  },

  // Development Settings
  debug: {
    enabled: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    showTransactionLogs: process.env.NEXT_PUBLIC_SHOW_TRANSACTION_LOGS === 'true',
  },
} as const;

/**
 * Network-specific configurations
 */
export const NETWORK_CONFIGS = {
  localnet: {
    name: 'Localnet',
    rpcUrl: 'http://127.0.0.1:8899',
    wsUrl: 'ws://127.0.0.1:8900',
    explorerUrl: 'http://localhost:3000/explorer',
  },
  devnet: {
    name: 'Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    wsUrl: 'wss://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
  },
  testnet: {
    name: 'Testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    wsUrl: 'wss://api.testnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
  },
  'mainnet-beta': {
    name: 'Mainnet Beta',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
  },
} as const;

/**
 * Get the current network configuration
 */
export function getCurrentNetworkConfig() {
  return NETWORK_CONFIGS[SOLANA_CONFIG.network];
}

/**
 * Get explorer URL for an address
 */
export function getExplorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
  const baseUrl = getCurrentNetworkConfig().explorerUrl;
  const cluster = SOLANA_CONFIG.network === 'mainnet-beta' ? '' : `?cluster=${SOLANA_CONFIG.network}`;
  return `${baseUrl}/${type}/${address}${cluster}`;
}

/**
 * Log configuration for debugging
 */
export function logConfig() {
  if (SOLANA_CONFIG.debug.enabled) {
    console.log('🔧 Solana Configuration:', {
      network: SOLANA_CONFIG.network,
      rpcUrl: SOLANA_CONFIG.rpcUrl,
      programs: SOLANA_CONFIG.programs,
      features: SOLANA_CONFIG.features,
    });
  }
}
