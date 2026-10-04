import type { HTMLAttributes } from "react"

export const PESO_SYMBOL = "\u20b1"
export const formatPrice = (value: number) => `${PESO_SYMBOL}${value}`

export function Price({ value, ...props }: { value: number } & HTMLAttributes<HTMLSpanElement>) {
  return <span {...props}>{formatPrice(value)}</span>
}