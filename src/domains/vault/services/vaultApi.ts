/**
 * Intel Vault API Service
 *
 * Provides document management operations with mock data.
 * In production, these would connect to secure document storage backends.
 */

import type {
  VaultDocument,
  VaultSearchParams,
  VaultSearchResult,
  DocumentCategory,
  SecurityLevel,
  FileType,
  DocumentStatus,
} from '../types';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-001',
    title: 'Financial Analysis Report Q4 2024',
    filename: 'q4-2024-financial-analysis.pdf',
    fileType: 'pdf',
    category: 'financial-analysis',
    securityLevel: 'confidential',
    status: 'active',
    size: 2457600,
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-20T14:45:00Z',
    createdBy: 'analyst@greyeye.com',
    tags: ['financial', 'quarterly', '2024', 'TSL'],
    description: 'Comprehensive financial analysis for TSL Group Q4 2024',
    caseId: 'tsl-2024',
  },
  {
    id: 'doc-002',
    title: 'Risk Assessment Matrix',
    filename: 'risk-matrix-umit-holdings.xlsx',
    fileType: 'xlsx',
    category: 'risk-assessment',
    securityLevel: 'secret',
    status: 'active',
    size: 524288,
    createdAt: '2024-11-20T08:15:00Z',
    updatedAt: '2024-12-18T11:20:00Z',
    createdBy: 'risk@greyeye.com',
    tags: ['risk', 'matrix', 'umit', 'scoring'],
    description: 'Multi-dimensional risk scoring for Umit Holdings investigation',
    caseId: 'umit-2024',
  },
  {
    id: 'doc-003',
    title: 'Corporate Registry Extract - TSL Group',
    filename: 'tsl-corp-registry-2024.pdf',
    fileType: 'pdf',
    category: 'corporate-filing',
    securityLevel: 'unclassified',
    status: 'active',
    size: 1048576,
    createdAt: '2024-10-05T09:00:00Z',
    updatedAt: '2024-10-05T09:00:00Z',
    createdBy: 'research@greyeye.com',
    tags: ['corporate', 'registry', 'tsl', 'official'],
    description: 'Official corporate registry extract for TSL Group A/S',
    caseId: 'tsl-2024',
  },
  {
    id: 'doc-004',
    title: 'Network Analysis - Transaction Flows',
    filename: 'network-analysis-txn-flows.json',
    fileType: 'json',
    category: 'network-analysis',
    securityLevel: 'top-secret',
    status: 'pending-review',
    size: 3145728,
    createdAt: '2024-12-22T16:45:00Z',
    updatedAt: '2024-12-22T16:45:00Z',
    createdBy: 'analyst@greyeye.com',
    tags: ['network', 'transactions', 'flows', 'suspicious'],
    description: 'Automated network analysis of suspicious transaction patterns',
  },
  {
    id: 'doc-005',
    title: 'Legal Opinion - AML Compliance',
    filename: 'legal-opinion-aml-2024.docx',
    fileType: 'docx',
    category: 'legal-document',
    securityLevel: 'confidential',
    status: 'archived',
    size: 819200,
    createdAt: '2024-08-10T11:30:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
    createdBy: 'legal@greyeye.com',
    tags: ['legal', 'aml', 'compliance', 'opinion'],
    description: 'External legal opinion on AML compliance requirements',
  },
  {
    id: 'doc-006',
    title: 'Intelligence Report - Eastern European Operations',
    filename: 'intel-report-ee-ops.pdf',
    fileType: 'pdf',
    category: 'intelligence-report',
    securityLevel: 'top-secret',
    status: 'active',
    size: 4194304,
    createdAt: '2024-12-01T14:00:00Z',
    updatedAt: '2024-12-19T09:30:00Z',
    createdBy: 'intel@greyeye.com',
    tags: ['intelligence', 'operations', 'eastern-europe', 'strategic'],
    description: 'Strategic intelligence assessment of Eastern European business operations',
    caseId: 'umit-2024',
  },
  {
    id: 'doc-007',
    title: 'Surveillance Log - December 2024',
    filename: 'surveillance-log-dec-2024.csv',
    fileType: 'csv',
    category: 'surveillance-log',
    securityLevel: 'secret',
    status: 'active',
    size: 262144,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-23T23:59:59Z',
    createdBy: 'ops@greyeye.com',
    tags: ['surveillance', 'log', 'december', '2024'],
    description: 'Monthly surveillance activity log',
  },
  {
    id: 'doc-008',
    title: 'Draft Investigation Report',
    filename: 'draft-investigation-tsl.docx',
    fileType: 'docx',
    category: 'intelligence-report',
    securityLevel: 'confidential',
    status: 'draft',
    size: 1572864,
    createdAt: '2024-12-20T13:00:00Z',
    updatedAt: '2024-12-23T10:15:00Z',
    createdBy: 'analyst@greyeye.com',
    tags: ['draft', 'investigation', 'tsl', 'wip'],
    description: 'Work in progress - TSL Group investigation findings',
    caseId: 'tsl-2024',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function matchesSearch(doc: VaultDocument, query: string): boolean {
  const q = query.toLowerCase();
  return (
    doc.title.toLowerCase().includes(q) ||
    doc.filename.toLowerCase().includes(q) ||
    doc.description?.toLowerCase().includes(q) ||
    doc.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    doc.createdBy.toLowerCase().includes(q)
  );
}

function compareDocuments(
  a: VaultDocument,
  b: VaultDocument,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): number {
  let comparison = 0;

  switch (sortBy) {
    case 'title':
      comparison = a.title.localeCompare(b.title);
      break;
    case 'createdAt':
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      break;
    case 'updatedAt':
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      break;
    case 'size':
      comparison = a.size - b.size;
      break;
    default:
      comparison = 0;
  }

  return sortOrder === 'desc' ? -comparison : comparison;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search and filter documents in the vault
 */
export async function searchDocuments(params: VaultSearchParams = {}): Promise<VaultSearchResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));

  const {
    query,
    category,
    securityLevel,
    status,
    fileType,
    tags,
    caseId,
    createdAfter,
    createdBefore,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10,
  } = params;

  let filtered = [...MOCK_DOCUMENTS];

  // Apply filters
  if (query) {
    filtered = filtered.filter((doc) => matchesSearch(doc, query));
  }
  if (category) {
    filtered = filtered.filter((doc) => doc.category === category);
  }
  if (securityLevel) {
    filtered = filtered.filter((doc) => doc.securityLevel === securityLevel);
  }
  if (status) {
    filtered = filtered.filter((doc) => doc.status === status);
  }
  if (fileType) {
    filtered = filtered.filter((doc) => doc.fileType === fileType);
  }
  if (tags && tags.length > 0) {
    filtered = filtered.filter((doc) => tags.some((t) => doc.tags.includes(t)));
  }
  if (caseId) {
    filtered = filtered.filter((doc) => doc.caseId === caseId);
  }
  if (createdAfter) {
    const afterDate = new Date(createdAfter).getTime();
    filtered = filtered.filter((doc) => new Date(doc.createdAt).getTime() >= afterDate);
  }
  if (createdBefore) {
    const beforeDate = new Date(createdBefore).getTime();
    filtered = filtered.filter((doc) => new Date(doc.createdAt).getTime() <= beforeDate);
  }

  // Sort
  filtered.sort((a, b) => compareDocuments(a, b, sortBy, sortOrder));

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const documents = filtered.slice(startIndex, startIndex + pageSize);

  return {
    documents,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get a single document by ID
 */
export async function getDocument(id: string): Promise<VaultDocument | null> {
  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
  return MOCK_DOCUMENTS.find((doc) => doc.id === id) ?? null;
}

/**
 * Get available filter options
 */
export async function getFilterOptions(): Promise<{
  categories: DocumentCategory[];
  securityLevels: SecurityLevel[];
  statuses: DocumentStatus[];
  fileTypes: FileType[];
  allTags: string[];
  caseIds: string[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const allTags = [...new Set(MOCK_DOCUMENTS.flatMap((doc) => doc.tags))].sort();
  const caseIds = [...new Set(MOCK_DOCUMENTS.map((doc) => doc.caseId).filter(Boolean))] as string[];

  return {
    categories: [
      'intelligence-report',
      'financial-analysis',
      'risk-assessment',
      'legal-document',
      'corporate-filing',
      'surveillance-log',
      'network-analysis',
      'other',
    ],
    securityLevels: ['unclassified', 'confidential', 'secret', 'top-secret'],
    statuses: ['draft', 'active', 'archived', 'pending-review'],
    fileTypes: ['pdf', 'docx', 'xlsx', 'txt', 'json', 'csv', 'image', 'other'],
    allTags,
    caseIds,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
