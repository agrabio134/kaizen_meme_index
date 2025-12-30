// AppContent.js - Updated with new logo URL
import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Swal from 'sweetalert2';

const AppContent = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const copyCa = () => {
    navigator.clipboard.writeText('3ejk8LXAS9kUC7XhpDGHRjARyUy5qU7PaAq7PMykpump');
    Swal.fire({
      title: 'Copied!',
      text: 'Contract address copied to clipboard',
      icon: 'success',
      timer: 1800,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      background: '#000',
      color: '#0f0',
    });
  };

  return (
    <div className="app">
      <header className="header-cyberpunk">
        <div className="scanline-top" />
        <div className="scanline-bottom" />
        <div className="header-glow-left" />
        <div className="header-glow-right" />
        <div className="header-grid-overlay" />

        <div className="header-inner">
          <div className="brand-section">
            <div className="logo-container">
              <div className="logo-ring-outer">
                <div className="logo-ring-inner">
                  <img 
                    src="https://l5fpqchmvmrcwa0k.public.blob.vercel-storage.com/character-avatars/e2bde479-5ea5-424c-b36b-cd51d8cd0aab/1766937255758-photo_6235780279272410482_y.jpg" 
                    alt="KAIZEN-OS" 
                    className="logo-img" 
                  />
                </div>
              </div>
            </div>

            <div className="title-container">
              <h1 className="title-main glitch-cyber">KAIZEN-OS</h1>
              <div className="title-sub">ADVANCED MEME INDEX TERMINAL</div>
            </div>
          </div>

          <div className="ca-module">
            <button className="ca-button neon-frame" onClick={copyCa}>
              <span className="ca-label">CONTRACT ADDRESS</span>
              <span className="ca-hash">3ejk8LXA...Mykpump</span>
            </button>
          </div>
        </div>
      </header>

      <Dashboard isMobile={isMobile} />
    </div>
  );
};

export default AppContent;