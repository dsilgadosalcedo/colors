import { ColorInfo, ColorPalette } from '@/lib/types'

describe('lib/types', () => {
  describe('ColorInfo', () => {
    it('should have required properties', () => {
      const colorInfo: ColorInfo = {
        hex: '#FF0000',
        name: 'Red',
        description: 'A vibrant red color',
      }

      expect(colorInfo.hex).toBe('#FF0000')
      expect(colorInfo.name).toBe('Red')
      expect(colorInfo.description).toBe('A vibrant red color')
    })
  })

  describe('ColorPalette', () => {
    it('should have required properties', () => {
      const colorPalette: ColorPalette = {
        colors: [
          {
            hex: '#FF0000',
            name: 'Red',
            description: 'A vibrant red color',
          },
          {
            hex: '#00FF00',
            name: 'Green',
            description: 'A bright green color',
          },
        ],
        dominantColor: '#FF0000',
        mood: 'Energetic and vibrant',
      }

      expect(colorPalette.colors).toHaveLength(2)
      expect(colorPalette.dominantColor).toBe('#FF0000')
      expect(colorPalette.mood).toBe('Energetic and vibrant')
    })

    it('should handle optional properties', () => {
      const colorPalette: ColorPalette = {
        colors: [],
        dominantColor: '#000000',
        mood: 'Dark',
        timestamp: Date.now(),
        imagePreview: 'data:image/jpeg;base64,mock',
        isFavorite: true,
      }

      expect(colorPalette.timestamp).toBeDefined()
      expect(colorPalette.imagePreview).toBeDefined()
      expect(colorPalette.isFavorite).toBe(true)
    })
  })
})
