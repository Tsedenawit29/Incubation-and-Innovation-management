import React, { useState } from 'react';
import { FaRocket, FaMoneyBillWave, FaChalkboardTeacher, FaChartLine, FaLightbulb, FaGlobe, FaUsers, FaTrophy, FaCogs } from 'react-icons/fa';
import Testimonials from '../components/Testimonials';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

const metrics = [
  { icon: <FaRocket size={28} />, label: 'Startups Incubated', value: 24 },
  { icon: <FaMoneyBillWave size={28} />, label: 'ETB in Funding', value: '4.2M' },
  { icon: <FaChalkboardTeacher size={28} />, label: 'Active Mentors', value: 12 },
  { icon: <FaChartLine size={28} />, label: 'Graduation Rate', value: '87%' },
];

const categories = ['Fintech', 'AgriTech', 'HealthTech', 'GreenTech', 'EdTech'];

const features = [
  { label: 'Startup Onboarding', icon: <FaRocket size={22} /> },
  { label: 'Mentorship Programs', icon: <FaChalkboardTeacher size={22} /> },
  { label: 'Pitch Competitions', icon: <FaMoneyBillWave size={22} /> },
  { label: 'Innovation Tracking', icon: <FaChartLine size={22} /> },
  { label: 'Resource Management', icon: <FaMoneyBillWave size={22} /> },
  { label: 'Progress Monitoring', icon: <FaChartLine size={22} /> },
];

