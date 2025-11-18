import { Github, Twitter, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-transparent text-gray-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold">SPY DAO</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Democratizing corporate governance for index investors worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Product</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Governance</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Voting Portal</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Community</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Forum</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Newsletter</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Legal</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Risk Disclosure</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-300 dark:border-gray-700 pt-8 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 SPY DAO. Built for Rayls Hackathon.
          </p>
          
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}