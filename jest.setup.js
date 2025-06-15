import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock File API
global.File = class MockFile {
  constructor(bits, name, options = {}) {
    this.bits = bits
    this.name = name
    this.size = bits.join('').length
    this.type = options.type || ''
    this.lastModified = Date.now()
  }
}

// Mock FileReader
global.FileReader = class MockFileReader {
  constructor() {
    this.readAsDataURL = jest.fn(() => {
      this.onload &&
        this.onload({ target: { result: 'data:image/jpeg;base64,mock' } })
    })
  }
}
