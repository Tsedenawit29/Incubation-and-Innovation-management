import React from 'react';

const Home = () => (
  <div className="p-4 max-w-4xl mx-auto">
    {/* Hero Section */}
    <section className="text-center py-10 bg-blue-50 rounded-lg shadow mb-8">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-4">Empowering Ethiopian Startups to Succeed</h1>
      <p className="text-lg text-blue-900">We provide mentorship, funding access, and innovation management tools.</p>
    </section>

    {/* Mission & Vision */}
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Our Mission & Vision</h2>
      <p className="text-gray-700 mb-2">Our mission is to nurture and empower the next generation of Ethiopian innovators and entrepreneurs by providing world-class incubation, mentorship, and resources. We envision a thriving ecosystem where startups can grow, connect, and make a global impact.</p>
    </section>

    {/* What We Do */}
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">What We Do</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <li className="bg-white rounded shadow p-4">Startup onboarding</li>
        <li className="bg-white rounded shadow p-4">Mentorship programs</li>
        <li className="bg-white rounded shadow p-4">Pitch competitions</li>
        <li className="bg-white rounded shadow p-4">Innovation tracking</li>
        <li className="bg-white rounded shadow p-4">Resource management</li>
      </ul>
    </section>

    {/* Why Choose IIMS? */}
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose IIMS?</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Tailored for the Ethiopian ecosystem</li>
        <li>Scalable digital platform</li>
        <li>Connected with mentors, investors, and accelerators</li>
      </ul>
    </section>
  </div>
);

export default Home;