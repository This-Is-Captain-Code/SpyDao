export function Marquee() {
  const companies = [
    {
      name: 'Arbitrum',
      logo: '/logos/full-arbitrum-logo.png',
    },
    {
      name: 'Mastercard',
      logo: '/logos/Mastercard-logo.svg',
    },
    {
      name: 'Rayls',
      logo: '/logos/c25a31b-small-Rayls_Logo_Gradient.png',
    },
    {
      name: 'AWS',
      logo: '/logos/Amazon_Web_Services_Logo.svg.png',
    },
    {
      name: 'Banco Central do Brasil',
      logo: '/logos/central_bank_of_brazil-logo_brandlogos.net_alitr.png',
    },
    {
      name: 'Kineyis by JP Morgan',
      logo: '/logos/Logo_of_JPMorganChase_2024.svg.png',
    },
  ];

  // Duplicate many times for seamless infinite loop
  const duplicatedCompanies = [...companies, ...companies, ...companies, ...companies, ...companies, ...companies];

  return (
    <section className="relative py-4 bg-transparent overflow-hidden -mt-8">
      <div 
        className="w-full relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 10%, black 90%, transparent 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 5%, black 10%, black 90%, transparent 95%, transparent 100%)',
        }}
      >
        <div className="flex animate-marquee-reverse whitespace-nowrap items-center">
          {duplicatedCompanies.map((company, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-8 px-6 py-3 flex items-center justify-center"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="h-12 w-auto max-w-[150px] object-contain opacity-90 hover:opacity-100 transition-opacity"
                loading="lazy"
                onError={(e) => {
                  console.error(`Failed to load logo: ${company.logo}`);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'block';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

