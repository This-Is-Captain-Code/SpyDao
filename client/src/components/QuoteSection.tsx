export function QuoteSection() {
  return (
    <section className="py-12 bg-transparent">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col md:flex-row items-stretch rounded-xl overflow-hidden shadow-lg glass-card">
          {/* Middle Section - Two Squares */}
          <div className="w-full md:w-1/5 flex flex-col">
            {/* Top Square - Quote Marks */}
            <div className="flex-1 bg-gray-800 flex items-center justify-center min-h-[100px]">
              <div className="text-6xl md:text-7xl font-serif text-gray-300 leading-none">"</div>
            </div>
            {/* Bottom Square */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 min-h-[100px]"></div>
          </div>

          {/* Right Section - Quote Text */}
          <div className="w-full md:flex-1 bg-gray-100 dark:bg-gray-800 p-6 md:p-8 flex flex-col justify-center">
            <blockquote className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
              The right to vote is the right upon which all other rights depend.
            </blockquote>
            <cite className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 not-italic self-end">
              — THOMAS PAINE
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}

