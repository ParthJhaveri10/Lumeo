/**
 * @fileoverview Main App - Spotify-style Music Player
 * @version 3.0.0
 */

import React, { useState } from 'react';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import SearchSection from './components/SearchSection';
import ArtistProfile from './components/ArtistProfile';
import NowPlaying from './components/NowPlaying';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'home' | 'search' | 'artist'>('home');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  const handleArtistClick = (artistId: string) => {
    setSelectedArtistId(artistId);
    setActiveView('artist');
  };

  const handleBackFromArtist = () => {
    setActiveView('search');
    setSelectedArtistId(null);
  };

  return (
    <MusicPlayerProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1410 0%, #2d2416 100%)' }}>
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex md:w-72 h-full flex-shrink-0 flex-col border-r-2" style={{ 
          background: 'linear-gradient(180deg, #242424 0%, #1f1f1f 100%)',
          borderColor: '#3a3a3a',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Logo */}
          <div className="p-8 border-b" style={{ borderColor: '#3a3a3a' }}>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ 
              color: '#FFB84D',
              letterSpacing: '1px'
            }}>
              <span className="text-4xl">☀</span> LUMEO
            </h1>
            <p className="text-sm mt-2" style={{ color: '#a0a0a0' }}>Your Music, Radiant</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col px-4 mt-6">
            <button
              onClick={() => setActiveView('home')}
              className="w-full text-left px-6 py-4 rounded-xl mb-3 transition-all duration-300"
              style={{ 
                color: activeView === 'home' ? '#1a1a1a' : '#e5e5e5',
                background: activeView === 'home' ? 'linear-gradient(135deg, #FFB84D 0%, #FFA726 100%)' : 'transparent',
                border: activeView === 'home' ? '2px solid #FFB84D' : '2px solid transparent',
                boxShadow: activeView === 'home' ? '0 4px 12px rgba(255, 184, 77, 0.4)' : 'none',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'home') {
                  e.currentTarget.style.background = 'rgba(255, 184, 77, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 184, 77, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'home') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Home</span>
              </div>
            </button>

            <button
              onClick={() => setActiveView('search')}
              className="w-full text-left px-6 py-4 rounded-xl mb-3 transition-all duration-300"
              style={{ 
                color: activeView === 'search' ? '#1a1a1a' : '#e5e5e5',
                background: activeView === 'search' ? 'linear-gradient(135deg, #FFB84D 0%, #FFA726 100%)' : 'transparent',
                border: activeView === 'search' ? '2px solid #FFB84D' : '2px solid transparent',
                boxShadow: activeView === 'search' ? '0 4px 12px rgba(255, 184, 77, 0.4)' : 'none',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'search') {
                  e.currentTarget.style.background = 'rgba(255, 184, 77, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 184, 77, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'search') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span>Search</span>
              </div>
            </button>
          </nav>

          {/* Footer Info */}
          <div className="p-6 border-t" style={{ borderColor: '#3a3a3a' }}>
            <p className="text-xs flex items-center gap-1" style={{ color: '#a0a0a0' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Powered by Saavn
            </p>
            <p className="text-xs mt-1" style={{ color: '#FFB84D' }}>Lumeo v3.0.0</p>
          </div>
        </aside>

        {/* Main Content Area - Full width on mobile, beside sidebar on desktop */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Content - with bottom padding on mobile for nav + player */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-[240px] md:pb-24" style={{ 
            background: 'linear-gradient(135deg, rgba(26, 20, 16, 0.6) 0%, rgba(45, 36, 22, 0.4) 100%)'
          }}>
            {activeView === 'home' && (
              <div>
                {/* Animated Hero Section */}
                <div className="relative mb-8 md:mb-16 overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-12" style={{
                  background: 'linear-gradient(135deg, rgba(255, 184, 77, 0.1) 0%, rgba(255, 143, 0, 0.05) 50%, rgba(255, 184, 77, 0.1) 100%)',
                  border: '2px solid rgba(255, 184, 77, 0.2)',
                  boxShadow: '0 8px 32px rgba(255, 143, 0, 0.2)'
                }}>
                  {/* Floating Music Notes Background */}
                  <div className="absolute inset-0 opacity-10 hidden md:block" style={{ pointerEvents: 'none' }}>
                    <div className="absolute" style={{ top: '10%', left: '10%', fontSize: '48px', animation: 'float 6s ease-in-out infinite' }}>♪</div>
                    <div className="absolute" style={{ top: '70%', left: '80%', fontSize: '36px', animation: 'float 8s ease-in-out infinite 1s' }}>♫</div>
                    <div className="absolute" style={{ top: '40%', right: '15%', fontSize: '42px', animation: 'float 7s ease-in-out infinite 2s' }}>♬</div>
                    <div className="absolute" style={{ bottom: '20%', left: '25%', fontSize: '38px', animation: 'float 9s ease-in-out infinite 1.5s' }}>♩</div>
                  </div>

                  <div className="relative text-center">
                    {/* Vinyl Record Icon */}
                    <div className="inline-flex items-center justify-center mb-4 md:mb-8" style={{
                      width: '80px',
                      height: '80px',
                      background: 'radial-gradient(circle, #1a1a1a 0%, #1a1a1a 35%, #FFB84D 35%, #FFB84D 38%, #2a2a2a 38%, #2a2a2a 100%)',
                      borderRadius: '50%',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 184, 77, 0.3)',
                      border: '3px solid #FFB84D',
                      animation: 'spin 20s linear infinite'
                    }}>
                      <div className="w-5 h-5 md:w-10 md:h-10" style={{
                        background: '#FFB84D',
                        borderRadius: '50%',
                        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                      }}></div>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold mb-3 md:mb-4" style={{ 
                      background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 50%, #FFB84D 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '2px',
                      textShadow: '0 0 40px rgba(255, 184, 77, 0.3)',
                      animation: 'gradient 3s ease infinite'
                    }}>
                      LUMEO
                    </h1>
                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <div className="hidden md:block" style={{ height: '2px', width: '60px', background: 'linear-gradient(90deg, transparent, #FFB84D, transparent)' }}></div>
                      <p className="text-sm md:text-xl" style={{ color: '#FFB84D', fontWeight: '600', letterSpacing: '1px' }}>
                        YOUR MUSIC, YOUR WAY
                      </p>
                      <div className="hidden md:block" style={{ height: '2px', width: '60px', background: 'linear-gradient(90deg, transparent, #FFB84D, transparent)' }}></div>
                    </div>
                    <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4" style={{ color: '#a0a0a0', lineHeight: '1.7' }}>
                      Listen to millions of songs instantly. No signup needed.
                    </p>
                  </div>
                </div>

                {/* Wave Divider */}
                <div className="hidden md:flex items-center gap-2 mb-12">
                  {[...Array(50)].map((_, i) => (
                    <div key={i} style={{
                      width: '8px',
                      height: `${20 + Math.sin(i * 0.5) * 15}px`,
                      background: `rgba(255, 184, 77, ${0.3 + Math.sin(i * 0.3) * 0.3})`,
                      borderRadius: '4px',
                      animation: `wave 2s ease-in-out infinite ${i * 0.05}s`
                    }}></div>
                  ))}
                </div>

                {/* Interactive Feature Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
                  {/* Card 1 - Immersive */}
                  <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-8 transition-all hover:scale-105 cursor-pointer" style={{
                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                    border: '2px solid #3a3a3a',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                  }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{
                      background: 'radial-gradient(circle, #FFB84D 0%, transparent 70%)',
                      filter: 'blur(40px)'
                    }}></div>
                    <div className="relative">
                      <div className="text-4xl md:text-6xl mb-3 md:mb-4 inline-block" style={{
                        filter: 'drop-shadow(0 0 20px rgba(255, 184, 77, 0.5))'
                      }}>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                      <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-3" style={{ color: '#FFB84D' }}>
                        High Quality Audio
                      </h3>
                      <p className="text-base md:text-lg" style={{ color: '#a0a0a0', lineHeight: '1.6' }}>
                        Stream music in 320kbps quality. Sounds crisp on any device.
                      </p>
                      <div className="mt-4 flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{
                            width: '8px',
                            height: `${i * 8}px`,
                            background: '#FFB84D',
                            borderRadius: '2px',
                            animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`
                          }}></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2 - Discovery */}
                  <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-8 transition-all hover:scale-105 cursor-pointer" style={{
                    background: 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)',
                    border: '2px solid #3a3a3a',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                  }}>
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-20" style={{
                      background: 'radial-gradient(circle, #FF8F00 0%, transparent 70%)',
                      filter: 'blur(40px)'
                    }}></div>
                    <div className="relative">
                      <div className="text-4xl md:text-6xl mb-3 md:mb-4 inline-block" style={{
                        filter: 'drop-shadow(0 0 20px rgba(255, 143, 0, 0.5))'
                      }}>
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-3" style={{ color: '#FFB84D' }}>
                        Search Anything
                      </h3>
                      <p className="text-base md:text-lg" style={{ color: '#a0a0a0', lineHeight: '1.6' }}>
                        Type it in, hit enter. That's it.
                      </p>
                      <div className="mt-3 md:mt-4 flex gap-1 flex-wrap">
                        <div className="px-2 md:px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255, 184, 77, 0.2)', color: '#FFB84D' }}>Songs</div>
                        <div className="px-2 md:px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255, 184, 77, 0.2)', color: '#FFB84D' }}>Artists</div>
                        <div className="px-2 md:px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255, 184, 77, 0.2)', color: '#FFB84D' }}>Albums</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start Listening CTA */}
                <div className="text-center mb-8 md:mb-12">
                  <button
                    onClick={() => setActiveView('search')}
                    className="group relative px-8 md:px-12 py-3 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-xl transition-all overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                      color: '#1a1a1a',
                      border: '3px solid #FFB84D',
                      boxShadow: '0 8px 30px rgba(255, 143, 0, 0.4)'
                    }}
                  >
                    <span className="relative z-10">Let's Go</span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                      background: 'linear-gradient(135deg, #FF8F00 0%, #FFB84D 100%)'
                    }}></div>
                  </button>
                  <p className="mt-4 text-sm" style={{ color: '#a0a0a0' }}>
                    No signup needed • Just start listening
                  </p>
                </div>

                {/* Quick Access Search */}
                <div className="rounded-2xl md:rounded-3xl p-4 md:p-8 relative overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.5) 0%, rgba(31, 31, 31, 0.5) 100%)',
                  border: '2px solid rgba(255, 184, 77, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5" style={{
                    background: 'radial-gradient(circle, #FFB84D 0%, transparent 70%)',
                    filter: 'blur(60px)'
                  }}></div>
                  <h2 className="text-xl md:text-3xl font-bold mb-2 relative" style={{ color: '#FFB84D' }}>
                    Jump Right In
                  </h2>
                  <p className="mb-6 relative" style={{ color: '#a0a0a0' }}>
                    Search for your favorite music and start listening instantly
                  </p>
                  <div className="relative">
                    <SearchSection />
                  </div>
                </div>

                {/* Add keyframe animations */}
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                  }
                  @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                  @keyframes wave {
                    0%, 100% { height: 20px; }
                    50% { height: 40px; }
                  }
                  @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                  }
                `}</style>
              </div>
            )}

            {activeView === 'search' && (
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#e5e5e5' }}>
                  Search Music
                </h2>
                <SearchSection onArtistClick={handleArtistClick} />
              </div>
            )}

            {activeView === 'artist' && selectedArtistId && (
              <div className="h-full">
                <ArtistProfile artistId={selectedArtistId} onBack={handleBackFromArtist} />
              </div>
            )}
          </div>

          {/* Now Playing Bar - Above bottom nav on mobile */}
          <NowPlaying />
        </main>

        {/* Mobile Bottom Navigation - Spotify Style */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t-2 flex justify-around items-center" 
             style={{ 
               background: 'linear-gradient(180deg, #242424 0%, #1f1f1f 100%)',
               borderColor: '#3a3a3a',
               boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
               height: '80px',
               paddingBottom: 'env(safe-area-inset-bottom)'
             }}>
          <button
            onClick={() => setActiveView('home')}
            className="flex flex-col items-center justify-center px-4 py-2 transition-all duration-300"
            style={{ 
              color: activeView === 'home' ? '#FFB84D' : '#a0a0a0',
              minWidth: '80px'
            }}
          >
            <svg className="w-7 h-7 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs font-semibold">Home</span>
          </button>

          <button
            onClick={() => setActiveView('search')}
            className="flex flex-col items-center justify-center px-4 py-2 transition-all duration-300"
            style={{ 
              color: activeView === 'search' || activeView === 'artist' ? '#FFB84D' : '#a0a0a0',
              minWidth: '80px'
            }}
          >
            <svg className="w-7 h-7 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold">Search</span>
          </button>
        </nav>
      </div>
    </MusicPlayerProvider>
  );
};

export default App;
