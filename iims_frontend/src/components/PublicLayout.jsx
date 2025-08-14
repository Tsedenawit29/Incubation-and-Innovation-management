import React from "react";
import Navbar from "../components/iimsNavbar";
import Footer from "../components/iims_Footer"; // adjust path if needed

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-6 bg-gray-50 pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
