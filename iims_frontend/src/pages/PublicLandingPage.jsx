import React, { useEffect, useState } from 'react';
import { getLandingPage } from '../api/landingPage';
import { useParams } from 'react-router-dom';
import { FaRocket, FaInfoCircle, FaEnvelope, FaFolderOpen, FaCogs, FaUserPlus, FaUserTie, FaQuoteLeft, FaUsers, FaQuestionCircle, FaImages } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaGithub } from 'react-icons/fa';

const SOCIALS = [
  { name: "Facebook", color: "#1877F3", icon: FaFacebook },
  { name: "Twitter", color: "#1DA1F2", icon: FaTwitter },
  { name: "LinkedIn", color: "#0077B5", icon: FaLinkedin },
  { name: "Instagram", color: "#E4405F", icon: FaInstagram },
  { name: "YouTube", color: "#FF0000", icon: FaYoutube },
  { name: "GitHub", color: "#333", icon: FaGithub },
];

const SECTION_LABELS = {
  HERO: 'Home',
  ABOUT: 'About',
  PROJECTS: 'Projects',
  TEAM: 'Team',
  TESTIMONIALS: 'Testimonials',
  FAQ: 'FAQ',
  GALLERY: 'Gallery',
  CONTACT: 'Contact',
  CUSTOM: 'Custom',
};

