export function QuoteSection() {
  return (
    <section className="py-16 bg-transparent">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden shadow-lg glass-card">
          {/* Middle Section - Two Squares */}
          <div className="w-full md:w-1/4 flex flex-col">
            {/* Top Square - Quote Marks */}
            <div className="flex-1 bg-gray-800 flex items-center justify-center min-h-[150px]">
              <div className="text-8xl md:text-9xl font-serif text-gray-300 leading-none">"</div>
            </div>
            {/* Bottom Square */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 min-h-[150px]"></div>
          </div>

          {/* Right Section - Quote Text */}
          <div className="w-full md:flex-1 bg-gray-100 dark:bg-gray-800 p-8 md:p-12 flex flex-col justify-center">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 dark:text-gray-100 leading-relaxed mb-6">
              Shareholder democracy is not a privilege—it's a right. Your stake equals your voice in shaping corporate America.
            </blockquote>
            <cite className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 not-italic self-end">
              — SPY DAO
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}

