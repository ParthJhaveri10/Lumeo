/**
 * @fileoverview Search Section Component - Modular search interface
 * @author Principal Software Engineer
 * @version 2.0.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import {
  useSearch,
  useSearchSongs,
  useSearchAlbums,
  useSearchArtists,
  useSearchPlaylists
} from '../hooks/useSaavnApi';
import { saavnApi } from '../services/SaavnApiService';

type SearchType = 'all' | 'songs' | 'albums' | 'artists' | 'playlists';

interface SearchSectionProps {
  onArtistClick?: (artistId: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onArtistClick }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { playTrack, addToQueue } = useMusicPlayer();
  const debounceTimerRef = useRef<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; song: any } | null>(null);
  const [mobileMenuSong, setMobileMenuSong] = useState<any | null>(null);

  /**
   * Decode HTML entities in strings
   */
  const decodeHtmlEntities = (text: string): string => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decoded = textarea.value;
    // Double decode in case of double-encoded entities
    if (decoded.includes('&quot;') || decoded.includes('&amp;') || decoded.includes('&#')) {
      textarea.innerHTML = decoded;
      return textarea.value;
    }
    return decoded;
  };

  // Search hooks
  const search = useSearch();
  const searchSongs = useSearchSongs();
  const searchAlbums = useSearchAlbums();
  const searchArtists = useSearchArtists();
  const searchPlaylists = useSearchPlaylists();

  /**
   * Load recommendations on component mount
   */
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        // Fetch trending or popular songs as recommendations
        const trendingQueries = ['trending', 'top hits', 'popular songs', 'latest hits'];
        const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
        
        const result = await saavnApi.searchSongs(randomQuery, 0, 20);
        if (result.data?.results) {
          // Normalize song name for comparison (remove "From", parentheses, quotes, etc.)
          const normalizeName = (name: string) => {
            return name
              .toLowerCase()
              .replace(/\(from.*?\)/gi, '')
              .replace(/["']/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          };

          // Remove duplicates by song ID AND normalized name
          const seenNames = new Set<string>();
          const seenIds = new Set<string>();
          const uniqueSongs = result.data.results.filter((song: any) => {
            const normalizedName = normalizeName(song.name || song.title || '');
            if (seenIds.has(song.id) || seenNames.has(normalizedName)) {
              return false;
            }
            seenIds.add(song.id);
            seenNames.add(normalizedName);
            return true;
          });

          // Sort by popularity (play count) in descending order
          const sortedSongs = uniqueSongs.sort((a: any, b: any) => {
            const aPlayCount = parseInt(a.playCount || a.play_count || '0');
            const bPlayCount = parseInt(b.playCount || b.play_count || '0');
            return bPlayCount - aPlayCount;
          });
          
          setRecommendations(sortedSongs.slice(0, 12));
        }
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, []);

  /**
   * Execute search based on selected type
   */
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      switch (searchType) {
        case 'all':
          await search.search(searchQuery);
          break;
        case 'songs':
          await searchSongs.searchSongs(searchQuery);
          break;
        case 'albums':
          await searchAlbums.searchAlbums(searchQuery);
          break;
        case 'artists':
          await searchArtists.searchArtists(searchQuery);
          break;
        case 'playlists':
          await searchPlaylists.searchPlaylists(searchQuery);
          break;
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [searchType, search, searchSongs, searchAlbums, searchArtists, searchPlaylists]);

  /**
   * Auto-search with debouncing
   */
  useEffect(() => {
    if (!query.trim()) {
      // Clear timer when query is empty
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = window.setTimeout(() => {
      handleSearch(query);
    }, 800); // 800ms debounce for stability

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]); // Only depend on query, not handleSearch

  /**
   * Handle manual search button click
   */
  const handleSearchClick = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    handleSearch(query);
  }, [query, handleSearch]);

  /**
   * Handle Enter key press
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      handleSearch(query);
    }
  }, [query, handleSearch]);

  /**
   * Handle song selection and play
   */
  const handleSongPlay = useCallback(async (songId: string) => {
    await playTrack(songId);
  }, [playTrack]);

  /**
   * Handle right-click context menu
   */
  const handleContextMenu = useCallback((e: React.MouseEvent, song: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      song: song
    });
  }, []);

  /**
   * Handle adding song to queue from context menu
   */
  const handleAddToQueueFromMenu = useCallback(async (song: any) => {
    try {
      // Fetch full song details if needed
      const api = new (await import('../services/SaavnApiService')).SaavnApiService();
      const fullSong = await api.getSong(song.id);
      addToQueue(fullSong.data[0]);
      setContextMenu(null);
      setMobileMenuSong(null);
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  }, [addToQueue]);

  /**
   * Close context menu when clicking outside
   */
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setMobileMenuSong(null);
    };
    if (contextMenu || mobileMenuSong) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu, mobileMenuSong]);

  /**
   * Format artist names safely
   */
  const formatArtistNames = useCallback((artists: any, fallback?: string | null): string => {
    if (artists?.primary && Array.isArray(artists.primary)) {
      return artists.primary.map((a: any) => a.name).join(', ');
    }
    if (artists?.all && Array.isArray(artists.all)) {
      return artists.all.map((a: any) => a.name).join(', ');
    }
    return fallback || 'Unknown Artist';
  }, []);

  /**
   * Get current results based on search type
   */
  const getCurrentResults = useCallback(() => {
    switch (searchType) {
      case 'all':
        return search.data;
      case 'songs':
        return searchSongs.data;
      case 'albums':
        return searchAlbums.data;
      case 'artists':
        return searchArtists.data;
      case 'playlists':
        return searchPlaylists.data;
      default:
        return null;
    }
  }, [searchType, search.data, searchSongs.data, searchAlbums.data, searchArtists.data, searchPlaylists.data]);

  const currentResults = getCurrentResults();
  const isLoading = search.loading || searchSongs.loading || searchAlbums.loading || 
                   searchArtists.loading || searchPlaylists.loading;
  const searchError = search.error || searchSongs.error || searchAlbums.error || 
                     searchArtists.error || searchPlaylists.error;

  /**
   * Render search result item
   */
  const renderResultItem = useCallback((item: any, type: string) => {
    const albumArt = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url || '';
    const duration = item.duration ? Math.floor(item.duration / 60) + ':' + String(Math.floor(item.duration % 60)).padStart(2, '0') : '';
    
    // Clean up song/album/playlist names - remove "Trending Version" and similar suffixes
    const cleanName = (name: string) => {
      return name
        .replace(/\s*\(Trending Version\)/gi, '')
        .replace(/\s*\(Trending\)/gi, '')
        .replace(/\s*\[Trending Version\]/gi, '')
        .replace(/\s*\[Trending\]/gi, '')
        .trim();
    };
    
    return (
      <div
        key={item.id}
        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
          border: '2px solid #3a3a3a',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#FFB84D';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 143, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#3a3a3a';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
        onClick={() => {
          if (type === 'songs' || (searchType === 'all' && type === 'song')) {
            handleSongPlay(item.id);
          } else if ((type === 'artists' || type === 'artist') && onArtistClick) {
            onArtistClick(item.id);
          }
        }}
        onContextMenu={(e) => {
          if (type === 'songs' || (searchType === 'all' && type === 'song')) {
            handleContextMenu(e, item);
          }
        }}
      >
        {/* Album Art with Gradient Overlay */}
        <div className="relative h-48 overflow-hidden">
          {albumArt ? (
            <img 
              src={albumArt} 
              alt={item.name || item.title || ''}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
              <svg className="w-20 h-20 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                {type === 'artists' || type === 'artist' ? (
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                ) : type === 'playlists' || type === 'playlist' ? (
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                ) : (
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                )}
              </svg>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          
          {/* Play Button Overlay */}
          {(type === 'songs' || type === 'song') && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                     boxShadow: '0 4px 16px rgba(255, 143, 0, 0.6)'
                   }}>
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#1a1a1a' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {(type === 'songs' || type === 'song') && (
            <button
              className="absolute top-3 right-3 md:hidden w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 184, 77, 0.3)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuSong(mobileMenuSong?.id === item.id ? null : item);
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          )}

          {/* Mobile Dropdown Menu */}
          {(type === 'songs' || type === 'song') && mobileMenuSong?.id === item.id && (
            <div
              className="absolute top-12 right-3 md:hidden rounded-lg shadow-2xl overflow-hidden z-20"
              style={{
                background: '#1a1a1a',
                border: '2px solid #FFB84D',
                minWidth: '180px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors"
                style={{
                  color: '#e5e5e5',
                  borderBottom: '1px solid #3a3a3a'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => handleAddToQueueFromMenu(item)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                </svg>
                <span className="font-medium">Add to Queue</span>
              </button>
            </div>
          )}

          {/* Duration Badge */}
          {duration && (type === 'songs' || type === 'song') && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                 style={{
                   background: 'rgba(0, 0, 0, 0.7)',
                   color: '#FFB84D',
                   border: '1px solid rgba(255, 184, 77, 0.3)'
                 }}>
              {duration}
            </div>
          )}

          {/* Type Badge for non-songs */}
          {type === 'albums' && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                 style={{
                   background: 'rgba(255, 184, 77, 0.9)',
                   color: '#1a1a1a',
                   border: '1px solid #FFB84D'
                 }}>
              Album
            </div>
          )}
          {(type === 'artists' || type === 'artist') && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                 style={{
                   background: 'rgba(255, 184, 77, 0.9)',
                   color: '#1a1a1a',
                   border: '1px solid #FFB84D'
                 }}>
              Artist
            </div>
          )}
          {(type === 'playlists' || type === 'playlist') && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                 style={{
                   background: 'rgba(255, 184, 77, 0.9)',
                   color: '#1a1a1a',
                   border: '1px solid #FFB84D'
                 }}>
              Playlist
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FFB84D] group-hover:to-[#FF8F00] transition-all"
              style={{ color: '#e5e5e5' }}
              title={decodeHtmlEntities(cleanName(item.name || item.title || ''))}>
            {decodeHtmlEntities(cleanName(item.name || item.title || ''))}
          </h3>
          
          <p className="text-sm mb-3 truncate"
             style={{ color: '#a0a0a0' }}
             title={
               (type === 'songs' || type === 'song') 
                 ? decodeHtmlEntities(formatArtistNames(item.artists, item.primaryArtists || item.artist))
                 : type === 'albums'
                 ? decodeHtmlEntities(formatArtistNames(item.artists, item.artist))
                 : (type === 'artists' || type === 'artist')
                 ? item.dominantType || 'Artist'
                 : decodeHtmlEntities(item.description || '')
             }>
            {(type === 'songs' || type === 'song') && decodeHtmlEntities(formatArtistNames(item.artists, item.primaryArtists || item.artist))}
            {type === 'albums' && decodeHtmlEntities(formatArtistNames(item.artists, item.artist))}
            {(type === 'artists' || type === 'artist') && (item.dominantType || 'Artist')}
            {(type === 'playlists' || type === 'playlist') && decodeHtmlEntities(item.description || '')}
          </p>

          {/* Additional Info */}
          {item.playCount && (type === 'songs' || type === 'song') && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#FFB84D' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{(item.playCount / 1000000).toFixed(1)}M plays</span>
            </div>
          )}
          {item.songCount && type === 'albums' && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#FFB84D' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <span>{item.songCount} songs</span>
            </div>
          )}
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
             style={{
               background: 'linear-gradient(90deg, #FFB84D 0%, #FF8F00 100%)'
             }}>
        </div>
      </div>
    );
  }, [searchType, handleSongPlay, formatArtistNames, handleContextMenu]);

  /**
   * Render search results section
   */
  const renderSearchResults = useCallback(() => {
    if (!currentResults || !currentResults.data) return null;

    const data = currentResults.data;

    // Handle 'all' search type - check for songs, albums, artists, playlists properties
    if (searchType === 'all' && 'songs' in data) {
      return (
        <div className="space-y-8">
          {/* Songs */}
          {data.songs?.results && data.songs.results.length > 0 && (
            <div className="rounded-2xl p-8" style={{ 
              background: '#242424',
              border: '2px solid #3a3a3a',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
            }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#FFB84D' }}>
                ♫ Songs
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.songs.results.slice(0, 6).map((item: any) => 
                  renderResultItem(item, 'song')
                )}
              </div>
            </div>
          )}

          {/* Albums */}
          {data.albums?.results && data.albums.results.length > 0 && (
            <div className="rounded-2xl p-8" style={{ 
              background: '#242424',
              border: '2px solid #3a3a3a',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
            }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#FFB84D' }}>
                ♛ Albums
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.albums.results.slice(0, 6).map((item: any) => 
                  renderResultItem(item, 'albums')
                )}
              </div>
            </div>
          )}

          {/* Artists */}
          {data.artists?.results && data.artists.results.length > 0 && (
            <div className="rounded-2xl p-8" style={{ 
              background: '#242424',
              border: '2px solid #3a3a3a',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
            }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#FFB84D' }}>
                ♚ Artists
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.artists.results.slice(0, 6).map((item: any) => 
                  renderResultItem(item, 'artists')
                )}
              </div>
            </div>
          )}

          {/* Playlists */}
          {data.playlists?.results && data.playlists.results.length > 0 && (
            <div className="rounded-2xl p-8" style={{ 
              background: '#242424',
              border: '2px solid #3a3a3a',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
            }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#FFB84D' }}>
                ♜ Playlists
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.playlists.results.slice(0, 6).map((item: any) => 
                  renderResultItem(item, 'playlists')
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle specific search types - check for results property
    if ('results' in data && data.results && data.results.length > 0) {
      return (
        <div className="rounded-2xl p-8" style={{ 
          background: '#242424',
          border: '2px solid #3a3a3a',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
        }}>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.results.slice(0, 12).map((item: any) => 
              renderResultItem(item, searchType)
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl p-10 text-center" style={{ 
        background: 'linear-gradient(135deg, rgba(74, 44, 109, 0.3) 0%, rgba(45, 27, 78, 0.5) 100%)',
        backdropFilter: 'blur(15px)',
        border: '2px solid rgba(212, 175, 55, 0.2)'
      }}>
        <div className="text-6xl mb-4">♔</div>
        <p className="text-xl mb-2" style={{ color: '#d4af37', fontFamily: 'Playfair Display, serif' }}>No results found for "{query}"</p>
        <p className="text-sm" style={{ color: '#e6c9a8', fontStyle: 'italic' }}>Try adjusting your royal search</p>
      </div>
    );
  }, [currentResults, searchType, query, renderResultItem]);

  return (
    <>
      {/* Search Input Section */}
      <div className="rounded-2xl shadow-2xl p-8 mb-8" style={{ 
        background: '#242424',
        border: '2px solid #3a3a3a',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ 
          color: '#FFB84D'
        }}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          Discover Music
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for songs, artists, albums..."
              className="w-full px-6 py-5 rounded-xl outline-none transition-all text-lg"
              style={{ 
                background: '#1a1a1a',
                color: '#e5e5e5',
                border: '2px solid #3a3a3a',
                fontSize: '18px',
                minHeight: '60px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FFB84D';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 184, 77, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#3a3a3a';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {/* Search Type Selector */}
          <div className="w-full md:w-52">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
              className="w-full px-6 py-5 rounded-xl outline-none transition-all cursor-pointer text-lg"
              style={{ 
                background: '#1a1a1a',
                color: '#e5e5e5',
                border: '2px solid #3a3a3a',
                fontSize: '18px',
                fontWeight: '600',
                minHeight: '60px'
              }}
            >
              <option value="all">All Types</option>
              <option value="songs">Songs</option>
              <option value="albums">Albums</option>
              <option value="artists">Artists</option>
              <option value="playlists">Playlists</option>
            </select>
          </div>
          
          {/* Search Button */}
          <button
            onClick={handleSearchClick}
            disabled={!query.trim() || isLoading}
            className="w-full md:w-auto px-8 py-5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            style={{ 
              background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
              color: '#1a1a1a',
              fontWeight: '700',
              fontSize: '18px',
              border: '2px solid #FFB84D',
              boxShadow: '0 4px 12px rgba(255, 143, 0, 0.4)',
              minHeight: '60px'
            }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Error Display */}
        {searchError && (
          <div className="mb-4 rounded-lg p-4" style={{ background: '#5C4033', border: '1px solid #E8D4A0' }}>
            <div className="flex">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#E8D4A0' }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p style={{ color: '#FFF8E7' }}>{searchError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Section */}
      {currentResults && (
        <div className="mb-8">
          {renderSearchResults()}
        </div>
      )}

      {/* Recommendations Section - Show when no search results */}
      {!query.trim() && !currentResults && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl"
                 style={{
                   background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                   boxShadow: '0 4px 12px rgba(255, 143, 0, 0.4)'
                 }}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#1a1a1a' }}>
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#e5e5e5' }}>
              Recommended For You
            </h2>
          </div>
          
          {loadingRecommendations ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((song) => {
                const albumArt = song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url || '';
                const duration = song.duration ? Math.floor(song.duration / 60) + ':' + String(Math.floor(song.duration % 60)).padStart(2, '0') : '';
                
                // Clean up song name - remove "Trending Version" and similar suffixes
                const cleanSongName = (name: string) => {
                  return name
                    .replace(/\s*\(Trending Version\)/gi, '')
                    .replace(/\s*\(Trending\)/gi, '')
                    .replace(/\s*\[Trending Version\]/gi, '')
                    .replace(/\s*\[Trending\]/gi, '')
                    .trim();
                };
                
                return (
                  <div
                    key={song.id}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                      border: '2px solid #3a3a3a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FFB84D';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 143, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#3a3a3a';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                    }}
                    onClick={() => handleSongPlay(song.id)}
                    onContextMenu={(e) => handleContextMenu(e, song)}
                  >
                    {/* Album Art with Gradient Overlay */}
                    <div className="relative h-48 overflow-hidden">
                      {albumArt ? (
                        <img 
                          src={albumArt} 
                          alt={song.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                             style={{ background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
                          <svg className="w-20 h-20 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform"
                             style={{
                               background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                               boxShadow: '0 4px 16px rgba(255, 143, 0, 0.6)'
                             }}>
                          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#1a1a1a' }}>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      {duration && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                             style={{
                               background: 'rgba(0, 0, 0, 0.7)',
                               color: '#FFB84D',
                               border: '1px solid rgba(255, 184, 77, 0.3)'
                             }}>
                          {duration}
                        </div>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FFB84D] group-hover:to-[#FF8F00] transition-all"
                          style={{ color: '#e5e5e5' }}
                          title={decodeHtmlEntities(cleanSongName(song.name || song.title || ''))}>
                        {decodeHtmlEntities(cleanSongName(song.name || song.title || ''))}
                      </h3>
                      
                      <p className="text-sm mb-3 truncate"
                         style={{ color: '#a0a0a0' }}
                         title={decodeHtmlEntities(formatArtistNames(song.artists, song.primaryArtists || song.artist))}>
                        {decodeHtmlEntities(formatArtistNames(song.artists, song.primaryArtists || song.artist))}
                      </p>

                      {/* Play Count or Album Info */}
                      {(song.playCount || song.album?.name) && (
                        <div className="flex items-center gap-2 text-xs"
                             style={{ color: '#FFB84D' }}>
                          {song.playCount && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              <span>{(song.playCount / 1000000).toFixed(1)}M plays</span>
                            </div>
                          )}
                          {song.album?.name && (
                            <div className="truncate" title={song.album.name}>
                              {decodeHtmlEntities(song.album.name)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                         style={{
                           background: 'linear-gradient(90deg, #FFB84D 0%, #FF8F00 100%)'
                         }}>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: '#a0a0a0' }}>
              <p>No recommendations available at the moment</p>
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed rounded-xl shadow-2xl overflow-hidden"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            background: '#2a2a2a',
            border: '2px solid #FFB84D',
            zIndex: 1000,
            minWidth: '220px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <button
            onClick={() => handleAddToQueueFromMenu(contextMenu.song)}
            className="w-full px-6 py-4 text-left transition-all flex items-center gap-3"
            style={{ color: '#e5e5e5', fontWeight: '600' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#333333';
              e.currentTarget.style.color = '#FFB84D';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#e5e5e5';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add to Queue</span>
          </button>
        </div>
      )}
    </>
  );
};

export default SearchSection;
