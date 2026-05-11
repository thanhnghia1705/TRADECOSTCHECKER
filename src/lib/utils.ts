import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers like 350000 => 350,000
export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-US'); // Will use standard thousand separators
}

// Format decimals to percentage like 0.125 => 12.5%
export function formatPercent(num: number | undefined): string {
  if (num === undefined || num === null) return '0%';
  
  // Convert 0.225 -> 22.5
  const percent = num * 100;
  
  // Use Intl.NumberFormat to neatly format percentage without forcing unnecessary trailing zeros
  // Maximum fraction digits 2 prevents super long decimals like 22.500000000004
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  });
  
  return formatter.format(percent) + '%';
}
