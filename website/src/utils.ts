const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
/** "jul 12, 2026" */
export const shortDate = (d: Date) => `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
/** "14 jul 2026" */
export const longDate = (d: Date) => `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
