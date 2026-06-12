'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, FileJson, FileText, X, CheckCircle,
  AlertCircle, Download, ChevronDown, ChevronUp, Loader2,
  Eye, Trash2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ParsedProduct {
  name?: string;
  description?: string;
  price?: number | string;
  discountPrice?: number | string;
  category?: string;
  subcategory?: string;
  brand?: string;
  stock?: number | string;
  images?: string | string[];
  featured?: boolean | string;
  [key: string]: any;
}

interface ImportResult {
  imported: number;
  failed: number;
  total: number;
  errors: { row: number; error: string }[];
}

interface BulkImportProps {
  onSuccess?: (count: number) => void;
}

// File type icons
const fileIcons: Record<string, JSX.Element> = {
  csv: <FileText className="h-6 w-6 text-green-400" />,
  xlsx: <FileSpreadsheet className="h-6 w-6 text-blue-400" />,
  xls: <FileSpreadsheet className="h-6 w-6 text-blue-400" />,
  json: <FileJson className="h-6 w-6 text-yellow-400" />,
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  // Detect delimiter (comma or semicolon)
  const delimiter = lines[0].includes(';') ? ';' : ',';

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').replace(/^"|"$/g, '').trim();
    });
    if (Object.values(row).some((v) => v)) rows.push(row);
  }

  return rows;
}

