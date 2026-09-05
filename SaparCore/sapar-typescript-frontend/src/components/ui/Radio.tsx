import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name?: string;
  options?: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, options, value, onChange, disabled, children, orientation = 'vertical', ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      className={cn(
        'grid gap-2',
        orientation === 'horizontal' ? 'grid-flow-col auto-cols-max' : '',
        className
      )}
      {...props}
    >
      {options
        ? options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={opt.value}
                id={`radio-${opt.value}`}
                disabled={disabled || opt.disabled}
              />
              <label
                htmlFor={`radio-${opt.value}`}
                className={cn(
                  'text-sm font-medium text-gray-700 cursor-pointer select-none',
                  (disabled || opt.disabled) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {opt.label}
              </label>
            </div>
          ))
        : children}
    </RadioGroupPrimitive.Root>
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-gray-300 text-purple-600 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-purple-600',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-purple-600 text-purple-600" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

/** Backward compatible Radio component */
export interface RadioProps {
  label?: React.ReactNode;
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, id, name, value, checked, onChange, disabled, className, containerClassName }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;

    return (
      <label
        htmlFor={fieldId}
        className={cn(
          'inline-flex items-center gap-2 select-none',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          containerClassName
        )}
      >
        <input
          ref={ref}
          id={fieldId}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'h-4 w-4 border border-gray-300 text-purple-600 accent-purple-600 outline-none',
            'focus-visible:ring-1 focus-visible:ring-purple-600 disabled:cursor-not-allowed',
            className
          )}
        />
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      </label>
    );
  }
);
Radio.displayName = 'Radio';

export { Radio, RadioGroup, RadioGroupItem, RadioGroupPrimitive };
export default Radio;
