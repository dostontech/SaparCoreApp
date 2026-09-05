import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs',
      'data-[state=open]:animate-overlay-show data-[state=closed]:opacity-0 transition-opacity',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';

const sizeMap: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'w-[calc(100vw-2rem)] max-w-none h-[calc(100vh-2rem)]',
};

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: DialogSize;
  hideCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = '2xl', hideCloseButton = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6 md:p-10">
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'relative w-full rounded-xl bg-white shadow-2xl border border-gray-100 outline-none my-auto max-h-[90vh] flex flex-col',
          'data-[state=open]:animate-content-show',
          sizeMap[size],
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-md p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </div>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 px-6 py-4 border-b border-gray-100 text-left shrink-0',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('p-6 overflow-y-auto flex-1', className)}
    {...props}
  />
);
DialogBody.displayName = 'DialogBody';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl shrink-0',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-bold text-gray-900 font-sans tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-gray-500', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
