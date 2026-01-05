/**
 * @fileoverview Now Playing Audio Player - Full-featured modern music player
 * @version 4.0.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

const NowPlaying: React.FC = () => {
  const { state, playNext, playPrevious, setRepeat, addToQueue } = useMusicPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const loadedSongIdRef = useRef<string | null>(null);

  const song = state.currentSong;

  // Get audio URL from song
  const getAudioUrl = (): string => {
    if (!song?.downloadUrl || song.downloadUrl.length === 0) return '';
    
    const qualities = ['320kbps', '160kbps', '96kbps', '48kbps'];
    for (const quality of qualities) {
      const url = song.downloadUrl.find((u: any) => u.quality === quality);
      if (url?.url) return url.url;
    }
    
    return song.downloadUrl[0]?.url || '';
  };

  // Get album art
  const getAlbumArt = (): string => {
    if (!song?.image || song.image.length === 0) return '';
    
    const qualities = ['500x500', '150x150', '50x50'];
    for (const quality of qualities) {
      const img = song.image.find((i: any) => i.quality === quality);
      if (img?.url) return img.url;
    }
    
    return song.image[0]?.url || '';
  };

  // Format artist names
  const formatArtistNames = (artists: any): string => {
    if (artists?.primary && Array.isArray(artists.primary)) {
      return artists.primary.map((a: any) => a.name).join(', ');
    }
    if (artists?.all && Array.isArray(artists.all)) {
      return artists.all.map((a: any) => a.name).join(', ');
    }
    return 'Unknown Artist';
  };

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle audio events - REAL-TIME PROGRESS TRACKING
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1. TIMEUPDATE: Updates progress bar position continuously
    const handleTimeUpdate = () => {
      if (!isDragging) {  // Only update when not dragging
        const time = audio.currentTime;
        if (!isNaN(time) && time >= 0) {
          setCurrentTime(time);
        }
      }
    };
    
    // Duration tracking from multiple events for reliability
    const handleDurationChange = () => {
      const dur = audio.duration;
      if (!isNaN(dur) && dur > 0 && isFinite(dur)) {
        setDuration(dur);
      }
    };
    
    const handleLoadedData = () => {
      const dur = audio.duration;
      if (!isNaN(dur) && dur > 0 && isFinite(dur)) {
        setDuration(dur);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      playNext();
    };
    
    // Global mouseup to stop dragging anywhere
    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    // Attach all event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    document.addEventListener('mouseup', handleMouseUpGlobal);

    // Initial duration check on mount
    if (!isNaN(audio.duration) && audio.duration > 0 && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [playNext, isDragging]);

  // Set initial volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Auto-play when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.id) return;

    // Prevent re-loading the same song
    if (loadedSongIdRef.current === song.id) return;

    // Reset state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    // Load new audio
    const audioUrl = getAudioUrl();
    if (!audioUrl) return;

    console.log('Loading new song:', song.name, 'URL:', audioUrl);
    loadedSongIdRef.current = song.id;

    audio.src = audioUrl;
    audio.load();

    const handleMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        console.log('Metadata duration:', audio.duration);
      }
    };
    audio.addEventListener('loadedmetadata', handleMetadata);

    const handleCanPlay = async () => {
      try {
        // Force duration check with multiple attempts
        let attempts = 0;
        const checkDuration = () => {
          if (!isNaN(audio.duration) && audio.duration > 0) {
            setDuration(audio.duration);
            console.log('Duration locked:', audio.duration);
          } else if (attempts < 10) {
            attempts++;
            setTimeout(checkDuration, 100);
          }
        };
        checkDuration();
        
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('canplay', handleCanPlay, { once: true });

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [song?.id]);

  // Handle play/pause
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setIsPlaying(false);
    }
  };

  // Handle volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  // Cycle repeat mode
  const cycleRepeat = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeat);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeat(nextMode);
  };

  // Add to queue
  const handleAddToQueue = () => {
    if (song) {
      addToQueue(song);
    }
  };

  if (!song) return null;

  const albumArt = getAlbumArt();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  console.log('Render - Duration:', duration, 'Current:', currentTime, 'Progress:', progress);

  return (
    <div 
         className="fixed left-0 right-0 border-t backdrop-blur-xl md:bottom-0 bottom-[80px]"
         style={{ 
           background: 'linear-gradient(to top, #1f1f1f 0%, #242424 100%)', 
           borderTop: '2px solid #3a3a3a',
           boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
           zIndex: 30,
           minHeight: '140px'
         }}>
      <audio 
        ref={audioRef} 
        preload="auto"
        crossOrigin="anonymous"
      />
      
      <div className="px-4 py-3 md:px-8 md:py-4">
        {/* Main Player Row */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
          {/* Mobile: Spotify-style Full Controls */}
          <div className="flex md:hidden flex-col w-full gap-4">
            {/* Top Row: Song Info */}
            <div className="flex items-center gap-3 w-full">
              {/* Album Art */}
              {albumArt && (
                <img 
                  src={albumArt} 
                  alt={song.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  style={{ 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                    border: '1px solid #3a3a3a'
                  }}
                />
              )}
              
              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate" 
                    style={{ color: '#e5e5e5' }}
                    title={song.name}>
                  {song.name}
                </h3>
                <p className="text-sm truncate" 
                   style={{ color: '#FFB84D' }}
                   title={formatArtistNames(song.artists)}>
                  {formatArtistNames(song.artists)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs font-bold tabular-nums" style={{ color: '#FFB84D', minWidth: '40px' }}>
                {formatTime(currentTime)}
              </span>
              
              <div 
                className="relative flex-1 h-1.5 rounded-full cursor-pointer"
                style={{ background: 'rgba(255, 184, 77, 0.2)' }}
                onClick={(e) => {
                  e.preventDefault();
                  const audio = audioRef.current;
                  if (!audio || duration <= 0) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                  const newTime = (percentage / 100) * duration;
                  
                  audio.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                  const audio = audioRef.current;
                  if (!audio || duration <= 0) return;
                  
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touchX = touch.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (touchX / rect.width) * 100));
                  const newTime = (percentage / 100) * duration;
                  
                  audio.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                onTouchMove={(e) => {
                  if (!isDragging) return;
                  e.preventDefault();
                  const audio = audioRef.current;
                  if (!audio || duration <= 0) return;
                  
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touchX = touch.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (touchX / rect.width) * 100));
                  const newTime = (percentage / 100) * duration;
                  
                  audio.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                onTouchEnd={() => setIsDragging(false)}
              >
                <div 
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ 
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #FFB84D 0%, #FF8F00 100%)',
                    transition: isDragging ? 'none' : 'width 0.1s linear'
                  }}
                />
              </div>

              <span className="text-xs font-bold tabular-nums" style={{ color: '#FF8F00', minWidth: '40px', textAlign: 'right' }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between w-full">
              {/* Repeat Button */}
              <button
                onClick={cycleRepeat}
                className="p-2.5 rounded-full transition-all"
                style={{ 
                  background: state.repeat !== 'none' ? 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)' : 'rgba(255, 184, 77, 0.15)',
                  color: state.repeat !== 'none' ? '#1a1a1a' : '#FFB84D',
                  border: '2px solid ' + (state.repeat !== 'none' ? '#FFB84D' : 'rgba(255, 184, 77, 0.4)'),
                  boxShadow: state.repeat !== 'none' ? '0 2px 8px rgba(255, 143, 0, 0.4)' : 'none'
                }}
              >
                {state.repeat === 'one' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                  </svg>
                )}
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="p-3 rounded-full transition-all"
                style={{ 
                  background: 'rgba(255, 184, 77, 0.15)',
                  border: '2px solid rgba(255, 184, 77, 0.4)'
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="p-4 rounded-full transition-all active:scale-95"
                style={{ 
                  background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                  color: '#1a1a1a',
                  border: '2px solid #FFB84D',
                  boxShadow: '0 4px 12px rgba(255, 143, 0, 0.5)'
                }}
              >
                {isPlaying ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-3 rounded-full transition-all"
                style={{ 
                  background: 'rgba(255, 184, 77, 0.15)',
                  border: '2px solid rgba(255, 184, 77, 0.4)'
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                  <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z" />
                </svg>
              </button>

              {/* Queue Info */}
              {state.queue.length > 0 && (
                <div className="px-2.5 py-1.5 rounded-full text-xs font-bold"
                     style={{ 
                       background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                       color: '#1a1a1a',
                       border: '2px solid #FFB84D'
                     }}>
                  {state.queue.length}
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Full layout */}
          {/* Left: Track Info */}
          <div className="hidden md:flex items-center gap-5 min-w-0" style={{ flex: '0 1 30%' }}>
            {albumArt && (
              <div className="relative group">
                <img 
                  src={albumArt} 
                  alt={song.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-2xl flex-shrink-0"
                  style={{ 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    border: '2px solid #3a3a3a'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/50 transition-all rounded-xl" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg truncate mb-2" 
                  style={{ 
                    color: '#e5e5e5'
                  }}
                  title={song.name}>
                {song.name}
              </h3>
              <p className="text-sm truncate mb-1" 
                 style={{ color: '#FFB84D', fontWeight: '600' }}
                 title={formatArtistNames(song.artists)}>
                {formatArtistNames(song.artists)}
              </p>
              {song.album?.name && (
                <p className="text-xs truncate" 
                   style={{ color: '#a0a0a0', opacity: 0.8 }}
                   title={song.album.name}>
                  {song.album.name}
                </p>
              )}
            </div>
            {/* Add to Queue Button */}
            <button
              onClick={handleAddToQueue}
              className="p-3 rounded-full transition-all"
              style={{ 
                background: 'rgba(255, 184, 77, 0.15)',
                border: '2px solid rgba(255, 184, 77, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 184, 77, 0.25)';
                e.currentTarget.style.borderColor = '#FFB84D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 184, 77, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              }}
              title="Add to queue"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Center: Player Controls - Desktop only, mobile has minimal controls */}
          <div className="hidden md:flex flex-col items-center gap-3" style={{ flex: '0 1 40%' }}>
            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {/* Repeat Button */}
              <button
                onClick={cycleRepeat}
                className="p-3 rounded-full transition-all"
                style={{ 
                  background: state.repeat !== 'none' ? 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)' : 'rgba(255, 184, 77, 0.15)',
                  color: state.repeat !== 'none' ? '#1a1a1a' : '#FFB84D',
                  border: '2px solid ' + (state.repeat !== 'none' ? '#FFB84D' : 'rgba(255, 184, 77, 0.4)'),
                  boxShadow: state.repeat !== 'none' ? '0 2px 8px rgba(255, 143, 0, 0.4)' : 'none'
                }}
                title={`Repeat: ${state.repeat}`}
              >
                {state.repeat === 'one' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                  </svg>
                )}
              </button>

              {/* Previous */}
              <button
                onClick={playPrevious}
                className="p-3 rounded-full transition-all"
                style={{ 
                  background: 'rgba(255, 184, 77, 0.15)',
                  border: '2px solid rgba(255, 184, 77, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 184, 77, 0.25)';
                  e.currentTarget.style.borderColor = '#FFB84D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 184, 77, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 184, 77, 0.4)';
                }}
                title="Previous"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="p-4 rounded-full transition-all hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                  color: '#1a1a1a',
                  border: '3px solid #FFB84D',
                  boxShadow: '0 4px 12px rgba(255, 143, 0, 0.5)'
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-3 rounded-full transition-all"
                style={{ 
                  background: 'rgba(255, 184, 77, 0.15)',
                  border: '2px solid rgba(255, 184, 77, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 184, 77, 0.25)';
                  e.currentTarget.style.borderColor = '#FFB84D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 184, 77, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 184, 77, 0.4)';
                }}
                title="Next"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                  <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z" />
                </svg>
              </button>

              {/* Queue Info */}
              {state.queue.length > 0 && (
                <div className="px-3 py-2 rounded-full text-sm font-bold"
                     style={{ 
                       background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                       color: '#1a1a1a',
                       border: '2px solid #FFB84D',
                       boxShadow: '0 2px 8px rgba(255, 143, 0, 0.4)'
                     }}
                     title={`${state.queue.length} song${state.queue.length > 1 ? 's' : ''} in queue`}>
                  {state.queue.length}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-4 w-full">
              {/* 3. CURRENT TIME DISPLAY: Updates every second via timeupdate */}
              <span className="text-xs font-bold tabular-nums" style={{ color: '#FFB84D', minWidth: '45px' }}>
                {formatTime(currentTime)}
              </span>
              
              {/* Custom Progress Bar - FULLY INTERACTIVE */}
              <div 
                className="relative flex-1 h-2 rounded-full cursor-pointer group"
                style={{ background: 'rgba(255, 184, 77, 0.2)' }}
                onClick={(e) => {
                  // 2. CLICK SEEKING: Calculate position and seek immediately
                  e.preventDefault();
                  const audio = audioRef.current;
                  if (!audio || duration <= 0) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                  const newTime = (percentage / 100) * duration;
                  
                  // Set audio position and update UI immediately
                  audio.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                onMouseDown={(e) => {
                  // 3. DRAG START: Begin dragging operation
                  e.preventDefault();
                  setIsDragging(true);
                  
                  const audio = audioRef.current;
                  if (!audio || duration <= 0) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                  const newTime = (percentage / 100) * duration;
                  
                  // Immediately seek on mousedown
                  audio.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                onMouseMove={(e) => {
                  // 4. DRAG SEEKING: Continuously update position while dragging
                  if (!isDragging) return;
                  
                  e.preventDefault();
                  const audio = audioRef.current;
                  if (!audio || duration <= 0) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const moveX = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(100, (moveX / rect.width) * 100));
                  const newTime = (percentage / 100) * duration;
                  
                  // Update audio position and time display during drag
                  audio.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
              >
                {/* Progress Fill */}
                <div 
                  className="absolute top-0 left-0 h-full rounded-full pointer-events-none"
                  style={{ 
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #FFB84D 0%, #FF8F00 100%)',
                    boxShadow: '0 0 8px rgba(255, 143, 0, 0.4)',
                    transition: isDragging ? 'none' : 'width 0.1s linear'
                  }}
                />
                {/* Hover Indicator */}
                <div 
                  className="absolute top-1/2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none"
                  style={{ 
                    left: `${progress}%`,
                    background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                    border: '2px solid #1a1a1a',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 12px rgba(255, 143, 0, 0.8)'
                  }}
                />
              </div>

              <span className="text-xs font-bold tabular-nums" style={{ color: '#FF8F00', minWidth: '45px' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Extra Controls - Desktop only */}
          <div className="hidden md:flex items-center gap-3 justify-end" style={{ flex: '0 1 30%' }}>
            {/* Volume Control */}
            <div className="flex items-center gap-2 relative"
                 onMouseEnter={() => setShowVolumeSlider(true)}
                 onMouseLeave={() => setShowVolumeSlider(false)}>
              <button className="p-2 rounded-full hover:bg-opacity-20 transition-all"
                      style={{ background: 'transparent' }}>
                {volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#2D2D2D' }}>
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#2D2D2D' }}>
                    <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#2D2D2D' }}>
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              
              {/* Volume Slider - appears on hover */}
              <div 
                className="absolute right-0 bottom-full mb-2 p-3 rounded-lg transition-all"
                style={{ 
                  background: '#2a2a2a',
                  border: '2px solid #3a3a3a',
                  opacity: showVolumeSlider ? 1 : 0,
                  pointerEvents: showVolumeSlider ? 'auto' : 'none',
                  transform: showVolumeSlider ? 'translateY(0)' : 'translateY(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="slider"
                  style={{ width: '100px' }}
                />
                <div className="text-xs text-center mt-2" style={{ color: '#e5e5e5' }}>
                  {Math.round(volume * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
