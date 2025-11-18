import { ArrowRight, Phone, Mail, Twitter, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';

export function CTASection() {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <section className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900 dark:text-white">
            Start Participating Today
          </h2>
          <p className="mt-6 text-xl text-gray-700 dark:text-gray-300">
            Connect your wallet and gain instant voting rights across 500 of America's largest companies.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-black hover:bg-gray-800 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300"
          >
            Connect Wallet
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-900 dark:border-gray-100 bg-transparent text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-lg px-8 py-4 rounded-xl"
          >
            View Documentation
          </Button>
        </div>

        <div className="mt-12 border-t border-gray-300 dark:border-gray-700 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Whitepaper
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              GovernanceDocs
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Follow @SPY_DAO
            </a>
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
              <Github className="h-4 w-4" />
              Open Source
            </a>
          </div>
          
          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            Built for Rayls Hackathon 2024
          </div>
        </div>
      </div>
    </section>
  );
}