export default function BulkImport({ onSuccess }: BulkImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedProduct[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(async (selectedFile: File) => {
    setParsing(true);
    setParseError('');
    setPreview([]);
    setRawData([]);
    setResult(null);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    try {
      if (ext === 'json') {
        const text = await selectedFile.text();
        let parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          // Handle { products: [...] } format
          parsed = parsed.products || parsed.data || [parsed];
        }
        setRawData(parsed);
        setPreview(parsed.slice(0, 5));

      } else if (ext === 'csv') {
        const text = await selectedFile.text();
        const rows = parseCSV(text);
        setRawData(rows);
        setPreview(rows.slice(0, 5));

      } else if (ext === 'xlsx' || ext === 'xls') {
        // Dynamically import xlsx to avoid SSR issues
        const XLSX = await import('xlsx');
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        setRawData(rows as any[]);
        setPreview((rows as any[]).slice(0, 5));

      } else {
        setParseError('Unsupported file format. Please use CSV, Excel (.xlsx/.xls), or JSON.');
        return;
      }
    } catch (err: any) {
      setParseError(`Failed to parse file: ${err.message}`);
      setFile(null);
    } finally {
      setParsing(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    const supported = ['csv', 'xlsx', 'xls', 'json'];

    if (!supported.includes(ext)) {
      toast.error('Unsupported file type. Use CSV, Excel, or JSON');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB allowed');
      return;
    }

    setFile(selectedFile);
    await parseFile(selectedFile);
  }, [parseFile]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) await handleFileSelect(dropped);
  }, [handleFileSelect]);

  const handleImport = async () => {
    if (!rawData.length) return;
    setImporting(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: rawData }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
        toast.success(`✅ Imported ${data.data.imported} products!`, { duration: 5000 });
        onSuccess?.(data.data.imported);
      } else {
        toast.error(data.error || 'Import failed');
        if (data.details) {
          setResult({ imported: 0, failed: data.details.length, total: rawData.length, errors: data.details });
        }
      }
    } catch (err: any) {
      toast.error('Network error. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setRawData([]);
    setResult(null);
    setParseError('');
    setShowPreview(false);
    setShowErrors(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = (format: 'csv' | 'json') => {
    const sample = [
      {
        name: 'Classic White T-Shirt',
        description: 'Premium cotton t-shirt for everyday wear',
        price: 999,
        discountPrice: 699,
        category: 'mens',
        subcategory: 'T-Shirts',
        brand: 'ShopHub',
        stock: 100,
        images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        featured: false,
      },
      {
        name: 'Floral Midi Dress',
        description: 'Beautiful floral dress perfect for summer',
        price: 2499,
        discountPrice: 1799,
        category: 'womens',
        subcategory: 'Dresses',
        brand: 'FloralBloom',
        stock: 50,
        images: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
        featured: true,
      },
      {
        name: 'Kids Sneakers',
        description: 'Comfortable sneakers for active kids',
        price: 1299,
        discountPrice: 899,
        category: 'kids',
        subcategory: 'Shoes',
        brand: 'KidStep',
        stock: 75,
        images: '',
        featured: false,
      },
    ];

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_template.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = Object.keys(sample[0]).join(',');
      const rows = sample.map((p) =>
        Object.values(p).map((v) => `"${v}"`).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    toast.success(`Template downloaded!`);
  };

  const fileExt = file?.name.split('.').pop()?.toLowerCase() || '';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-orange-400" />
            Bulk Import Products
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Import multiple products at once via CSV, Excel (.xlsx), or JSON
          </p>
        </div>

        {/* Download Template */}
        <div className="flex gap-2">
          <button
            onClick={() => downloadTemplate('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            CSV Template
          </button>
          <button
            onClick={() => downloadTemplate('json')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            JSON Template
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
              : 'border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />

          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? 'bg-orange-500/20' : 'bg-gray-800'
            }`}>
              <Upload className={`h-8 w-8 transition-colors ${
                isDragging ? 'text-orange-400' : 'text-gray-500'
              }`} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-200">
                {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { ext: 'CSV', icon: <FileText className="h-4 w-4 text-green-400" />, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                { ext: 'XLSX', icon: <FileSpreadsheet className="h-4 w-4 text-blue-400" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { ext: 'JSON', icon: <FileJson className="h-4 w-4 text-yellow-400" />, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              ].map((f) => (
                <div key={f.ext} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${f.color}`}>
                  {f.icon}
                  {f.ext}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600">Maximum 500 products · 10MB file size</p>
          </div>
        </div>
      )}

      {/* Parsing loader */}
      {parsing && (
        <div className="flex items-center justify-center gap-3 py-8 bg-gray-900 rounded-2xl border border-gray-800">
          <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
          <p className="text-sm text-gray-300">Parsing file...</p>
        </div>
      )}

      {/* Parse Error */}
      {parseError && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-medium">Parse Error</p>
            <p className="text-xs text-red-400 mt-1">{parseError}</p>
          </div>
          <button onClick={handleReset} className="ml-auto text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* File Info + Preview */}
      {file && !parsing && !parseError && rawData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* File card */}
          <div className="flex items-center gap-4 p-4 bg-gray-800/80 border border-gray-700 rounded-xl">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              {fileIcons[fileExt] || <FileText className="h-5 w-5 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {rawData.length} products found ·{' '}
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
                {showPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
                  <p className="text-xs text-gray-500 px-4 py-2.5 border-b border-gray-800">
                    Showing first {Math.min(5, preview.length)} of {rawData.length} rows
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {Object.keys(preview[0] || {}).slice(0, 8).map((key) => (
                          <th key={key} className="text-left px-3 py-2 text-gray-400 font-medium whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          {Object.values(row).slice(0, 8).map((val: any, j) => (
                            <td key={j} className="px-3 py-2 text-gray-300 max-w-[120px] truncate">
                              {String(val || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Column mapping hint */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-400 font-medium mb-1.5">📋 Column Mapping</p>
            <p className="text-xs text-gray-400">
              The importer auto-detects columns. Supported names:{' '}
              <span className="text-gray-300 font-mono">name, description, price, discountPrice, category, subcategory, brand, stock, images/productUrl, featured</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Category must be: <span className="text-orange-400 font-semibold">mens</span>, <span className="text-orange-400 font-semibold">womens</span>, or <span className="text-orange-400 font-semibold">kids</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              <span className="text-yellow-400">⚠ Images:</span> Use direct HTTPS URLs (Unsplash, Cloudinary, etc.).
              Base64 and Google Shopping URLs are skipped — a smart fallback image is used instead.
            </p>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-orange-500/20"
          >
            {importing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Importing {rawData.length} products...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Import {rawData.length} Products
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Import Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-1.5" />
                <p className="text-2xl font-black text-green-400">{result.imported}</p>
                <p className="text-xs text-green-500/80 mt-0.5">Imported</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                <FileText className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
                <p className="text-2xl font-black text-white">{result.total}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Rows</p>
              </div>
              <div className={`border rounded-xl p-4 text-center ${
                result.failed > 0
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-gray-800 border-gray-700'
              }`}>
                <AlertCircle className={`h-6 w-6 mx-auto mb-1.5 ${result.failed > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                <p className={`text-2xl font-black ${result.failed > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {result.failed}
                </p>
                <p className={`text-xs mt-0.5 ${result.failed > 0 ? 'text-red-500/80' : 'text-gray-500'}`}>
                  Failed
                </p>
              </div>
            </div>

            {/* Success message */}
            {result.imported > 0 && (
              <div className="flex items-center gap-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-300 font-medium">
                  Successfully imported {result.imported} products. They are now visible in your store.
                </p>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {result.errors.length} row{result.errors.length > 1 ? 's' : ''} failed — click to view
                  </span>
                  {showErrors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {showErrors && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-1.5 max-h-48 overflow-y-auto">
                        {result.errors.map((err, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-gray-500 flex-shrink-0 font-mono">Row {err.row}:</span>
                            <span className="text-red-400">{err.error}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Import another */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Import another file
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
