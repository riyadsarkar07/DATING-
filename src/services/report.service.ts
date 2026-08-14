import db, { COLLECTIONS, serverTimestamp } from '../firebase/firestore';
import { userService } from './user.service';
import { logEvent } from '../firebase/analytics';

export interface ReportInput {
  reporterUid: string;
  targetUid: string;
  reason: string;
  details: string;
}

class ReportService {
  async submit(input: ReportInput): Promise<void> {
    await db.collection(COLLECTIONS.reports).add({
      reporterUid: input.reporterUid,
      targetUid: input.targetUid,
      reason: input.reason,
      details: input.details,
      status: 'open',
      createdAt: serverTimestamp(),
    });
    logEvent('user_reported', { user_id: input.reporterUid, target_id: input.targetUid });
  }

  async blockAndReport(input: ReportInput): Promise<void> {
    await this.submit(input);
    await userService.blockUser(input.reporterUid, input.targetUid);
  }
}

export const reportService = new ReportService();
