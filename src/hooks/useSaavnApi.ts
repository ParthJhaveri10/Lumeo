/**
 * @fileoverview React hooks for Saavn API with caching and state management
 * @author Principal Software Engineer  
 * @version 2.0.0
 */

import { useState, useCallback } from 'react';
import { saavnApi } from '../services/SaavnApiService';
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
  SuggestionsResponse
} from '../types/saavn';
import { BaseError } from '../types/errors';

interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useApiCall<T>(): [ApiHookState<T>, (apiCall: () => Promise<T>) => Promise<void>] {
  const [state, setState] = useState<ApiHookState<T>>({
    data: null,
    loading: false,
    error: null
  });
  
  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof BaseError 
        ? error.getUserMessage()
        : error instanceof Error 
          ? error.message
          : 'An unexpected error occurred';
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);
  
  return [state, execute];
}

export function useSearch() {
  const [state, execute] = useApiCall<SearchResult>();
  
  const search = useCallback(async (query: string) => {
    await execute(() => saavnApi.search(query));
  }, [execute]);
  
  return { ...state, search };
}

export function useSearchSongs() {
  const [state, execute] = useApiCall<SongsResponse>();
  
  const searchSongs = useCallback(async (query: string, page = 0, limit = 10) => {
    await execute(() => saavnApi.searchSongs(query, page, limit));
  }, [execute]);
  
  return { ...state, searchSongs };
}

export function useSearchAlbums() {
  const [state, execute] = useApiCall<AlbumsResponse>();
  
  const searchAlbums = useCallback(async (query: string, page = 0, limit = 10) => {
    await execute(() => saavnApi.searchAlbums(query, page, limit));
  }, [execute]);
  
  return { ...state, searchAlbums };
}

export function useSearchArtists() {
  const [state, execute] = useApiCall<ArtistsResponse>();
  
  const searchArtists = useCallback(async (query: string, page = 0, limit = 10) => {
    await execute(() => saavnApi.searchArtists(query, page, limit));
  }, [execute]);
  
  return { ...state, searchArtists };
}

export function useSearchPlaylists() {
  const [state, execute] = useApiCall<PlaylistsResponse>();
  
  const searchPlaylists = useCallback(async (query: string, page = 0, limit = 10) => {
    await execute(() => saavnApi.searchPlaylists(query, page, limit));
  }, [execute]);
  
  return { ...state, searchPlaylists };
}

export function useSong() {
  const [state, execute] = useApiCall<SongResponse>();
  
  const getSong = useCallback(async (id: string) => {
    await execute(() => saavnApi.getSong(id));
  }, [execute]);
  
  return { ...state, getSong };
}

export function useSongSuggestions() {
  const [state, execute] = useApiCall<SuggestionsResponse>();
  
  const getSuggestions = useCallback(async (id: string, limit = 10) => {
    await execute(() => saavnApi.getSongSuggestions(id, limit));
  }, [execute]);
  
  return { ...state, getSuggestions };
}

export function useAlbum() {
  const [state, execute] = useApiCall<AlbumResponse>();
  
  const getAlbum = useCallback(async (id: string, link?: string) => {
    await execute(() => saavnApi.getAlbum(id, link));
  }, [execute]);
  
  return { ...state, getAlbum };
}

export function useArtist() {
  const [state, execute] = useApiCall<ArtistResponse>();
  
  const getArtist = useCallback(async (id: string) => {
    await execute(() => saavnApi.getArtistById(id));
  }, [execute]);
  
  return { ...state, getArtist };
}

export function usePlaylist() {
  const [state, execute] = useApiCall<PlaylistResponse>();
  
  const getPlaylist = useCallback(async (id: string, link?: string, page = 0, limit = 10) => {
    await execute(() => saavnApi.getPlaylist(id, link, page, limit));
  }, [execute]);
  
  return { ...state, getPlaylist };
}