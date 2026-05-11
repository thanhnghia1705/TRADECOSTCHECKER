import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { formatNumber, formatPercent } from '../lib/utils';

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
}

export function ProductSelector({ products, selectedProduct, onSelectProduct }: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Tìm & chọn sản phẩm..."
          className="pl-9 pr-8 bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-500 cursor-pointer"
          value={isOpen ? searchTerm : (selectedProduct ? selectedProduct.productName : '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
        />
        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
      </div>
      
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border border-slate-800 bg-slate-900 shadow-lg">
          {filteredProducts.length > 0 ? (
            <ul className="py-1 text-sm text-slate-300">
              {filteredProducts.map((product, idx) => (
                <li 
                  key={`${product.productName}-${idx}`}
                  className="cursor-pointer px-4 py-2 hover:bg-slate-800 flex flex-col"
                  onClick={() => {
                    onSelectProduct(product);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span className="font-medium text-slate-50">{product.productName}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Giá: {formatNumber(product.productSellPricePerUnit)}đ - Vốn: {formatNumber(product.productCostPerUnit)}đ - Trade: {formatPercent(product.tradeCost)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-4 text-sm text-center text-slate-500">
              Không tìm thấy sản phẩm.<br/>
              <span className="text-[11px]">Vui lòng thêm ở mục Quản lý Dữ liệu.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
