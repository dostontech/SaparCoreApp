import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface PaginationWrapperProps {
  page: number;
  count: number;
  from: number;
  to: number;
  total: number;
  onChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  paginationVariant?: any;
  paginationShape?: 'rounded' | 'circular';
}

const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
  page,
  count,
  from,
  to,
  total,
  onChange,
}) => {
  const { t } = useTranslation();

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (count <= 7) {
      for (let i = 1; i <= count; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(count);
      } else if (page >= count - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = count - 4; i <= count; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(count);
      }
    }
    return pages;
  };

  if (count <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <p className="text-gray-500 text-xs font-medium">
        {t('common.showingEntries', {
          from: total > 0 ? from : 0,
          to,
          total,
          defaultValue: `${total > 0 ? from : 0} dan ${to} gacha koʻrsatilmoqda (jami ${total} ta)`,
        })}
      </p>

      <nav
        role="navigation"
        aria-label="Pagination Navigation"
        className="inline-flex items-center gap-1"
      >
        {/* Previous Button */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={(e) => onChange(e as any, page - 1)}
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 transition-colors',
            page <= 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 cursor-pointer'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Buttons */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex items-center justify-center h-8 w-8 text-xs text-gray-400 select-none"
              >
                …
              </span>
            );
          }

          const isCurrent = p === page;
          return (
            <button
              key={`page-${p}`}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              onClick={(e) => onChange(e as any, Number(p))}
              className={cn(
                'inline-flex items-center justify-center h-8 min-w-[32px] px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer',
                isCurrent
                  ? 'bg-purple-600 text-white shadow-xs border border-purple-600'
                  : 'border border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
              )}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={page >= count}
          onClick={(e) => onChange(e as any, page + 1)}
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 transition-colors',
            page >= count
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 cursor-pointer'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default PaginationWrapper;
