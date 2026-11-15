export interface BrandNameProps {
  /**
   * Font size, weight, or extra styling classes.
   */
  className?: string
  /**
   * Capitalization format:
   * - 'title': "BLife" (default)
   * - 'lowercase': "blife"
   * - 'uppercase': "BLIFE"
   */
  casing?: 'title' | 'lowercase' | 'uppercase'
  /**
   * Primary brand color (Natural Green).
   * Applied to: 'B', 'L', 'i', and 'e'.
   * Defaults to 'text-[#A6F16A]' (vivid lime/natural green).
   */
  colorX?: string
  /**
   * Complementary accent color.
   * Applied to: 'f'.
   * Defaults to 'text-[#20D6A0]' (vibrant turquoise).
   */
  colorY?: string
}

/**
 * Standardized Letter-by-Letter BLife Brand Name Component
 *
 * Implements the color mapping pattern where:
 * - 'B', 'L', 'i', and 'e' share Color X (natural green, default #A6F16A)
 * - 'f' is styled in Color Y (complementary turquoise, default #20D6A0)
 *
 * This visually highlights "Life" in natural green with an accent on 'f',
 * retaining the exact spelling "BLife".
 */
export default function BrandName({
  className = '',
  casing = 'title',
  colorX = 'text-[#A6F16A]',
  colorY = 'text-[#20D6A0]',
}: BrandNameProps) {
  let letterB = 'B'
  let letterL = 'L'
  let letterI = 'i'
  let letterF = 'f'
  let letterE = 'e'

  if (casing === 'lowercase') {
    letterB = 'b'
    letterL = 'l'
    letterI = 'i'
    letterF = 'f'
    letterE = 'e'
  } else if (casing === 'uppercase') {
    letterB = 'B'
    letterL = 'L'
    letterI = 'I'
    letterF = 'F'
    letterE = 'E'
  }

  return (
    <span
      className={`inline-flex items-baseline font-sans font-extrabold tracking-normal leading-none select-none ${className}`}
      aria-label="BLife"
    >
      {/* 'B' in natural green */}
      <span className={colorX}>{letterB}</span>
      {/* 'L' and 'i' in natural green */}
      <span className={colorX}>{letterL}</span>
      <span className={colorX}>{letterI}</span>
      {/* 'f' in complementary accent color */}
      <span className={colorY}>{letterF}</span>
      {/* 'e' in natural green, completing "Life" */}
      <span className={colorX}>{letterE}</span>
    </span>
  )
}
