/**
 * @fileoverview API Demo Component - Comprehensive API Testing Interface
 * @author Principal Software Engineer
 * @version 2.0.0
 * 
 * CRITICAL: This component demonstrates ALL 14 saavn.dev API endpoints
 * Uses the new hooks architecture with proper error handling
 */

import React, { useState } from 'react';
import {
  useSearch,
  useSearchSongs,
  useSearchAlbums,
  useSearchArtists,
  useSearchPlaylists,
  useSong,
  useSongSuggestions,
  useAlbum,
  useArtist,
  usePlaylist
} from '../hooks/useSaavnApi';

/**
 * Demo section component for consistent UI
 */
interface DemoSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const DemoSection: React.FC<DemoSectionProps> = ({ title, description, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    {children}
  </div>
);

/**
 * Results display component
 */
interface ResultsDisplayProps {
  data: any;
  loading: boolean;
  error: string | null;
  title: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, loading, error, title }) => {
  if (loading) {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-700">Loading {title}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700 font-medium">Error:</p>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium text-gray-900 mb-2">{title} Results:</h4>
      <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-96 overflow-y-auto">
        <pre className="text-xs text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default function ApiDemo(): React.ReactElement {
  // Search states
  const [searchQuery, setSearchQuery] = useState('arijit singh');
  const [songId, setSongId] = useState('PIirrqf8');
  const [albumId, setAlbumId] = useState('34354395');
  const [artistId, setArtistId] = useState('459320');
  const [playlistId, setPlaylistId] = useState('110858205');

  // Hook instances
  const search = useSearch();
  const searchSongs = useSearchSongs();
  const searchAlbums = useSearchAlbums();
  const searchArtists = useSearchArtists();
  const searchPlaylists = useSearchPlaylists();
  const song = useSong();
  const songSuggestions = useSongSuggestions();
  const album = useAlbum();
  const artist = useArtist();
  const playlist = usePlaylist();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Saavn.dev API Demo</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive testing interface for all 14 API endpoints
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Global Search */}
          <DemoSection
            title="1. Global Search"
            description="Search across all content types (songs, albums, artists, playlists)"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search query"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => search.search(searchQuery)}
                disabled={search.loading || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Search All
              </button>
            </div>
            <ResultsDisplay
              data={search.data}
              loading={search.loading}
              error={search.error}
              title="Global Search"
            />
          </DemoSection>

          {/* Search Songs */}
          <DemoSection
            title="2. Search Songs"
            description="Search specifically for songs"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Song search query"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => searchSongs.searchSongs(searchQuery)}
                disabled={searchSongs.loading || !searchQuery.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Search Songs
              </button>
            </div>
            <ResultsDisplay
              data={searchSongs.data}
              loading={searchSongs.loading}
              error={searchSongs.error}
              title="Songs"
            />
          </DemoSection>

          {/* Search Albums */}
          <DemoSection
            title="3. Search Albums"
            description="Search specifically for albums"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Album search query"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => searchAlbums.searchAlbums(searchQuery)}
                disabled={searchAlbums.loading || !searchQuery.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Search Albums
              </button>
            </div>
            <ResultsDisplay
              data={searchAlbums.data}
              loading={searchAlbums.loading}
              error={searchAlbums.error}
              title="Albums"
            />
          </DemoSection>

          {/* Search Artists */}
          <DemoSection
            title="4. Search Artists"
            description="Search specifically for artists"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Artist search query"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => searchArtists.searchArtists(searchQuery)}
                disabled={searchArtists.loading || !searchQuery.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Search Artists
              </button>
            </div>
            <ResultsDisplay
              data={searchArtists.data}
              loading={searchArtists.loading}
              error={searchArtists.error}
              title="Artists"
            />
          </DemoSection>

          {/* Search Playlists */}
          <DemoSection
            title="5. Search Playlists"
            description="Search specifically for playlists"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Playlist search query"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => searchPlaylists.searchPlaylists(searchQuery)}
                disabled={searchPlaylists.loading || !searchQuery.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Search Playlists
              </button>
            </div>
            <ResultsDisplay
              data={searchPlaylists.data}
              loading={searchPlaylists.loading}
              error={searchPlaylists.error}
              title="Playlists"
            />
          </DemoSection>

          {/* Get Song */}
          <DemoSection
            title="6. Get Song Details"
            description="Get detailed information about a specific song"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={songId}
                onChange={(e) => setSongId(e.target.value)}
                placeholder="Song ID"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => song.getSong(songId)}
                disabled={song.loading || !songId.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Get Song
              </button>
            </div>
            <ResultsDisplay
              data={song.data}
              loading={song.loading}
              error={song.error}
              title="Song Details"
            />
          </DemoSection>

          {/* Get Song Suggestions */}
          <DemoSection
            title="7. Get Song Suggestions"
            description="Get song recommendations based on a song"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={songId}
                onChange={(e) => setSongId(e.target.value)}
                placeholder="Song ID for suggestions"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => songSuggestions.getSuggestions(songId)}
                disabled={songSuggestions.loading || !songId.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                Get Suggestions
              </button>
            </div>
            <ResultsDisplay
              data={songSuggestions.data}
              loading={songSuggestions.loading}
              error={songSuggestions.error}
              title="Song Suggestions"
            />
          </DemoSection>

          {/* Get Album */}
          <DemoSection
            title="8. Get Album Details"
            description="Get detailed information about a specific album"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                placeholder="Album ID"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => album.getAlbum(albumId)}
                disabled={album.loading || !albumId.trim()}
                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
              >
                Get Album
              </button>
            </div>
            <ResultsDisplay
              data={album.data}
              loading={album.loading}
              error={album.error}
              title="Album Details"
            />
          </DemoSection>

          {/* Get Artist */}
          <DemoSection
            title="9. Get Artist Details"
            description="Get detailed information about a specific artist"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={artistId}
                onChange={(e) => setArtistId(e.target.value)}
                placeholder="Artist ID"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => artist.getArtist(artistId)}
                disabled={artist.loading || !artistId.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                Get Artist
              </button>
            </div>
            <ResultsDisplay
              data={artist.data}
              loading={artist.loading}
              error={artist.error}
              title="Artist Details"
            />
          </DemoSection>

          {/* Get Playlist */}
          <DemoSection
            title="10. Get Playlist Details"
            description="Get detailed information about a specific playlist"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
                placeholder="Playlist ID"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => playlist.getPlaylist(playlistId)}
                disabled={playlist.loading || !playlistId.trim()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Get Playlist
              </button>
            </div>
            <ResultsDisplay
              data={playlist.data}
              loading={playlist.loading}
              error={playlist.error}
              title="Playlist Details"
            />
          </DemoSection>
        </div>

        {/* Test All Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // Test all endpoints with sample data
              search.search('arijit singh');
              searchSongs.searchSongs('kesariya');
              searchAlbums.searchAlbums('brahmastra');
              searchArtists.searchArtists('arijit');
              searchPlaylists.searchPlaylists('hindi');
              song.getSong('PIirrqf8');
              songSuggestions.getSuggestions('PIirrqf8');
              album.getAlbum('34354395');
              artist.getArtist('459320');
              playlist.getPlaylist('110858205');
            }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            🚀 Test All Endpoints
          </button>
          <p className="text-gray-600 text-sm mt-2">
            This will test all 10 main endpoints with sample data
          </p>
        </div>
      </div>
    </div>
  );
}
