/**
 * Shared Base Types
 *
 * Defines reusable structural building blocks (identity, names, addresses,
 * metadata) that are composed by domain specific models to avoid repeated
 * field declarations across the code base.
 */

/**
 * Basic identity contract with a stable identifier.
 */
export interface Identifiable {
  id: string;
}

/**
 * Named entities expose a human readable name in addition to an id.
 */
export interface NamedEntity extends Identifiable {
  name: string;
}

/**
 * Description mixin for entities that provide a narrative summary.
 */
export interface DescribedEntity {
  description: string;
}

/**
 * Canonical address representation shared across companies, people and
 * counterparties.
 */
export interface Address {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

/**
 * Addressable entities embed an optional address block.
 */
export interface Addressable {
  address?: Address;
}

/**
 * Timestamp metadata for audit trails.
 */
export interface TemporalMetadata {
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
}
