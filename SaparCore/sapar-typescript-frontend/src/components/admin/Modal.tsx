import { type ReactNode } from 'react';
import { XCircleIcon } from 'lucide-react';
import { confirmIfDirty } from '@hooks/useDirtyGuard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  type DialogSize,
} from '@/components/ui/Dialog';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: DialogSize;
  confirmOnClose?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = '2xl',
  confirmOnClose = false,
}: ModalProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!confirmIfDirty(confirmOnClose)) return;
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size={size}
        hideCloseButton={true}
        onPointerDownOutside={(e) => {
          if (!confirmIfDirty(confirmOnClose)) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!confirmIfDirty(confirmOnClose)) {
            e.preventDefault();
          }
        }}
        onSubmit={(e) => e.stopPropagation()}
        className="p-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="text-lg font-bold text-gray-800 font-sans">
            {title}
          </DialogTitle>
          <button
            onClick={() => handleOpenChange(false)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <XCircleIcon size={22} />
          </button>
        </DialogHeader>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-4rem)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
