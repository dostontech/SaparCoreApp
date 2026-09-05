import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ checked, onChange, label, disabled, id, className, containerClassName }, ref) => {
  const autoId = React.useId();
  const switchId = id ?? autoId;

  return (
    <span className={cn('inline-flex items-center gap-2.5', containerClassName)}>
      <SwitchPrimitives.Root
        ref={ref}
        id={switchId}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-200',
          className
        )}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitives.Root>
      {label && (
        <label
          htmlFor={switchId}
          className="text-sm font-medium text-gray-700 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </span>
  );
});
Switch.displayName = 'Switch';

export { SwitchPrimitives };
export default Switch;
