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
  LayoutGrid,
  Table2,
  Building2,
  Coins,
  AlertCircle,
  CheckCircle2,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@components/ui';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { PosPaymentModal } from '@components/admin/pos/PosPaymentModal';
import { ThermalReceiptModal } from '@components/admin/pos/ThermalReceiptModal';
import { ProductDetailsModal } from '@components/admin/pos/ProductDetailsModal';
import { PosCalculatorModal } from '@components/admin/pos/PosCalculatorModal';
import { PosDiscountModal } from '@components/admin/pos/PosDiscountModal';
import { PosHeldOrdersModal, type HeldOrder } from '@components/admin/pos/PosHeldOrdersModal';
import { PosOpenShiftModal } from '@components/admin/pos/PosOpenShiftModal';
import { QuickAddProductModal } from '@components/admin/pos/QuickAddProductModal';
import { PosZReportPrintModal } from '@components/admin/pos/PosZReportPrintModal';
import { posAudio } from '@/utils/posAudio';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  sku?: string;
  ikpu?: string;
  discountPercent?: number;
  stock?: number;
}

interface CustomerOption {
  id: string;
  name: string;
  phone?: string;
  balance: number;
  isRetail?: boolean;
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

  // Sapar-Style Workflow State
  const [selectedRegister, setSelectedRegister] = useState<string>('Kassa №1 (Asosiy zal)');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('Boshqarma ombori');
  const [selectedPriceList, setSelectedPriceList] = useState<'standard' | 'wholesale' | 'vip'>('standard');
  const [selectedCurrency, setSelectedCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [posViewMode, setPosViewMode] = useState<'touch' | 'table'>('touch');
  const usdRate = 12750;

  // Customers Directory & Selection (Sapar Akt Sverki integration)
  const [customers, setCustomers] = useState<CustomerOption[]>([
    { id: 'retail', name: 'Chakana Xaridor (Oddiy xaridor)', balance: 0, isRetail: true },
    { id: 'c1', name: 'OOO "RIZOBAY STROY"', phone: '+998 90 123 45 67', balance: -14500000 },
    { id: 'c2', name: 'Akbarjon Usta (Quruvchi brigada)', phone: '+998 94 449 94 47', balance: -2800000 },
    { id: 'c3', name: 'Sanjarbek Savdo Uyi', phone: '+998 97 777 88 99', balance: 5400000 },
    { id: 'c4', name: 'Sherdor Qurilish MCHJ', phone: '+998 91 555 44 33', balance: -45000000 },
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('retail');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Audio & Fullscreen states
  const [isMuted, setIsMuted] = useState<boolean>(posAudio.isMuted);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');

  // Shift & Modals
  const [shiftData, setShiftData] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('sapar_pos_shift');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isOpenShiftModal, setIsOpenShiftModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickAddProductOpen, setIsQuickAddProductOpen] = useState(false);
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [completedShiftData, setCompletedShiftData] = useState<any>(null);

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
    fetchContacts();
    /* eslint-disable-next-line */
  }, [selectedCategory]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Global Cashier Keyboard Shortcuts Handler (F1, F3, F4, F7, F8, F9, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCalculatorOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

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
        case 'F7':
          e.preventDefault();
          if (cart.length > 0) handleQuickCreditCheckout();
          else toast.error('Savat boʻsh');
          break;
        case 'F8':
          e.preventDefault();
          if (cart.length > 0) handleQuickCashCheckout();
          else toast.error('Savat boʻsh');
          break;
        case 'F9':
          e.preventDefault();
          if (cart.length > 0) handleOpenPaymentModal();
          else toast.error('Savat boʻsh');
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
  }, [cart, discountAmount, selectedCustomerId]);

