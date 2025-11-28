/**
 * useVault Hook
 *
 * React hook for managing Intel Vault document search, filtering, and selection.
 */

import { useState, useCallback, useEffect } from 'react';
import type { VaultSearchParams, VaultState } from '../types';
import { searchDocuments, getDocument, getFilterOptions } from '../services/vaultApi';

const DEFAULT_PAGE_SIZE = 10;

interface UseVaultOptions {
  initialParams?: VaultSearchParams;
  autoLoad?: boolean;
}

interface FilterOptions {
  categories: string[];
  securityLevels: string[];
  statuses: string[];
  fileTypes: string[];
  allTags: string[];
  caseIds: string[];
}

export function useVault(options: UseVaultOptions = {}) {
  const { initialParams = {}, autoLoad = true } = options;

  const [state, setState] = useState<VaultState>({
    documents: [],
    selectedDocument: null,
    searchParams: { pageSize: DEFAULT_PAGE_SIZE, ...initialParams },
    total: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 0,
    isLoading: false,
    error: null,
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  /**
   * Execute search with current or provided params
   */
  const search = useCallback(async (params?: Partial<VaultSearchParams>) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      searchParams: params ? { ...prev.searchParams, ...params } : prev.searchParams,
    }));

    try {
      const mergedParams = params
        ? { ...state.searchParams, ...params }
        : state.searchParams;

      const result = await searchDocuments(mergedParams);

      setState((prev) => ({
        ...prev,
        documents: result.documents,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        isLoading: false,
        searchParams: mergedParams,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Search failed',
      }));
    }
  }, [state.searchParams]);

  /**
   * Update search query
   */
  const setQuery = useCallback((query: string) => {
    search({ query, page: 1 });
  }, [search]);

  /**
   * Update filters
   */
  const setFilters = useCallback((filters: Partial<VaultSearchParams>) => {
    search({ ...filters, page: 1 });
  }, [search]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    search({
      query: undefined,
      category: undefined,
      securityLevel: undefined,
      status: undefined,
      fileType: undefined,
      tags: undefined,
      caseId: undefined,
      page: 1,
    });
  }, [search]);

  /**
   * Change page
   */
  const setPage = useCallback((page: number) => {
    search({ page });
  }, [search]);

  /**
   * Change sort
   */
  const setSort = useCallback((sortBy: VaultSearchParams['sortBy'], sortOrder?: 'asc' | 'desc') => {
    search({ sortBy, sortOrder: sortOrder ?? 'desc', page: 1 });
  }, [search]);

  /**
   * Select a document
   */
  const selectDocument = useCallback(async (id: string | null) => {
    if (!id) {
      setState((prev) => ({ ...prev, selectedDocument: null }));
      return;
    }

    const doc = await getDocument(id);
    setState((prev) => ({ ...prev, selectedDocument: doc }));
  }, []);

  /**
   * Load filter options
   */
  const loadFilterOptions = useCallback(async () => {
    const options = await getFilterOptions();
    setFilterOptions(options);
  }, []);

  /**
   * Refresh current search
   */
  const refresh = useCallback(() => {
    search();
  }, [search]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      search();
      loadFilterOptions();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    documents: state.documents,
    selectedDocument: state.selectedDocument,
    searchParams: state.searchParams,
    total: state.total,
    page: state.page,
    pageSize: state.pageSize,
    totalPages: state.totalPages,
    isLoading: state.isLoading,
    error: state.error,
    filterOptions,

    // Actions
    search,
    setQuery,
    setFilters,
    clearFilters,
    setPage,
    setSort,
    selectDocument,
    refresh,
    loadFilterOptions,
  };
}

export type UseVaultReturn = ReturnType<typeof useVault>;
