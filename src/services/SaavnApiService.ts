/**
 * @fileoverview Production-grade Saavn API Service using Fetch API
 * @author Principal Software Engineer
 * @version 2.0.0
 * 
 * This service provides EXACT implementation based on saavn.dev API documentation
 * ALL endpoints match the official API specification with ZERO deviation
 */

import { SaavnApiError, ValidationError, NetworkError, ApiResponseError } from '../types/errors';
import type { 
  SearchResult,
  SongsResponse,
  AlbumsResponse,
  ArtistsResponse,
  PlaylistsResponse,
  SongResponse,
  AlbumResponse,
  ArtistResponse,
  PlaylistResponse,
  SuggestionsResponse,
  ArtistSongsResponse,
  ArtistAlbumsResponse,
  ArtistOptions,
  SortBy,
  SortOrder
} from '../types/saavn';

/**
 * Configuration interface for the Saavn API Service
 */
interface SaavnApiConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  userAgent: string;
  rateLimitDelay: number;
}

/**
 * Default configuration optimized for production use
 */
const DEFAULT_CONFIG: SaavnApiConfig = {
  baseUrl: import.meta.env.PROD ? '/api' : 'https://saavn.sumit.co',
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  userAgent: 'Lumeo-Music-App/2.0.0',
  rateLimitDelay: 100 // 100ms between requests
};

/**
 * Production-grade Saavn API Service
 * Implements ALL endpoints from the official API documentation
 */
export class SaavnApiService {
  private readonly config: SaavnApiConfig;
  private lastRequestTime: number = 0;

