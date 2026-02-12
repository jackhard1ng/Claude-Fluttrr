import { useState, useCallback, useRef, useMemo } from 'react';
import * as eventsApi from '../api/events';

/**
 * Simple in-memory cache for event data.
 * Entries expire after CACHE_TTL milliseconds.
 */
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (prefix, params) => {
  return `${prefix}:${JSON.stringify(params ?? {})}`;
};

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Custom hook for fetching and managing event data.
 *
 * Provides methods to fetch events (general, nearby, trending) with
 * automatic loading/error state management and a simple cache layer.
 *
 * @returns {Object} Event state and fetch methods
 */
const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Abort controllers to cancel in-flight requests
  const controllersRef = useRef({});

  /**
   * Internal helper to manage loading state and errors around an API call.
   */
  const execute = useCallback(async (key, apiCall) => {
    // Cancel any existing request for this key
    if (controllersRef.current[key]) {
      controllersRef.current[key].abort();
    }

    const controller = new AbortController();
    controllersRef.current[key] = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        const message = err.response?.data?.message || err.message || 'Failed to fetch events';
        setError(message);
      }
      return null;
    } finally {
      setLoading(false);
      delete controllersRef.current[key];
    }
  }, []);

  /**
   * Fetch a paginated list of events.
   */
  const fetchEvents = useCallback(
    async (params = {}) => {
      const cacheKey = getCacheKey('events', params);
      const cached = getFromCache(cacheKey);

      if (cached) {
        setEvents(cached.data || cached);
        if (cached.pagination) setPagination(cached.pagination);
        return cached;
      }

      const result = await execute('fetchEvents', () => eventsApi.getEvents(params));

      if (result) {
        const eventData = result.data || result;
        setEvents(Array.isArray(eventData) ? eventData : []);
        if (result.pagination) setPagination(result.pagination);
        setCache(cacheKey, result);
      }

      return result;
    },
    [execute]
  );

  /**
   * Fetch events near a geographic location.
   */
  const fetchNearbyEvents = useCallback(
    async (lat, lng, radius = 10, params = {}) => {
      const cacheKey = getCacheKey('nearby', { lat, lng, radius, ...params });
      const cached = getFromCache(cacheKey);

      if (cached) {
        setNearbyEvents(cached.data || cached);
        return cached;
      }

      const result = await execute('fetchNearby', () =>
        eventsApi.getNearbyEvents(lat, lng, radius, params)
      );

      if (result) {
        const eventData = result.data || result;
        setNearbyEvents(Array.isArray(eventData) ? eventData : []);
        setCache(cacheKey, result);
      }

      return result;
    },
    [execute]
  );

  /**
   * Fetch trending events.
   */
  const fetchTrendingEvents = useCallback(async () => {
    const cacheKey = getCacheKey('trending', {});
    const cached = getFromCache(cacheKey);

    if (cached) {
      setTrendingEvents(cached.data || cached);
      return cached;
    }

    const result = await execute('fetchTrending', () => eventsApi.getTrendingEvents());

    if (result) {
      const eventData = result.data || result;
      setTrendingEvents(Array.isArray(eventData) ? eventData : []);
      setCache(cacheKey, result);
    }

    return result;
  }, [execute]);

  /**
   * Fetch featured events.
   */
  const fetchFeaturedEvents = useCallback(async () => {
    const cacheKey = getCacheKey('featured', {});
    const cached = getFromCache(cacheKey);

    if (cached) {
      setFeaturedEvents(cached.data || cached);
      return cached;
    }

    const result = await execute('fetchFeatured', () => eventsApi.getFeaturedEvents());

    if (result) {
      const eventData = result.data || result;
      setFeaturedEvents(Array.isArray(eventData) ? eventData : []);
      setCache(cacheKey, result);
    }

    return result;
  }, [execute]);

  /**
   * Fetch a single event by ID.
   */
  const fetchEvent = useCallback(
    async (id) => {
      const cacheKey = getCacheKey('event', { id });
      const cached = getFromCache(cacheKey);

      if (cached) {
        setSelectedEvent(cached.data || cached);
        return cached;
      }

      const result = await execute('fetchEvent', () => eventsApi.getEvent(id));

      if (result) {
        const eventData = result.data || result;
        setSelectedEvent(eventData);
        setCache(cacheKey, result);
      }

      return result;
    },
    [execute]
  );

  /**
   * Search events by text query.
   */
  const searchEvents = useCallback(
    async (query, params = {}) => {
      const result = await execute('searchEvents', () =>
        eventsApi.searchEvents(query, params)
      );

      if (result) {
        const eventData = result.data || result;
        setEvents(Array.isArray(eventData) ? eventData : []);
      }

      return result;
    },
    [execute]
  );

  /**
   * Invalidate all cached data.
   */
  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  /**
   * Refresh current events data (clears cache first).
   */
  const refresh = useCallback(async () => {
    clearCache();
    await fetchEvents();
  }, [clearCache, fetchEvents]);

  return useMemo(
    () => ({
      // State
      events,
      trendingEvents,
      featuredEvents,
      nearbyEvents,
      selectedEvent,
      loading,
      error,
      pagination,

      // Actions
      fetchEvents,
      fetchNearbyEvents,
      fetchTrendingEvents,
      fetchFeaturedEvents,
      fetchEvent,
      searchEvents,
      clearCache,
      refresh,
      setSelectedEvent,
    }),
    [
      events,
      trendingEvents,
      featuredEvents,
      nearbyEvents,
      selectedEvent,
      loading,
      error,
      pagination,
      fetchEvents,
      fetchNearbyEvents,
      fetchTrendingEvents,
      fetchFeaturedEvents,
      fetchEvent,
      searchEvents,
      clearCache,
      refresh,
    ]
  );
};

export default useEvents;
