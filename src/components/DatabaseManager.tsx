import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Save, Trash2, PlusCircle, LayoutGrid, FileUp, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { formatNumber, formatPercent } from '../lib/utils';
import { parseExcelProducts } from '../utils/excel';

interface DatabaseManagerProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  onClose: () => void;
}

export function DatabaseManager({ products, onSaveProducts, onClose }: DatabaseManagerProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  
  // Form add new
  const [name, setName] = useState('');
  const [sell, setSell] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [trade, setTrade] = useState<number | ''>('');

  const handleAdd = () => {
    if (!name.trim() || sell === '' || cost === '' || trade === '') return;
    
    const newProduct: Product = {
      productName: name.trim(),
      productSellPricePerUnit: sell,
      productCostPerUnit: cost,
      tradeCost: trade / 100,
      productSellPrice: sell // not used much
    };

    setLocalProducts([newProduct, ...localProducts]);
    
    // reset form
    setName('');
    setSell('');
    setCost('');
    setTrade('');
  };

  const handleRemove = (index: number) => {
    const updated = [...localProducts];
    updated.splice(index, 1);
    setLocalProducts(updated);
  };

  const handleSaveAndClose = () => {
    onSaveProducts(localProducts);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    try {
      const importedProducts = await parseExcelProducts(file);
      // Combine imported products with existing ones (import on top)
      setLocalProducts(prev => {
        // Simple distinct filter (avoid exact name duplicates)
        const existingNames = new Set(prev.map(p => p.productName.toLowerCase()));
        const uniqueImported = importedProducts.filter(p => !existingNames.has(p.productName.toLowerCase()));
        return [...uniqueImported, ...prev];
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setImportError(err.message || 'Lỗi đọc file Excel.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-50 uppercase tracking-tight flex items-center gap-2">
             <LayoutGrid className="text-blue-500 w-5 h-5"/> Quản lý Danh mục Sản phẩm
          </h2>
          <p className="text-slate-400 text-xs mt-1">Dữ liệu được lưu trữ tự động trên thiết bị của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="border-slate-800 text-slate-300">Hủy</Button>
          <Button onClick={handleSaveAndClose} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
            <Save className="w-4 h-4 mr-2" /> Lưu danh mục
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD & IMPORT FORM */}
        <div className="flex flex-col gap-6 col-span-1">
          {/* IMPORT CARD */}
          <Card className="border-slate-800 bg-slate-900 shadow-sm h-fit">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm uppercase text-slate-300 tracking-wider font-semibold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500"/> Nhập từ file Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button variant="outline" className="w-full border-dashed border-2 border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/10 h-auto py-4 flex flex-col gap-2" onClick={triggerFileInput}>
                <FileUp className="w-6 h-6" />
                <span>Chọn File Excel Danh Mục</span>
              </Button>
              {importError && (
                <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] rounded flex items-start gap-2 leading-tight">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ADD CARD */}
          <Card className="border-slate-800 bg-slate-900 shadow-sm h-fit">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm uppercase text-slate-300 tracking-wider font-semibold">Thêm thủ công</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Tên sản phẩm</Label>
                <Input 
                  placeholder="VD: Thuốc Ho Bổ Phế..." 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Giá bán (VNĐ/Viên)</Label>
                <Input type="number" placeholder="VD: 25000" value={sell} onChange={e => setSell(e.target.value === '' ? '' : Number(e.target.value))}/>
              </div>
              <div className="space-y-1.5">
                <Label>Giá vốn (VNĐ/Viên)</Label>
                <Input type="number" placeholder="VD: 15000" value={cost} onChange={e => setCost(e.target.value === '' ? '' : Number(e.target.value))}/>
              </div>
              <div className="space-y-1.5">
                <Label>Ngân sách Trade (%)</Label>
                <Input type="number" step="0.1" placeholder="VD: 12.5" value={trade} onChange={e => setTrade(e.target.value === '' ? '' : Number(e.target.value))}/>
              </div>
              <Button className="w-full mt-2" onClick={handleAdd} disabled={!name || sell === '' || cost === '' || trade === ''}>
                <PlusCircle className="w-4 h-4 mr-2"/> Thêm vào danh sách
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* LIST */}
        <Card className="border-slate-800 bg-slate-900 shadow-sm col-span-1 lg:col-span-2 overflow-hidden flex flex-col h-[650px] lg:h-auto max-h-[80vh]">
          <div className="overflow-y-auto flex-1 relative">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-950/90 backdrop-blur text-[11px] uppercase tracking-widest text-slate-400 sticky top-0 z-10 shadow-sm border-b border-slate-800">
                 <tr>
                   <th className="px-4 py-3 font-semibold">Tên sản phẩm</th>
                   <th className="px-4 py-3 font-semibold text-right">Giá Bán</th>
                   <th className="px-4 py-3 font-semibold text-right">Giá Vốn</th>
                   <th className="px-4 py-3 font-semibold text-right">Trade Cost</th>
                   <th className="px-4 py-3 font-semibold text-center w-16">Xóa</th>
                 </tr>
               </thead>
               <tbody>
                 {localProducts.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                        Chưa có dữ liệu sản phẩm.
                     </td>
                   </tr>
                 ) : (
                   localProducts.map((p, idx) => (
                     <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                       <td className="px-4 py-3 text-slate-50 font-medium truncate max-w-[200px]" title={p.productName}>{p.productName}</td>
                       <td className="px-4 py-3 text-emerald-400 text-right">{formatNumber(p.productSellPricePerUnit)}</td>
                       <td className="px-4 py-3 text-amber-400 text-right">{formatNumber(p.productCostPerUnit)}</td>
                       <td className="px-4 py-3 text-blue-400 text-right font-medium">{formatPercent(p.tradeCost)}</td>
                       <td className="px-4 py-3 text-center">
                         <div className="flex justify-center">
                           <button 
                             onClick={() => handleRemove(idx)}
                             className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                             title="Xóa"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
          <div className="bg-slate-950/50 border-t border-slate-800 p-3 text-[11px] text-slate-500 flex justify-between uppercase tracking-wider font-semibold shrink-0">
            <span>Tổng cộng: {localProducts.length} sản phẩm</span>
            <span>Local Storage Active</span>
          </div>
        </Card>

      </div>
    </div>
  );
}
