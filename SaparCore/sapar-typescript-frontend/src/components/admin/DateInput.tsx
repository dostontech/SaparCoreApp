import React, { type FC } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import useDateFormatter from '@hooks/useDateFormatter';
import { cn } from '@/lib/utils';

interface DateInputProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  isRequired?: boolean;
  className?: string;
  disabled?: boolean;
}

const DateInput: FC<DateInputProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  isRequired,
  className,
  disabled = false,
}) => {
  const { dateFnsFormat } = useDateFormatter();

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-heading pb-1">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="relative w-full">
        <DatePicker
          selected={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat={dateFnsFormat}
          disabled={disabled}
          className={cn(
            'w-full h-9 rounded-md border border-gray-300 bg-white px-3 pr-9 text-sm text-gray-800 shadow-xs transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400'
          )}
          wrapperClassName="w-full"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <Calendar className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default DateInput;