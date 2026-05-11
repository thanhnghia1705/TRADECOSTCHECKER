import * as XLSX from 'xlsx';
import { Product } from '../types';

export const parseExcelProducts = async (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Không thể đọc dữ liệu file');

        // Use ArrayBuffer for better compatibility with xlsx
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays to find headers
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1, raw: true });
        
        if (json.length < 2) {
          throw new Error('File Excel không có đủ dữ liệu (cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu)');
        }

        // Find header row robustly: scan first 30 rows for 'tên sản phẩm'
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(json.length, 30); i++) {
          const row = json[i];
          if (Array.isArray(row)) {
            const hasNameColumn = row.some(cell => 
              typeof cell === 'string' && 
              (cell.toLowerCase().includes('tên sản phẩm') || cell.toLowerCase().includes('tên hh'))
            );
            if (hasNameColumn) {
              headerRowIdx = i;
              break;
            }
          }
        }

        if (headerRowIdx === -1) {
            throw new Error('Không tìm thấy dòng tiêu đề chứa cột "TÊN SẢN PHẨM". Vui lòng kiểm tra lại file.');
        }
        
        const headers = json[headerRowIdx] as any[];
        
        // Find indices
        const findColIdx = (possibleNames: string[]) => {
          return headers.findIndex(h => {
             if (!h) return false;
             const normalized = h.toString().toLowerCase().trim();
             return possibleNames.some(pn => normalized.includes(pn.toLowerCase()));
          });
        };

        const nameIdx = findColIdx(['TÊN SẢN PHẨM', 'Tên HH', 'TÊN SP']);
        const sellPriceIdx = findColIdx(['GIÁ BÁN SẢN PHẨM (VIÊN)', 'Giá bán (viên)', 'Giá bán / viên', 'Giá bán (VNĐ/Viên)']);
        // Fallback for sell price total if per unit is not found
        const sellPriceTotalIdx = findColIdx(['GIÁ BÁN SẢN PHẨM', 'Giá bán']);
        
        const costPriceIdx = findColIdx(['GIÁ VỐN SẢN PHẨM (VIÊN)', 'Giá vốn (viên)', 'Giá vốn / viên', 'Giá vốn (VNĐ/Viên)', 'GIÁ VỐN']);
        const tradeCostIdx = findColIdx(['CHI PHÍ TRADE', 'Trade Cost', 'Ngân sách Trade', 'TRADE']);

        if (nameIdx === -1) throw new Error('Không tìm thấy cột "TÊN SẢN PHẨM"');
        if (sellPriceIdx === -1 && sellPriceTotalIdx === -1) throw new Error('Không tìm thấy cột "GIÁ BÁN SẢN PHẨM (VIÊN)" hoặc "GIÁ BÁN"');
        if (costPriceIdx === -1) throw new Error('Không tìm thấy cột "GIÁ VỐN SẢN PHẨM (VIÊN)" hoặc "GIÁ VỐN"');
        if (tradeCostIdx === -1) throw new Error('Không tìm thấy cột "CHI PHÍ TRADE"');

        const finalSellIdx = sellPriceIdx !== -1 ? sellPriceIdx : sellPriceTotalIdx;

        const parseNumber = (val: any): number => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          // Only replace comma if it looks like a thousand separator (e.g. 25,000). 
          const cleaned = val.toString().replace(/,/g, '').replace(/%/g, '').trim();
          return Number(cleaned) || 0;
        };

        const parsePercent = (val: any): number => {
            if (typeof val === 'number') {
                // If it's already a decimal like 0.225, return it. If it's like 22.5 (representing 22.5%), divide by 100
                return val > 1 ? val / 100 : val;
            }
            if (typeof val === 'string') {
                let cleaned = val.trim();
                const hasPercent = cleaned.includes('%');
                // Replace comma with dot for decimals, e.g. 22,5 -> 22.5
                cleaned = cleaned.replace(/,/g, '.').replace(/%/g, '');
                let num = Number(cleaned);
                if (isNaN(num)) return 0;
                // Treat things like "22.5" as 22.5%. If they typed "0.225" manually as string, it's 0.00225.
                // Standardizing: if > 1 or has %, divide by 100.
                if (hasPercent || num > 1) { 
                    return num / 100;
                }
                return num;
            }
            return 0;
        }

        const parsedProducts: Product[] = [];
        
        for (let i = headerRowIdx + 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0 || !row[nameIdx]) continue; // Skip empty rows or rows without name

          const name = row[nameIdx].toString().trim();
          const sellPricePerUnit = parseNumber(row[finalSellIdx]);
          const costPricePerUnit = parseNumber(row[costPriceIdx]);
          const tradeCostRaw = row[tradeCostIdx];
          const tradeCost = parsePercent(tradeCostRaw);

          if (name && sellPricePerUnit > 0 && costPricePerUnit > 0) {
            parsedProducts.push({
              productName: name,
              productSellPricePerUnit: sellPricePerUnit,
              productCostPerUnit: costPricePerUnit,
              tradeCost: tradeCost,
              productSellPrice: sellPricePerUnit
            });
          }
        }

        if (parsedProducts.length === 0) {
           throw new Error('Đã đọc file nhưng không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại định dạng số.');
        }

        resolve(parsedProducts);

      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Đã xảy ra lỗi khi đọc file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};
