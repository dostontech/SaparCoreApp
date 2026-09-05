import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-semibold rounded-control transition-colors duration-150 select-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
        secondary: 'bg-secondary text-white hover:opacity-90 shadow-sm',
        outline:
          'border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white',
        soft: 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white',
        white: 'bg-white border border-border text-heading hover:bg-gray-50 shadow-sm',
        danger: 'bg-danger text-white hover:opacity-90 shadow-sm',
        dangerOutline:
          'border border-danger text-danger hover:bg-danger hover:text-white',
        success: 'bg-success text-white hover:opacity-90 shadow-sm',
        warning: 'bg-warning text-white hover:opacity-90 shadow-sm',
        ghost: 'text-body hover:bg-gray-100 hover:text-heading',
        link: 'bg-transparent text-purple-600 hover:underline underline-offset-2 disabled:no-underline p-0 h-auto',
      },
      size: {
        sm: 'text-xs px-2.5 py-1.5',
        md: 'text-[13px] px-3 py-2',
        lg: 'text-sm px-4 py-2.5',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const SPINNER_SIZE: Record<ButtonSize, number> = {
  sm: 14,
  md: 15,
  lg: 16,
  icon: 15,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const currentSize = size ?? 'md';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <Loader2Icon
            className="animate-spin"
            style={{
              width: SPINNER_SIZE[currentSize],
              height: SPINNER_SIZE[currentSize],
            }}
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;
