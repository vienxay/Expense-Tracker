import { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Calendar, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ExportModal = ({ onClose }) => {
  const [exportType, setExportType] = useState('excel');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [transactionType, setTransactionType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(transactionType && { type: transactionType })
      });

      const url = `/api/export/${exportType}?${params}`;
      
      // Create download link
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `expense-report-${Date.now()}.${exportType === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">ສົ່ງອອກລາຍງານ</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Export Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                ປະເພດໄຟລ໌
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportType('excel')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    exportType === 'excel'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FileSpreadsheet className={`w-8 h-8 ${exportType === 'excel' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={`font-medium ${exportType === 'excel' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    Excel (.xlsx)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportType('pdf')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    exportType === 'pdf'
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FileText className={`w-8 h-8 ${exportType === 'pdf' ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className={`font-medium ${exportType === 'pdf' ? 'text-red-600' : 'text-slate-600'}`}>
                    PDF (.pdf)
                  </span>
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ຊ່ວງວັນທີ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input-field pl-10"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ປະເພດທຸລະກຳ
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="input-field"
              >
                <option value="">ທັງໝົດ</option>
                <option value="income">ລາຍຮັບ</option>
                <option value="expense">ລາຍຈ່າຍ</option>
              </select>
            </div>

            {/* Quick Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ເລືອກໄວ
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'ເດືອນນີ້', start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
                  { label: 'ເດືອນກ່ອນ', start: startOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))), end: endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))) },
                  { label: '3 ເດືອນ', start: new Date(new Date().setMonth(new Date().getMonth() - 3)), end: new Date() },
                  { label: 'ປີນີ້', start: new Date(new Date().getFullYear(), 0, 1), end: new Date() },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDateRange({
                      startDate: format(opt.start, 'yyyy-MM-dd'),
                      endDate: format(opt.end, 'yyyy-MM-dd')
                    })}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ກຳລັງສົ່ງອອກ...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    ດາວໂຫຼດ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;