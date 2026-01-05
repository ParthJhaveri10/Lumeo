/**
 * @fileoverview Professional Audio Player Component
 * @author Principal Software Engineer
 * @version 2.0.0
 * 
 * CRITICAL: Production-grade audio player with full media controls
 * Modular, clean, and optimized for performance
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Song } from '../types/saavn';

interface AudioPlayerProps {
  song: Song;
  playlist?: Song[];
  currentIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSongChange?: (song: Song, index: number) => void;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  song,
  onNext,
  onPrevious
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isLoading: true
  });

  /**
   * Get optimal audio URL with quality fallback
   */
  const getAudioUrl = useCallback((songData: Song): string => {
    if (!songData.downloadUrl?.length) return '';
    
    const qualityOrder = ['320kbps', '160kbps', '96kbps', '48kbps'];
    
    for (const quality of qualityOrder) {
      const url = songData.downloadUrl.find(u => u.quality === quality);
      if (url?.url) return url.url;
    }
    
    return songData.downloadUrl[0]?.url || '';
  }, []);

  /**
   * Get optimal image URL with quality fallback
   */
  const getImageUrl = useCallback((songData: Song): string => {
    if (!songData.image?.length) return '';
    
    const qualityOrder = ['500x500', '150x150', '50x50'];
    
    for (const quality of qualityOrder) {
      const img = songData.image.find(i => i.quality === quality);
      if (img?.url) return img.url;
    }
    
    return songData.image[0]?.url || '';
  }, []);

  /**
   * Format artist names safely
   */
  const formatArtists = useCallback((artists: any): string => {
    if (artists?.primary?.length) {
      return artists.primary.map((a: any) => a.name).join(', ');
    }
    if (artists?.all?.length) {
      return artists.all.map((a: any) => a.name).join(', ');
    }
    return 'Unknown Artist';
  }, []);

  /**
   * Format time duration
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Initialize audio element with event listeners
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isLoading: false }));
    const handleLoadedMetadata = () => setState(prev => ({ ...prev, duration: audio.duration }));
    const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onNext?.();
    };
    const handleError = () => {
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      console.error('Audio playback error');
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onNext]);

  /**
   * Update audio source when song changes
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = state.volume;
    audio.muted = state.isMuted;
  }, [state.volume, state.isMuted]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || state.isLoading) return;

    try {
      if (state.isPlaying) {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await audio.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Playback failed:', error);
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [state.isPlaying, state.isLoading]);

  /**
   * Seek to specific time
   */
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, []);

  /**
   * Handle volume change
   */
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  }, []);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const audioUrl = getAudioUrl(song);
  const imageUrl = getImageUrl(song);
  const artistNames = formatArtists(song.artists);

  if (!audioUrl) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 p-4 text-center">
        <p className="text-red-800 font-medium">Audio not available for this track</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />

      {/* Progress Bar */}
      <div className="px-4 pt-2">
        <input
          type="range"
          min="0"
          max={state.duration || 0}
          value={state.currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={state.isLoading}
        />
      </div>

      <div className="flex items-center justify-between p-4">
        {/* Song Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={song.name}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate text-sm">
              {song.name}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {artistNames}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <button
            onClick={onPrevious}
            disabled={!onPrevious}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={togglePlayPause}
            disabled={state.isLoading}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : state.isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={!onNext}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
          </button>
        </div>

        {/* Volume & Time */}
        <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
          <span className="text-xs text-gray-600 font-mono">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </span>

          <button
            onClick={toggleMute}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            {state.isMuted || state.volume === 0 ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.792L4.106 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.106l4.277-3.792zM15 8a1 1 0 10-2 0v4a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.792L4.106 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.106l4.277-3.792zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={state.isMuted ? 0 : state.volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
