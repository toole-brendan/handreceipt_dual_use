import { useMemo } from 'react';
import { useSensitiveItems } from './useSensitiveItems';
import { VerificationStatus } from '@/types/property';

interface VerificationSchedule {
  nextVerificationTime: Date;
  isVerificationRequired: boolean;
  isOverdue: boolean;
  itemsDueCount: number;
  itemsOverdueCount: number;
}

export const useVerificationSchedule = (): VerificationSchedule => {
  const { items } = useSensitiveItems();
  
  return useMemo(() => {
    const now = new Date();
    const itemsDue = items.filter(item => {
      const nextVerification = new Date(item.verificationSchedule.nextVerification);
      return nextVerification <= now && item.verificationStatus === 'NEEDS_VERIFICATION' as VerificationStatus;
    });
    
    const itemsOverdue = itemsDue.filter(item => {
      const nextVerification = new Date(item.verificationSchedule.nextVerification);
      const overdueDays = Math.floor((now.getTime() - nextVerification.getTime()) / (1000 * 60 * 60 * 24));
      return item.verificationStatus === 'OVERDUE' as VerificationStatus || overdueDays > 0;
    });

    // Find the next required verification time
    const nextVerification = items
      .map(item => new Date(item.verificationSchedule.nextVerification))
      .sort((a, b) => a.getTime() - b.getTime())
      .find(date => date > now) || now;

    return {
      nextVerificationTime: nextVerification,
      isVerificationRequired: itemsDue.length > 0,
      isOverdue: itemsOverdue.length > 0,
      itemsDueCount: itemsDue.length,
      itemsOverdueCount: itemsOverdue.length
    };
  }, [items]);
};
