/**
 * @fileoverview Main App - Modern Music Player
 * @version 3.0.0
 */

import React, { useState } from 'react';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import SearchSection from './components/SearchSection';
import NowPlaying from './components/NowPlaying';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'search'>('home');

  return (
    <MusicPlayerProvider>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
        {/* Top Navbar */}
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-3 backdrop-blur-xl" style={{ 
          background: 'rgba(15, 15, 15, 0.95)',
          borderBottom: '1px solid rgba(255, 184, 77, 0.2)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.8)'
        }}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
              boxShadow: '0 2px 10px rgba(255, 184, 77, 0.5)'
            }}>
              <span className="text-lg">☀</span>
            </div>
            <h1 className="text-xl font-bold" style={{ 
              background: 'linear-gradient(90deg, #FFB84D 0%, #FF8F00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px'
            }}>
              LUMEO
            </h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveView('home')}
              className="px-5 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{ 
                background: activeView === 'home' ? 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)' : 'transparent',
                color: activeView === 'home' ? '#0a0a0a' : '#e5e5e5',
                border: `1px solid ${activeView === 'home' ? '#FFB84D' : 'rgba(255, 184, 77, 0.3)'}`
              }}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('search')}
              className="px-5 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{ 
                background: activeView === 'search' ? 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)' : 'transparent',
                color: activeView === 'search' ? '#0a0a0a' : '#e5e5e5',
                border: `1px solid ${activeView === 'search' ? '#FFB84D' : 'rgba(255, 184, 77, 0.3)'}`
              }}
            >
              Search
            </button>
          </nav>

          {/* Version Badge */}
          <div className="text-xs px-3 py-1 rounded-full" style={{ 
            background: 'rgba(255, 184, 77, 0.1)',
            border: '1px solid rgba(255, 184, 77, 0.2)',
            color: '#FFB84D'
          }}>
            v3.0
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0a0a0a' }}>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8" style={{ background: '#0a0a0a' }}>
            {activeView === 'home' && (
              <div className="max-w-7xl mx-auto">
                {/* Hero Section - Simplified */}
                <div className="relative mb-12 rounded-2xl p-10 text-center" style={{
                  background: 'linear-gradient(135deg, rgba(255, 184, 77, 0.08) 0%, rgba(255, 143, 0, 0.05) 100%)',
                  border: '1px solid rgba(255, 184, 77, 0.15)'
                }}>
                  <div className="inline-block mb-6 text-7xl" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 184, 77, 0.6))' }}>☀</div>
                  <h1 className="text-6xl font-bold mb-4" style={{ 
                    background: 'linear-gradient(90deg, #FFB84D 0%, #FF8F00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '3px'
                  }}>
                    LUMEO
                  </h1>
                  <p className="text-xl mb-2" style={{ color: '#FFB84D', fontWeight: '600' }}>
                    Your Music, Radiant
                  </p>
                  <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#a0a0a0' }}>
                    Stream millions of tracks in stunning quality
                  </p>
                  <button
                    onClick={() => setActiveView('search')}
                    className="px-8 py-3 rounded-xl font-bold text-base transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                      color: '#0a0a0a',
                      border: '2px solid #FFB84D',
                      boxShadow: '0 4px 20px rgba(255, 143, 0, 0.4)'
                    }}
                  >
                    Start Listening
                  </button>
                </div>

                {/* Feature Cards - Simplified */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="rounded-xl p-6" style={{
                    background: 'rgba(255, 184, 77, 0.05)',
                    border: '1px solid rgba(255, 184, 77, 0.15)'
                  }}>
                    <div className="text-4xl mb-3">🎵</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#FFB84D' }}>Premium Sound</h3>
                    <p className="text-sm" style={{ color: '#a0a0a0' }}>320kbps crystal clear quality</p>
                  </div>
                  <div className="rounded-xl p-6" style={{
                    background: 'rgba(255, 184, 77, 0.05)',
                    border: '1px solid rgba(255, 184, 77, 0.15)'
                  }}>
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#FFB84D' }}>Smart Search</h3>
                    <p className="text-sm" style={{ color: '#a0a0a0' }}>Find any track instantly</p>
                  </div>
                  <div className="rounded-xl p-6" style={{
                    background: 'rgba(255, 184, 77, 0.05)',
                    border: '1px solid rgba(255, 184, 77, 0.15)'
                  }}>
                    <div className="text-4xl mb-3">📱</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#FFB84D' }}>Modern UI</h3>
                    <p className="text-sm" style={{ color: '#a0a0a0' }}>Beautiful & intuitive</p>
                  </div>
                </div>

                {/* Quick Search */}
                <div className="rounded-xl p-6" style={{
                  background: 'rgba(255, 184, 77, 0.05)',
                  border: '1px solid rgba(255, 184, 77, 0.15)'
                }}>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#FFB84D' }}>
                    Start Searching
                  </h2>
                  <SearchSection />
                </div>
              </div>
            )}

            {activeView === 'search' && (
              <div className="max-w-7xl mx-auto">
                <SearchSection />
              </div>
            )}
          </div>

          {/* Now Playing Bar - Fixed at Bottom */}
          <NowPlaying />
        </main>
      </div>
    </MusicPlayerProvider>
  );
};

export default App;
