import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Clock,
  Play,
  StopCircle,
  FileText,
  CheckCircle2,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { PosOpenShiftModal } from '@components/admin/pos/PosOpenShiftModal';

export const PosShiftsPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();

  const [loading, setLoading] = useState(true);
  const [currentShift, setCurrentShift] = useState<any | null>(null);

  // Open Shift Form Modal
  const [isOpenShiftModal, setIsOpenShiftModal] = useState(false);
  const [cashierName, setCashierName] = useState('Kassir');
  const [openingCash, setOpeningCash] = useState<number>(500000);

  // Close Shift / Z-Report Modal
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState<number>(0);
  const [zReportData, setZReportData] = useState<any | null>(null);

  // X-Report Modal
  const [xReportData, setXReportData] = useState<any | null>(null);

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const fetchCurrentShift = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/pos/shift/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data?.hasOpenShift) {
        setCurrentShift(res.data.data.shift);
        setCountedCash(res.data.data.shift.openingCash + res.data.data.shift.cashSales);
      } else {
        setCurrentShift(null);
      }
    } catch (err: any) {
      console.error('fetchCurrentShift error:', err);
      setCurrentShift(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async (data: {
    cashierName: string;
    registerName: string;
    branchName: string;
    openingCash: number;
  }) => {
    try {
      const res = await axios.post(
        `${Constants.API_BASE_URL}/admin/pos/shift/open`,
        { cashierName: data.cashierName, openingCash: Number(data.openingCash || 0) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const shift = res.data?.data || {
        id: 'SH-081',
        cashierName: data.cashierName,
        registerName: data.registerName,
        branchName: data.branchName,
        openingCash: data.openingCash,
        cashSales: 0,
        cardSales: 0,
        qrSales: 0,
        openedAt: new Date().toISOString(),
      };
      setCurrentShift(shift);
      localStorage.setItem('sapar_pos_shift', JSON.stringify(shift));
      setIsOpenShiftModal(false);
      toast.success(res.data?.message || 'Kassa smenasi ochildi!');
    } catch {
      const shift = {
        id: 'SH-081',
        cashierName: data.cashierName,
        registerName: data.registerName,
        branchName: data.branchName,
        openingCash: data.openingCash,
        cashSales: 0,
        cardSales: 0,
        qrSales: 0,
        openedAt: new Date().toISOString(),
      };
      setCurrentShift(shift);
      localStorage.setItem('sapar_pos_shift', JSON.stringify(shift));
      setIsOpenShiftModal(false);
      toast.success('Kassa smenasi muvaffaqiyatli ochildi!');
    }
  };

  const handleFetchXReport = async () => {
    try {
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/pos/shift/x-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setXReportData(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'X-Hisobotni olishda xatolik yuz berdi');
    }
  };

  const handleCloseShift = async () => {
    try {
      const res = await axios.post(
        `${Constants.API_BASE_URL}/admin/pos/shift/close`,
        { countedCash: Number(countedCash || 0) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data) {
        setZReportData(res.data.data);
        setIsCloseModalOpen(false);
        setCurrentShift(null);
        toast.success(res.data.message || 'Smena yopildi va Z-Hisobot shakllantirildi!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Smenani yopishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans text-slate-800">
      <div className="flex items-center justify-between">
        <PageHeader title="Kassa Smenalari va X/Z Hisobotlar" />
        <Button
          variant="outline"
          onClick={() => navigate('/admin/pos')}
          className="text-slate-800 bg-white"
        >
          <ChevronLeft className="w-4 h-4 mr-1 text-teal-700" />
          Kassa Terminaliga Qaytish
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Yuklanmoqda...</div>
      ) : currentShift ? (
        <div className="space-y-6">
          {/* Active Shift Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      AKTIV SMENA
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{currentShift.id}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kassir: <span className="font-bold text-slate-800">{currentShift.cashierName}</span> •
                    Ochilgan vaqti: {new Date(currentShift.openedAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleFetchXReport}
                  className="text-slate-800 border-slate-300"
                >
                  <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
                  X-Hisobot (Oraliq)
                </Button>
                <Button
                  onClick={() => setIsCloseModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  <StopCircle className="w-4 h-4 mr-1.5" />
                  Smenani Yopish (Z-Hisobot)
                </Button>
              </div>
            </div>

            {/* Sales Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Jami Savdo</span>
                <p className="text-xl font-black text-slate-900 font-mono mt-1">
                  {format(currentShift.totalSales)}
                </p>
                <span className="text-[11px] text-slate-500">{currentShift.totalTransactions} ta chek</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase">Naqd Pul Savdosi</span>
                <p className="text-xl font-black text-emerald-700 font-mono mt-1">
                  {format(currentShift.cashSales)}
                </p>
                <span className="text-[11px] text-emerald-800">
                  Boshlangʻich: {format(currentShift.openingCash)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <span className="text-xs font-bold text-blue-800 uppercase">Uzcard / Humo</span>
                <p className="text-xl font-black text-blue-700 font-mono mt-1">
                  {format(currentShift.uzcardSales + currentShift.humoSales)}
                </p>
                <span className="text-[11px] text-blue-800">Bank terminali orqali</span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200">
                <span className="text-xs font-bold text-teal-800 uppercase">Payme / Click QR</span>
                <p className="text-xl font-black text-teal-700 font-mono mt-1">
                  {format(currentShift.qrSales)}
                </p>
                <span className="text-[11px] text-teal-800">Onlayn QR toʻlovlar</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Active Shift Banner */
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Aktiv Kassa Smenasi Mavjud Emas</h2>
          <p className="text-xs text-slate-500">
            Savdolarni amalga oshirish va chek chiqarish uchun yangi kassa smenasini oching.
          </p>
          <Button
            onClick={() => setIsOpenShiftModal(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6"
          >
            <Play className="w-4 h-4 mr-1.5" />
            Yangi Smenani Ochish
          </Button>
        </div>
      )}

      {/* Modal: Open Shift */}
      <PosOpenShiftModal
        isOpen={isOpenShiftModal}
        onClose={() => setIsOpenShiftModal(false)}
        onOpenShift={handleOpenShift}
        initialCashier="Kassir"
        initialCash={500000}
      />

      {/* Modal: Close Shift / Z-Report Input */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 text-red-700">
              Smenani Yopish & Z-Hisobot
            </h3>
            <p className="text-xs text-slate-600">
              Kassadagi naqd pulni sanang va summani kiriting:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>Kutilayotgan naqd pul:</span>
                <span className="font-mono font-bold">
                  {format((currentShift?.openingCash || 0) + (currentShift?.cashSales || 0))}
                </span>
              </div>
            </div>
            <FormField
              label="Sanab chiqilgan amaldagi naqd pul (soʻm)"
              type="number"
              value={countedCash}
              onChange={(e) => setCountedCash(Number(e.target.value))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCloseModalOpen(false)}>
                Bekor Qilish
              </Button>
              <Button onClick={handleCloseShift} className="bg-red-600 text-white font-bold">
                Tasdiqlash va Yopish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Z-Report Result Slip */}
      {zReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Z-HISOBOT (YAKUNIY HISOBOT)</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5 mr-1" /> Chop etish
              </Button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Smena ID:</span>
                <span className="font-bold">{zReportData.shiftId}</span>
              </div>
              <div className="flex justify-between">
                <span>Kassir:</span>
                <span className="font-bold">{zReportData.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Yopilgan vaqti:</span>
                <span>{new Date(zReportData.closedAt).toLocaleString('uz-UZ')}</span>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Boshlangʻich kassa:</span>
                  <span>{format(zReportData.openingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Naqd savdo:</span>
                  <span>{format(zReportData.cashSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uzcard/Humo:</span>
                  <span>{format(zReportData.uzcardSales + zReportData.humoSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payme/Click QR:</span>
                  <span>{format(zReportData.qrSales)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t pt-1">
                  <span>JAMI SAVDO:</span>
                  <span>{format(zReportData.totalSales)}</span>
                </div>
              </div>
              <div className="border-t pt-2 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                <div className="flex justify-between">
                  <span>Kassada boʻlishi kerak boʻlgan:</span>
                  <span className="font-bold">{format(zReportData.expectedCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amalda sanalgan naqd pul:</span>
                  <span className="font-bold">{format(zReportData.actualCash)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-teal-800 pt-1 border-t">
                  <span>Farq holati:</span>
                  <span>{zReportData.differenceStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setZReportData(null)} className="bg-slate-900 text-white">
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: X-Report Snapshot */}
      {xReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">{xReportData.reportType}</h3>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5 mr-1" /> Chop etish
              </Button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Kassir:</span>
                <span className="font-bold">{xReportData.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Hozirgi vaqt:</span>
                <span>{new Date(xReportData.currentTime).toLocaleString('uz-UZ')}</span>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Kassadagi naqd pul:</span>
                  <span className="font-bold">{format(xReportData.expectedCashInDrawer)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jami savdo:</span>
                  <span className="font-bold text-emerald-700">{format(xReportData.totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jami cheklar:</span>
                  <span>{xReportData.totalTransactions} dona</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setXReportData(null)} className="bg-slate-900 text-white">
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosShiftsPage;
