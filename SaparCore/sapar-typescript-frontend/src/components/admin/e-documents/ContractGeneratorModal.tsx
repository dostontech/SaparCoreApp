import React, { useState } from 'react';
import {
  X,
  Layers,
  Building2,
  FileText,
  Plus,
  Trash2,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import Constants from '@constants/api';
import Cookies from 'js-cookie';

interface ContractGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: any) => void;
}

export const ContractGeneratorModal: React.FC<ContractGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const getToken = () => Cookies.get('authToken') || localStorage.getItem('authToken') || localStorage.getItem('token') || '';

  const [templateType, setTemplateType] = useState('SALES');
  const [contractNumber, setContractNumber] = useState(
    `SH-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
  );
  const [contractDate, setContractDate] = useState(new Date().toISOString().substring(0, 10));

  // Counterparty
  const [counterpartyName, setCounterpartyName] = useState('FARGʻONA AGRO EXPORT MCHJ');
  const [counterpartyTin, setCounterpartyTin] = useState('307654321');
  const [counterpartyPinfl, setCounterpartyPinfl] = useState('31108840190055');
  const [counterpartyAddress, setCounterpartyAddress] = useState('Fargʻona shahri, Al-Fargʻoniy koʻchasi 18');
  const [counterpartyBankAccount, setCounterpartyBankAccount] = useState('20208000900300400500');
  const [counterpartyBankMfo, setCounterpartyBankMfo] = useState('00555');
  const [counterpartyDirector, setCounterpartyDirector] = useState('Soliyev Ahmadjon Rahimovich');

  // Terms
  const [vatRate, setVatRate] = useState(12);
  const [paymentDays, setPaymentDays] = useState(5);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [validityDays, setValidityDays] = useState(365);

  // Items
  const [items, setItems] = useState<any[]>([
    {
      name: 'SAPAR ERP Cloud Korxona Yillik Obunasi',
      catalogCode: '06201001001000000',
      packageName: 'obuna',
      count: 1,
      summa: 18000000,
      vatRate: 12,
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    catalogCode: '06201001001000000',
    packageName: 'dona',
    count: 1,
    summa: 0,
    vatRate: 12,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newItem.name || newItem.summa <= 0) {
      toast.error('Tovar/Xizmat nomi va narxini kiriting');
      return;
    }
    setItems([...items, { ...newItem }]);
    setNewItem({
      name: '',
      catalogCode: '06201001001000000',
      packageName: 'dona',
      count: 1,
      summa: 0,
      vatRate: 12,
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((acc, it) => acc + (it.summa * it.count), 0);
  const vatTotal = items.reduce((acc, it) => acc + ((it.summa * it.count * (it.vatRate || 12)) / 100), 0);
  const grandTotal = subtotal + vatTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterpartyName || !counterpartyTin) {
      toast.error('Kontragent nomi va STIR raqamini toʻldiring');
      return;
    }

    setLoading(true);
    try {
      const curToken = getToken();
      const res = await axios.post(
        `${Constants.API_BASE_URL}/admin/e-documents/generate/contract`,
        {
          templateType,
          contractNumber,
          contractDate,
          counterpartyName,
          counterpartyTin,
          counterpartyPinfl,
          counterpartyAddress,
          counterpartyBankAccount,
          counterpartyBankMfo,
          counterpartyDirector,
          items,
          totalSum: grandTotal,
          vatRate,
          paymentDays,
          deliveryDays,
          validityDays,
        },
        { headers: { Authorization: `Bearer ${curToken}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Shartnoma muvaffaqiyatli shakllantirildi');
        onSuccess(res.data.data.document);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Shartnoma yaratishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading">
                Elektron Shartnoma (Договор) Konstruktori
              </h2>
              <p className="text-xs text-body">
                Yuridik shablonlar asosida elektron shartnoma generatsiyasi va ikki tomonlama E-IMZO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-body hover:text-heading hover:bg-muted/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Template & Basics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" /> 1. Shartnoma Turi va Rekvizitlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-heading block mb-1.5">
                  Shartnoma Shablon Turi *
                </label>
                <select
                  value={templateType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTemplateType(val);
                    if (val === 'SERVICES') {
                      setItems([{ name: 'Buxgalteriya va audit konsalting xizmati', catalogCode: '06920001001000000', packageName: 'oy', count: 1, summa: 12000000, vatRate: 12 }]);
                    } else if (val === 'LEASE') {
                      setItems([{ name: 'Bino va ofis xonalarini oylik ijarasi (50 kv.m)', catalogCode: '06820001001000000', packageName: 'oy', count: 1, summa: 15000000, vatRate: 12 }]);
                    } else if (val === 'CONTRACTOR') {
                      setItems([{ name: 'Omborxona binosini taʼmirlash va montaj ishlari', catalogCode: '04321001001000000', packageName: 'ish', count: 1, summa: 45000000, vatRate: 12 }]);
                    } else if (val === 'IT_SERVICES') {
                      setItems([{ name: 'ERP axborot tizimini joriy qilish va texnik xizmat', catalogCode: '06201001001000000', packageName: 'loyiha', count: 1, summa: 28000000, vatRate: 0 }]);
                    } else if (val === 'EMPLOYMENT') {
                      setItems([{ name: 'Bosh buxgalter lavozimi oylik maoshi', catalogCode: '08500001001000000', packageName: 'oy', count: 1, summa: 14000000, vatRate: 0 }]);
                    } else if (val === 'LIABILITY') {
                      setItems([{ name: 'Omborxona tovar-moddiy boyliklari moddiy javobgarligi', catalogCode: '05210001001000000', packageName: 'shartnoma', count: 1, summa: 1, vatRate: 0 }]);
                    } else if (val === 'DISTRIBUTION') {
                      setItems([{ name: 'Mahsulotlarni Oʻzbekiston boʻyicha distribyutsiya qilish', catalogCode: '04610001001000000', packageName: 'partiya', count: 1, summa: 85000000, vatRate: 12 }]);
                    } else {
                      setItems([{ name: 'SAPAR ERP Cloud Korxona Yillik Obunasi', catalogCode: '06201001001000000', packageName: 'obuna', count: 1, summa: 18000000, vatRate: 12 }]);
                    }
                  }}
                  className="w-full text-xs py-2 px-3 border border-border rounded-xl bg-surface text-heading focus:ring-2 focus:ring-primary/20"
                >
                  <option value="SALES">1. Oldi-sotdi shartnomasi (Tovarlar savdosi)</option>
                  <option value="SERVICES">2. Pullik xizmat koʻrsatish shartnomasi (Xizmatlar)</option>
                  <option value="SUPPLY">3. Tovarlarni yetkazib berish shartnomasi (Ulgurji)</option>
                  <option value="LEASE">4. Bino va inshootlar ijara shartnomasi</option>
                  <option value="CONTRACTOR">5. Pudrat shartnomasi (Qurilish va taʼmirlash)</option>
                  <option value="IT_SERVICES">6. IT va Dasturiy taʼminot shartnomasi (IT Park 0% QQS)</option>
                  <option value="EMPLOYMENT">7. Mehnat shartnomasi (my.mehnat.uz standarti)</option>
                  <option value="LIABILITY">8. Toʻliq moddiy javobgarlik shartnomasi</option>
                  <option value="DISTRIBUTION">9. Eksklyuziv distribyutorlik shartnomasi</option>
                  <option value="CUSTOM">10. Boshqa erkin tijorat shartnomasi</option>
                </select>
              </div>
              <FormField
                label="Shartnoma raqami *"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                required
              />
              <FormField
                label="Tuzilgan sanasi *"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 2: Counterparty Information */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" /> 2. Ikkinchi Tomon (Buyurtmachi / Xaridor) Rekvizitlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <FormField
                label="Tashkilot nomi *"
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
                required
              />
              <FormField
                label="STIR (ИНН) *"
                value={counterpartyTin}
                onChange={(e) => setCounterpartyTin(e.target.value)}
                required
              />
              <FormField
                label="JShShIR (ПИНФЛ 14 xonali)"
                value={counterpartyPinfl}
                onChange={(e) => setCounterpartyPinfl(e.target.value)}
              />
              <FormField
                label="Rahbar F.I.Sh."
                value={counterpartyDirector}
                onChange={(e) => setCounterpartyDirector(e.target.value)}
              />
              <FormField
                label="Hisob raqami (20 xonali)"
                value={counterpartyBankAccount}
                onChange={(e) => setCounterpartyBankAccount(e.target.value)}
              />
              <FormField
                label="Bank MFO (5 xonali)"
                value={counterpartyBankMfo}
                onChange={(e) => setCounterpartyBankMfo(e.target.value)}
              />
              <FormField
                label="Yuridik manzil"
                value={counterpartyAddress}
                onChange={(e) => setCounterpartyAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Financials & Products */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-primary" /> 3. Shartnoma Predmeti (Tovarlar / Xizmatlar) va Narxlar
            </h3>

            <div className="border border-border rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-heading font-semibold border-b border-border">
                  <tr>
                    <th className="py-2 px-3">№</th>
                    <th className="py-2 px-3">Nomi</th>
                    <th className="py-2 px-3 font-mono">MXIK</th>
                    <th className="py-2 px-3">Oʻlchov</th>
                    <th className="py-2 px-3 text-right">Miqdori</th>
                    <th className="py-2 px-3 text-right">Narxi (soʻm)</th>
                    <th className="py-2 px-3 text-right">Jami</th>
                    <th className="py-2 px-3 text-center">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it, idx) => {
                    const rowSum = it.summa * it.count;
                    return (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-2 px-3 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium">{it.name}</td>
                        <td className="py-2 px-3 font-mono text-body">{it.catalogCode}</td>
                        <td className="py-2 px-3">{it.packageName}</td>
                        <td className="py-2 px-3 text-right">{it.count}</td>
                        <td className="py-2 px-3 text-right font-mono">{Number(it.summa).toLocaleString('uz-UZ')}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-heading">
                          {rowSum.toLocaleString('uz-UZ')}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* New Row Input */}
                  <tr className="bg-muted/10 border-t border-border">
                    <td className="p-2 text-center text-body">+</td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Xizmat/Tovar nomi"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="MXIK"
                        value={newItem.catalogCode}
                        onChange={(e) => setNewItem({ ...newItem, catalogCode: e.target.value })}
                        className="w-full text-xs p-1 border rounded font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="dona"
                        value={newItem.packageName}
                        onChange={(e) => setNewItem({ ...newItem, packageName: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={newItem.count}
                        onChange={(e) => setNewItem({ ...newItem, count: Number(e.target.value) })}
                        className="w-full text-xs p-1 border rounded text-right"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={newItem.summa}
                        onChange={(e) => setNewItem({ ...newItem, summa: Number(e.target.value) })}
                        className="w-full text-xs p-1 border rounded text-right"
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-bold">
                      {(newItem.summa * newItem.count).toLocaleString('uz-UZ')}
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="white"
                        onClick={handleAddItem}
                        className="p-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms & Conditions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <FormField
                label="QQS stavkasi (%)"
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
              />
              <FormField
                label="Toʻlov muddati (kun)"
                type="number"
                value={paymentDays}
                onChange={(e) => setPaymentDays(Number(e.target.value))}
              />
              <FormField
                label="Yetkazib berish (kun)"
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
              />
              <FormField
                label="Amal qilish muddati (kun)"
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
              />
            </div>

            {/* Total summary */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border text-xs">
              <span className="text-body">QQS (12%) bilan umumiy shartnoma qiymati:</span>
              <span className="text-lg font-black text-primary font-mono">
                {grandTotal.toLocaleString('uz-UZ')} soʻm
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="white" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              {loading ? 'Shakllantirilmoqda...' : 'Shartnoma Yaratish va E-IMZO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
