/**
 * Utility functions for currency and number formatting in Indonesian Rupiah (IDR).
 */

export function parseIncentiveAmount(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  const clean = val.trim().replace(/^"|"$/g, '');
  if (clean === '' || clean === '0') return 0;

  const isNegative = clean.startsWith('-');
  const unsigned = isNegative ? clean.slice(1) : clean;

  // Handle commas:
  // If multiple commas, e.g. 1,261,216 -> thousands separator
  const commaCount = (unsigned.match(/,/g) || []).length;

  if (commaCount > 1) {
    const num = parseFloat(unsigned.replace(/,/g, ''));
    return isNegative ? -num : num;
  }

  if (commaCount === 1) {
    const parts = unsigned.split(',');
    // If after comma there are exactly 3 digits, it's a thousands separator: e.g. "337,824", "6,000", "25,000"
    if (parts[1].length === 3) {
      const num = parseFloat(parts[0] + parts[1]);
      return isNegative ? -num : num;
    } else {
      // 1 or 2 digits after comma, e.g. "13090,03", "1726,4", "668,04" -> decimal comma
      const num = parseFloat(parts[0] + '.' + parts[1]);
      return isNegative ? -num : num;
    }
  }

  const num = parseFloat(unsigned);
  return isNaN(num) ? 0 : isNegative ? -num : num;
}

export function formatRupiah(amount: number, withDecimalsIfPresent: boolean = true): string {
  const isNeg = amount < 0;
  const absVal = Math.abs(amount);

  // Check if has fractional cents
  const hasDecimals = absVal % 1 !== 0;

  let formatted = '';
  if (withDecimalsIfPresent && hasDecimals) {
    formatted = absVal.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formatted = Math.round(absVal).toLocaleString('id-ID');
  }

  return (isNeg ? '- Rp ' : 'Rp ') + formatted;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

