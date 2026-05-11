import React, { useState, useEffect } from 'react';
import { Product, CalculationResult, Status } from './types';
import { ResultCard } from './components/ResultCard';
import { HistorySection } from './components/HistorySection';
import { calculatePromotionCost, calculateRemainingCost, getStatusFromRemainingCost } from './utils/calculator';
import { Calculator, AlertCircle, Database, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { ProductSelector } from './components/ProductSelector';
import { DatabaseManager } from './components/DatabaseManager';
import { formatNumber, formatPercent } from './lib/utils';
import { INITIAL_PRODUCTS } from './data/mockProducts';

export default function App() {
  const [view, setView] = useState<'calculator' | 'manager'>('calculator');
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [soldQty, setSoldQty] = useState<number | ''>('');
  const [giftQty, setGiftQty] = useState<number | ''>('');
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load products from localStorage or use initial mock data
    const stored = localStorage.getItem('trade_cost_products_v2');
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('trade_cost_products_v2', JSON.stringify(INITIAL_PRODUCTS));
    }
  }, []);

  const handleSaveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('trade_cost_products_v2', JSON.stringify(newProducts));
    
    // If selected product is deleted, reset selection
    if (selectedProduct && !newProducts.find(p => p.productName === selectedProduct.productName)) {
      setSelectedProduct(null);
    }
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setSoldQty('');
    setGiftQty('');
    setResult(null);
    setError(null);
  };

  const validate = (): boolean => {
    setError(null);
    if (!selectedProduct) {
      setError('Vui lòng chọn một sản phẩm.');
      return false;
    }
    if (soldQty === '' || soldQty <= 0) {
      setError('Số lượng bán phải lớn hơn 0.');
      return false;
    }
    if (giftQty === '' || giftQty < 0) {
      setError('Số lượng tặng không được nhỏ hơn 0.');
      return false;
    }
    return true;
  };

  const handleCalculate = () => {
    if (!validate() || !selectedProduct) return;
    
    const sQty = soldQty as number;
    const gQty = giftQty as number;

    const promotionCost = calculatePromotionCost(
      selectedProduct.productCostPerUnit,
      selectedProduct.productSellPricePerUnit,
      sQty,
      gQty
    );

    const remainingCost = calculateRemainingCost(selectedProduct.tradeCost, promotionCost);
    const status = getStatusFromRemainingCost(remainingCost);

    const newResult: CalculationResult = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      product: selectedProduct,
      soldQty: sQty,
      giftQty: gQty,
      promotionCost,
      remainingCost,
      status
    };

    setResult(newResult);
    
    // Add to history (newest first)
    setHistory(prev => [newResult, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 pb-12 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white">
            💊
          </div>
          <div className="font-bold tracking-tight text-slate-50 flex items-center">
            TRADE COST CHECKER 
            <span className="text-slate-400 font-normal ml-2 text-[13px] hidden sm:inline">| KIỂM TRA CHI PHÍ TRADE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={view === 'manager' ? 'default' : 'outline'} 
            size="sm" 
            className={`h-8 text-xs font-semibold ${view === 'calculator' ? 'border-slate-700 text-slate-300' : ''}`}
            onClick={() => setView(view === 'manager' ? 'calculator' : 'manager')}
          >
            <Database className="w-3.5 h-3.5 mr-1.5"/>
            Quản lý Dữ liệu
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto p-6 md:p-8 flex flex-col items-center">
        {view === 'manager' ? (
          <DatabaseManager 
            products={products} 
            onSaveProducts={handleSaveProducts} 
            onClose={() => setView('calculator')}
          />
        ) : (
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
              
              {/* Left Column: Product Selection */}
              <Card className="h-full flex flex-col border-slate-800 bg-slate-900 shadow-sm p-1">
                <CardHeader>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex justify-between items-center">
                    <span>1. Chọn Sản Phẩm</span>
                    <span className="text-[10px] text-slate-500 font-normal normal-case">Dữ liệu nội bộ</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-5 mt-2">
                  <div className="space-y-2">
                    <ProductSelector 
                      products={products}
                      selectedProduct={selectedProduct}
                      onSelectProduct={(p) => { setSelectedProduct(p); setError(null); }}
                    />
                  </div>

                  {selectedProduct && (
                    <div className="pt-2 animate-in fade-in duration-300">
                      <Label className="mb-2.5 block text-slate-400">Thông tin chi tiết</Label>
                      <div className="flex flex-col gap-3 text-sm text-slate-300 bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                          <span className="text-[11px] uppercase tracking-[0.05em] text-slate-500 font-medium">Giá bán (Viên)</span>
                          <span className="font-semibold text-[15px] text-emerald-400">{formatNumber(selectedProduct.productSellPricePerUnit)} VNĐ</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                          <span className="text-[11px] uppercase tracking-[0.05em] text-slate-500 font-medium">Giá vốn (Viên)</span>
                          <span className="font-semibold text-[15px] text-amber-400">{formatNumber(selectedProduct.productCostPerUnit)} VNĐ</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[11px] uppercase tracking-[0.05em] text-slate-500 font-medium">Ngân sách Trade</span>
                          <span className="font-bold text-[16px] text-blue-500">
                            {formatPercent(selectedProduct.tradeCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedProduct && (
                    <div className="border border-dashed border-slate-800 bg-slate-950/30 rounded-lg p-6 text-center mt-4">
                      <Settings className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                      <p className="text-[12px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                        Chưa chọn sản phẩm.<br/>Vui lòng tìm kiếm qua thanh công cụ phía trên.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Column: Promotion Form & Result */}
              <div className="flex flex-col gap-6 w-full">
                <Card className={`border-slate-800 bg-slate-900 shadow-sm p-5 transition-opacity duration-300 ${!selectedProduct ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-4">
                    2. Thiết lập chương trình khuyến mãi
                  </div>
                  <CardContent className="p-0 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="soldQty">Số lượng BÁN</Label>
                        <Input 
                          id="soldQty"
                          type="number"
                          min="1"
                          placeholder="VD: 10"
                          value={soldQty}
                          onChange={(e) => { setSoldQty(e.target.value === '' ? '' : Number(e.target.value)); setError(null); }}
                          disabled={!selectedProduct}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="giftQty">Số lượng TẶNG</Label>
                        <Input 
                          id="giftQty"
                          type="number"
                          min="0"
                          placeholder="VD: 2"
                          value={giftQty}
                          onChange={(e) => { setGiftQty(e.target.value === '' ? '' : Number(e.target.value)); setError(null); }}
                          disabled={!selectedProduct}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-sm rounded-md flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleCalculate} disabled={!selectedProduct} className="flex-1 text-[13px] py-5 font-semibold">TÍNH CHI PHÍ</Button>
                      <Button variant="outline" onClick={handleReset} disabled={!selectedProduct} className="px-6 py-5 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200">Đặt lại</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Result Area */}
                {result && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResultCard result={result} />
                  </div>
                )}
              </div>
            </div>

            {/* History Section */}
            <HistorySection history={history} />
          </div>
        )}
      </main>
    </div>
  );
}
