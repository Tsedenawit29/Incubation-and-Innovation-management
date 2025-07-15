import { Routes, Route } from 'react-router-dom';
import Navbar from './apps/PortfolioApp/components/Navbar';
import HeroSection from './apps/PortfolioApp/components/HeroSection';
import Footer from './apps/shared/components/Footer';
import Home from './apps/PortfolioApp/pages/Home';
import Contact from './apps/PortfolioApp/pages/Contact';
import Application from './apps/PortfolioApp/pages/Application';
import Documentation from './apps/PortfolioApp/pages/Documentation';

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
          <Route path="/contact" element={<Contact />} />
          <Route path="/application" element={<Application />} />
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
