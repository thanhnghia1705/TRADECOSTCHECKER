import React from 'react';
import { CalculationResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { formatNumber, formatPercent } from '../lib/utils';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ResultCardProps {
  result: CalculationResult | null;
}

export function ResultCard({ result }: ResultCardProps) {
  if (!result) return null;

  const { product, soldQty, giftQty, promotionCost, remainingCost, status } = result;

  const getStatusDisplay = () => {
    switch (status) {
      case 'CÒN DƯ CHI PHÍ': return { color: 'success' as const, icon: CheckCircle2, text: 'CÒN DƯ CHI PHÍ' };
      case 'VỪA ĐỦ CHI PHÍ': return { color: 'warning' as const, icon: Activity, text: 'VỪA ĐỦ CHI PHÍ' };
      case 'HỤT CHI PHÍ / VƯỢT TRADE': return { color: 'destructive' as const, icon: AlertTriangle, text: 'HỤT CHI PHÍ / VƯỢT TRADE' };
      default: return { color: 'default' as const, icon: Activity, text: status };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <Card className="border-slate-800 bg-slate-900 shadow-sm overflow-hidden relative p-1 mt-6">
      <div className={`absolute top-0 left-0 w-1 h-full ${
        status === 'CÒN DƯ CHI PHÍ' ? 'bg-emerald-500' :
        status === 'VỪA ĐỦ CHI PHÍ' ? 'bg-amber-500' : 'bg-rose-500'
      }`}></div>
      <CardHeader className="pb-3 border-b border-slate-800 bg-slate-950/20 px-5 pt-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardDescription className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Kết quả tính toán</CardDescription>
            <CardTitle className="text-lg leading-tight text-slate-50">{product.productName}</CardTitle>
          </div>
          <Badge variant={statusDisplay.color} className="whitespace-nowrap py-1 px-3">
            <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
            {statusDisplay.text}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5 space-y-5 px-5 pb-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="border-l-2 border-slate-800 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Cơ chế</p>
            <p className="font-semibold text-[16px] text-slate-50">Mua {formatNumber(soldQty)} tặng {formatNumber(giftQty)}</p>
          </div>
          <div className="border-l-2 border-slate-800 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Ngân sách Trade</p>
            <p className="font-semibold text-[16px] text-blue-500">{formatPercent(product.tradeCost)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="border-l-2 border-slate-800 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Chi phí CTKM</p>
            <p className="text-[32px] font-bold tracking-tight text-slate-50 leading-none">
              {formatPercent(promotionCost)}
            </p>
          </div>
          <div className="border-l-2 border-slate-800 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Chi phí còn lại</p>
            <p className={`text-[32px] font-bold tracking-tight leading-none ${
              status === 'CÒN DƯ CHI PHÍ' ? 'text-emerald-500' :
              status === 'VỪA ĐỦ CHI PHÍ' ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {remainingCost > 0 ? '+' : ''}{formatPercent(remainingCost)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500 italic">
          Công thức: ({formatNumber(product.productCostPerUnit)} × {formatNumber(giftQty)}) / ({formatNumber(product.productSellPricePerUnit)} × {formatNumber(soldQty)}) = {formatPercent(promotionCost)} | Trade: {formatPercent(product.tradeCost)} - {formatPercent(promotionCost)} = {remainingCost > 0 ? '+' : ''}{formatPercent(remainingCost)}
        </div>
      </CardContent>
    </Card>
  );
}
