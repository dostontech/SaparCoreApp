import React, { useState, useRef, useEffect, type SyntheticEvent } from 'react';
import { ChevronDown, Check, Loader2, X } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

export type OptionType = {
  id: string;
  name: string;
};

export type SearchableDropdownValue<FreeSolo extends boolean | undefined> =
  FreeSolo extends true ? OptionType | string | null : OptionType | null;

export interface SearchableDropdownProps<FreeSolo extends boolean | undefined = false> {
  label?: string | null;
  value: SearchableDropdownValue<FreeSolo>;
  options: OptionType[];
  inputValue?: string;
  onInputChange?: (event: SyntheticEvent, value: string) => void;
  onChange?: (event: SyntheticEvent, value: SearchableDropdownValue<FreeSolo>) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  loading?: boolean;
  noAsterisk?: boolean;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  freeSolo?: FreeSolo;
}

function SearchableDropdownImpl<FreeSolo extends boolean | undefined = false>({
  label,
  value,
  options,
  inputValue: controlledInputValue,
  onInputChange,
  onChange,
  disabled = false,
  required = false,
  placeholder = `Select ${label || ''}`,
  loading = false,
  noAsterisk = false,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  freeSolo,
}: SearchableDropdownProps<FreeSolo>) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const displayValue = typeof value === 'string' ? value : value?.name ?? '';
  const currentQuery = controlledInputValue !== undefined ? controlledInputValue : internalQuery;

  // Sync internal query with display value when closed
  useEffect(() => {
    if (!isOpen) {
      setInternalQuery(displayValue);
    }
  }, [displayValue, isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(currentQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    onInputChange?.(e, val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (opt: OptionType, e: React.MouseEvent) => {
    setInternalQuery(opt.name);
    onChange?.(e, opt as SearchableDropdownValue<FreeSolo>);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalQuery('');
    onChange?.(e, null as SearchableDropdownValue<FreeSolo>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelectOption(filteredOptions[0], e as any);
      } else if (freeSolo && currentQuery.trim()) {
        onChange?.(e, currentQuery.trim() as SearchableDropdownValue<FreeSolo>);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && !noAsterisk && <span className="text-red-500">*</span>}
        </label>
      )}

      <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            ref={triggerRef}
            className={cn(
              'relative flex items-center w-full h-[42px] rounded-lg border border-gray-300 bg-white shadow-xs transition-colors',
              'focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20',
              disabled && 'bg-gray-100 cursor-not-allowed opacity-70',
              ariaInvalid && 'border-red-500 focus-within:border-red-500'
            )}
            onClick={() => {
              if (!disabled) {
                setIsOpen(true);
                inputRef.current?.focus();
              }
            }}
          >
            <input
              ref={inputRef}
              id={id}
              type="text"
              disabled={disabled}
              value={isOpen ? currentQuery : displayValue}
              placeholder={placeholder}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedby}
              className="w-full h-full px-3 pr-16 text-sm text-gray-800 bg-transparent rounded-lg outline-none placeholder:text-gray-400"
            />

            <div className="absolute right-2.5 flex items-center gap-1">
              {loading && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
              {displayValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  tabIndex={-1}
                  aria-label="Clear selection"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          style={{ width: triggerRef.current?.offsetWidth }}
          className="p-1 max-h-60 overflow-y-auto z-50 rounded-lg border border-gray-100 bg-white shadow-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {loading ? (
            <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-3 px-3 text-center text-xs text-gray-500">
              {freeSolo && currentQuery.trim() ? (
                <span>Press Enter to use &quot;{currentQuery}&quot;</span>
              ) : (
                'No options found'
              )}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredOptions.map((opt) => {
                const isSelected =
                  typeof value === 'string'
                    ? value === opt.name
                    : value?.id === opt.id;

                return (
                  <li
                    key={opt.id}
                    onClick={(e) => handleSelectOption(opt, e)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span>{opt.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-purple-600 shrink-0" />}
                  </li>
                );
              })}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

const SearchableDropdown = SearchableDropdownImpl as <FreeSolo extends boolean | undefined = false>(
  props: SearchableDropdownProps<FreeSolo>
) => ReturnType<typeof SearchableDropdownImpl>;

export default SearchableDropdown;
