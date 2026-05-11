export interface Product {
  productName: string;
  productSellPrice: number;
  productSellPricePerUnit: number;
  productCostPerUnit: number;
  tradeCost: number; // decimal representation, e.g. 0.125 for 12.5%
}

export type Status = 'CÒN DƯ CHI PHÍ' | 'VỪA ĐỦ CHI PHÍ' | 'HỤT CHI PHÍ / VƯỢT TRADE';

export interface CalculationResult {
  id: string; // unique ID for history
  timestamp: Date;
  product: Product;
  soldQty: number;
  giftQty: number;
  promotionCost: number; // decimal, e.g. 0.12
  remainingCost: number; // decimal, e.g. 0.005
  status: Status;
}
