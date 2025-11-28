/**
 * Intel Vault Domain
 *
 * Public API for the vault module.
 */

// Types
export type {
  VaultDocument,
  VaultSearchParams,
  VaultSearchResult,
  VaultState,
  VaultApiResponse,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  SecurityLevel,
  DocumentStatus,
  DocumentCategory,
  FileType,
} from './types';

// Services
export {
  searchDocuments,
  getDocument,
  getFilterOptions,
  formatFileSize,
} from './services/vaultApi';

// Hooks
export { useVault } from './hooks/useVault';
export type { UseVaultReturn } from './hooks/useVault';
