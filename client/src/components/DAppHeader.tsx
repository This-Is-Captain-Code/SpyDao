import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Coins, Vote, Shield } from 'lucide-react';

export function DAppHeader() {
  const [location] = useLocation();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-nav rounded-2xl w-[85%]">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
            <span className="text-lg font-semibold text-gray-900 dark:text-black">spy.dao</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/vault">
              <Button
                size="sm"
                className={
                  location === '/vault' 
                    ? 'bg-black hover:bg-gray-800 text-white' 
                    : 'bg-transparent text-gray-900 dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200'
                }
                data-testid="nav-vault"
              >
                <Coins className="mr-2 h-4 w-4" />
                Vault
              </Button>
            </Link>
            <Link href="/governance">
              <Button
                size="sm"
                className={
                  location === '/governance' 
                    ? 'bg-black hover:bg-gray-800 text-white' 
                    : 'bg-transparent text-gray-900 dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200'
                }
                data-testid="nav-governance"
              >
                <Vote className="mr-2 h-4 w-4" />
                Governance
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="sm"
                className={
                  location === '/admin' 
                    ? 'bg-black hover:bg-gray-800 text-white' 
                    : 'bg-transparent text-gray-900 dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200'
                }
                data-testid="nav-admin"
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
