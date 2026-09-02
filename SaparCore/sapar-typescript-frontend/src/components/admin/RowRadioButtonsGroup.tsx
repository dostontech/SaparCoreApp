import * as React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/Radio';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options: Option[];
  name: string;
  className?: string;
};

export default function RowRadioButtonsGroup({
  value,
  onChange,
  options,
  name,
  className,
}: Props) {
  const handleValueChange = (val: string) => {
    if (onChange) {
      // Simulate synthetic change event for legacy callers expecting (e: ChangeEvent) => ...
      const syntheticEvent = {
        target: { name, value: val },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <RadioGroup
      orientation="horizontal"
      value={value ?? undefined}
      onChange={handleValueChange}
      className={cn('flex flex-wrap items-center gap-4 py-1', className)}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem
            value={option.value}
            id={`${name}-${option.value}`}
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
