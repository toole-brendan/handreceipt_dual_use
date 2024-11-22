import { Operation, OperationType, OperationStatus, OperationModel } from '../../database/local/models/operation';
import { getDatabase } from '../../database/local/sqlite_config';
import { DatabaseEncryption } from '../../database/local/encryption';

export class QueueStorage {
  private static readonly MAX_RETRY_COUNT = 3;
  static readonly HIGH_PRIORITY = 2;
  static readonly MEDIUM_PRIORITY = 1;
  static readonly LOW_PRIORITY = 0;

  static async enqueue(operation: Omit<Operation, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<Operation> {
    return await OperationModel.create(operation);
  }

  static async getNextBatch(batchSize: number = 10): Promise<Operation[]> {
    return await OperationModel.findPendingOperations(batchSize);
  }

  static async markAsProcessing(operationId: string): Promise<void> {
    await OperationModel.updateStatus(operationId, 'processing');
  }

  static async markAsCompleted(operationId: string): Promise<void> {
    await OperationModel.updateStatus(operationId, 'completed');
  }

  static async markAsFailed(operationId: string): Promise<void> {
    const operation = await this.getOperation(operationId);
    
    if (operation && operation.retryCount < this.MAX_RETRY_COUNT) {
      await OperationModel.updateStatus(operationId, 'retrying', true);
    } else {
      await OperationModel.updateStatus(operationId, 'failed');
    }
  }

  static async cleanupCompletedOperations(olderThan?: Date): Promise<number> {
    return await OperationModel.deleteCompleted(olderThan);
  }

  private static async getOperation(id: string): Promise<Operation | null> {
    const db = await getDatabase();
    const [results] = await db.executeSql(
      'SELECT * FROM operations WHERE id = ?',
      [id]
    );

    if (results.rows.length === 0) {
      return null;
    }

    const op = results.rows.item(0);
    const decryptedData = await DatabaseEncryption.decryptData(op.data);

    return {
      id: op.id,
      type: op.type as OperationType,
      assetId: op.asset_id,
      data: JSON.parse(decryptedData),
      status: op.status as OperationStatus,
      priority: op.priority,
      createdAt: op.created_at,
      retryCount: op.retry_count
    };
  }

  static getPriorityForOperation(type: OperationType): number {
    switch (type) {
      case 'transfer':
      case 'scan':
        return this.HIGH_PRIORITY;
      case 'update':
        return this.MEDIUM_PRIORITY;
      case 'create':
      case 'delete':
      default:
        return this.LOW_PRIORITY;
    }
  }
}
