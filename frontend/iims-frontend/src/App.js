import { Routes, Route } from 'react-router-dom';
import Navbar from './apps/PortfolioApp/components/Navbar';
import HeroSection from './apps/PortfolioApp/components/HeroSection';
import Footer from './apps/shared/components/Footer';
import Home from './apps/PortfolioApp/pages/Home';
import Projects from './apps/PortfolioApp/pages/Projects';
import Contact from './apps/PortfolioApp/pages/Contact';

const App = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-6 bg-gray-50 pt-20">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <Home />
              </>
            }
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
