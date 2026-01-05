/**
 * @fileoverview Music Player Context - Global State Management
 * @author Principal Software Engineer
 * @version 2.0.0
 * 
 * CRITICAL: Centralized state management for music playback
 * Provides clean API for controlling music across components
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Song } from '../types/saavn';
import { SaavnApiService } from '../services/SaavnApiService';

interface MusicPlayerState {
  currentSong: Song | null;
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  queue: Song[];
  history: Song[];
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}

type MusicPlayerAction =
  | { type: 'SET_CURRENT_SONG'; payload: { song: Song; playlist?: Song[]; index?: number } }
  | { type: 'SET_PLAYLIST'; payload: { playlist: Song[]; currentIndex?: number } }
  | { type: 'NEXT_SONG' }
  | { type: 'PREVIOUS_SONG' }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'ADD_TO_QUEUE'; payload: Song }
  | { type: 'REMOVE_FROM_QUEUE'; payload: number }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SET_REPEAT'; payload: 'none' | 'one' | 'all' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'CLEAR_PLAYER' };

interface MusicPlayerContextType {
  state: MusicPlayerState;
  playSong: (song: Song, playlist?: Song[], index?: number) => void;
  playTrack: (trackId: string) => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setRepeat: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  clearPlayer: () => void;
}

const initialState: MusicPlayerState = {
  currentSong: null,
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  queue: [],
  history: [],
  repeat: 'none',
  shuffle: false
};

const musicPlayerReducer = (state: MusicPlayerState, action: MusicPlayerAction): MusicPlayerState => {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      const newHistory = state.currentSong && !state.history.includes(state.currentSong) 
        ? [...state.history.slice(-49), state.currentSong]
        : state.history;
      
      return {
        ...state,
        currentSong: action.payload.song,
        playlist: action.payload.playlist || state.playlist,
        currentIndex: action.payload.index ?? state.currentIndex,
        history: newHistory
      };

    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload.playlist,
        currentIndex: action.payload.currentIndex ?? 0,
        currentSong: action.payload.playlist[action.payload.currentIndex ?? 0] || null
      };

    case 'NEXT_SONG':
      if (state.queue.length > 0) {
        // Play from queue first
        const nextSong = state.queue[0];
        return {
          ...state,
          currentSong: nextSong,
          queue: state.queue.slice(1),
          history: state.currentSong ? [...state.history.slice(-49), state.currentSong] : state.history
        };
      }

      if (state.repeat === 'one') {
        return state; // Stay on current song
      }

      let nextIndex = state.currentIndex + 1;
      
      if (state.shuffle) {
        // Random next song (excluding current)
        const availableIndices = state.playlist
          .map((_, i) => i)
          .filter(i => i !== state.currentIndex);
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else if (nextIndex >= state.playlist.length) {
        if (state.repeat === 'all') {
          nextIndex = 0;
        } else {
          return { ...state, isPlaying: false }; // End of playlist
        }
      }

      return {
        ...state,
        currentIndex: nextIndex,
        currentSong: state.playlist[nextIndex] || null,
        history: state.currentSong ? [...state.history.slice(-49), state.currentSong] : state.history
      };

    case 'PREVIOUS_SONG':
      if (state.history.length > 0) {
        const previousSong = state.history[state.history.length - 1];
        const previousIndex = state.playlist.findIndex(song => song.id === previousSong.id);
        
        return {
          ...state,
          currentSong: previousSong,
          currentIndex: previousIndex !== -1 ? previousIndex : state.currentIndex,
          history: state.history.slice(0, -1)
        };
      }

      let prevIndex = state.currentIndex - 1;
      
      if (prevIndex < 0) {
        if (state.repeat === 'all') {
          prevIndex = state.playlist.length - 1;
        } else {
          return state; // Stay at first song
        }
      }

      return {
        ...state,
        currentIndex: prevIndex,
        currentSong: state.playlist[prevIndex] || null
      };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };

    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, action.payload] };

    case 'REMOVE_FROM_QUEUE':
      return { 
        ...state, 
        queue: state.queue.filter((_, index) => index !== action.payload) 
      };

    case 'CLEAR_QUEUE':
      return { ...state, queue: [] };

    case 'SET_REPEAT':
      return { ...state, repeat: action.payload };

    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };

    case 'CLEAR_PLAYER':
      return initialState;

    default:
      return state;
  }
};

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(musicPlayerReducer, initialState);

  const playSong = useCallback((song: Song, playlist?: Song[], index?: number) => {
    dispatch({ 
      type: 'SET_CURRENT_SONG', 
      payload: { song, playlist, index } 
    });
  }, []);

  const playTrack = useCallback(async (trackId: string) => {
    try {
      const apiService = new SaavnApiService();
      const response = await apiService.getSongs([trackId]);
      if (response.success && response.data && response.data.length > 0) {
        const song = response.data[0];
        playSong(song);
      }
    } catch (error) {
      console.error('Failed to load track:', error);
    }
  }, [playSong]);

  const playNext = useCallback(() => {
    dispatch({ type: 'NEXT_SONG' });
  }, []);

  const playPrevious = useCallback(() => {
    dispatch({ type: 'PREVIOUS_SONG' });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: song });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  const setRepeat = useCallback((mode: 'none' | 'one' | 'all') => {
    dispatch({ type: 'SET_REPEAT', payload: mode });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, []);

  const clearPlayer = useCallback(() => {
    dispatch({ type: 'CLEAR_PLAYER' });
  }, []);

  const contextValue: MusicPlayerContextType = {
    state,
    playSong,
    playTrack,
    playNext,
    playPrevious,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setRepeat,
    toggleShuffle,
    clearPlayer
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};