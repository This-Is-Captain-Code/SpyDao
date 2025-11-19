import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, Coins, Vote, Shield } from 'lucide-react';

export function DAppHeader() {
  const [location] = useLocation();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/vault" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-logo">
            <span className="text-2xl font-bold">spy.dao</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/vault">
              <Button
                variant={location === '/vault' ? 'default' : 'ghost'}
                size="sm"
                data-testid="nav-vault"
              >
                <Coins className="mr-2 h-4 w-4" />
                Vault
              </Button>
            </Link>
            <Link href="/governance">
              <Button
                variant={location === '/governance' ? 'default' : 'ghost'}
                size="sm"
                data-testid="nav-governance"
              >
                <Vote className="mr-2 h-4 w-4" />
                Governance
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant={location === '/admin' ? 'default' : 'ghost'}
                size="sm"
                data-testid="nav-admin"
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="nav-home">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
