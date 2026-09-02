import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Plus,
  FileSpreadsheet,
  MapPin,
  Search,
  Trash2,
  Edit2,
  X,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface LineItem {
  id: string;
  name: string;
  stock: number;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export const IboxSaleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormatter();

  // Header State
  const [customer, setCustomer] = useState('OOO "RIZOBAY STROY"');
  const [saleDate, setSaleDate] = useState('2026-09-03 10:00');
  const [saleNumber, setSaleNumber] = useState('SO-00482');
  const [salesChannel, setSalesChannel] = useState('Bosh doʻkon (Chakana / Ulgurji)');
  const [responsiblePerson, setResponsiblePerson] = useState('Shokirjon Turgʻunboyev');
  const [currency, setCurrency] = useState('UZS');
  const [warehouse, setWarehouse] = useState('Boshqarma');
  const [priceList, setPriceList] = useState('Standart narx');

  // Bottom State
  const [notes, setNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('Toshkent sh., Chilonzor tumani, 9-mavze');

  // Items State (Pre-filled sample row to demonstrate)
  const [items, setItems] = useState<LineItem[]>([
    {
      id: 'item-1',
      name: 'Armatura 12mm A500C (Oʻzmetkombinat)',
      stock: 2500,
      quantity: 100,
      price: 13500,
      discount: 0,
      total: 1350000,
    },
  ]);

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      name: 'Akfa Emulsiya Fasid Boʻyoq 20kg',
      stock: 80,
      quantity: 5,
      price: 275000,
      discount: 0,
      total: 1375000,
    };
    setItems([...items, newItem]);
    toast.success('Tovar qoʻshildi');
  };

  const handleUpdateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(1, qty), total: Math.max(1, qty) * it.price } : it
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);

  const handleSaveSale = () => {
    toast.success('Sotuv hujjati muvaffaqiyatli saqlandi!');
    navigate('/admin/sales');
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-24 space-y-4 animate-fade-in text-xs">
      {/* Page Title & Context Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Sotuv (Yaratish)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Yangi sotuv yuk xati va hisob-fakturasini rasmiylashtirish</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/pos')}
            className="bg-[#02C39A] hover:bg-[#02A683] text-[#0B2B33] font-extrabold border-none text-xs shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" /> POS oyna
          </Button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        {/* Row 1: Mijoz, Sotuv sanasi, Sotuv raqami */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Mijoz*</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
            >
              <option value='OOO "RIZOBAY STROY"'>OOO "RIZOBAY STROY"</option>
              <option value="Akbarjon Usta">Akbarjon Usta (Quruvchi)</option>
              <option value="Sherdor Qurilish MCHJ">Sherdor Qurilish MCHJ</option>
              <option value="Chakana Xaridor">Chakana Xaridor</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Sotuv sanasi*</label>
            <div className="relative">
              <input
                type="text"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Sotuv raqami</label>
            <input
              type="text"
              value={saleNumber}
              onChange={(e) => setSaleNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
            />
          </div>
        </div>

        {/* Row 2: Sotuv kanali, Mas'ul shaxs, Hujjat valyutasi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Sotuv kanali</label>
            <select
              value={salesChannel}
              onChange={(e) => setSalesChannel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
            >
              <option>Bosh doʻkon (Chakana / Ulgurji)</option>
              <option>Telefon orqali buyurtma</option>
              <option>Telegram bot buyurtma</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Masʼul shaxs</label>
            <div className="relative">
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
              />
              <button
                type="button"
                onClick={() => setResponsiblePerson('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Hujjat valyutasi*</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
            >
              <option value="UZS">UZS (Oʻzbekiston soʻmi)</option>
              <option value="USD">USD (AQSH Dollari)</option>
              <option value="RUB">RUB (Rossiya rubli)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Ombor, Buttons, Prays list */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
              >
                <option value="Boshqarma">Ombor: Boshqarma</option>
                <option value="Chilonzor">Ombor: Chilonzor</option>
                <option value="Ulgurji baza">Ombor: Ulgurji baza</option>
              </select>
            </div>

            <Button
              type="button"
              onClick={handleAddItem}
              className="bg-[#028090]/10 hover:bg-[#028090]/20 text-[#028090] border border-[#028090]/30 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Mahsulotlarni tanlash
            </Button>

            <Button
              type="button"
              variant="outline"
              className="text-slate-600 font-medium text-xs"
              onClick={() => toast.info('Excel import moduli faol')}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-[#028090]" /> Excel dan yuklash
            </Button>
          </div>

          <div>
            <select
              value={priceList}
              onChange={(e) => setPriceList(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
            >
              <option value="Standart narx">Prays list: Standart narx</option>
              <option value="Optom narx">Prays list: Optom narx (-10%)</option>
            </select>
          </div>
        </div>

        {/* SAPAR TEAL TABLE HEADER (#028090) */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#028090] text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3 w-10 text-center">#</th>
                <th className="px-4 py-3">Mahsulot</th>
                <th className="px-4 py-3 text-right">Qoldiq</th>
                <th className="px-4 py-3 text-center w-28">Miqdor</th>
                <th className="px-4 py-3 text-right">Narx</th>
                <th className="px-4 py-3 text-right">Chegirma</th>
                <th className="px-4 py-3 text-right font-bold">Summa</th>
                <th className="px-3 py-3 text-center w-12">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#F0FBF8] transition">
                  <td className="px-3 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">{item.stock} dona</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQty(item.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded border border-slate-300 text-center font-bold focus:outline-none focus:border-[#028090]"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{format(item.price)}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">0 UZS</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#028090]">
                    {format(item.total)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Details (Izoh, Yetkazib berish manzili, Summa) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
          <div className="lg:col-span-8 space-y-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Izoh</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Buyurtmaga tegishli qoʻshimcha izohlar..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Yetkazib berish manzili</label>
              <div className="relative">
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <MapPin className="w-4 h-4 text-[#028090] absolute right-3 top-2.5 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end space-y-2 bg-[#F0FBF8] p-4 rounded-xl border border-[#028090]/20">
            <div className="flex justify-between text-slate-600">
              <span>Oraliq jami:</span>
              <span className="font-mono font-bold text-slate-900">{format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 items-center">
              <span>Chegirma:</span>
              <span className="font-mono text-slate-700 flex items-center gap-1">
                0 UZS <Edit2 className="w-3 h-3 text-[#028090] cursor-pointer" />
              </span>
            </div>
            <div className="border-t border-[#028090]/20 pt-2 flex justify-between items-center">
              <span className="font-black text-[#0B2B33] text-sm">Jami:</span>
              <span className="font-black text-[#028090] text-base font-mono">{format(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 shadow-lg flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveSale}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs"
          >
            Saqlash <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/sales')} className="text-xs">
            Bekor qilish
          </Button>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <span>
            Jami: <strong className="font-mono text-[#028090] text-sm">{format(subtotal)}</strong>
          </span>
          <span>
            Miqdor: <strong className="font-mono text-slate-900">{totalQty}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default IboxSaleCreatePage;
