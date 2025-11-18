import { CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Link your Web3 wallet to access SPY DAO governance platform.',
  },
  {
    number: '02',
    title: 'Deposit SPY',
    description: 'Deposit your SPY shares to receive proportional voting rights.',
  },
  {
    number: '03',
    title: 'Review Proposals',
    description: 'Browse upcoming shareholder meetings and governance proposals.',
  },
  {
    number: '04',
    title: 'Cast Your Vote',
    description: 'Participate in collective decision-making across 500 companies.',
  },
  {
    number: '05',
    title: 'Track Impact',
    description: 'Monitor how your votes contribute to corporate governance changes.',
  },
];

export function StepsSection() {
  return (
    <section className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get started in five simple steps. Transform your passive holdings into active governance participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Step Card */}
              <div className="rounded-2xl glass-card p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl font-bold text-gray-300 dark:text-gray-600">
                    {step.number}
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-6 -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

