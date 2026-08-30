import React, { useState } from 'react';
import { X, PauseCircle, Play, Trash2, Clock, User, Plus } from 'lucide-react';
import { Button, FormField, fieldControlClasses } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export interface HeldOrder {
  id: string;
  heldAt: string | Date;
  customerName: string;
  note?: string;
  items: any[];
  subtotal: number;
  discountAmount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onHoldCurrentCart?: (customerName: string, note: string) => void;
  onResumeOrder: (order: HeldOrder) => void;
  onDiscardOrder: (orderId: string) => void;
  canHoldCurrent: boolean;
}

export const PosHeldOrdersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  heldOrders,
  onHoldCurrentCart,
  onResumeOrder,
  onDiscardOrder,
  canHoldCurrent,
}) => {
  const { format } = useCurrencyFormatter();
  const [isHoldingNew, setIsHoldingNew] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const controlClass = typeof fieldControlClasses === 'function' ? fieldControlClasses() : fieldControlClasses;

  const handleSaveHold = () => {
    if (onHoldCurrentCart) {
      onHoldCurrentCart(customerName.trim() || 'Nomsiz Xaridor', note.trim());
    }
    setIsHoldingNew(false);
    setCustomerName('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Toʻxtatilgan Savdolar (Hold Cart - F4)</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50 space-y-4 flex-1">
          {/* Action to Hold Current Cart */}
          {canHoldCurrent && (
            <div className="p-4 bg-white rounded-2xl border border-teal-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-xs text-teal-900 uppercase tracking-wider">
                  Hozirgi savdoni toʻxtatib turish
                </div>
                {!isHoldingNew && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsHoldingNew(true)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Savdoni Toʻxtatish
                  </Button>
                )}
              </div>

              {isHoldingNew && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <FormField label="Xaridor / Stol nomi">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masalan: 3-stol yoki Ali aka"
                      className={controlClass}
                    />
                  </FormField>
                  <FormField label="Izoh (Ixtiyoriy)">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Masalan: Pul yechib keladi"
                      className={controlClass}
                    />
                  </FormField>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="secondary" size="sm" onClick={() => setIsHoldingNew(false)}>
                      Bekor Qilish
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveHold}>
                      Saqlash va Toʻxtatish
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List of Held Orders */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Toʻxtatilgan Buyurtmalar ({heldOrders.length})
            </div>

            {heldOrders.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
                Hozircha toʻxtatilgan savdolar mavjud emas.
              </div>
            ) : (
              heldOrders.map((order) => {
                const total = Math.max(0, order.subtotal - (order.discountAmount || 0));
                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-bold text-sm text-slate-900">{order.customerName}</span>
                          {order.note && (
                            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                              {order.note}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.heldAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{order.items.length} ta tovar</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm text-slate-900">{format(total)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">№ {order.id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Preview items */}
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex flex-wrap gap-1.5 border border-slate-100">
                      {order.items.slice(0, 4).map((it, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                          {it.name} ({it.quantity} dona)
                        </span>
                      ))}
                      {order.items.length > 4 && (
                        <span className="text-slate-400 self-center">+{order.items.length - 4} yana</span>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onDiscardOrder(order.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Oʻchirish
                      </button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onResumeOrder(order);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Savdoga Qaytarish (Resume)
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </div>
    </div>
  );
};
