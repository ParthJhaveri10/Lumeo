/**
 * @fileoverview Accurate Type definitions for Saavn API based on official documentation
 * @author Principal Software Engineer
 * @version 2.0.0
 * 
 * CRITICAL: These types match EXACTLY with the API documentation at saavn.dev
 * ANY deviation from the actual API response structure is FORBIDDEN
 */

/**
 * Image quality variants from API
 */
export interface ImageQuality {
  quality: string;
  url: string;
}

/**
 * Download URL with quality information
 */
export interface DownloadUrl {
  quality: string;
  url: string;
}

/**
 * Artist information structure from API
 */
export interface ArtistInfo {
  id: string;
  name: string;
  role: string;
  type: string;
  image: ImageQuality[];
  url: string;
}

/**
 * Artists container with primary, featured, and all arrays
 */
export interface ArtistsContainer {
  primary: ArtistInfo[];
  featured: ArtistInfo[];
  all: ArtistInfo[];
}

/**
 * Album reference in song objects
 */
export interface AlbumReference {
  id: string | null;
  name: string | null;
  url: string | null;
}

/**
 * Song entity - EXACT match with API documentation
 */
export interface Song {
  id: string;
  name: string;
  type: string;
  year: number | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: AlbumReference;
  artists: ArtistsContainer;
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
}

/**
 * Album entity - EXACT match with API documentation
 */
export interface Album {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  artists: ArtistsContainer;
  songCount: number | null;
  url: string;
  image: ImageQuality[];
  songs?: Song[];
}

/**
 * Bio information for artists
 */
export interface ArtistBio {
  text: string | null;
  title: string | null;
  sequence: number | null;
}

/**
 * Artist entity - EXACT match with API documentation
 */
export interface Artist {
  id: string;
  name: string;
  url: string;
  type: string;
  image: ImageQuality[];
  followerCount: number | null;
  fanCount: number | null;
  isVerified: boolean | null;
  dominantLanguage: string | null;
  dominantType: string | null;
  bio: ArtistBio[];
  dob: string | null;
  fb: string | null;
  twitter: string | null;
  wiki: string | null;
  availableLanguages: string[];
  isRadioPresent: boolean | null;
  topSongs?: Song[];
  topAlbums?: Album[];
  singles?: Song[];
  similarArtists?: Artist[];
}

/**
 * Playlist entity - EXACT match with API documentation
 */
export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  type: string;
  playCount: number | null;
  language: string;
  explicitContent: boolean;
  songCount: number | null;
  url: string;
  image: ImageQuality[];
  songs?: Song[];
  artists?: ArtistInfo[];
}

/**
 * Search result item for general search (different from individual entities)
 */
export interface SearchResultItem {
  id: string;
  title: string;
  image: ImageQuality[];
  artist?: string;
  album?: string;
  url: string;
  type: string;
  description: string;
  primaryArtists?: string;
  singers?: string;
  language: string;
  year?: string;
  songIds?: string;
  position?: number;
}

/**
 * Search results container
 */
export interface SearchResults {
  results: SearchResultItem[];
  position: number;
}

/**
 * Main search response structure - EXACT match with API
 */
export interface SearchResult {
  success: boolean;
  data: {
    albums?: SearchResults;
    songs?: SearchResults;
    artists?: SearchResults;
    playlists?: SearchResults;
    topQuery?: SearchResults;
  };
}

/**
 * Paginated response for songs
 */
export interface SongsResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Song[];
  };
}

/**
 * Paginated response for albums
 */
export interface AlbumsResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Album[];
  };
}

/**
 * Paginated response for artists
 */
export interface ArtistsResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Artist[];
  };
}

/**
 * Paginated response for playlists
 */
export interface PlaylistsResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Playlist[];
  };
}

/**
 * Single song response
 */
export interface SongResponse {
  success: boolean;
  data: Song[];
}

/**
 * Single album response
 */
export interface AlbumResponse {
  success: boolean;
  data: Album;
}

/**
 * Single artist response
 */
export interface ArtistResponse {
  success: boolean;
  data: Artist;
}

/**
 * Single playlist response
 */
export interface PlaylistResponse {
  success: boolean;
  data: Playlist;
}

/**
 * Song suggestions response
 */
export interface SuggestionsResponse {
  success: boolean;
  data: Song[];
}

/**
 * Artist songs response
 */
export interface ArtistSongsResponse {
  success: boolean;
  data: {
    total: number;
    songs: Song[];
  };
}

/**
 * Artist albums response
 */
export interface ArtistAlbumsResponse {
  success: boolean;
  data: {
    total: number;
    albums: Album[];
  };
}

/**
 * Sort options
 */
export type SortBy = 'popularity' | 'latest' | 'alphabetical';
export type SortOrder = 'asc' | 'desc';

/**
 * Artist query options
 */
export interface ArtistOptions {
  page?: number;
  songCount?: number;
  albumCount?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}