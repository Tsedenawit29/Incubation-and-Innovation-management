import React from 'react';

const startups = [
  {
    name: 'AgriGrow',
    logo: 'https://via.placeholder.com/64',
    industry: 'AgriTech',
    description: 'Empowering farmers with smart agriculture solutions.',
    link: '#',
  },
  {
    name: 'FinLeap',
    logo: 'https://via.placeholder.com/64',
    industry: 'Fintech',
    description: 'Digital banking for the unbanked.',
    link: '#',
  },
  {
    name: 'HealthBridge',
    logo: 'https://via.placeholder.com/64',
    industry: 'HealthTech',
    description: 'Connecting patients with healthcare providers.',
    link: '#',
  },
];

const metrics = [
  { icon: '🚀', label: 'Startups Incubated', value: 24 },
  { icon: '💰', label: 'ETB in Funding', value: '4.2M' },
  { icon: '👨‍🏫', label: 'Active Mentors', value: 12 },
  { icon: '📈', label: 'Graduation Rate', value: '87%' },
];

const categories = ['Fintech', 'AgriTech', 'HealthTech', 'GreenTech', 'EdTech'];

const Projects = () => (
  <div className="p-4 max-w-5xl mx-auto">
    {/* Featured Startups */}
    <section className="mb-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Featured Startups</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {startups.map((startup) => (
          <div key={startup.name} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img src={startup.logo} alt={startup.name} className="w-16 h-16 mb-4 rounded-full" />
            <h2 className="text-xl font-semibold mb-2">{startup.name}</h2>
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded mb-2">{startup.industry}</span>
            <p className="text-gray-600 mb-4 text-center">{startup.description}</p>
            <a href={startup.link} className="text-blue-600 hover:underline">Learn more</a>
          </div>
        ))}
      </div>
    </section>

    {/* Impact Metrics */}
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Impact Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-3xl mb-2">{metric.icon}</span>
            <span className="text-xl font-bold">{metric.value}</span>
            <span className="text-gray-700 text-sm">{metric.label}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Innovation Categories */}
    <section>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Innovation Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <span key={cat} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {cat}
          </span>
        ))}
      </div>
    </section>
  </div>
);

export default Projects;