import React, { useEffect, useRef, useState } from 'react';

const metrics = [
  { label: 'Startups Incubated', value: 24, suffix: '' },
  { label: 'ETB in Funding', value: 4.2, suffix: 'M' },
  { label: 'Active Mentors', value: 12, suffix: '' },
  { label: 'Graduation Rate', value: 87, suffix: '%' },
];

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    let start = 0;
    let startTime = null;
    function animateCount(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * (target - start) + start));
      if (progress < 1) requestAnimationFrame(animateCount);
      else setCount(target);
    }
    requestAnimationFrame(animateCount);
    // eslint-disable-next-line
  }, [target]);
  return count;
}

const HeroSection = () => {
  // Animated counts for each metric
  const counts = [
    useCountUp(24),
    useCountUp(4.2 * 10), // animate to 42, then show as 4.2M
    useCountUp(12),
    useCountUp(87),
  ];

  return (
    <section
      className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(/image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 md:px-12 w-full max-w-6xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-xl mb-6">
          Empowering{' '}
          <span className="bg-gradient-to-r from-[#299DFF] to-[#0A2D5C] bg-clip-text text-transparent">
            Innovation
          </span>{' '}
          for Growth
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 font-medium leading-relaxed max-w-3xl mx-auto">
          Your all-in-one platform to manage <span className="text-[#299DFF] font-semibold">incubation</span>, mentorship, and startup innovation—built for emerging ecosystems.
        </p>
        <a
          href="#projects"
          className="inline-block bg-gradient-to-r from-[#299DFF] to-[#0A2D5C] text-white font-semibold px-8 py-3 rounded-full text-lg shadow-lg hover:scale-105 transition-transform duration-300"
        >
          🚀 Explore Projects
        </a>
        {/* Impact Metrics Bar */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10 items-center w-full max-w-3xl mx-auto bg-white/20 backdrop-blur-md rounded-2xl py-4 px-2 md:px-8 shadow-lg border border-white/30 animate-fade-in-up">
          {metrics.map((metric, idx) => (
            <div key={metric.label} className="flex flex-col items-center min-w-[100px]">
              <span className="text-3xl md:text-4xl font-extrabold text-[#299DFF] drop-shadow-lg">
                {idx === 1
                  ? `${(counts[idx] / 10).toFixed(1)}${metric.suffix}`
                  : `${counts[idx]}${metric.suffix}`}
              </span>
              <span className="text-xs md:text-sm text-white/90 font-medium mt-1 text-center">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Artistic floating shapes */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#299DFF] rounded-full opacity-20 animate-[float_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-50px] right-[-50px] w-52 h-52 bg-[#0A2D5C] rounded-full opacity-20 animate-[float_8s_ease-in-out_infinite]" />
      {/* Custom animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
