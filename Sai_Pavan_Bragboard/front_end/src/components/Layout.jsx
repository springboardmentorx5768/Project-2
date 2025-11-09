import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout; // This makes the component available for import