  /**
   * Creates a new instance of SaavnApiService
   */
  constructor(config?: Partial<SaavnApiConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Enforces rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.config.rateLimitDelay) {
      const delay = this.config.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Makes an HTTP request with comprehensive error handling and retries
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    await this.enforceRateLimit();

    const url = `${this.config.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const requestOptions: RequestInit = {
          method: 'GET',
          headers: {
            'User-Agent': this.config.userAgent,
            'Accept': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
          ...options,
        };

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new ApiResponseError(
            `HTTP ${response.status}: Request failed`,
            response.status,
            await this.safelyParseErrorResponse(response)
          );
        }

        const responseText = await response.text();
        
        if (!responseText) {
          throw new ApiResponseError('Empty response body', response.status);
        }

        let parsedData: T;
        try {
          parsedData = JSON.parse(responseText);
        } catch (parseError) {
          throw new ApiResponseError(
            'Invalid JSON response',
            response.status,
            { parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error' }
          );
        }

        return parsedData;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on validation errors or client errors (4xx)
        if (error instanceof ValidationError || 
            (error instanceof ApiResponseError && error.statusCode >= 400 && error.statusCode < 500)) {
          throw error;
        }

        // Don't retry on AbortError (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timeout', error);
        }

        // Exponential backoff for retries
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw new NetworkError(
      `Failed to complete request after ${this.config.maxRetries + 1} attempts`,
      lastError || undefined
    );
  }

  /**
   * Safely parses error response bodies
   */
  private async safelyParseErrorResponse(response: Response): Promise<any> {
    try {
      const text = await response.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /**
   * Validates and sanitizes query strings
   */
  private validateAndSanitizeQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Query parameter is required and must be a string');
    }
    
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      throw new ValidationError('Query parameter cannot be empty');
    }
    
    if (trimmed.length > 100) {
      throw new ValidationError('Query parameter too long (max 100 characters)');
    }
    
    return encodeURIComponent(trimmed);
  }

  /**
   * 1. Global Search - /api/search
   * Search for songs, albums, artists, and playlists based on the provided query string
   */
  async search(query: string): Promise<SearchResult> {
    const sanitizedQuery = this.validateAndSanitizeQuery(query);
    
    try {
      const result = await this.makeRequest<SearchResult>(`/api/search?query=${sanitizedQuery}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Search failed for query: ${query}`,
        'search',
        { query, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 2. Search Songs - /api/search/songs
   * Search for songs based on the provided query
   */
  async searchSongs(query: string, page: number = 0, limit: number = 10): Promise<SongsResponse> {
    const sanitizedQuery = this.validateAndSanitizeQuery(query);
    
    try {
      const result = await this.makeRequest<SongsResponse>(
        `/api/search/songs?query=${sanitizedQuery}&page=${page}&limit=${limit}`
      );
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Song search failed for query: ${query}`,
        'searchSongs',
        { query, page, limit, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 3. Search Albums - /api/search/albums
   * Search for albums based on the provided query
   */
  async searchAlbums(query: string, page: number = 0, limit: number = 10): Promise<AlbumsResponse> {
    const sanitizedQuery = this.validateAndSanitizeQuery(query);
    
    try {
      const result = await this.makeRequest<AlbumsResponse>(
        `/api/search/albums?query=${sanitizedQuery}&page=${page}&limit=${limit}`
      );
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Album search failed for query: ${query}`,
        'searchAlbums',
        { query, page, limit, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 4. Search Artists - /api/search/artists
   * Search for artists based on the provided query
   */
  async searchArtists(query: string, page: number = 0, limit: number = 10): Promise<ArtistsResponse> {
    const sanitizedQuery = this.validateAndSanitizeQuery(query);
    
    try {
      const result = await this.makeRequest<ArtistsResponse>(
        `/api/search/artists?query=${sanitizedQuery}&page=${page}&limit=${limit}`
      );
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Artist search failed for query: ${query}`,
        'searchArtists',
        { query, page, limit, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 5. Search Playlists - /api/search/playlists
   * Search for playlists based on the provided query
   */
  async searchPlaylists(query: string, page: number = 0, limit: number = 10): Promise<PlaylistsResponse> {
    const sanitizedQuery = this.validateAndSanitizeQuery(query);
    
    try {
      const result = await this.makeRequest<PlaylistsResponse>(
        `/api/search/playlists?query=${sanitizedQuery}&page=${page}&limit=${limit}`
      );
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Playlist search failed for query: ${query}`,
        'searchPlaylists',
        { query, page, limit, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 6. Get Multiple Songs - /api/songs?ids=
   * Retrieve songs by a comma-separated list of IDs
   */
  async getSongs(ids: string[]): Promise<SongResponse> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError('Song IDs array is required and cannot be empty');
    }

    const idsString = ids.join(',');
    
    try {
      const result = await this.makeRequest<SongResponse>(`/api/songs?ids=${encodeURIComponent(idsString)}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch songs with IDs: ${idsString}`,
        'getSongs',
        { ids, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 7. Get Single Song - /api/songs/{id}
   * Retrieve a song by its ID
   */
  async getSong(id: string): Promise<SongResponse> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Song ID is required');
    }
    
    try {
      const result = await this.makeRequest<SongResponse>(`/api/songs/${encodeURIComponent(id)}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch song with ID: ${id}`,
        'getSong',
        { id, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 8. Get Song Suggestions - /api/songs/{id}/suggestions
   * Retrieve song suggestions based on the given song ID
   */
  async getSongSuggestions(id: string, limit: number = 10): Promise<SuggestionsResponse> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Song ID is required');
    }
    
    try {
      const result = await this.makeRequest<SuggestionsResponse>(
        `/api/songs/${encodeURIComponent(id)}/suggestions?limit=${limit}`
      );
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch suggestions for song ID: ${id}`,
        'getSongSuggestions',
        { id, limit, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 9. Get Album - /api/albums
   * Retrieve an album by providing either an ID or a direct link to the album
   */
  async getAlbum(id: string, link?: string): Promise<AlbumResponse> {
    if (!id && !link) {
      throw new ValidationError('Either album ID or link is required');
    }

    const params = new URLSearchParams();
    if (id) params.append('id', id);
    if (link) params.append('link', link);
    
    try {
      const result = await this.makeRequest<AlbumResponse>(`/api/albums?${params.toString()}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch album`,
        'getAlbum',
        { id, link, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 10. Get Artist (Comprehensive) - /api/artists
   * Retrieve artists by ID or by a direct artist link
   */
  async getArtist(id: string, options?: ArtistOptions, link?: string): Promise<ArtistResponse> {
    if (!id && !link) {
      throw new ValidationError('Either artist ID or link is required');
    }

    const params = new URLSearchParams();
    if (id) params.append('id', id);
    if (link) params.append('link', link);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.songCount) params.append('songCount', options.songCount.toString());
    if (options?.albumCount) params.append('albumCount', options.albumCount.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
    
    try {
      const result = await this.makeRequest<ArtistResponse>(`/api/artists?${params.toString()}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch artist`,
        'getArtist',
        { id, link, options, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 11. Get Artist by ID (Simple) - /api/artists/{id}
   * Retrieve artist by ID
   */
  async getArtistById(
    id: string, 
    page: number = 0, 
    songCount: number = 10, 
    albumCount: number = 10,
    sortBy: SortBy = 'popularity',
    sortOrder: SortOrder = 'desc'
  ): Promise<ArtistResponse> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Artist ID is required');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      songCount: songCount.toString(),
      albumCount: albumCount.toString(),
      sortBy,
      sortOrder
    });
    
    try {
      const result = await this.makeRequest<ArtistResponse>(`/api/artists/${encodeURIComponent(id)}?${params.toString()}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch artist with ID: ${id}`,
        'getArtistById',
        { id, page, songCount, albumCount, sortBy, sortOrder, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 12. Get Artist Songs - /api/artists/{id}/songs
   * Retrieve a list of songs for a given artist by their ID
   */
  async getArtistSongs(
    id: string, 
    page: number = 0,
    sortBy: SortBy = 'popularity',
    sortOrder: SortOrder = 'desc'
  ): Promise<ArtistSongsResponse> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Artist ID is required');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      sortBy,
      sortOrder
    });
    
    try {
      const result = await this.makeRequest<ArtistSongsResponse>(`/api/artists/${encodeURIComponent(id)}/songs?${params.toString()}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch songs for artist ID: ${id}`,
        'getArtistSongs',
        { id, page, sortBy, sortOrder, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 13. Get Artist Albums - /api/artists/{id}/albums
   * Retrieve a list of albums for a given artist by their ID
   */
  async getArtistAlbums(
    id: string, 
    page: number = 0,
    sortBy: SortBy = 'popularity',
    sortOrder: SortOrder = 'desc'
  ): Promise<ArtistAlbumsResponse> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Artist ID is required');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      sortBy,
      sortOrder
    });
    
    try {
      const result = await this.makeRequest<ArtistAlbumsResponse>(`/api/artists/${encodeURIComponent(id)}/albums?${params.toString()}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch albums for artist ID: ${id}`,
        'getArtistAlbums',
        { id, page, sortBy, sortOrder, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * 14. Get Playlist - /api/playlists
   * Retrieve a playlist by providing either an ID or a direct link to the playlist
   */
  async getPlaylist(id: string, link?: string, page: number = 0, limit: number = 10): Promise<PlaylistResponse> {
    if (!id && !link) {
      throw new ValidationError('Either playlist ID or link is required');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (id) params.append('id', id);
    if (link) params.append('link', link);
    
    try {
      const result = await this.makeRequest<PlaylistResponse>(`/api/playlists?${params.toString()}`);
      return result;
    } catch (error) {
      throw new SaavnApiError(
        `Failed to fetch playlist`,
        'getPlaylist',
        { id, link, page, limit, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Gracefully shuts down the service
   */
  destroy(): void {
    this.lastRequestTime = 0;
  }
}

/**
 * Singleton instance for application-wide use
 */
export const saavnApi = new SaavnApiService();