import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Barcode,
  Package,
  CreditCard,
  User,
  Clock,
  RefreshCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Info,
  PauseCircle,
  Percent,
  Calculator,
  Keyboard,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@components/ui';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { PosPaymentModal } from '@components/admin/pos/PosPaymentModal';
import { ThermalReceiptModal } from '@components/admin/pos/ThermalReceiptModal';
import { ProductDetailsModal } from '@components/admin/pos/ProductDetailsModal';
import { PosCalculatorModal } from '@components/admin/pos/PosCalculatorModal';
import { PosDiscountModal } from '@components/admin/pos/PosDiscountModal';
import { PosHeldOrdersModal, type HeldOrder } from '@components/admin/pos/PosHeldOrdersModal';
import { posAudio } from '@/utils/posAudio';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  sku?: string;
  ikpu?: string;
}

export const PosTerminalPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio & Fullscreen states
  const [isMuted, setIsMuted] = useState<boolean>(posAudio.isMuted);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Chakana Xaridor');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');

  // Shift & Modals
  const [shiftData, setShiftData] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Supercharged POS Modals
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Held Orders Persisted in LocalStorage
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    try {
      const saved = localStorage.getItem('sapar_pos_held_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sapar_pos_held_orders', JSON.stringify(heldOrders));
    } catch {
      /* ignore */
    }
  }, [heldOrders]);

  useEffect(() => {
    fetchProducts();
    fetchCurrentShift();
    /* eslint-disable-next-line */
  }, [selectedCategory]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Global Cashier Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If Alt+C pressed -> toggle calculator
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCalculatorOpen((prev) => !prev);
        return;
      }

      // Ignore standard function keys when typing in standard text inputs (except F-keys)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
          break;
        case 'F3':
          e.preventDefault();
          if (cart.length > 0) setIsDiscountModalOpen(true);
          else toast.error('Avval tovar qoʻshing');
          break;
        case 'F4':
          e.preventDefault();
          setIsHeldModalOpen(true);
          break;
        case 'F8':
          e.preventDefault();
          if (cart.length > 0) {
            handleQuickCashCheckout();
          } else {
            toast.error('Savat boʻsh');
          }
          break;
        case 'F9':
          e.preventDefault();
          if (cart.length > 0) {
            handleOpenPaymentModal();
          } else {
            toast.error('Savat boʻsh');
          }
          break;
        case 'Escape':
          if (!isInput) {
            e.preventDefault();
            setIsPaymentModalOpen(false);
            setIsDiscountModalOpen(false);
            setIsHeldModalOpen(false);
            setIsCalculatorOpen(false);
            setShowShortcutsHelp(false);
            setIsDetailModalOpen(false);
            setLastReceipt(null);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, discountAmount, customerName]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleSound = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    posAudio.setMuted(nextMute);
    if (!nextMute) {
      posAudio.playScanBeep();
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const catParam = selectedCategory !== 'all' ? `&categoryId=${selectedCategory}` : '';
      const res = await axios.get(
        `${Constants.API_BASE_URL}/admin/pos/products?query=${searchQuery}${catParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data) {
        setProducts(res.data.data.products || []);
        setCategories(res.data.data.categories || []);
      }
    } catch {
      // Mockup fallback
      setProducts([
        {
          id: 'p1',
          name: 'Coca-Cola 1.5L Klassik',
          sku: 'CC-15',
          barcode: '4780001234567',
          ikpu: '02102001001000000',
          price: 14000,
          stock: 120,
          category: 'Ichimliklar',
        },
        {
          id: 'p2',
          name: 'Nestle Sut 3.2% 1L',
          sku: 'NES-32',
          barcode: '4780007654321',
          ikpu: '01041001001000000',
          price: 18500,
          stock: 85,
          category: 'Oziq-ovqat',
        },
        {
          id: 'p3',
          name: 'Samarqand Non (Tandir)',
          sku: 'NON-01',
          barcode: '4780009998881',
          ikpu: '01061001001000000',
          price: 8000,
          stock: 45,
          category: 'Oziq-ovqat',
        },
        {
          id: 'p4',
          name: 'Ariel Kir Yuvish Kukuni 3kg',
          sku: 'AR-3K',
          barcode: '4780005554443',
          ikpu: '02081001001000000',
          price: 85000,
          stock: 30,
          category: 'Maishiy',
        },
        {
          id: 'p5',
          name: 'Choco Nut Shokolad Pastasi 400g',
          sku: 'CN-400',
          barcode: '4780001112229',
          ikpu: '01081001001000000',
          price: 32000,
          stock: 60,
          category: 'Oziq-ovqat',
        },
        {
          id: 'p6',
          name: 'Hydra Suv Gazsiz 0.5L',
          sku: 'HYD-05',
          barcode: '4780003331110',
          ikpu: '02101001001000000',
          price: 3500,
          stock: 200,
          category: 'Ichimliklar',
        },
      ]);
      setCategories([
        { id: 'all', name: 'Barcha Mahsulotlar' },
        { id: 'c1', name: 'Ichimliklar' },
        { id: 'c2', name: 'Oziq-ovqat' },
        { id: 'c3', name: 'Maishiy' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentShift = async () => {
    try {
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/pos/shift/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data?.hasOpenShift) {
        setShiftData(res.data.data.shift);
      }
    } catch {
      /* ignore */
    }
  };

  // Add Product to Cart with sound & stock validation
  const handleAddToCart = (prod: any) => {
    const currentInCart = cart.find((item) => item.id === prod.id)?.quantity || 0;
    const availableStock = Number(prod.stock ?? 0);

    if (availableStock <= 0) {
      posAudio.playRemoveTone();
      toast.error(`"${prod.name}" omborda tugagan (0 ta)`);
      return;
    }

    if (currentInCart + 1 > availableStock) {
      posAudio.playRemoveTone();
      toast.error(`"${prod.name}" uchun omborda boshqa qoldiq mavjud emas (Mavjud: ${availableStock} ta)`);
      return;
    }

    posAudio.playScanBeep();
    setCart((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: 1,
          barcode: prod.barcode,
          sku: prod.sku,
          ikpu: prod.ikpu,
        },
      ];
    });
  };

  // Barcode Instant Add
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const matched = products.find(
        (p) =>
          p.barcode === searchQuery.trim() ||
          p.sku?.toLowerCase() === searchQuery.trim().toLowerCase() ||
          p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
      if (matched) {
        handleAddToCart(matched);
        setSearchQuery('');
      } else {
        posAudio.playRemoveTone();
        toast.error('Mahsulot topilmadi');
      }
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    if (delta > 0) {
      const prod = products.find((p) => p.id === id);
      const currentInCart = cart.find((item) => item.id === id)?.quantity || 0;
      const availableStock = Number(prod?.stock ?? 999999);
      if (currentInCart + delta > availableStock) {
        posAudio.playRemoveTone();
        toast.error(`Omborda yetarli qoldiq mavjud emas (Mavjud: ${availableStock} ta)`);
        return;
      }
      posAudio.playScanBeep();
    } else {
      posAudio.playRemoveTone();
    }
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    posAudio.playRemoveTone();
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    posAudio.playRemoveTone();
    setCart([]);
    setDiscountAmount(0);
    setDiscountReason('');
  };

  const subtotal = cart.reduce((s, it) => s + it.quantity * it.price, 0);
  const total = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round((total * 12) / 112);

  const [activeIdempotencyKey, setActiveIdempotencyKey] = useState<string>(
    () => `pos-tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );

  const handleOpenPaymentModal = () => {
    setActiveIdempotencyKey(`pos-tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    setIsPaymentModalOpen(true);
  };

  // Hold / Park Cart Handlers
  const handleHoldCurrentCart = (name: string, note: string) => {
    if (cart.length === 0) {
      toast.error('Savat boʻsh, toʻxtatish uchun tovar qoʻshing');
      return;
    }
    const newHold: HeldOrder = {
      id: `hold-${Date.now()}`,
      heldAt: new Date(),
      customerName: name,
      note,
      items: [...cart],
      subtotal,
      discountAmount,
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    posAudio.playRemoveTone();
    setCart([]);
    setDiscountAmount(0);
    setDiscountReason('');
    toast.success(`Savdo toʻxtatildi (${name})`);
  };

  const handleResumeHeldOrder = (order: HeldOrder) => {
    setCart(order.items);
    setDiscountAmount(order.discountAmount || 0);
    setCustomerName(order.customerName);
    setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
    posAudio.playScanBeep();
    toast.success(`Savdo tiklandi: ${order.customerName}`);
  };

  const handleDiscardHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
    toast.info('Toʻxtatilgan savdo oʻchirildi');
  };

  // 1-Click Quick Cash Checkout (F8)
  const handleQuickCashCheckout = async () => {
    await handleCompletePayment({
      paymentMethod: 'CASH',
      cashAmount: total,
      uzcardAmount: 0,
      humoAmount: 0,
      qrAmount: 0,
      creditAmount: 0,
    });
  };

  const handleCompletePayment = async (paymentDetails: any) => {
    try {
      const payload = {
        items: cart,
        paymentMethod: paymentDetails.paymentMethod,
        cashAmount: paymentDetails.cashAmount,
        uzcardAmount: paymentDetails.uzcardAmount,
        humoAmount: paymentDetails.humoAmount,
        qrAmount: paymentDetails.qrAmount,
        creditAmount: paymentDetails.creditAmount,
        customerName,
        discountAmount,
        discountReason,
        idempotencyKey: activeIdempotencyKey,
      };

      const res = await axios.post(`${Constants.API_BASE_URL}/admin/pos/checkout`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && res.data?.data) {
        posAudio.playSuccessChime();
        setLastReceipt(res.data.data);
        setIsPaymentModalOpen(false);
        clearCart();
        setActiveIdempotencyKey(`pos-tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
        toast.success(res.data.message || 'Savdo muvaffaqiyatli yakunlandi!');
      } else {
        posAudio.playRemoveTone();
        toast.error(res.data?.message || 'Savdoni yakunlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      posAudio.playRemoveTone();
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Serverga ulanishda xatolik yuz berdi. Tranzaksiya amalga oshmadi.';
      toast.error(`Xatolik: ${errorMsg}`);
    }
  };

  const openProductInfo = (prod: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDetailProduct(prod);
    setIsDetailModalOpen(true);
  };

  return (
    <div
      className={`flex flex-col font-sans text-slate-900 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-100 p-3 h-screen' : 'h-[calc(100vh-5rem)] -m-6 p-4 bg-slate-100'
      }`}
    >
      {/* Top POS Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500 rounded-xl text-slate-950 font-black">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">SAPAR POS — Kassa Terminali</h1>
            <p className="text-xs text-teal-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Soliq E-Kassa Rejimi (QQS 12%)
            </p>
          </div>
        </div>

        {/* Search / Barcode Input */}
        <div className="flex-1 max-w-md relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Shtrix-kod skanerlang yoki qidiring... (F1)"
            className="w-full pl-10 pr-12 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <span className="absolute right-3 top-2 px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-mono text-slate-300">
            F1
          </span>
        </div>

        {/* POS Tools: Held Orders, Calculator, Audio, Fullscreen, Shifts */}
        <div className="flex items-center gap-2">
          {/* Held orders button */}
          <button
            type="button"
            onClick={() => setIsHeldModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${
              heldOrders.length > 0
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toʻxtatilgan savdolarni koʻrish (F4)"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>Toʻxtatilgan ({heldOrders.length})</span>
            <span className="text-[10px] font-mono bg-slate-700 px-1 py-0.2 rounded text-slate-300">F4</span>
          </button>

          {/* Calculator toggle */}
          <button
            type="button"
            onClick={() => setIsCalculatorOpen((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
            title="Kassir kalkulyatori (Alt+C)"
          >
            <Calculator className="w-4 h-4 text-teal-400" />
            <span className="hidden md:inline">Kalkulyator</span>
          </button>

          {/* Shortcuts Help */}
          <button
            type="button"
            onClick={() => setShowShortcutsHelp(true)}
            className="p-2 rounded-xl border bg-slate-800 border-slate-700 text-slate-400 hover:text-white transition"
            title="Qaynoq tugmalar maʼlumotnomasi"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Audio toggle button */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition ${
              isMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-teal-500/20 border-teal-500/40 text-teal-300 hover:bg-teal-500/30'
            }`}
            title={isMuted ? 'Ovozni yoqish' : 'Ovozni oʻchirish'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen toggle button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
              isFullscreen
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
            }`}
            title={isFullscreen ? 'Oynali rejimga qaytish' : 'Toʻliq ekran rejimi (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/pos/shifts')}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-xs"
          >
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
            {shiftData ? `Smena: ${shiftData.cashierName}` : 'Smena & X/Z'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content Layout (Left: Items Grid, Right: Cart) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* LEFT: Categories & Products (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Category Filter Pills */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Barchasi ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Touch Grid */}
          <div className="p-3 flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-16 text-center text-slate-400">Yuklanmoqda...</div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-slate-400">Mahsulotlar topilmadi</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2.5">
                {products.map((prod) => {
                  const isOutOfStock = Number(prod.stock || 0) <= 0;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleAddToCart(prod)}
                      className={`p-3 rounded-2xl bg-white border transition text-left flex flex-col justify-between group relative ${
                        isOutOfStock
                          ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50/50'
                          : 'border-slate-200 hover:border-teal-500 hover:shadow-md cursor-pointer active:scale-95'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono">{prod.sku}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => openProductInfo(prod, e)}
                              className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition"
                              title="Tovar haqida toʻliq maʼlumot"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <span
                              className={`px-1.5 py-0.5 rounded-full font-semibold ${
                                isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isOutOfStock ? '0 ta (Tugagan)' : `${prod.stock} ta`}
                            </span>
                          </div>
                        </div>
                        <h4
                          className={`font-bold text-xs line-clamp-2 ${
                            isOutOfStock ? 'text-slate-400' : 'text-slate-900 group-hover:text-teal-700'
                          }`}
                        >
                          {prod.name}
                        </h4>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span
                          className={`font-mono font-black text-sm ${
                            isOutOfStock ? 'text-slate-400' : 'text-teal-800'
                          }`}
                        >
                          {format(prod.price)}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-300'
                              : 'bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Live Cart & Checkout (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Customer Selection Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-xs font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-teal-700"
                  placeholder="Mijoz nomi..."
                />
                <p className="text-[10px] text-slate-400">Chakana xarid</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(true)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                    discountAmount > 0
                      ? 'bg-teal-50 text-teal-700 border-teal-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Chegirma qoʻllash (F3)"
                >
                  <Percent className="w-3.5 h-3.5 text-teal-600" />
                  <span>{discountAmount > 0 ? `-${format(discountAmount)}` : 'Chegirma (F3)'}</span>
                </button>
              )}

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Tozalash
                </button>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                <ShoppingCart className="w-10 h-10 stroke-1 text-slate-300" />
                <p className="text-xs font-medium">Savat boʻsh</p>
                <p className="text-[10px] text-slate-400 text-center max-w-[200px]">
                  Mahsulotni bosing yoki shtrix-kod skanerlang (F1)
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                    <p className="text-[11px] font-mono text-slate-500">
                      {format(item.price)} × {item.quantity} ={' '}
                      <span className="font-bold text-teal-800">{format(item.price * item.quantity)}</span>
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-2xs font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-2xs font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Dual Checkout Triggers */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Oraliq summa:</span>
                <span className="font-mono font-bold text-slate-900">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shu jumladan QQS (12%):</span>
                <span className="font-mono text-slate-700">{format(vatAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-teal-700 font-semibold">
                  <span>Chegirma {discountReason ? `(${discountReason})` : ''}:</span>
                  <span className="font-mono">-{format(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="text-sm font-black text-slate-900 uppercase">Jami Toʻlov:</span>
                <span className="text-xl font-black text-teal-800 font-mono tracking-tight">{format(total)}</span>
              </div>
            </div>

            {/* Checkout Action Buttons (Quick Cash F8 & Full Tender F9) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleQuickCashCheckout}
                className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
                  cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Tezkor Naqd toʻlov va chek chop etish (F8)"
              >
                <Banknote className="w-4 h-4" />
                <span>Naqd Toʻlov (F8)</span>
              </button>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleOpenPaymentModal}
                className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
                  cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
                title="Karta, Humo, Nasiya va Aralash toʻlovlar (F9)"
              >
                <CreditCard className="w-4 h-4" />
                <span>Toʻlov Turlari (F9)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Tender Modal (F9) */}
      <PosPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        onCompletePayment={handleCompletePayment}
      />

      {/* Fiscal Thermal Receipt Modal (58mm / 80mm & ESC/POS direct) */}
      {lastReceipt && (
        <ThermalReceiptModal
          isOpen={!!lastReceipt}
          onClose={() => setLastReceipt(null)}
          receiptData={lastReceipt}
        />
      )}

      {/* Product Details Drawer Modal */}
      <ProductDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedDetailProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Calculator Modal (Alt+C) */}
      <PosCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Discount Manager Modal (F3) */}
      <PosDiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={subtotal}
        currentDiscount={discountAmount}
        onApplyDiscount={(amt, reason) => {
          setDiscountAmount(amt);
          setDiscountReason(reason);
        }}
      />

      {/* Held Orders Modal (F4) */}
      <PosHeldOrdersModal
        isOpen={isHeldModalOpen}
        onClose={() => setIsHeldModalOpen(false)}
        heldOrders={heldOrders}
        canHoldCurrent={cart.length > 0}
        onHoldCurrentCart={handleHoldCurrentCart}
        onResumeOrder={handleResumeHeldOrder}
        onDiscardOrder={handleDiscardHeldOrder}
      />

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold">Kassir Qaynoq Tugmalari</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsHelp(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Shtrix-kod / Qidiruv</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border text-teal-700">F1</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Chegirma qoʻllash</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border text-teal-700">F3</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Savdoni toʻxtatish (Hold)</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border text-teal-700">F4</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Tezkor Naqd toʻlov</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border text-teal-700">F8</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Barcha toʻlov turlari (Tender)</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border text-teal-700">F9</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Kassir kalkulyatori</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border text-teal-700">Alt + C</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Oynalarni yopish / Bekor qilish</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border text-slate-700">ESC</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowShortcutsHelp(false)}>
                Tushunarli
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosTerminalPage;
