import { cn } from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn (clsx + tailwind-merge)', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe(
        'base-class conditional-class'
      )
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('should handle undefined/null values', () => {
      expect(cn('base-class', undefined, null)).toBe('base-class')
    })

    it('should merge conflicting tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })
})
