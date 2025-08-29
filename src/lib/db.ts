// src/lib/db.ts
import { db } from "./firebase-admin";

/**
 * Deduct call quota from a student
 * @param studentId string
 * @param minutes number
 * @returns new remaining quota
 */
export async function deductCallQuota(studentId: string, minutes: number) {
  const ref = db.collection("students").doc(studentId);

  return db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists) throw new Error("Student not found");

    const data = snap.data()!;
    const newQuota = (data.quotaMinutes || 0) - minutes;

    if (newQuota < 0) throw new Error("Quota exceeded");

    transaction.update(ref, { quotaMinutes: newQuota });
    return newQuota;
  });
}
