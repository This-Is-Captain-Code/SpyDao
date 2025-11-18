import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';

export default function Home() {
  const { address, isConnecting, error, connectWallet, disconnectWallet, truncateAddress } = useWallet();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-lg text-center space-y-8 md:space-y-12">
        <div className="space-y-4 md:space-y-6">
          <h1 
            className="text-6xl md:text-7xl font-bold tracking-tight font-display"
            data-testid="text-spydao-title"
          >
            SPYDAO
          </h1>
          
          <p 
            className="text-lg md:text-xl text-muted-foreground"
            data-testid="text-spydao-tagline"
          >
            Decentralized Autonomous Organization
          </p>
        </div>

        <div className="space-y-4">
          {!address ? (
            <>
              <Button
                size="lg"
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-8 py-6 text-base md:text-lg font-semibold h-auto min-h-0"
                data-testid="button-connect-wallet"
              >
                {isConnecting ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>

              {error && (
                <div 
                  className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20"
                  data-testid="text-error-message"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-left">{error}</p>
                </div>
              )}

              {!window.ethereum && !error && (
                <p className="text-sm text-muted-foreground">
                  Don't have MetaMask?{' '}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                    data-testid="link-metamask-download"
                  >
                    Download here
                  </a>
                </p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div 
                className="inline-block bg-secondary/50 px-6 py-3 rounded-lg border border-border"
                data-testid="text-wallet-address"
              >
                <p className="text-sm text-muted-foreground mb-1">Connected</p>
                <p className="font-mono text-base font-medium">{truncateAddress(address)}</p>
              </div>

              <Button
                variant="ghost"
                onClick={disconnectWallet}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-disconnect-wallet"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
