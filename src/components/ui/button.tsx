import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-base font-base border-2 border-border transition-all duration-200 cursor-pointer neo-shadow active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1',
  {
    variants: {
      variant: {
        default: 'bg-main text-black hover:bg-mainAccent',
        destructive: 'bg-red-400 text-black hover:bg-red-500',
        success: 'bg-green-400 text-black hover:bg-green-500',
        secondary: 'bg-gray-400 text-black hover:bg-gray-500',
        outline: 'bg-white text-black hover:bg-gray-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1 text-sm',
        lg: 'h-12 px-6 py-3 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; 