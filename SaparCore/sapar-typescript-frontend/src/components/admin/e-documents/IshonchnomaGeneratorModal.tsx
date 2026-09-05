import React, { useState } from 'react';
import {
  X,
  FileSignature,
  Building2,
  UserCheck,
  Plus,
  Trash2,
  ShieldCheck,
  Package,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import Constants from '@constants/api';

interface IshonchnomaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: any) => void;
}

export const IshonchnomaGeneratorModal: React.FC<IshonchnomaGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem('token') || '';

  // Attorney (Ishonchli shaxs)
  const [attorneyName, setAttorneyName] = useState('RAXIMOV SARDOR BAXTIYOROVICH');
  const [attorneyPosition, setAttorneyPosition] = useState('Taʼminot va logistika boʻlimi boshligʻi');
  const [attorneyPassport, setAttorneyPassport] = useState('AA 1234567');
  const [attorneyPassportIssuedBy, setAttorneyPassportIssuedBy] = useState(
    'Toshkent shahar Mirzo Ulugʻbek IIO FMB tomonidan 12.04.2021 yilda berilgan'
  );
  const [attorneyPinfl, setAttorneyPinfl] = useState('32004900190088');

  // Supplier
  const [supplierName, setSupplierName] = useState('TOSHKENT TEXNO IMPORT MCHJ');
  const [supplierTin, setSupplierTin] = useState('304567890');
  const [supplierAddress, setSupplierAddress] = useState('Toshkent shahri, Chilonzor tumani 19-mavze');
  const [contractNumber, setContractNumber] = useState('88-XARID');
  const [contractDate, setContractDate] = useState('2025-05-12');

  // Validity
  const defaultValidDate = new Date(Date.now() + 10 * 86400000).toISOString().substring(0, 10);
  const [validUntil, setValidUntil] = useState(defaultValidDate);

  // Items
  const [items, setItems] = useState<any[]>([
    {
      name: 'Server Dell PowerEdge R750xs Rack Server',
      catalogCode: '04701002001000000',
      packageName: 'dona',
      count: 2,
      summa: 42000000,
    },
    {
      name: 'Cisco Catalyst 9200L 48-Port Switch',
      catalogCode: '04702001001000000',
      packageName: 'dona',
      count: 4,
      summa: 14500000,
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    catalogCode: '04701001001000000',
    packageName: 'dona',
    count: 1,
    summa: 0,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newItem.name) {
      toast.error('Tovar nomini kiriting');
      return;
    }
    setItems([...items, { ...newItem }]);
    setNewItem({
      name: '',
      catalogCode: '04701001001000000',
      packageName: 'dona',
      count: 1,
      summa: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attorneyName || !attorneyPassport || !supplierName) {
      toast.error('Barcha majburiy maydonlarni toʻldiring');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${Constants.BASE_URL}/admin/e-documents/generate/empowerment`,
        {
          attorneyName,
          attorneyPosition,
          attorneyPassport,
          attorneyPassportIssuedBy,
          attorneyPinfl,
          supplierName,
          supplierTin,
          supplierAddress,
          contractNumber,
          contractDate,
          validUntil,
          items,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Ishonchnoma (M-2) muvaffaqiyatli shakllantirildi');
        onSuccess(res.data.data.document);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ishonchnoma yaratishda xatolik');
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
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading">
                Elektron Ishonchnoma (Доверенность — Shakl № M-2) Yaratish
              </h2>
              <p className="text-xs text-body">
                Tovarlar va moddiy boyliklarni qabul qilish huquqini beruvchi rasmiy ishonchnoma
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
          {/* Section 1: Attorney Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" /> 1. Ishonchli Shaxs (Xodim) Maʼlumotlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <FormField
                label="F.I.Sh. (Toʻliq) *"
                value={attorneyName}
                onChange={(e) => setAttorneyName(e.target.value)}
                placeholder="Familiyasi Ismi Sharif"
                required
              />
              <FormField
                label="Lavozimi *"
                value={attorneyPosition}
                onChange={(e) => setAttorneyPosition(e.target.value)}
                placeholder="Masalan: Taʼminotchi"
                required
              />
              <FormField
                label="JShShIR (ПИНФЛ) *"
                value={attorneyPinfl}
                onChange={(e) => setAttorneyPinfl(e.target.value)}
                placeholder="14 xonali JShShIR"
                required
              />
              <FormField
                label="Pasport seriya va raqami *"
                value={attorneyPassport}
                onChange={(e) => setAttorneyPassport(e.target.value)}
                placeholder="AA 1234567"
                required
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Kim tomonidan va qachon berilgan *"
                  value={attorneyPassportIssuedBy}
                  onChange={(e) => setAttorneyPassportIssuedBy(e.target.value)}
                  placeholder="IIB / IIO FMB tomonidan..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Supplier & Validity */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" /> 2. Yetkazib Beruvchi va Amal Qilish Muddati
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <FormField
                label="Yetkazib beruvchi tashkilot *"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Kompaniya nomi"
                required
              />
              <FormField
                label="Yetkazib beruvchi STIR (ИНН)"
                value={supplierTin}
                onChange={(e) => setSupplierTin(e.target.value)}
                placeholder="300000000"
              />
              <FormField
                label="Yetkazib beruvchi manzili"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                placeholder="Manzil"
              />
              <FormField
                label="Shartnoma / Faktura №"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="№ 12-SH"
              />
              <FormField
                label="Shartnoma sanasi"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
              <FormField
                label="Amal qilish muddati *"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 3: Goods / Items to Receive */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-primary" /> 3. Qabul Qilinishi Kerak Boʻlgan Tovar-Moddiy Boyliklar
            </h3>

            <div className="border border-border rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-heading font-semibold border-b border-border">
                  <tr>
                    <th className="py-2 px-3">№</th>
                    <th className="py-2 px-3">Tovar / Mahsulot nomi</th>
                    <th className="py-2 px-3 font-mono">MXIK (IKPU)</th>
                    <th className="py-2 px-3">Oʻlchov birligi</th>
                    <th className="py-2 px-3 text-right">Miqdori</th>
                    <th className="py-2 px-3 text-center">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2 px-3 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium">{it.name}</td>
                      <td className="py-2 px-3 font-mono text-body">{it.catalogCode}</td>
                      <td className="py-2 px-3">{it.packageName}</td>
                      <td className="py-2 px-3 text-right font-bold text-heading">{it.count}</td>
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
                  ))}
                  {/* New Item Input */}
                  <tr className="bg-muted/10 border-t border-border">
                    <td className="p-2 text-center text-body">+</td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Tovar nomi"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="MXIK kodi (17 xonali)"
                        value={newItem.catalogCode}
                        onChange={(e) => setNewItem({ ...newItem, catalogCode: e.target.value })}
                        className="w-full text-xs p-1 border rounded font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={newItem.packageName}
                        onChange={(e) => setNewItem({ ...newItem, packageName: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      >
                        <option value="dona">dona (796)</option>
                        <option value="kg">kg (166)</option>
                        <option value="metr">metr (006)</option>
                        <option value="komplekt">komplekt (839)</option>
                        <option value="quti">quti (778)</option>
                      </select>
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
              {loading ? 'Shakllantirilmoqda...' : 'Ishonchnoma Shakllantirish va E-IMZO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
