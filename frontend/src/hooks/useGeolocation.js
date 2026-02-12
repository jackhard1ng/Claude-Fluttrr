import { useState, useEffect, useCallback, useRef } from 'react';
import { MAP_DEFAULT_CENTER } from '../utils/constants';

/**
 * Geolocation options for the browser API.
 */
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5 * 60 * 1000, // cache for 5 minutes
};

/**
 * Custom hook for browser geolocation.
 *
 * Returns the user's current geographic position (latitude, longitude),
 * loading/error state, and a method to request a fresh position.
 *
 * Falls back to the MAP_DEFAULT_CENTER (Austin, TX) when geolocation
 * is unavailable or denied.
 *
 * @param {Object} options
 * @param {boolean} options.watchPosition - If true, continuously track position
 * @param {boolean} options.autoFetch - If true, request position on mount (default true)
 * @returns {Object} Geolocation state and methods
 */
const useGeolocation = ({ watchPosition = false, autoFetch = true } = {}) => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState(null);

  const watchIdRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Handle a successful geolocation result.
   */
  const onSuccess = useCallback((position) => {
    if (!isMountedRef.current) return;
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
    setAccuracy(position.coords.accuracy);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Handle a geolocation error.
   */
  const onError = useCallback((err) => {
    if (!isMountedRef.current) return;

    let message;
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission denied. Using default location.';
        setPermissionState('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information unavailable. Using default location.';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out. Using default location.';
        break;
      default:
        message = 'An unknown error occurred while retrieving location.';
    }

    setError(message);
    setLoading(false);

    // Fall back to default center
    setLatitude(MAP_DEFAULT_CENTER.lat);
    setLongitude(MAP_DEFAULT_CENTER.lng);
  }, []);

  /**
   * Request the current position once.
   */
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLatitude(MAP_DEFAULT_CENTER.lat);
      setLongitude(MAP_DEFAULT_CENTER.lng);
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTIONS);
  }, [onSuccess, onError]);

  /**
   * Start watching the position continuously.
   */
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, GEO_OPTIONS);
  }, [onSuccess, onError]);

  /**
   * Stop watching the position.
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Check the permission state (if the Permissions API is available)
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          if (isMountedRef.current) {
            setPermissionState(result.state);

            result.addEventListener('change', () => {
              if (isMountedRef.current) {
                setPermissionState(result.state);
              }
            });
          }
        })
        .catch(() => {
          // Permissions API not fully supported
        });
    }
  }, []);

  // Auto-fetch or watch on mount
  useEffect(() => {
    if (autoFetch) {
      if (watchPosition) {
        startWatching();
      } else {
        getCurrentPosition();
      }
    }

    return () => {
      isMountedRef.current = false;
      stopWatching();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    permissionState,
    isAvailable: !!latitude && !!longitude,
    getCurrentPosition,
    startWatching,
    stopWatching,
  };
};

export default useGeolocation;