export default function PublicLandingPage() {
  const { tenantId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLandingPage(tenantId, true)
      .then(setData)
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Landing page not found.</div>;

  const themeColor = data.themeColor || '#299DFF';
  const themeColor2 = data.themeColor2 || '#43a047';
  const themeColor3 = data.themeColor3 || '#fbc02d';
  const logo = data.sections?.find(s => s.type === 'HERO')?.contentJson ? JSON.parse(data.sections.find(s => s.type === 'HERO').contentJson).logo : null;
  const tenantName = data.tenantName || data.sections?.find(s => s.type === 'HERO')?.contentJson ? JSON.parse(data.sections.find(s => s.type === 'HERO').contentJson).title : 'Landing Page';

  // Build section links for navbar/footer
  const sectionLinks = (data.sections || []).map((section, idx) => ({
    id: SECTION_LABELS[section.type]?.toLowerCase() || `section${idx}`,
    label: SECTION_LABELS[section.type] || `Section ${idx + 1}`
  }));

  function renderSection(section, idx) {
    const content = section.contentJson ? JSON.parse(section.contentJson) : {};
    const sectionBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    const sectionId = SECTION_LABELS[section.type]?.toLowerCase() || `section${idx}`;
    switch (section.type) {
      case 'HERO':
        return (
          <section id={sectionId} className="w-full min-h-screen flex items-center justify-center relative" style={{ fontFamily: 'Inter, sans-serif', background: content.bgImage ? `url(${content.bgImage}) center/cover no-repeat` : themeColor }}>
            <div className="absolute inset-0 bg-black bg-opacity-40" style={{zIndex:1}}></div>
            <div className="relative z-10 flex flex-col items-center justify-start w-full max-w-3xl mx-auto px-4 text-center pt-10" style={{minHeight: '70vh'}}>
              {/* Logo removed from here */}
              <h1 className="text-5xl md:text-7xl font-extrabold mb-2 text-white drop-shadow-lg" style={{letterSpacing: '-0.03em'}}>{content.title}</h1>
              <h2 className="text-2xl md:text-3xl mb-4 text-white/90 font-medium max-w-4xl mx-auto leading-snug line-clamp-4" style={{minHeight: 'unset'}}>{content.subtitle}</h2>
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-0">
                {content.ctas && content.ctas.slice(0,2).map((cta, idx) => (
                  <a key={idx} href="#" className="px-8 py-4 rounded-full font-bold shadow-lg transition text-white text-lg bg-brand-primary hover:opacity-90 flex items-center gap-2" style={{background: themeColor, minWidth: '180px'}}>
                    {cta.type === 'startup' ? <FaUserPlus /> : <FaUserTie />} {cta.label}
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      case 'ABOUT':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
              {content.image && <img src={content.image} alt="about" className="h-40 w-40 mb-8 md:mb-0 rounded-2xl object-cover border-4 border-gray-200 shadow-lg" style={{objectFit: 'cover'}} />}
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-4 flex items-center gap-3 text-brand-primary" style={{color: themeColor2}}><FaInfoCircle /> {content.title}</h2>
                <p className="text-xl text-gray-700 leading-relaxed">{content.description}</p>
              </div>
            </div>
          </section>
        );
      case 'CONTACT':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">
              {/* Contact Form */}
              <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 mb-8 md:mb-0">
                <h3 className="text-2xl font-bold mb-4 text-left">Send us a message</h3>
                <form className="space-y-4">
                  <div className="flex gap-4">
                    <input type="text" placeholder="First Name" className="w-1/2 border rounded px-4 py-2" />
                    <input type="text" placeholder="Last Name" className="w-1/2 border rounded px-4 py-2" />
                  </div>
                  <div className="flex gap-4">
                    <input type="email" placeholder="Email" className="w-1/2 border rounded px-4 py-2" />
                    <input type="text" placeholder="Phone" className="w-1/2 border rounded px-4 py-2" />
                  </div>
                  <textarea placeholder="Message" className="w-full border rounded px-4 py-2 min-h-[100px]" />
                  <button type="button" className="w-full bg-brand-primary text-white font-bold py-3 rounded-full text-lg hover:opacity-90 transition" style={{background: themeColor}}>Send Message</button>
                </form>
              </div>
              {/* Contact Info Card */}
              <div className="flex-1 bg-brand-primary text-white rounded-2xl shadow-lg p-8 flex flex-col items-center md:items-start">
                <h3 className="text-xl font-bold mb-4">Hi! We are always here to help you.</h3>
                <div className="mb-4 w-full">
                  {content.phone && <div className="flex items-center gap-2 mb-2"><span className="font-semibold">Hotline:</span> <span>{content.phone}</span></div>}
                  {content.whatsapp && <div className="flex items-center gap-2 mb-2"><span className="font-semibold">SMS / WhatsApp:</span> <span>{content.whatsapp}</span></div>}
                  {content.email && <div className="flex items-center gap-2 mb-2"><span className="font-semibold">Email:</span> <span>{content.email}</span></div>}
                </div>
                <div className="flex gap-3 mt-2">
                  {SOCIALS.map(({ name, color, icon: Icon }) =>
                    data.socialLinks && data.socialLinks[name] ? (
                      <a
                        key={name}
                        href={data.socialLinks[name]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ background: color }}
                        className="rounded-full p-2 hover:opacity-80 transition text-white"
                        aria-label={name}
                        title={name}
                      >
                        <Icon size={20} />
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      case 'PROJECTS':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 text-brand-primary" style={{color: themeColor}}><FaFolderOpen /> Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(content.projects || []).map((proj, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center hover:shadow-2xl transition">
                    {proj.image && <img src={proj.image} alt="proj" className="h-24 mb-4 rounded-xl object-cover" />}
                    <h3 className="font-bold text-2xl mb-2 text-brand-primary" style={{color: themeColor2}}>{proj.title}</h3>
                    <p className="text-gray-700 text-lg text-center">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'TESTIMONIALS':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 text-brand-primary" style={{color: themeColor2}}><FaQuoteLeft /> Testimonials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(content.testimonials || []).map((testimonial, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center">
                    {testimonial.image && <img src={testimonial.image} alt="testimonial" className="h-20 w-20 mb-4 rounded-full object-cover border-4 border-gray-200 shadow" style={{objectFit: 'cover'}} />}
                    <p className="text-gray-700 italic text-lg mb-2">"{testimonial.quote}"</p>
                    <p className="font-bold text-xl" style={{color: themeColor}}>{testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'TEAM':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 text-brand-primary" style={{color: themeColor3}}><FaUsers /> Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(content.members || []).map((member, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center">
                    {member.image && <img src={member.image} alt="team" className="h-20 w-20 mb-4 rounded-full object-cover border-4 border-gray-200 shadow" style={{objectFit: 'cover'}} />}
                    <p className="font-bold text-xl mb-1" style={{color: themeColor}}>{member.name}</p>
                    <p className="text-gray-700 text-lg">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'FAQ':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 text-brand-primary" style={{color: themeColor2}}><FaQuestionCircle /> FAQ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(content.faqs || []).map((faq, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg">
                    <p className="font-bold text-xl mb-2" style={{color: themeColor}}>{faq.question}</p>
                    <p className="text-gray-700 text-lg">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'GALLERY':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 text-brand-primary" style={{color: themeColor}}><FaImages /> Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(content.images || []).map((image, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center">
                    {image && <img src={image} alt="gallery" className="h-40 w-40 object-cover rounded-full border-4 border-gray-200 shadow" style={{objectFit: 'cover'}} />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case 'CUSTOM':
        return (
          <section id={sectionId} className={`w-full py-20 ${sectionBg}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div dangerouslySetInnerHTML={{ __html: content.html }} />
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  }

  return (
    <div style={{ background: themeColor + '22', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Navbar logo={logo} tenantName={tenantName} sections={sectionLinks} themeColor={themeColor} />
      <div style={{ paddingTop: 80 }}>
        {data.sections && data.sections.length > 0 ? (
          data.sections.map((section, idx) => (
            <div key={idx}>{renderSection(section, idx)}</div>
          ))
        ) : (
          <div className="text-center text-brand-dark text-lg mt-12">No sections to display.</div>
        )}
      </div>
      <Footer logo={logo} tenantName={tenantName} links={sectionLinks} socialLinks={data.socialLinks || {}} themeColor={themeColor} />
    </div>
  );
} 