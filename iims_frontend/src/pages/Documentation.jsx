import React, { useState, useMemo, useRef } from 'react';
import { FaBook, FaSearch, FaRocket, FaCogs, FaQuestionCircle, FaFileAlt, FaUsers, FaLightbulb, FaChartLine, FaFolderOpen, FaTachometerAlt, FaWrench, FaDatabase, FaCloudUploadAlt, FaUserShield, FaClipboardList, FaPalette, FaGlobe, FaBug, FaChartPie } from 'react-icons/fa';
// If you have react-markdown installed, uncomment the next line:
// import ReactMarkdown from 'react-markdown';

const sections = [
  { key: 'introduction', label: 'Introduction', icon: <FaBook className="text-[#299DFF] mr-2" /> },
  { key: 'getting-started', label: 'Getting Started', icon: <FaRocket className="text-[#299DFF] mr-2" /> },
  { key: 'core-modules', label: 'Core Modules', icon: <FaCogs className="text-[#299DFF] mr-2" /> },
  { key: 'frontend', label: 'Frontend (UI/UX) Guide', icon: <FaPalette className="text-[#299DFF] mr-2" /> },
  { key: 'backend', label: 'Backend/API Reference', icon: <FaDatabase className="text-[#299DFF] mr-2" /> },
  { key: 'deployment', label: 'Deployment Guide', icon: <FaCloudUploadAlt className="text-[#299DFF] mr-2" /> },
  { key: 'admin-dashboard', label: 'Admin Dashboard', icon: <FaUserShield className="text-[#299DFF] mr-2" /> },
  { key: 'analytics', label: 'Analytics & Impact Metrics', icon: <FaChartPie className="text-[#299DFF] mr-2" /> },
  { key: 'customization', label: 'Customization', icon: <FaWrench className="text-[#299DFF] mr-2" /> },
  { key: 'faq', label: 'FAQs / Troubleshooting', icon: <FaQuestionCircle className="text-[#299DFF] mr-2" /> },
];

