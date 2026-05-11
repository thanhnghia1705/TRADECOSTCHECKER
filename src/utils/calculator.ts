import { Product, Status } from '../types';

export function calculatePromotionCost(
  costPerUnit: number,
  sellPricePerUnit: number,
  soldQty: number,
  giftQty: number
): number {
  if (sellPricePerUnit === 0 || soldQty === 0) return 0;
  return (costPerUnit * giftQty) / (sellPricePerUnit * soldQty);
}

export function calculateRemainingCost(tradeCost: number, promotionCost: number): number {
  return tradeCost - promotionCost;
}

export function getStatusFromRemainingCost(remainingCost: number): Status {
  // Using a very small epsilon to handle floating point inaccuracies
  if (remainingCost > 0.00001) return 'CÒN DƯ CHI PHÍ';
  if (remainingCost < -0.00001) return 'HỤT CHI PHÍ / VƯỢT TRADE';
  return 'VỪA ĐỦ CHI PHÍ';
}
