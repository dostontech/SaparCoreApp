import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const TabsRoot = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'underline' | 'segmented';
  }
>(({ className, variant = 'underline', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      variant === 'segmented'
        ? 'inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-gray-600'
        : 'flex items-center gap-4 border-b border-gray-200',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'underline' | 'segmented';
  }
>(({ className, variant = 'underline', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      variant === 'segmented'
        ? [
            'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-offset-white transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm',
            'text-gray-600 hover:text-gray-900',
          ].join(' ')
        : [
            'inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-1 pb-3 text-sm font-semibold transition-all -mb-px',
            'border-b-2 border-transparent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
            'disabled:pointer-events-none disabled:opacity-50',
            'data-[state=active]:border-purple-600 data-[state=active]:text-purple-600',
            'text-gray-500 hover:text-gray-800',
          ].join(' '),
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/* =========================================================================
   Backward-Compatible Declarative Tabs wrapper
   ========================================================================= */

export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type TabsVariant = 'underline' | 'segmented';

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const Tabs = ({
  tabs,
  value,
  onChange,
  variant = 'underline',
  className = '',
  id,
  ...rest
}: TabsProps) => {
  return (
    <TabsRoot value={value} onValueChange={onChange} className={className}>
      <TabsList variant={variant} aria-label={rest['aria-label']}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            variant={variant}
            disabled={tab.disabled}
          >
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </TabsRoot>
  );
};

export { TabsRoot, TabsList, TabsTrigger, TabsContent };
export default Tabs;
