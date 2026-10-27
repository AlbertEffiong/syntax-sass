/**
 * Centralised grading scale so scores are computed identically across the
 * teacher save/submit flows and the admin approval flow.
 */
export interface GradeBand {
  min: number;
  grade: string;
  remark: string;
}

export const GRADE_SCALE: GradeBand[] = [
  { min: 70, grade: 'A', remark: 'Excellent' },
  { min: 60, grade: 'B', remark: 'Very Good' },
  { min: 50, grade: 'C', remark: 'Good' },
  { min: 45, grade: 'D', remark: 'Fair' },
  { min: 40, grade: 'E', remark: 'Pass' },
  { min: 0, grade: 'F', remark: 'Fail' },
];

export function gradeFor(total: number): string {
  return GRADE_SCALE.find((band) => total >= band.min)?.grade ?? 'F';
}

export function remarkFor(total: number): string {
  return GRADE_SCALE.find((band) => total >= band.min)?.remark ?? 'Fail';
}

/**
 * Total = CA1 (<=20) + CA2 (<=20) + Exam (<=60). Inputs are clamped to their
 * maximums to defend against out-of-range submissions.
 */
export function computeTotal(ca1: number, ca2: number, exam: number): number {
  const clamp = (value: number, max: number) =>
    Math.max(0, Math.min(max, Number.isFinite(value) ? value : 0));
  return clamp(ca1, 20) + clamp(ca2, 20) + clamp(exam, 60);
}
