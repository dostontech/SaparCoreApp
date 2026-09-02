import type { ReactNode } from 'react';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';

export interface DeleteConfirmationModalProps {
  /** Controls if the modal is visible */
  isOpen: boolean;
  /** Function to call when the modal is closed (e.g., by clicking cancel or the backdrop) */
  onClose: () => void;
  /** Function to call when the 'Confirm' button is clicked */
  onConfirm: () => void;
  /** The main title of the modal. Defaults to 'Confirm Deletion'. */
  title?: string;
  /** The descriptive message inside the modal. */
  message?: ReactNode;
  /** A boolean to indicate that the deletion is in progress (disables buttons and shows a spinner). */
  isDeleting?: boolean;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  isDeleting = false,
}: DeleteConfirmationModalProps) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
    >
      <AlertDialogContent className="max-w-md p-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>

        <AlertDialogHeader className="text-center sm:text-center space-y-2">
          <AlertDialogTitle className="text-lg font-bold text-gray-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-normal text-gray-500">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 sm:justify-center grid grid-cols-2 gap-3 w-full">
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={onClose}
            className="w-full mt-0"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="danger"
            disabled={isDeleting}
            isLoading={isDeleting}
            onClick={onConfirm}
            className="w-full"
          >
            {isDeleting ? 'Processing...' : 'Confirm'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;