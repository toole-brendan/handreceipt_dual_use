import { getDatabase } from '../sqlite_config';
import { DatabaseEncryption } from '../encryption';

export type OperationType = 'create' | 'update' | 'delete' | 'transfer' | 'scan';
export type OperationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

export interface Operation {
  id: string;
  type: OperationType;
  assetId?: string;
  data: Record<string, any>;
  status: OperationStatus;
  priority: number;
  createdAt: string;
  retryCount: number;
}

export class OperationModel {
  static async create(operation: Omit<Operation, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<Operation> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newOperation: Operation = {
      ...operation,
      id,
      createdAt: now,
      status: 'pending',
      retryCount: 0
    };

    // Encrypt sensitive operation data
    const encryptedData = await DatabaseEncryption.encryptData(
      JSON.stringify(operation.data)
    );

    await db.executeSql(
      `INSERT INTO operations (
        id, type, asset_id, data, status,
        priority, created_at, retry_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newOperation.id,
        newOperation.type,
        newOperation.assetId || null,
        encryptedData,
        newOperation.status,
        newOperation.priority,
        newOperation.createdAt,
        newOperation.retryCount
      ]
    );

    return newOperation;
  }

  static async findPendingOperations(limit: number = 10): Promise<Operation[]> {
    const db = await getDatabase();
    const [results] = await db.executeSql(
      `SELECT * FROM operations 
       WHERE status IN ('pending', 'retrying') 
       ORDER BY priority DESC, created_at ASC 
       LIMIT ?`,
      [limit]
    );

    const operations: Operation[] = [];
    
    for (let i = 0; i < results.rows.length; i++) {
      const op = results.rows.item(i);
      const decryptedData = await DatabaseEncryption.decryptData(op.data);
      
      operations.push({
        id: op.id,
        type: op.type as OperationType,
        assetId: op.asset_id,
        data: JSON.parse(decryptedData),
        status: op.status as OperationStatus,
        priority: op.priority,
        createdAt: op.created_at,
        retryCount: op.retry_count
      });
    }

    return operations;
  }

  static async updateStatus(id: string, status: OperationStatus, incrementRetry: boolean = false): Promise<void> {
    const db = await getDatabase();
    
    await db.executeSql(
      `UPDATE operations 
       SET status = ?, 
           retry_count = retry_count + ? 
       WHERE id = ?`,
      [status, incrementRetry ? 1 : 0, id]
    );
  }

  static async deleteCompleted(olderThan?: Date): Promise<number> {
    const db = await getDatabase();
    const dateThreshold = olderThan || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default 7 days

    const [result] = await db.executeSql(
      `DELETE FROM operations 
       WHERE status = 'completed' 
       AND created_at < ? 
       RETURNING id`,
      [dateThreshold.toISOString()]
    );

    return result.rows.length;
  }
}
