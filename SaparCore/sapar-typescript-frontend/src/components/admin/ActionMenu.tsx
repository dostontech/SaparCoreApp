import React from 'react';
import { MoreVertical } from 'lucide-react';
import { useSelector } from 'react-redux';
import { filterByPermission, type Action } from '@components/admin/tableActions';
import type { RootState } from '@store/index';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';

export type ActionMenuProps<T> = {
  row: T;
  actions: Action<T>[];
};

export const ActionMenu = <T,>({ row, actions: rawActions }: ActionMenuProps<T>) => {
  const permissions = useSelector((state: RootState) => state.systemSettings.data?.permissions) ?? [];
  // Hide menu items the current user is not permitted to see
  const actions = filterByPermission(rawActions, permissions);

  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
          aria-label="Actions"
        >
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]" onClick={(e) => e.stopPropagation()}>
        {actions.map((action) => {
          const disabled = action.isDisabled ? action.isDisabled(row) : false;
          const isDanger = action.variant === 'danger';

          return (
            <DropdownMenuItem
              key={action.label}
              disabled={disabled}
              variant={isDanger ? 'danger' : 'default'}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  action.onClick(row);
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-medium cursor-pointer',
                disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {action.icon && <span className="h-4 w-4 shrink-0">{action.icon}</span>}
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;