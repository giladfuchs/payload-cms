import type { ButtonHTMLAttributes, MouseEvent } from "react";

import { trackPixelEvent } from "@/components/layout/analytics";
import { cn } from "@/lib/core/utilities";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "nav"
  | "select";

type ButtonSize = "default" | "sm" | "lg" | "icon" | "clear";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "size"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  selected?: boolean;
  eventName?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0";

const sizeClass: Record<ButtonSize, string> = {
  clear: "",
  default: "h-10 px-4 py-2 has-[>svg]:px-3",
  sm: "h-9 px-3 has-[>svg]:px-2.5",
  lg: "h-11 px-8 has-[>svg]:px-4",
  icon: "size-10",
};

const variantClass: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  destructive:
    "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  outline:
    "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  nav: "p-0 pt-2 pb-6 uppercase font-mono tracking-widest text-xs bg-transparent",
  select: "rounded-lg px-3 py-3 border",
};

export default function Button({
  className,
  variant = "default",
  size = "default",
  selected = false,
  type = "button",
  eventName,
  onClick,
  ...props
}: ButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (eventName)
      trackPixelEvent(eventName.trim().toLowerCase().replace(/\s+/g, "_"));
    onClick?.(e);
  };

  return (
    <button
      data-slot="button"
      type={type}
      onClick={typeof window !== "undefined" ? handleClick : undefined}
      className={cn(
        base,
        sizeClass[size],
        variantClass[variant],
        selected && "ring-2 ring-primary",
        className,
      )}
      {...props}
    />
  );
}
