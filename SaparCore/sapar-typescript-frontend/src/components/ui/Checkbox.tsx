import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'onChange'> {
  label?: React.ReactNode;
  containerClassName?: string;
  indeterminate?: boolean;
  onChange?: (checked: boolean | 'indeterminate') => void;
}

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, containerClassName, label, id, indeterminate, checked, onCheckedChange, onChange, disabled, ...props }, ref) => {
  const autoId = React.useId();
  const fieldId = id ?? autoId;

  const currentChecked = indeterminate ? 'indeterminate' : checked;

  const handleCheckedChange = (state: CheckboxPrimitive.CheckedState) => {
    onCheckedChange?.(state);
    onChange?.(state);
  };

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        'inline-flex items-center gap-2 select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        containerClassName
      )}
    >
      <CheckboxPrimitive.Root
        ref={ref}
        id={fieldId}
        checked={currentChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded border border-gray-300 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 data-[state=checked]:text-white',
          'data-[state=indeterminate]:bg-purple-600 data-[state=indeterminate]:border-purple-600 data-[state=indeterminate]:text-white',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {indeterminate ? (
            <Minus className="h-3 w-3" strokeWidth={3} />
          ) : (
            <Check className="h-3 w-3" strokeWidth={3} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </label>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, CheckboxPrimitive };
export default Checkbox;
