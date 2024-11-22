import { Operation, OperationType } from '../../database/local/models/operation';
import { QueueStorage } from '../storage/queue_storage';

export interface PriorityRule {
  type: OperationType;
  condition: (operation: Operation) => boolean;
  priority: number;
}

export class PriorityHandler {
  private static rules: PriorityRule[] = [
    {
      type: 'transfer',
      condition: () => true,
      priority: QueueStorage.HIGH_PRIORITY
    },
    {
      type: 'scan',
      condition: (op) => !!op.data.isUrgent,
      priority: QueueStorage.HIGH_PRIORITY
    },
    {
      type: 'update',
      condition: (op) => !!op.data.isSecurityRelated,
      priority: QueueStorage.HIGH_PRIORITY
    }
  ];

  static addRule(rule: PriorityRule): void {
    this.rules.push(rule);
  }

  static calculatePriority(operation: Operation): number {
    const matchingRule = this.rules.find(
      rule => rule.type === operation.type && rule.condition(operation)
    );

    return matchingRule?.priority ?? QueueStorage.LOW_PRIORITY;
  }

  static async reprioritizeQueue(): Promise<void> {
    const operations = await QueueStorage.getNextBatch(100); // Get a larger batch for reprioritization
    
    for (const operation of operations) {
      const newPriority = this.calculatePriority(operation);
      if (newPriority !== operation.priority) {
        // Update priority in database
        // This would require adding a new method to OperationModel
        // await OperationModel.updatePriority(operation.id, newPriority);
      }
    }
  }
}
