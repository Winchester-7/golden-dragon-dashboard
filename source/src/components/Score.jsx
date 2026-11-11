import { tone } from '../data/hotel'

/** Цветная плашка с оценкой ИИ: зелёная от 8, жёлтая от 5, красная ниже. */
export default function Score({ value, decimals = 0 }) {
  return <span className={`score score--${tone(value)}`}>{value.toFixed(decimals)}</span>
}
