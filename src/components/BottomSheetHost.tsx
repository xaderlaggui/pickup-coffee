import { Coffee, CoffeeSize } from "../types"
import { BottomSheet } from "./BottomSheet"
export function BottomSheetHost({ coffee, max, existing, closing, onLimit, onAdd, onClose, quantity, setQuantity, temp, setTemp, size, setSize, note, setNote }: { coffee: Coffee | null; max: number; existing: number; closing: boolean; onLimit: () => void; onAdd: () => void; onClose: () => void; quantity: number; setQuantity: (value: number) => void; temp: "Iced" | "Hot"; setTemp: (value: "Iced" | "Hot") => void; size: CoffeeSize; setSize: (value: CoffeeSize) => void; note: string; setNote: (value: string) => void }) {
  if (!coffee) return null
  return <BottomSheet coffee={coffee} max={max} existing={existing} closing={closing} onLimit={onLimit} onAdd={onAdd} onClose={onClose} quantity={quantity} setQuantity={setQuantity} temp={temp} setTemp={setTemp} size={size} setSize={setSize} note={note} setNote={setNote} />
}