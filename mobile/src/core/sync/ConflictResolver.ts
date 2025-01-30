export interface Versioned {
  id: string;
  version: number;
  updatedAt: string;
}

export interface ConflictResolver<T extends Versioned> {
  resolve(local: T, remote: T): T;
}

export class TimestampBasedResolver<T extends Versioned> implements ConflictResolver<T> {
  resolve(local: T, remote: T): T {
    // If versions are different, higher version wins
    if (local.version !== remote.version) {
      return local.version > remote.version ? local : remote;
    }

    // If versions are same, most recent update wins
    const localDate = new Date(local.updatedAt);
    const remoteDate = new Date(remote.updatedAt);
    return localDate > remoteDate ? local : remote;
  }
}

export class MergeBasedResolver<T extends Versioned> implements ConflictResolver<T> {
  constructor(
    private readonly mergeStrategy: (local: T, remote: T) => T,
    private readonly fallback: ConflictResolver<T> = new TimestampBasedResolver()
  ) {}

  resolve(local: T, remote: T): T {
    try {
      // Attempt to merge the changes
      const merged = this.mergeStrategy(local, remote);
      return {
        ...merged,
        version: Math.max(local.version, remote.version) + 1,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      // If merge fails, fall back to timestamp-based resolution
      console.warn('Merge failed, falling back to timestamp resolution:', error);
      return this.fallback.resolve(local, remote);
    }
  }
}

// Example merge strategy for property records
export interface PropertyRecord extends Versioned {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  metadata: Record<string, unknown>;
}

export function createPropertyMergeStrategy(): (local: PropertyRecord, remote: PropertyRecord) => PropertyRecord {
  return (local, remote) => {
    // Merge metadata fields, preferring local values for conflicts
    const mergedMetadata = {
      ...remote.metadata,
      ...local.metadata
    };

    return {
      ...local,
      // Take most recent status
      status: new Date(local.updatedAt) > new Date(remote.updatedAt) 
        ? local.status 
        : remote.status,
      metadata: mergedMetadata,
    };
  };
}