  const toggleSound = () => {
    const nextState = posAudio.toggleMute();
    setIsMuted(nextState);
    toast.info(nextState ? 'POS ovozi oʻchirildi' : 'POS ovozi yoqildi');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error('Toʻliq ekran rejimiga oʻtib boʻlmadi');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.data?.contacts || res.data?.contacts || res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        const mapped: CustomerOption[] = list.map((c: any) => ({
          id: String(c.id),
          name: c.organisation || c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Mijoz',
          phone: c.telephone || c.phone || '',
          balance: Number(c.balance || c.currentBalance || 0),
        }));
        setCustomers([{ id: 'retail', name: 'Chakana Xaridor (Oddiy xaridor)', balance: 0, isRetail: true }, ...mapped]);
      }
    } catch {
      /* use demo list */
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/pos/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        },
      });

      if (res.data?.data?.products) {
        setProducts(res.data.data.products);
      }
      if (res.data?.data?.categories) {
        setCategories(res.data.data.categories);
      }
    } catch {
      // Fallback building materials dataset (matching Rizobay Stroy)
      setProducts([
        {
          id: 'p1',
          name: 'Armatura 12mm A500C (Oʻzmetkombinat)',
          sku: 'ARM-12MM',
          barcode: '4780001234567',
          ikpu: '01111001001000000',
          price: 13500,
          stock: 2500,
          category: 'Metall Prokat',
        },
        {
          id: 'p2',
          name: 'Akfa Emulsiya Fasid Boʻyoq 20kg',
          sku: 'AKF-FAS-20',
          barcode: '4780009876543',
          ikpu: '01112001001000000',
          price: 275000,
          stock: 80,
          category: 'Boʻyoq va Qurilish Kimyosi',
        },
        {
          id: 'p3',
          name: 'Sement M-500 (Bekobod) 50kg',
          sku: 'CEM-500-BK',
          barcode: '4780005554441',
          ikpu: '01113001001000000',
          price: 68000,
          stock: 350,
          category: 'Qurilish Materiallari',
        },
        {
          id: 'p4',
          name: 'Gipsokarton Knauf 12.5mm (Namga chidamli)',
          sku: 'GK-KN-12',
          barcode: '4780007778882',
          ikpu: '01114001001000000',
          price: 54000,
          stock: 420,
          category: 'Qurilish Materiallari',
        },
        {
          id: 'p5',
          name: 'Profil Akfa 60x27 mm (0.6mm)',
          sku: 'PRF-AK-60',
          barcode: '4780001112229',
          ikpu: '01081001001000000',
          price: 18500,
          stock: 600,
          category: 'Metall Prokat',
        },
        {
          id: 'p6',
          name: 'Shpatlevka Rotband Knauf 30kg',
          sku: 'SHP-ROT-30',
          barcode: '4780003331110',
          ikpu: '02101001001000000',
          price: 49000,
          stock: 140,
          category: 'Qurilish Materiallari',
        },
      ]);
      setCategories([
        { id: 'all', name: 'Barcha Mahsulotlar' },
        { id: 'c1', name: 'Metall Prokat' },
        { id: 'c2', name: 'Boʻyoq va Qurilish Kimyosi' },
        { id: 'c3', name: 'Qurilish Materiallari' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentShift = async () => {
    try {
      const savedLocal = localStorage.getItem('sapar_pos_shift');
      if (savedLocal) {
        setShiftData(JSON.parse(savedLocal));
      }

      const res = await axios.get(`${Constants.API_BASE_URL}/admin/pos/shift/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data?.hasOpenShift) {
        setShiftData(res.data.data.shift);
        localStorage.setItem('sapar_pos_shift', JSON.stringify(res.data.data.shift));
      } else if (!savedLocal) {
        setIsOpenShiftModal(true);
      }
    } catch {
      const savedLocal = localStorage.getItem('sapar_pos_shift');
      if (savedLocal) {
        setShiftData(JSON.parse(savedLocal));
      } else {
        setIsOpenShiftModal(true);
      }
    }
  };

  const handleStartShift = async (data: {
    cashierName: string;
    registerName: string;
    branchName: string;
    openingCash: number;
  }) => {
    const newShift = {
      id: `SH-${Date.now().toString().slice(-4)}`,
      cashierName: data.cashierName,
      registerName: data.registerName,
      branchName: data.branchName,
      openingCash: data.openingCash,
      cashSales: 0,
      cardSales: 0,
      qrSales: 0,
      openedAt: new Date().toISOString(),
    };

    try {
      await axios.post(
        `${Constants.API_BASE_URL}/admin/pos/shift/open`,
        { cashierName: data.cashierName, openingCash: data.openingCash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      /* offline resilience */
    }

    localStorage.setItem('sapar_pos_shift', JSON.stringify(newShift));
    setShiftData(newShift);
    setSelectedRegister(data.registerName);
    setIsOpenShiftModal(false);
    posAudio.playSuccessChime();
    toast.success(`Kassa smenasi ochildi! Kassir: ${data.cashierName}, Float: ${format(data.openingCash)}`);
  };

  const handleCloseShift = () => {
    const current = shiftData || {
      id: `Z-${Date.now().toString().slice(-4)}`,
      cashierName: 'Azizbek Toshmatov',
      registerName: selectedRegister,
      branchName: 'Bosh Ofis & Showroom',
      openedAt: new Date(Date.now() - 8 * 3600000).toLocaleString('uz-UZ'),
      closedAt: new Date().toLocaleString('uz-UZ'),
      startingCash: 500000,
      cashSales: 3450000,
      cardSales: 5120000,
      creditSales: 850000,
      expenses: 400000,
      ordersCount: 48,
    };
    setCompletedShiftData({
      id: current.id || `Z-${Date.now().toString().slice(-4)}`,
      cashierName: current.cashierName || 'Azizbek Toshmatov',
      registerName: current.registerName || selectedRegister,
      branchName: current.branchName || 'Bosh Ofis & Showroom',
      openedAt: current.openedAt || new Date(Date.now() - 8 * 3600000).toLocaleString('uz-UZ'),
      closedAt: new Date().toLocaleString('uz-UZ'),
      startingCash: current.openingCash || 500000,
      cashSales: current.cashSales || 3450000,
      cardSales: current.cardSales || 5120000,
      creditSales: current.creditSales || 850000,
      expenses: current.expenses || 400000,
      ordersCount: current.ordersCount || 48,
    });
    localStorage.removeItem('sapar_pos_shift');
    setShiftData(null);
    setIsZReportModalOpen(true);
    posAudio.playSuccessChime();
    toast.success('Kassa smenasi yopildi! Z-Hisobot cheki tayyor.');
  };

  // Price adjustment based on selected price tier
  const getCalculatedPrice = (basePrice: number) => {
    let p = basePrice;
    if (selectedPriceList === 'wholesale') p = Math.round(basePrice * 0.9); // -10% wholesale
    if (selectedPriceList === 'vip') p = Math.round(basePrice * 0.95); // -5% VIP
    return p;
  };

  // Format currency with active UZS / USD toggle
  const formatPosAmount = (amountInUzs: number) => {
    if (selectedCurrency === 'USD') {
      const usdVal = (amountInUzs / usdRate).toFixed(2);
      return `$${usdVal}`;
    }
    return format(amountInUzs);
  };

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
      toast.error(`"${prod.name}" uchun boshqa qoldiq yoʻq (Mavjud: ${availableStock} ta)`);
      return;
    }

    const itemPrice = getCalculatedPrice(prod.price);
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
          price: itemPrice,
          quantity: 1,
          barcode: prod.barcode,
          sku: prod.sku,
          ikpu: prod.ikpu,
          stock: prod.stock,
          discountPercent: 0,
        },
      ];
    });
  };

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

  const setItemExactQty = (id: string, qty: number) => {
    const prod = products.find((p) => p.id === id);
    const availableStock = Number(prod?.stock ?? 999999);
    const target = Math.max(1, Math.min(qty, availableStock));
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: target } : it))
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

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
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

  const handleHoldCurrentCart = (name: string, note: string) => {
    if (cart.length === 0) {
      toast.error('Savat boʻsh, toʻxtatish uchun tovar qoʻshing');
      return;
    }
    const newHold: HeldOrder = {
      id: `hold-${Date.now()}`,
      heldAt: new Date(),
      customerName: name || selectedCustomer?.name || 'Xaridor',
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
    const matchCust = customers.find((c) => c.name === order.customerName);
    if (matchCust) setSelectedCustomerId(matchCust.id);
    setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
    posAudio.playScanBeep();
    toast.success(`Savdo tiklandi: ${order.customerName}`);
  };

  const handleDiscardHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
    toast.info('Toʻxtatilgan savdo oʻchirildi');
  };

  // Quick 1-Click Cash Checkout (F8)
  const handleQuickCashCheckout = async () => {
    await handleCompletePayment({
      paymentMethod: 'Naqd Pul',
      cashAmount: total,
      uzcardAmount: 0,
      humoAmount: 0,
      qrAmount: 0,
      creditAmount: 0,
    });
  };

  // Quick 1-Click Credit Checkout (F7 - Nasiya / Akt Sverki ledger)
  const handleQuickCreditCheckout = async () => {
    if (selectedCustomerId === 'retail') {
      toast.error('Nasiya (Qarz) savdosi uchun avval aniq mijozni tanlang!');
      return;
    }
    await handleCompletePayment({
      paymentMethod: 'Nasiya (Muddatli Toʻlov)',
      cashAmount: 0,
      uzcardAmount: 0,
      humoAmount: 0,
      qrAmount: 0,
      creditAmount: total,
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
        customerName: selectedCustomer?.name || 'Chakana Xaridor',
        customerId: selectedCustomerId !== 'retail' ? selectedCustomerId : null,
        warehouse: selectedWarehouse,
        registerName: selectedRegister,
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

        // If credit payment, update customer debt balance locally
        if (paymentDetails.creditAmount > 0 && selectedCustomer) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === selectedCustomer.id ? { ...c, balance: c.balance - paymentDetails.creditAmount } : c
            )
          );
        }
      } else {
        posAudio.playRemoveTone();
        toast.error(res.data?.message || 'Savdoni yakunlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      posAudio.playRemoveTone();
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Serverga ulanishda xatolik yuz berdi.';
      toast.error(`Xatolik: ${errorMsg}`);
    }
  };

  const handleQuickAddCustomer = () => {
    if (!newCustName.trim()) {
      toast.error('Mijoz nomini kiriting!');
      return;
    }
    const newId = `c-new-${Date.now()}`;
    const newCust: CustomerOption = {
      id: newId,
      name: newCustName,
      phone: newCustPhone,
      balance: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    setSelectedCustomerId(newId);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    toast.success(`Yangi mijoz qoʻshildi: ${newCustName}`);
  };

  const openProductInfo = (prod: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDetailProduct(prod);
    setIsDetailModalOpen(true);
  };

  return (
    <div
      className={`flex flex-col font-sans text-slate-900 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-100 p-3 h-screen' : 'h-[calc(100vh-5rem)] -m-6 p-4 bg-slate-100'
        }`}
    >
      {/* 1. TOP POS HEADER BAR */}
      <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-2 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500 rounded-xl text-slate-950 font-black">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">SAPAR POS — Kassa Terminali</h1>
            <p className="text-xs text-teal-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Soliq E-Kassa Rejimi (QQS 12%) • Sapar Standard
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
            placeholder="Shtrix-kod skanerlang yoki tovar nomi... (F1)"
            className="w-full pl-10 pr-12 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <span className="absolute right-3 top-2 px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-mono text-slate-300">
            F1
          </span>
        </div>

        {/* POS Tools: Held Orders, Calculator, Audio, Fullscreen, Shifts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHeldModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${heldOrders.length > 0
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            title="Toʻxtatilgan savdolar (F4)"
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>Toʻxtatilgan ({heldOrders.length})</span>
            <span className="text-[10px] font-mono bg-slate-700 px-1 rounded text-slate-300">F4</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQuickAddProductOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border bg-slate-800 border-slate-700 text-teal-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Tezkor Yangi Mahsulot Qoʻshish (iBox / Bukku)"
          >
            <Plus className="w-4 h-4 text-[#02C39A]" />
            <span className="hidden md:inline">Yangi Tovar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCalculatorOpen((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
            title="Kassir kalkulyatori (Alt+C)"
          >
            <Calculator className="w-4 h-4 text-teal-400" />
            <span className="hidden md:inline">Kalkulyator</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShortcutsHelp(true)}
            className="p-2 rounded-xl border bg-slate-800 border-slate-700 text-slate-400 hover:text-white transition"
            title="Qaynoq tugmalar"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition ${isMuted
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              : 'bg-teal-500/20 border-teal-500/40 text-teal-300 hover:bg-teal-500/30'
              }`}
            title={isMuted ? 'Ovozni yoqish' : 'Ovozni oʻchirish'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${isFullscreen
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
            title={isFullscreen ? 'Oynali rejim' : 'Toʻliq ekran (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {shiftData ? (
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Smena:</span> {shiftData.cashierName} ({format(shiftData.openingCash)})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseShift}
                className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs font-bold cursor-pointer"
                title="Smenani yopish (Z-Hisobot)"
              >
                Smenani Yopish
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsOpenShiftModal(true)}
              className="bg-[#02C39A] hover:bg-[#02A683] text-[#0B2B33] font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Yangi Smena Ochish</span>
            </Button>
          )}

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

      {/* 2. Sapar-STYLE CONTEXT TOOLBAR: Kassa, Ombor, Mas'ul, Prays-list, Valyuta, Rejim */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 mb-2 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Kassa */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Kassa:</span>
            <select
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-teal-500 bg-slate-50"
            >
              <option value="Kassa №1 (Asosiy zal)">Kassa №1 (Asosiy zal)</option>
              <option value="Kassa №2 (Ekspress)">Kassa №2 (Ekspress)</option>
              <option value="Kassa №3 (Ombor / Ulgurji)">Kassa №3 (Ombor / Ulgurji)</option>
            </select>
          </div>

          {/* Ombor / Warehouse */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Ombor:</span>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-teal-500 bg-slate-50"
            >
              <option value="Boshqarma ombori">Boshqarma ombori</option>
              <option value="Chilonzor filiali">Chilonzor filiali</option>
              <option value="Ulgurji baza">Ulgurji baza</option>
            </select>
          </div>

          {/* Prays list */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Prays list:</span>
            <select
              value={selectedPriceList}
              onChange={(e) => setSelectedPriceList(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-teal-500 bg-slate-50"
            >
              <option value="standard">Standart narx</option>
              <option value="wholesale">Ulgurji / Optom (-10%)</option>
              <option value="vip">Doimiy mijoz (-5%)</option>
            </select>
          </div>

          {/* Mas'ul Shaxs */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Masʼul:</span>
            <span className="font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
              {shiftData?.cashierName || 'Shokirjon Turgʻunboyev'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Valyuta UZS / USD */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedCurrency('UZS')}
              className={`px-2 py-1 rounded-lg font-bold text-xs transition ${selectedCurrency === 'UZS' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              UZS (Soʻm)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurrency('USD')}
              className={`px-2 py-1 rounded-lg font-bold text-xs transition ${selectedCurrency === 'USD' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              USD ($)
            </button>
          </div>

          {/* Touch POS vs Sapar Table Mode Switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPosViewMode('touch')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 ${posViewMode === 'touch' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Touch Kassa</span>
            </button>
            <button
              type="button"
              onClick={() => setPosViewMode('table')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 ${posViewMode === 'table' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Sotuv Jadvali</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      {posViewMode === 'touch' ? (
        /* TOUCH POS MODE (Products Grid + Live Cart) */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          {/* LEFT: Products Grid (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Category Pills */}
            <div className="p-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCategory === 'all'
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
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedCategory === cat.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="flex-1 p-3 overflow-y-auto min-h-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {products.map((prod) => {
                  const isOutOfStock = Number(prod.stock || 0) <= 0;
                  const displayPrice = getCalculatedPrice(prod.price);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleAddToCart(prod)}
                      className={`p-3 rounded-2xl bg-white border transition text-left flex flex-col justify-between group relative ${isOutOfStock
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
                              className="p-0.5 rounded text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <span
                              className={`px-1.5 py-0.5 rounded-full font-semibold ${isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                              {isOutOfStock ? '0 ta' : `${prod.stock} ta`}
                            </span>
                          </div>
                        </div>
                        <h4
                          className={`font-bold text-xs line-clamp-2 ${isOutOfStock ? 'text-slate-400' : 'text-slate-900 group-hover:text-teal-700'
                            }`}
                        >
                          {prod.name}
                        </h4>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span
                          className={`font-mono font-black text-xs ${isOutOfStock ? 'text-slate-400' : 'text-teal-800'
                            }`}
                        >
                          {formatPosAmount(displayPrice)}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${isOutOfStock
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
            </div>
          </div>

          {/* RIGHT: Live Cart & Customer Picker (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Customer Picker with Live Akt Sverki Debt Display */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-teal-500 truncate"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="p-1 ml-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-bold shrink-0"
                  title="Yangi Mijoz Qoʻshish"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Debt Warning / Akt Sverki Ledger Banner */}
              {selectedCustomer && !selectedCustomer.isRetail && (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px]">
                  <span className="text-slate-500 font-semibold">Mijoz Balansi:</span>
                  <span
                    className={`font-mono font-bold ${selectedCustomer.balance < 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                  >
                    {selectedCustomer.balance < 0
                      ? `Qarzdorlik: ${format(Math.abs(selectedCustomer.balance))}`
                      : `Haqdor: ${format(selectedCustomer.balance)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-3 overflow-y-auto divide-y divide-slate-100 min-h-0">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-10 h-10 stroke-1 text-slate-300" />
                  <p className="text-xs">Savat boʻsh</p>
                  <p className="text-[10px] text-slate-400">Mahsulot bosing yoki shtrix-kod skanerlang (F1)</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {formatPosAmount(item.price)} × {item.quantity} ={' '}
                        <span className="font-bold text-teal-800">{formatPosAmount(item.price * item.quantity)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5 h-5 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer: Subtotal & 3 Checkout Triggers (Naqd F8, Nasiya F7, To'lov F9) */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2.5">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Oraliq summa:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPosAmount(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shu jumladan QQS (12%):</span>
                  <span className="font-mono text-slate-700">{formatPosAmount(vatAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-teal-700 font-semibold">
                    <span>Chegirma:</span>
                    <span className="font-mono">-{formatPosAmount(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase">Jami Toʻlov:</span>
                  <span className="text-lg font-black text-teal-800 font-mono">{formatPosAmount(total)}</span>
                </div>
              </div>

              {/* 3 Action Buttons (Naqd F8, Nasiya F7, Boshqa to'lovlar F9) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={handleQuickCashCheckout}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-xs transition active:scale-95 cursor-pointer ${cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  title="Tezkor Naqd toʻlov (F8)"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Naqd (F8)</span>
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={handleQuickCreditCheckout}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-xs transition active:scale-95 cursor-pointer ${cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  title="Nasiya / Qarzga yozish (F7)"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Nasiya (F7)</span>
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={handleOpenPaymentModal}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-xs transition active:scale-95 cursor-pointer ${cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                    }`}
                  title="Karta, Humo, Click va Aralash toʻlovlar (F9)"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Toʻlov (F9)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 1-TO-1 Sapar TABLE MODE (Exact replica of Sapar_sale_create.png) */
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-xs">Mijoz:</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setPosViewMode('touch')}
                className="text-xs bg-teal-700 text-white font-bold"
              >
                + Mahsulotlarni Tanlash (Katalog)
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={clearCart}>
                Tozalash
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-teal-900 text-white font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Mahsulot</th>
                  <th className="px-4 py-3 text-right">Ombordagi Qoldiq</th>
                  <th className="px-4 py-3 text-center w-28">Miqdor</th>
                  <th className="px-4 py-3 text-right">Narx</th>
                  <th className="px-4 py-3 text-right">Chegirma</th>
                  <th className="px-4 py-3 text-right font-bold">Summa</th>
                  <th className="px-4 py-3 text-center w-14">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Hali tovar qoʻshilmadi. Katalogdan tovar tanlang yoki shtrix-kod skanerlang (F1).
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">{item.stock || 50} dona</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setItemExactQty(item.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-center font-bold"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatPosAmount(item.price)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">0%</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-teal-800">
                        {formatPosAmount(item.price * item.quantity)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span>Jami qatorlar: <strong>{cart.length} ta</strong></span> •{' '}
              <span>Jami miqdor: <strong>{cart.reduce((a, b) => a + b.quantity, 0)} ta</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-slate-900">Jami: <strong className="text-teal-800 font-mono">{formatPosAmount(total)}</strong></span>
              <Button onClick={handleQuickCashCheckout} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                Naqd Toʻlov (F8)
              </Button>
              <Button onClick={handleQuickCreditCheckout} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs">
                Nasiya (F7)
              </Button>
              <Button onClick={handleOpenPaymentModal} className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs">
                Toʻlov Turlari (F9)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD CUSTOMER */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Yangi Mijoz Qoʻshish</DialogTitle>
            <DialogDescription>Tezkor kassa paytida yangi mijozni roʻyxatga oling.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">F.I.Sh yoki Tashkilot Nomi:</label>
              <input
                type="text"
                placeholder="masalan: Akbarjon Usta"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefon Raqami:</label>
              <input
                type="text"
                placeholder="+998 90 123 45 67"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleQuickAddCustomer} className="bg-teal-700 hover:bg-teal-800 text-white font-bold">
              Mijozni Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POS Calculator Modal */}
      <PosCalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />

      {/* POS Discount Modal */}
      <PosDiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={subtotal}
        onApplyDiscount={(amount, reason) => {
          setDiscountAmount(amount);
          setDiscountReason(reason);
        }}
      />

      {/* POS Held Orders Modal */}
      <PosHeldOrdersModal
        isOpen={isHeldModalOpen}
        onClose={() => setIsHeldModalOpen(false)}
        heldOrders={heldOrders}
        onHoldCurrentCart={handleHoldCurrentCart}
        onResumeOrder={handleResumeHeldOrder}
        onDiscardOrder={handleDiscardHeldOrder}
      />

      {/* Payment Tender Modal (F9) */}
      <PosPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        onCompletePayment={handleCompletePayment}
      />

      {/* Fiscal Thermal Receipt Modal */}
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
      />

      {/* Yangi Kassa Smenasini Ochish Modal (iBox-Style) */}
      <PosOpenShiftModal
        isOpen={isOpenShiftModal}
        onClose={() => setIsOpenShiftModal(false)}
        onOpenShift={handleStartShift}
        initialCashier="Kassir"
        initialCash={500000}
        initialRegister={selectedRegister}
      />

      {/* Tezkor Yangi Mahsulot Qoʻshish Modali (iBox / Bukku Standarti) */}
      <QuickAddProductModal
        isOpen={isQuickAddProductOpen}
        onClose={() => setIsQuickAddProductOpen(false)}
        onSuccess={(newProd) => {
          setProducts((prev) => [newProd, ...prev]);
          addToCart(newProd);
          posAudio.playSuccessChime();
        }}
        defaultCategory={selectedCategory !== 'all' ? selectedCategory : 'Metall Prokat'}
      />

      {/* Fiskal Smena Z-Hisoboti Modali (Termo-Chek) */}
      <PosZReportPrintModal
        isOpen={isZReportModalOpen}
        onClose={() => setIsZReportModalOpen(false)}
        shiftData={completedShiftData}
      />
    </div>
  );
};

export default PosTerminalPage;
