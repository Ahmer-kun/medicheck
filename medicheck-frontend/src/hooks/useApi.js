// src/hooks/useApi.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../utils/api';

export const useApi = (autoCancel = true) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null
  });
  
  const requestIdRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (autoCancel && requestIdRef.current) {
        api.cancelRequest(requestIdRef.current);
      }
    };
  }, [autoCancel]);

  const callApi = useCallback(async (apiCall, ...args) => {
    if (!mountedRef.current) return;

    // Generate unique request ID
    requestIdRef.current = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall(...args);
      
      if (mountedRef.current) {
        setState({
          loading: false,
          error: null,
          data: response.data || response
        });
      }
      
      return response;
    } catch (error) {
      if (mountedRef.current && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
      throw error;
    }
  }, [autoCancel]);

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setState({
        loading: false,
        error: null,
        data: null
      });
    }
  }, []);

  const setData = useCallback((data) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, data }));
    }
  }, []);

  const setError = useCallback((error) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, error, loading: false }));
    }
  }, []);

  return {
    ...state,
    callApi,
    reset,
    setData,
    setError,
    requestId: requestIdRef.current
  };
};

// Specialized hooks for common operations
export const useGet = (url, options = {}) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(url, options);
        if (mountedRef.current) {
          setState({
            loading: false,
            error: null,
            data: response.data || response
          });
        }
      } catch (error) {
        if (mountedRef.current) {
          setState({
            loading: false,
            error: error.message,
            data: null
          });
        }
      }
    };

    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [url, JSON.stringify(options)]);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get(url, options);
      if (mountedRef.current) {
        setState({
          loading: false,
          error: null,
          data: response.data || response
        });
      }
      return response;
    } catch (error) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
      throw error;
    }
  }, [url, JSON.stringify(options)]);

  return { ...state, refetch };
};