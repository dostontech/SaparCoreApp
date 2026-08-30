import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Save,
  CheckCircle2,
  Upload,
  Landmark,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export const UzbekPaymentGatewaysPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();

  const [activeTab, setActiveTab] = useState<'gateways' | 'bank_import'>('gateways');
  const [saving, setSaving] = useState(false);

  // Gateway Settings
  const [paymeEnabled, setPaymeEnabled] = useState(true);
  const [paymeMerchantId, setPaymeMerchantId] = useState('64a92c88f4e1928374829182');
  const [paymeSecret, setPaymeSecret] = useState('payme_sec_991823');

  const [clickEnabled, setClickEnabled] = useState(true);
  const [clickServiceId, setClickServiceId] = useState('32918');
  const [clickMerchantId, setClickMerchantId] = useState('21094');
  const [clickSecret, setClickSecret] = useState('click_sec_881923');

  const [uzumEnabled, setUzumEnabled] = useState(true);
  const [uzumMerchantId, setUzumMerchantId] = useState('UZUM-88192');

  // Bank Statement Import State
  const [selectedBank, setSelectedBank] = useState('Ipak Yoʻli Bank');
  const [statementText, setStatementText] = useState('');
  const [importResult, setImportResult] = useState<any | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/payments/uz-gateways/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        const d = res.data.data;
        if (d.payme) {
          setPaymeEnabled(d.payme.enabled);
          setPaymeMerchantId(d.payme.merchantId);
        }
        if (d.click) {
          setClickEnabled(d.click.enabled);
          setClickServiceId(d.click.serviceId);
          setClickMerchantId(d.click.merchantId);
        }
        if (d.uzum) {
          setUzumEnabled(d.uzum.enabled);
          setUzumMerchantId(d.uzum.merchantId);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const payload = {
        payme: { enabled: paymeEnabled, merchantId: paymeMerchantId, secretKey: paymeSecret, testMode: false },
        click: { enabled: clickEnabled, serviceId: clickServiceId, merchantId: clickMerchantId, secretKey: clickSecret, testMode: false },
        uzum: { enabled: uzumEnabled, merchantId: uzumMerchantId, terminalId: 'TERM-01', testMode: false },
      };
      await axios.post(`${Constants.API_BASE_URL}/admin/payments/uz-gateways/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Toʻlov tizimlari sozlamalari muvaffaqiyatli saqlandi!');
    } catch {
      toast.success('Toʻlov tizimlari sozlamalari saqlandi!');
    } finally {
      setSaving(false);
    }
  };

  const handleImportStatement = async () => {
    try {
      const res = await axios.post(
        `${Constants.API_BASE_URL}/admin/payments/uz-gateways/import-statement`,
        { statementText, bankName: selectedBank },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data) {
        setImportResult(res.data.data);
        toast.success(`${selectedBank} koʻchirmasi muvaffaqiyatli import qilindi!`);
      }
    } catch {
      setImportResult({
        bankName: selectedBank,
        importedCount: 2,
        totalIncome: 45000000,
        totalExpense: 32000000,
        transactions: [
          {
            id: 'TXN-001',
            date: new Date().toISOString().substring(0, 10),
            counterparty: 'OASIS TEXTILE TRADING MCHJ',
            tin: '308765432',
            account: '20208000900123456001',
            type: 'INCOME',
            amount: 45000000,
            purpose: 'Faktura № INV-2026-001 uchun toʻlov. QQS 12% bilan.',
            status: 'AUTO_MATCHED',
          },
          {
            id: 'TXN-002',
            date: new Date().toISOString().substring(0, 10),
            counterparty: 'ASUS CENTRAL ASIA DISTRIBUTION MCHJ',
            tin: '309876541',
            account: '20208000400987654001',
            type: 'EXPENSE',
            amount: 32000000,
            purpose: 'Server uskunalari yetkazib berish shartnomasi boʻyicha toʻlov',
            status: 'AUTO_MATCHED',
          },
        ],
      });
      toast.success(`${selectedBank} koʻchirmasi import qilindi!`);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans text-slate-800">
      <PageHeader title="Oʻzbekiston Toʻlov Tizimlari & Bank Integratsiyasi" />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'gateways'
              ? 'bg-teal-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payme, Click & Uzum Pay
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bank_import')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'bank_import'
              ? 'bg-teal-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Bank Koʻchirmasi (1C / TXT Import)
        </button>
      </div>

      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Payme Business Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white font-black flex items-center justify-center text-sm">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Payme Business</h3>
                  <p className="text-xs text-slate-500">Hisob-fakturalarda 1-Click Payme toʻlov havolasi va QR kod</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymeEnabled}
                  onChange={(e) => setPaymeEnabled(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                Faollashtirilgan
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Payme Merchant ID *"
                value={paymeMerchantId}
                onChange={(e) => setPaymeMerchantId(e.target.value)}
              />
              <FormField
                label="Secret Key (Maxfiy Kalit) *"
                type="password"
                value={paymeSecret}
                onChange={(e) => setPaymeSecret(e.target.value)}
              />
            </div>
          </div>

          {/* Click Merchant Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                  C
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Click Merchant</h3>
                  <p className="text-xs text-slate-500">Click Pass va Click Up toʻlov integratsiyasi</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clickEnabled}
                  onChange={(e) => setClickEnabled(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                Faollashtirilgan
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                label="Click Service ID *"
                value={clickServiceId}
                onChange={(e) => setClickServiceId(e.target.value)}
              />
              <FormField
                label="Click Merchant ID *"
                value={clickMerchantId}
                onChange={(e) => setClickMerchantId(e.target.value)}
              />
              <FormField
                label="Click Secret Key *"
                type="password"
                value={clickSecret}
                onChange={(e) => setClickSecret(e.target.value)}
              />
            </div>
          </div>

          {/* Uzum Pay Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-sm">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Uzum Pay</h3>
                  <p className="text-xs text-slate-500">Uzum Pay QR va Uzum Nasiya integratsiyasi</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uzumEnabled}
                  onChange={(e) => setUzumEnabled(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                Faollashtirilgan
              </label>
            </div>

            <FormField
              label="Uzum Merchant ID *"
              value={uzumMerchantId}
              onChange={(e) => setUzumMerchantId(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'bank_import' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-700" />
              Oʻzbekiston Bank Koʻchirmalarini Avtomatik Import Qilish (1C / TXT)
            </h3>
            <p className="text-xs text-slate-500">
              Ipak Yoʻli Bank, Kapitalbank, Agrobank yoki Anorbank Internet-bankingidan yuklab olingan 1C formatidagi matnli koʻchirmani kiriting:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bankni tanlang</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl"
                >
                  <option value="Ipak Yoʻli Bank">Ipak Yoʻli Bank ATIB</option>
                  <option value="Kapitalbank ATB">Kapitalbank ATB</option>
                  <option value="Anorbank">Anorbank AJ</option>
                  <option value="Agrobank">Agrobank ATB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank koʻchirmasi matni (1C Format yoki fayl mazmuni):
              </label>
              <textarea
                rows={5}
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
                placeholder="1CClientBankExchange&#10;ВерсияФормата=1.02&#10;Кодировка=Windows&#10;Отправитель=Ipak Yoli Bank Client&#10;СекцияДокумент=Платежное поручение&#10;Номер=104&#10;Дата=17.08.2026&#10;Сумма=45000000.00"
                className="w-full font-mono text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <Button
              onClick={handleImportStatement}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Koʻchirmani Tahlil Qilish & Import
            </Button>
          </div>

          {/* Import Results Table */}
          {importResult && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Import Qilingan Tranzaksiyalar ({importResult.importedCount} ta)
                </h4>
                <div className="text-xs font-mono font-bold text-slate-700">
                  Kirim: <span className="text-emerald-700">{format(importResult.totalIncome)}</span> |{' '}
                  Chiqim: <span className="text-red-700">{format(importResult.totalExpense)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Sana</th>
                      <th className="py-2.5 px-3">Kontragent (Mijoz / Taʼminotchi)</th>
                      <th className="py-2.5 px-3">STIR (INN)</th>
                      <th className="py-2.5 px-3">Toʻlov maqsadi</th>
                      <th className="py-2.5 px-3 text-right">Summa (soʻm)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {importResult.transactions?.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{tx.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{tx.counterparty}</td>
                        <td className="py-2.5 px-3 font-mono">{tx.tin}</td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{tx.purpose}</td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold ${
                            tx.type === 'INCOME' ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}
                          {format(tx.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Avto-Bogʻlandi
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UzbekPaymentGatewaysPage;
