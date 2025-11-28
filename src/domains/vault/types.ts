/**
 * Intel Vault Types
 *
 * Type definitions for the Intel Vault document management system.
 */

// Document security classification levels
export type SecurityLevel = 'unclassified' | 'confidential' | 'secret' | 'top-secret';

// Document status in the vault
export type DocumentStatus = 'draft' | 'active' | 'archived' | 'pending-review';

// Document type/category
export type DocumentCategory =
  | 'intelligence-report'
  | 'financial-analysis'
  | 'risk-assessment'
  | 'legal-document'
  | 'corporate-filing'
  | 'surveillance-log'
  | 'network-analysis'
  | 'other';

// File type
export type FileType = 'pdf' | 'docx' | 'xlsx' | 'txt' | 'json' | 'csv' | 'image' | 'other';

/**
 * Document metadata in the vault
 */
export interface VaultDocument {
  id: string;
  title: string;
  filename: string;
  fileType: FileType;
  category: DocumentCategory;
  securityLevel: SecurityLevel;
  status: DocumentStatus;
  size: number; // bytes
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  description?: string;
  caseId?: string;
  expiresAt?: string;
  checksum?: string;
}

/**
 * Search/filter parameters for vault queries
 */
export interface VaultSearchParams {
  query?: string;
  category?: DocumentCategory;
  securityLevel?: SecurityLevel;
  status?: DocumentStatus;
  fileType?: FileType;
  tags?: string[];
  caseId?: string;
  createdAfter?: string;
  createdBefore?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'size';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Paginated result set
 */
export interface VaultSearchResult {
  documents: VaultDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Document upload request
 */
export interface DocumentUploadRequest {
  file: File;
  title: string;
  category: DocumentCategory;
  securityLevel: SecurityLevel;
  tags?: string[];
  description?: string;
  caseId?: string;
}

/**
 * Document update request
 */
export interface DocumentUpdateRequest {
  id: string;
  title?: string;
  category?: DocumentCategory;
  securityLevel?: SecurityLevel;
  status?: DocumentStatus;
  tags?: string[];
  description?: string;
}

/**
 * Vault state for hooks
 */
export interface VaultState {
  documents: VaultDocument[];
  selectedDocument: VaultDocument | null;
  searchParams: VaultSearchParams;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Vault API response wrapper
 */
export interface VaultApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
