import { render, screen, fireEvent } from '@testing-library/react'
import { ColorCard } from '@/components/ColorCard'

// Mock zustand store
jest.mock('@/lib/store', () => ({
  useColorPaletteStore: () => ({
    setColorTextPreview: jest.fn(),
    clearColorTextPreview: jest.fn(),
    addColorTextToPrompt: jest.fn(),
  }),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
})

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}))

describe('ColorCard', () => {
  const mockColor = {
    hex: '#FF0000',
    name: 'Vibrant Red',
    description: 'A bold and energetic red color',
  }

  const mockProps = {
    color: mockColor,
    copiedColor: null,
    onCopyColor: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render color information correctly', () => {
    render(<ColorCard {...mockProps} />)

    expect(screen.getByText('Vibrant Red')).toBeInTheDocument()
    expect(screen.getByText('#FF0000')).toBeInTheDocument()
    expect(
      screen.getByText('A bold and energetic red color')
    ).toBeInTheDocument()
  })

  it('should display color background', () => {
    render(<ColorCard {...mockProps} />)

    // Find the color display div by looking for the element with the background color
    const colorDisplay = screen.getByRole('button') // The clickable div acts as a button
    expect(colorDisplay).toHaveStyle('background-color: rgb(255, 0, 0)')
  })

  it('should call onCopyColor when color area is clicked', () => {
    render(<ColorCard {...mockProps} />)

    const colorArea = screen.getByRole('button')
    fireEvent.click(colorArea)

    expect(mockProps.onCopyColor).toHaveBeenCalledWith('#FF0000')
  })

  it('should show check icon when color is copied', () => {
    const copiedProps = {
      ...mockProps,
      copiedColor: '#FF0000',
    }
    render(<ColorCard {...copiedProps} />)

    // Check icon should be present when color is copied
    const checkIcon =
      screen.getByTestId('check-icon') ||
      screen.getByRole('button').querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should handle invalid hex colors gracefully', () => {
    const invalidProps = {
      ...mockProps,
      color: {
        hex: 'invalid-hex',
        name: 'Invalid Color',
        description: 'This should still render',
      },
    }

    expect(() => render(<ColorCard {...invalidProps} />)).not.toThrow()
    expect(screen.getByText('invalid-hex')).toBeInTheDocument()
  })
})
