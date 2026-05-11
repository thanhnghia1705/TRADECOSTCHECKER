import React from 'react';
import { CalculationResult } from '../types';
import { formatNumber, formatPercent } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import * as XLSX from 'xlsx';

interface HistorySectionProps {
  history: CalculationResult[];
}

export function HistorySection({ history }: HistorySectionProps) {
  if (history.length === 0) return null;

  const exportToExcel = () => {
    const data = history.map(item => ({
      'Thời gian': item.timestamp.toLocaleString('vi-VN'),
      'Tên sản phẩm': item.product.productName,
      'Số lượng Bán': item.soldQty,
      'Số lượng Tặng': item.giftQty,
      'Chi phí Trade gốc': formatPercent(item.product.tradeCost),
      'Chi phí CTKM': formatPercent(item.promotionCost),
      'Chi phí còn lại': formatPercent(item.remainingCost),
      'Trạng thái': item.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lịch sử kiểm tra");
    XLSX.writeFile(wb, "Lich_Su_Trade_Cost.xlsx");
  };

  return (
    <Card className="mt-8 border-slate-800 bg-slate-900 shadow-sm p-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-sm uppercase tracking-[0.05em] text-slate-400 font-semibold mb-0">Lịch sử kiểm tra (Phiên hiện tại)</CardTitle>
        <Button variant="outline" size="sm" onClick={exportToExcel} className="text-[11px] h-7 px-3 shrink-0">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export Excel
        </Button>
      </CardHeader>
      <CardContent className="p-0 border-t border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold border-b border-slate-800">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold border-b border-slate-800 text-right">Mua</th>
                <th className="px-5 py-3 font-semibold border-b border-slate-800 text-right">Tặng</th>
                <th className="px-5 py-3 font-semibold border-b border-slate-800 text-right">CP CTKM</th>
                <th className="px-5 py-3 font-semibold border-b border-slate-800 text-right">Còn lại</th>
                <th className="px-5 py-3 font-semibold border-b border-slate-800">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr key={row.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-50 truncate max-w-[200px]" title={row.product.productName}>
                    {row.product.productName}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-300">{formatNumber(row.soldQty)}</td>
                  <td className="px-5 py-3 text-right text-slate-300">{formatNumber(row.giftQty)}</td>
                  <td className="px-5 py-3 text-right text-slate-300">{formatPercent(row.promotionCost)}</td>
                  <td className={`px-5 py-3 text-right font-medium ${
                    row.status === 'CÒN DƯ CHI PHÍ' ? 'text-emerald-500' :
                    row.status === 'VỪA ĐỦ CHI PHÍ' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {row.remainingCost > 0 ? '+' : ''}{formatPercent(row.remainingCost)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-medium">
                        <span className={`w-2 h-2 rounded-full ${
                          row.status === 'CÒN DƯ CHI PHÍ' ? 'bg-emerald-500' :
                          row.status === 'VỪA ĐỦ CHI PHÍ' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        <span className={
                          row.status === 'CÒN DƯ CHI PHÍ' ? 'text-emerald-500' :
                          row.status === 'VỪA ĐỦ CHI PHÍ' ? 'text-amber-500' : 'text-rose-500'
                        }>{row.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
