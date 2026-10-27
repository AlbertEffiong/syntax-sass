import { nextSequence } from '../models/Counter';

/**
 * Builds the next deterministic, school-prefixed student id:
 *   [PREFIX]/[YEAR]/[SEQ]  ->  e.g. "BFA/2026/001"
 *
 * The sequence is per (prefix, year) and incremented atomically so concurrent
 * enrollments never collide.
 */
export async function generateStudentId(prefix: string, year = new Date().getFullYear()): Promise<string> {
  const seq = await nextSequence(`${prefix.toUpperCase()}:${year}`);
  const padded = String(seq).padStart(3, '0');
  return `${prefix.toUpperCase()}/${year}/${padded}`;
}