const sectionContent = {
  'full-doc': (
    <div className="prose max-w-none text-[#0A2D5C] animate-fade-in-up">
      {/* Full documentation removed as requested. */}
    </div>
  ),
  introduction: (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaBook className="mr-2" /> Introduction</h3>
      <p className="text-gray-700 mb-2">The Incubation & Innovation Management System (IIMS) is a comprehensive platform designed to streamline the management of startup incubation, mentorship, and innovation tracking. It solves the challenges of manual tracking, fragmented communication, and lack of transparency in the innovation ecosystem.</p>
      <ul className="list-disc list-inside text-gray-700 ml-4 mb-2 animate-fade-in-up">
        <li><b>Who it's for:</b> Startup founders, mentors, administrators, and incubator managers seeking a digital solution for innovation management.</li>
        <li><b>Key features:</b> Startup onboarding, mentorship, innovation tracking, resource management, pitch competitions, analytics, and more.</li>
      </ul>
    </div>
  ),
  'getting-started': (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaRocket className="mr-2" /> Getting Started</h3>
      <p className="text-gray-700 mb-2">Follow these steps to get your IIMS instance up and running quickly.</p>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li><b>Prerequisites:</b> Node.js, PostgreSQL, and Docker (optional for containerized deployment).</li>
        <li><b>Installation:</b> Clone the repository, run <code>npm install</code> in the frontend, and set up your <code>.env</code> files for both frontend and backend.</li>
        <li><b>Project Structure:</b> The project is split into <b>frontend</b> (React, Tailwind), <b>backend</b> (Spring Boot), and <b>services</b> (API, authentication, etc.).</li>
        <li><b>Quick Start:</b> Use <code>npm run dev</code> for local development or <code>docker-compose up</code> for a full stack environment.</li>
      </ul>
    </div>
  ),
  'core-modules': (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaCogs className="mr-2" /> Core Modules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 rounded-xl p-6 shadow group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
          <h4 className="font-bold text-[#0A2D5C] mb-1 flex items-center"><FaUsers className="mr-2" /> User Management</h4>
          <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
            <li>Account creation for startups, admins, and mentors with role-based access.</li>
            <li>Secure login and registration with JWT authentication.</li>
            <li>Role and permission management for different user types.</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 rounded-xl p-6 shadow group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
          <h4 className="font-bold text-[#0A2D5C] mb-1 flex items-center"><FaRocket className="mr-2" /> Startup Onboarding</h4>
          <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
            <li>Customizable registration forms for startups.</li>
            <li>Application status tracking and admin review workflow.</li>
            <li>Automated notifications for application progress.</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 rounded-xl p-6 shadow group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
          <h4 className="font-bold text-[#0A2D5C] mb-1 flex items-center"><FaLightbulb className="mr-2" /> Mentorship Module</h4>
          <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
            <li>Mentor profile setup and assignment logic.</li>
            <li>Session scheduling, feedback, and progress tracking.</li>
            <li>Mentor-startup matching based on expertise and needs.</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 rounded-xl p-6 shadow group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
          <h4 className="font-bold text-[#0A2D5C] mb-1 flex items-center"><FaChartLine className="mr-2" /> Innovation Tracking</h4>
          <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
            <li>Project submission and review workflow.</li>
            <li>Track KPIs: progress, impact, category, and milestones.</li>
            <li>Timeline and milestone management for each project.</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 rounded-xl p-6 shadow group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
          <h4 className="font-bold text-[#0A2D5C] mb-1 flex items-center"><FaFolderOpen className="mr-2" /> Resource Management</h4>
          <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
            <li>Upload and manage files (docs, pitch decks, etc.).</li>
            <li>Access control for different user roles.</li>
            <li>Centralized repository for all resources.</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 rounded-xl p-6 shadow group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
          <h4 className="font-bold text-[#0A2D5C] mb-1 flex items-center"><FaClipboardList className="mr-2" /> Pitch Competitions</h4>
          <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
            <li>Create and manage pitch events with custom criteria.</li>
            <li>Judging dashboard and real-time scoring.</li>
            <li>Result publishing and feedback for participants.</li>
          </ul>
        </div>
      </div>
    </div>
  ),
  frontend: (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaPalette className="mr-2" /> Frontend (UI/UX) Guide</h3>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li><b>Folder Structure:</b> Organized by features, components, and shared utilities for scalability.</li>
        <li><b>Tech Stack:</b> React 19, Tailwind CSS, React Router, and modern hooks.</li>
        <li><b>Adding Pages:</b> Create a new file in <code>src/apps/PortfolioApp/pages</code> and add a route in <code>App.js</code>.</li>
        <li><b>Reusable Components:</b> Cards, modals, buttons, and more in <code>src/apps/shared/components</code>.</li>
        <li><b>Theme Customization:</b> Easily switch to dark mode and update branding in <code>tailwind.config.js</code>.</li>
      </ul>
    </div>
  ),
  backend: (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaDatabase className="mr-2" /> Backend/API Reference</h3>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li><b>Tech Stack:</b> Spring Boot (Java), PostgreSQL, JWT authentication, RESTful APIs.</li>
        <li><b>Endpoints:</b> Auth, user, startup, mentorship, and resource APIs.</li>
        <li><b>Security:</b> JWT-based authentication, role-based access, CORS configuration.</li>
        <li><b>Database:</b> PostgreSQL schema for users, startups, mentors, and resources.</li>
        <li><b>Integrations:</b> Webhooks for notifications, third-party analytics.</li>
      </ul>
    </div>
  ),
  deployment: (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaCloudUploadAlt className="mr-2" /> Deployment Guide</h3>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li><b>Environments:</b> Local, staging, and production setups.</li>
        <li><b>Docker:</b> Use <code>docker-compose up</code> for full stack deployment.</li>
        <li><b>CI/CD:</b> GitHub Actions for automated testing and deployment.</li>
        <li><b>Hosting:</b> Vercel, Nginx, or your preferred cloud provider.</li>
      </ul>
    </div>
  ),
  'admin-dashboard': (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaUserShield className="mr-2" /> Admin Dashboard</h3>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li>Manage users, startups, and mentors from a unified dashboard.</li>
        <li>Assign mentors to startups and monitor progress.</li>
        <li>View analytics, KPIs, and generate reports.</li>
      </ul>
    </div>
  ),
  analytics: (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaChartPie className="mr-2" /> Analytics & Impact Metrics</h3>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li>Track key metrics: number of startups, funding, mentor sessions, and more.</li>
        <li>Visualize data in dashboards and export reports.</li>
        <li>Integrate with Google Analytics, Mixpanel, or other tools.</li>
      </ul>
    </div>
  ),
  customization: (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaWrench className="mr-2" /> Customization</h3>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li>Change logo, colors, and branding in <code>tailwind.config.js</code> and assets.</li>
        <li>Enable/disable modules (pitch competitions, mentorship, etc.).</li>
        <li>Localization: add new languages and translations.</li>
      </ul>
    </div>
  ),
  faq: (
    <div>
      <h3 className="text-2xl font-bold text-[#299DFF] mb-2 flex items-center animate-fade-in-up"><FaQuestionCircle className="mr-2" /> FAQs / Troubleshooting</h3>
      <ul className="list-disc list-inside text-gray-700 ml-4 animate-fade-in-up">
        <li><b>Common installation issues:</b> Check Node.js and PostgreSQL versions, .env files, and network settings.</li>
        <li><b>Debugging API errors:</b> Use browser dev tools and backend logs for troubleshooting.</li>
        <li><b>CORS/database issues:</b> Ensure CORS is configured and database is running.</li>
      </ul>
    </div>
  ),
};

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [search, setSearch] = useState('');
  const mainRef = useRef(null);

  // Filter sections based on search (for sidebar only)
  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        (sectionContent[s.key]?.props?.children || '')
          .toString()
          .toLowerCase()
          .includes(q)
    );
  }, [search]);

  // Scroll to main content when sidebar button is clicked
  const handleSidebarClick = (key) => {
    setActiveSection(key);
    setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#299DFF]/10 to-[#0A2D5C]/10 py-12 mb-10 text-center animate-fade-in-up">
        <FaBook className="mx-auto text-5xl text-[#299DFF] mb-4 animate-fade-in-up" />
        <h1 className="text-4xl font-extrabold text-[#0A2D5C] mb-2 animate-fade-in-up">Documentation</h1>
        <p className="text-lg text-[#299DFF] max-w-2xl mx-auto animate-fade-in-up">
          Welcome to the Incubation & Innovation Management System documentation hub. Find guides, API references, and resources to help you get the most out of the platform.
        </p>
        {/* Search Bar */}
        <div className="mt-8 flex justify-center animate-fade-in-up">
          <div className="flex items-center bg-white rounded-full shadow px-4 py-2 w-full max-w-md">
            <FaSearch className="text-[#299DFF] mr-2" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="flex-1 bg-transparent outline-none text-[#0A2D5C] placeholder-[#299DFF] text-base"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4">
        {/* Sidebar */}
        <aside className="md:w-1/4 w-full bg-white rounded-2xl shadow p-6 mb-6 md:mb-0 animate-fade-in-left">
          <h2 className="text-lg font-bold text-[#0A2D5C] mb-4">Categories</h2>
          <ul className="space-y-3">
            {filteredSections.length ? filteredSections.map((cat) => (
              <li
                key={cat.key}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer font-medium transition-all duration-200 group ${activeSection === cat.key ? 'bg-[#299DFF]/10 text-[#299DFF] scale-105 shadow' : 'text-[#0A2D5C] hover:bg-[#299DFF]/10 hover:text-[#299DFF]'}`}
                onClick={() => handleSidebarClick(cat.key)}
              >
                {cat.icon}
                {cat.label}
              </li>
            )) : <li className="text-gray-400">No results found.</li>}
          </ul>
        </aside>
        {/* Main Content */}
        <main ref={mainRef} className="flex-1 bg-white rounded-2xl shadow p-8 min-h-[400px] animate-fade-in-up">
          {sectionContent[activeSection]}
        </main>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-left { animation: fade-in-left 0.8s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
};

export default Documentation; 