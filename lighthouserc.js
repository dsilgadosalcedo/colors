module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'pnpm start',
      numberOfRuns: 3,
      settings: {
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],

        // Bundle size
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'modern-image-formats': 'error',
        'uses-webp-images': 'warn',
        'uses-optimized-images': 'error',

        // Security
        'is-on-https': 'error',
        'uses-http2': 'error',
        'no-vulnerable-libraries': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
