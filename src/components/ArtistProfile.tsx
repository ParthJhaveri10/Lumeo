/**
 * @fileoverview Artist Profile Component - Spotify-style artist page
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { saavnApi } from '../services/SaavnApiService';

interface ArtistProfileProps {
  artistId: string;
  onBack: () => void;
}

const ArtistProfile: React.FC<ArtistProfileProps> = ({ artistId, onBack }) => {
  const { playTrack, addToQueue } = useMusicPlayer();
  const [artist, setArtist] = useState<any>(null);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtistData();
  }, [artistId]);

  const loadArtistData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch artist songs and albums separately
      const [songsResponse, albumsResponse] = await Promise.all([
        saavnApi.getArtistSongs(artistId, 0, 'popularity', 'desc'),
        saavnApi.getArtistAlbums(artistId, 0, 'popularity', 'desc')
      ]);
      
      // Set basic artist info from the first available response
      if (songsResponse.success && songsResponse.data) {
        setTopSongs(songsResponse.data.songs || []);
        // Extract artist info from songs response if available
        if (songsResponse.data.songs && songsResponse.data.songs.length > 0) {
          const firstSong = songsResponse.data.songs[0];
          // Build artist object from song data
          const artistInfo = {
            id: artistId,
            name: firstSong.artists?.primary?.[0]?.name || firstSong.artists?.all?.[0]?.name || 'Unknown Artist',
            image: firstSong.artists?.primary?.[0]?.image || firstSong.artists?.all?.[0]?.image || [],
            followerCount: (firstSong.artists?.primary?.[0] as any)?.followerCount,
            isVerified: (firstSong.artists?.primary?.[0] as any)?.isVerified || false,
            dominantType: (firstSong.artists?.primary?.[0] as any)?.dominantType || 'artist'
          };
          setArtist(artistInfo);
        }
      }
      
      if (albumsResponse.success && albumsResponse.data) {
        setAlbums(albumsResponse.data.albums || []);
      }
      
      // If we didn't get artist info from songs, try from albums
      if (!artist && albumsResponse.success && albumsResponse.data?.albums?.[0]) {
        const firstAlbum = albumsResponse.data.albums[0];
        const artistInfo = {
          id: artistId,
          name: firstAlbum.artists?.primary?.[0]?.name || firstAlbum.artists?.all?.[0]?.name || 'Unknown Artist',
          image: firstAlbum.artists?.primary?.[0]?.image || firstAlbum.artists?.all?.[0]?.image || [],
          followerCount: null,
          isVerified: false,
          dominantType: 'artist'
        };
        setArtist(artistInfo);
      }
    } catch (err) {
      console.error('Error loading artist:', err);
      setError('Failed to load artist profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSongPlay = async (songId: string) => {
    try {
      await playTrack(songId);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const handleAddToQueue = async (songId: string) => {
    try {
      const songResponse = await saavnApi.getSong(songId);
      if (songResponse.success && songResponse.data && songResponse.data.length > 0) {
        addToQueue(songResponse.data[0]);
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  };

  const formatFollowers = (count: number | null | undefined): string => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getArtistImage = () => {
    if (!artist?.image) return '';
    const images = artist.image;
    return images[2]?.url || images[1]?.url || images[0]?.url || '';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl" style={{ color: '#FFB84D' }}>Loading artist...</p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-xl mb-4" style={{ color: '#e5e5e5' }}>{error || 'Artist not found'}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
              color: '#1a1a1a',
              border: '2px solid #FFB84D'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const artistImage = getArtistImage();

  return (
    <div className="h-full overflow-y-auto pb-32">
      {/* Back Button */}
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
          style={{
            background: 'rgba(255, 184, 77, 0.15)',
            color: '#FFB84D',
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
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Back</span>
        </button>
      </div>

      {/* Artist Header */}
      <div className="relative px-8 pb-8">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(180deg, #FFB84D 0%, transparent 100%)`,
            filter: 'blur(100px)'
          }}
        />

        <div className="relative flex flex-col md:flex-row gap-8 items-end">
          {/* Artist Image */}
          <div className="relative group">
            {artistImage ? (
              <img
                src={artistImage}
                alt={artist.name}
                className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-2xl"
                style={{
                  border: '4px solid #FFB84D',
                  boxShadow: '0 8px 32px rgba(255, 143, 0, 0.6)'
                }}
              />
            ) : (
              <div 
                className="w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)',
                  border: '4px solid #FFB84D'
                }}
              >
                <svg className="w-32 h-32 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
            
            {/* Verified Badge */}
            {artist.isVerified && (
              <div 
                className="absolute bottom-2 right-2 w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: '#1DB954',
                  border: '3px solid #1a1a1a'
                }}
              >
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="flex-1 pb-4">
            <div className="text-sm font-bold mb-2" style={{ color: '#FFB84D' }}>
              ARTIST
            </div>
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
              style={{ 
                color: '#e5e5e5',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
              }}
            >
              {artist.name}
            </h1>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              {artist.followerCount && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  <span style={{ color: '#e5e5e5', fontWeight: '600' }}>
                    {formatFollowers(artist.followerCount)} followers
                  </span>
                </div>
              )}
              {artist.dominantType && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                  <span style={{ color: '#e5e5e5', fontWeight: '600' }}>
                    {artist.dominantType}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Songs */}
      {topSongs.length > 0 && (
        <div className="px-8 mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFB84D' }}>
            Popular Tracks
          </h2>
          
          <div className="space-y-2">
            {topSongs.slice(0, 10).map((song, index) => {
              const songImage = song.image?.[1]?.url || song.image?.[0]?.url || '';
              const duration = song.duration ? Math.floor(song.duration / 60) + ':' + String(Math.floor(song.duration % 60)).padStart(2, '0') : '';
              
              return (
                <div
                  key={song.id}
                  className="group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: 'rgba(42, 42, 42, 0.3)',
                    border: '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(42, 42, 42, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 184, 77, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(42, 42, 42, 0.3)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onClick={() => handleSongPlay(song.id)}
                >
                  {/* Track Number / Play Button */}
                  <div className="w-12 flex items-center justify-center">
                    <span 
                      className="group-hover:hidden font-bold text-lg"
                      style={{ color: '#a0a0a0' }}
                    >
                      {index + 1}
                    </span>
                    <div className="hidden group-hover:flex w-10 h-10 rounded-full items-center justify-center"
                         style={{
                           background: 'linear-gradient(135deg, #FFB84D 0%, #FF8F00 100%)',
                           boxShadow: '0 2px 8px rgba(255, 143, 0, 0.4)'
                         }}>
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#1a1a1a' }}>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Album Art */}
                  {songImage && (
                    <img
                      src={songImage}
                      alt={song.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      style={{ border: '1px solid #3a3a3a' }}
                    />
                  )}

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate mb-1" style={{ color: '#e5e5e5' }}>
                      {song.name}
                    </h4>
                    <p className="text-sm truncate" style={{ color: '#a0a0a0' }}>
                      {song.album?.name || 'Single'}
                    </p>
                  </div>

                  {/* Play Count */}
                  {song.playCount && (
                    <div className="hidden md:flex items-center gap-1 text-sm" style={{ color: '#a0a0a0' }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {formatFollowers(song.playCount)}
                    </div>
                  )}

                  {/* Duration */}
                  {duration && (
                    <div className="text-sm font-semibold" style={{ color: '#a0a0a0' }}>
                      {duration}
                    </div>
                  )}

                  {/* Add to Queue */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToQueue(song.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all"
                    style={{
                      background: 'rgba(255, 184, 77, 0.15)',
                      border: '1px solid rgba(255, 184, 77, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 184, 77, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 184, 77, 0.15)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB84D' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <div className="px-8 mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#FFB84D' }}>
            Albums
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((album) => {
              const albumArt = album.image?.[2]?.url || album.image?.[1]?.url || album.image?.[0]?.url || '';
              
              return (
                <div
                  key={album.id}
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
                >
                  {/* Album Art */}
                  <div className="relative h-48 overflow-hidden">
                    {albumArt ? (
                      <img
                        src={albumArt}
                        alt={album.name}
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
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Year Badge */}
                    {album.year && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                           style={{
                             background: 'rgba(0, 0, 0, 0.7)',
                             color: '#FFB84D',
                             border: '1px solid rgba(255, 184, 77, 0.3)'
                           }}>
                        {album.year}
                      </div>
                    )}
                  </div>

                  {/* Album Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FFB84D] group-hover:to-[#FF8F00] transition-all"
                        style={{ color: '#e5e5e5' }}
                        title={album.name}>
                      {album.name}
                    </h3>
                    
                    {album.songCount && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: '#FFB84D' }}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <span>{album.songCount} songs</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                       style={{
                         background: 'linear-gradient(90deg, #FFB84D 0%, #FF8F00 100%)'
                       }}>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;
