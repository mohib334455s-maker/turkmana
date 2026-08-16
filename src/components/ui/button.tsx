import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-200/50': variant === 'default',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
            'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700': variant === 'outline',
            'bg-teal-50 text-teal-800 hover:bg-teal-100': variant === 'secondary',
            'hover:bg-slate-100 text-slate-700': variant === 'ghost',
            'text-teal-600 underline-offset-4 hover:underline': variant === 'link',
            'h-10 px-4 py-2 rounded-xl': size === 'default',
            'h-9 rounded-xl px-3': size === 'sm',
            'h-11 rounded-xl px-8': size === 'lg',
            'h-10 w-10 rounded-xl': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