const Home = () => {
  return (
    <div className="relative px-4 py-8 max-w-6xl mx-auto">
      {/* Artistic floating shapes */}
      <div className="pointer-events-none select-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#299DFF] rounded-full opacity-10 blur-2xl animate-float-slow z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0A2D5C] rounded-full opacity-10 blur-2xl animate-float-slower z-0" />
      </div>

      {/* Mission & Vision */}
      <section className="mb-20 relative z-10 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Image - image only, no border box or decorative shape */}
          <img
            src="/mission-vision.jpg" // Replace with your actual image path
            alt="Mission illustration"
          />
          {/* Right Content */}
          <div className="relative bg-gradient-to-r from-[#299DFF]/10 to-[#0A2D5C]/10 rounded-2xl shadow-xl p-10 overflow-hidden group transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            {/* Artistic floating shapes */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#299DFF] rounded-full opacity-20 blur-2xl animate-float-slow z-0" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0A2D5C] rounded-full opacity-20 blur-2xl animate-float-slower z-0" />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[#0A2D5C] to-[#299DFF] text-transparent bg-clip-text mb-4 drop-shadow-lg">
                Our Mission & Vision
              </h2>
              <p className="text-lg text-gray-800 leading-relaxed tracking-wide">
                Our mission is to nurture and empower the next generation of Ethiopian innovators and entrepreneurs by providing world-class incubation, mentorship, and resources.<br /><br />
                We envision a thriving ecosystem where startups can grow, connect, and make a global impact.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Who We Serve */}
      <section className="mb-20 relative z-10 animate-fade-in-up flex flex-col items-center justify-center">
        <h2 className="text-3xl font-extrabold text-[#0A2D5C] mb-2 text-center">Who We Serve</h2>
        <p className="text-base text-[#0A2D5C] mb-8 text-center">We support a diverse range of stakeholders in their journey towards innovation and growth</p>
        <div className="relative w-full flex items-center justify-center" style={{ minHeight: '480px' }}>
          {/* Central Image */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <img
              src="/logo.jpeg" // Replace with your actual image path
              alt="Team Leader"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#299DFF] shadow-2xl mb-2 animate-float"
              style={{ background: 'white' }}
            />
          </div>
          {/* Service Spheres with content */}
          {[
            {
              label: 'Students & Researchers',
              angle: 0,
            },
            {
              label: 'Startups & Entrepreneurs',
              angle: 60,
            },
            {
              label: 'Small & Medium Enterprises',
              angle: 120,
            },
            {
              label: 'Research Institutions',
              angle: 180,
            },
            {
              label: 'Industry Partners',
              angle: 240,
            },
            {
              label: 'Government Agencies',
              angle: 300,
            },
          ].map((service, idx) => {
            const radius = 180; // px
            const rad = (service.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            return (
              <div
                key={service.label}
                className="absolute z-10 flex flex-col items-center group"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: '210px',
                }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-[#299DFF] to-[#0A2D5C] border-4 border-white cursor-pointer transition-transform duration-300 group-hover:scale-110 relative mb-2"
                  style={{
                    boxShadow: '0 8px 32px 0 rgba(41,157,255,0.25), 0 1.5px 0 0 #fff inset',
                    background: 'linear-gradient(135deg, #299DFF 60%, #0A2D5C 100%)',
                  }}
                >
                  {/* Glossy effect */}
                  <div className="absolute left-2 top-2 w-16 h-6 bg-white/40 rounded-full blur-sm opacity-70 pointer-events-none" />
                  <span className="text-white font-bold text-center text-xs drop-shadow-lg z-10 px-2">
                    {service.label}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Optional: SVG lines for visual connection */}
          <svg className="absolute left-0 top-0 w-full h-full pointer-events-none z-0" width="100%" height="100%">
            {[
              0, 60, 120, 180, 240, 300
            ].map((angle, idx) => {
              const radius = 180;
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={idx}
                  x1="50%" y1="50%"
                  x2={`${50 + Math.cos(rad) * radius * 0.9}%`} y2={`${50 + Math.sin(rad) * radius * 0.9}%`}
                  stroke="#299DFF" strokeWidth="2" opacity="0.2"
                />
              );
            })}
          </svg>
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-20 relative z-10 animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-[#0A2D5C] mb-8 text-center">Key Features</h2>
        <div className="relative">
          {/* Artistic floating shapes */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#299DFF] rounded-full opacity-10 blur-2xl animate-float-slow z-0" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0A2D5C] rounded-full opacity-10 blur-2xl animate-float-slower z-0" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {[
              {
                title: 'Incubation and Innovation Management',
                desc: 'Guiding innovation and managing the incubation process to help startups scale and succeed.',
                icon: <FaCogs size={36} className="text-[#299DFF] drop-shadow" />,
              },
              {
                title: 'Innovation',
                desc: 'We foster creativity and innovation in every step.',
                icon: <FaLightbulb size={36} className="text-[#0A2D5C] drop-shadow" />,
              },
              {
                title: 'Growth',
                desc: 'Empowering businesses to grow exponentially.',
                icon: <FaChartLine size={36} className="text-[#299DFF] drop-shadow" />,
              },
              {
                title: 'Global Reach',
                desc: 'Connecting startups to global opportunities.',
                icon: <FaGlobe size={36} className="text-[#0A2D5C] drop-shadow" />,
              },
              {
                title: 'Collaboration',
                desc: 'Encouraging teamwork and knowledge sharing.',
                icon: <FaUsers size={36} className="text-[#299DFF] drop-shadow" />,
              },
              {
                title: 'Results',
                desc: 'Delivering measurable success and impact.',
                icon: <FaTrophy size={36} className="text-[#0A2D5C] drop-shadow" />,
              },
            ].map((feature, idx) => (
              <div
                key={feature.title}
                className="group bg-gradient-to-br from-[#299DFF]/20 to-[#0A2D5C]/10 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Artistic floating gloss */}
                <div className="absolute top-2 left-2 w-20 h-8 bg-white/30 rounded-full blur-md opacity-60 pointer-events-none z-0" />
                <span className="mb-4 drop-shadow-lg z-10" aria-hidden>{feature.icon}</span>
                <h3 className="text-xl font-bold text-[#0A2D5C] mb-2 z-10 bg-gradient-to-r from-[#0A2D5C] to-[#299DFF] text-transparent bg-clip-text">
                  {feature.title}
                </h3>
                <p className="text-base text-[#0A2D5C] z-10 font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="mb-20 relative z-10 animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-[#0A2D5C] mb-8 text-center">Testimonials</h2>
        <Testimonials />
      </section>

      {/* How It Works */}
      <section className="mb-20 relative z-10 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-[#0A2D5C] mb-8 text-center">How It Works</h2>
        <div className="flex flex-row items-center justify-center gap-6 w-full max-w-5xl mx-auto">
          {[
            'Apply through our online platform.',
            'Get matched with mentors and resources.',
            'Participate in structured incubation programs.',
            'Pitch your startup and attract investment.',
            'Graduate and scale your solution.',
          ].map((step, idx, arr) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#299DFF] to-[#0A2D5C] text-white text-2xl font-extrabold mb-2 shadow-lg transition-transform duration-300 transform hover:scale-110 hover:shadow-2xl select-none">
                  {idx + 1}
                </div>
                <p className="text-sm text-[#0A2D5C] text-center max-w-[160px] font-medium">{step}</p>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex items-center justify-center">
                  <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12H32M32 12L24 4M32 12L24 20" stroke="#299DFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full flex flex-col items-center justify-center py-16">
        <div className="bg-gradient-to-r from-[#299DFF] to-[#0A2D5C] rounded-2xl shadow-lg px-8 py-12 flex flex-col items-center max-w-2xl w-full">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 text-center drop-shadow">Ready to take your innovation to the next level?</h2>
          <p className="text-lg text-blue-100 mb-8 text-center">Apply now to join our incubation program and turn your ideas into reality!</p>
          <Link
            to="/application"
            className="inline-block bg-white text-[#0A2D5C] font-bold px-8 py-3 rounded-full shadow-md hover:bg-[#299DFF] hover:text-white transition-colors duration-200 text-lg"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

const testimonials = [
  {
    name: 'Alemu T.',
    role: 'Startup Founder',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    feedback: 'The incubation program transformed my idea into a real business. The mentorship and resources were invaluable!'
  },
  {
    name: 'Sara M.',
    role: 'Entrepreneur',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    feedback: 'I loved the supportive community and the opportunities to connect with investors and partners.'
  },
  {
    name: 'Kebede G.',
    role: 'Researcher',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    feedback: 'The innovation hub helped me turn my research into a product that is now making a difference.'
  },
  {
    name: 'Mekdes A.',
    role: 'Mentor',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    feedback: 'It’s inspiring to work with such passionate founders and see their growth firsthand.'
  },
];

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const prev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="relative w-full">
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 min-h-[260px]">
          <img
            src={testimonials[current].image}
            alt={testimonials[current].name}
            className="w-20 h-20 rounded-full object-cover border-4 border-[#299DFF] shadow-lg mb-4"
          />
          <p className="text-lg text-gray-700 italic mb-4 text-center">“{testimonials[current].feedback}”</p>
          <div className="font-bold text-[#0A2D5C] text-base">{testimonials[current].name}</div>
          <div className="text-sm text-[#299DFF]">{testimonials[current].role}</div>
        </div>
        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-[#299DFF] text-[#299DFF] rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-[#299DFF] hover:text-white transition-colors duration-200"
          aria-label="Previous testimonial"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-[#299DFF] text-[#299DFF] rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-[#299DFF] hover:text-white transition-colors duration-200"
          aria-label="Next testimonial"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {/* Dots */}
      <div className="flex gap-2 mt-4">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${current === idx ? 'bg-[#299DFF]' : 'bg-gray-300'} transition-colors duration-200`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
