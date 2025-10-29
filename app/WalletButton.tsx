import { useState, useEffect } from 'react';
import { Wallet, Check, Copy, ExternalLink, LogOut, User, Settings, Shield } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface WalletButtonProps {
  className?: string;
}

// Mock role assignment based on wallet address
const getRoleFromWallet = (address: string): string => {
  // In production, this would query from blockchain or backend
  const lastChar = address.slice(-1);
  const roles = ['Administrator', 'Asset Manager', 'Auditor', 'Supervisor', 'Operator'];
  const index = parseInt(lastChar, 16) % roles.length;
  return roles[index];
};

export function WalletButton({ className = '' }: WalletButtonProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<string>('Administrator');

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Check if Phantom wallet is installed and connected
  const checkWalletConnection = async () => {
    try {
      const { solana } = window as any;
      
      if (solana && solana.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          const address = response.publicKey.toString();
          setWalletAddress(address);
          // Simulate balance (in production, fetch from blockchain)
          setBalance(Math.random() * 10);
          // Get role
          setRole(getRoleFromWallet(address));
        }
      }
    } catch (error) {
      // Wallet not connected yet, silent fail
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const { solana } = window as any;

      if (!solana) {
        toast.error('Phantom Wallet not found', {
          description: 'Please install Phantom Wallet extension',
          action: {
            label: 'Install',
            onClick: () => window.open('https://phantom.app/', '_blank'),
          },
        });
        setIsConnecting(false);
        return;
      }

      if (!solana.isPhantom) {
        toast.error('Phantom Wallet required', {
          description: 'Please use Phantom Wallet for Solana',
        });
        setIsConnecting(false);
        return;
      }

      // Connect to wallet
      const response = await solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      
      // Simulate balance (in production, fetch from blockchain)
      setBalance(Math.random() * 10);
      
      // Get role based on wallet (in production, query from blockchain)
      const userRole = getRoleFromWallet(address);
      setRole(userRole);

      toast.success('Wallet connected', {
        description: `Connected as ${userRole}`,
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      if (error.code === 4001) {
        toast.error('Connection rejected', {
          description: 'You rejected the connection request',
        });
      } else {
        toast.error('Connection failed', {
          description: 'Failed to connect to wallet',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      const { solana } = window as any;
      
      if (solana) {
        await solana.disconnect();
      }
      
      setWalletAddress(null);
      setBalance(0);
      setRole('Administrator');
      
      toast.success('Wallet disconnected', {
        description: 'Your wallet has been disconnected',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Disconnect failed', {
        description: 'Failed to disconnect wallet',
      });
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied', {
        description: 'Wallet address copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open wallet in Solana Explorer
  const viewInExplorer = () => {
    if (walletAddress) {
      window.open(
        `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`,
        '_blank'
      );
    }
  };

  // Format wallet address (e.g., "7xKX...9abc")
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // If wallet is not connected, show connect button
  if (!walletAddress) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  // If wallet is connected, show wallet info dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`hover:bg-gray-100 ${className}`}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <Wallet className="h-4 w-4" />
            <div className="hidden md:block text-left">
              <div className="text-sm font-mono">{formatAddress(walletAddress)}</div>
              <div className="text-xs text-gray-500">{role}</div>
            </div>
            <Badge variant="outline" className="hidden lg:flex bg-blue-50 text-blue-700 border-blue-200">
              {balance.toFixed(2)} SOL
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Solana Wallet
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Wallet Info */}
        <div className="px-2 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Address</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono">{formatAddress(walletAddress)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyAddress}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Balance</span>
            <span className="text-sm font-mono">{balance.toFixed(4)} SOL</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Role</span>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {role}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Network</span>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Devnet
            </Badge>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Account Actions */}
        <DropdownMenuItem>
          <User className="h-4 w-4 mr-2" />
          Profile Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Shield className="h-4 w-4 mr-2" />
          Permissions
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Wallet Actions */}
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={viewInExplorer}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View in Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
