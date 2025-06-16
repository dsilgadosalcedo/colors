// Server-only PostHog client using HTTP API
// This completely avoids posthog-node bundling issues

const POSTHOG_API_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

export async function captureServerEvent(
  eventName: string,
  properties: Record<string, any> = {}
) {
  // Server-side only check
  if (typeof window !== 'undefined') {
    console.warn('[PostHog] Server event capture called on client side')
    return
  }

  if (!POSTHOG_API_KEY) {
    console.warn('[PostHog] API key not found for server event capture')
    return
  }

  try {
    const eventData = {
      api_key: POSTHOG_API_KEY,
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        server_side: true,
        $lib: 'next-js-server',
        $lib_version: '1.0.0',
      },
      distinct_id: 'anonymous',
    }

    const response = await fetch(`${POSTHOG_API_HOST}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      console.error(
        '[PostHog] Failed to capture event:',
        response.status,
        response.statusText
      )
    } else {
      console.log(`[PostHog] Successfully captured event: ${eventName}`)
    }
  } catch (error) {
    console.error('[PostHog] Error capturing server event:', error)
  }
}

// Legacy function for backwards compatibility
export async function getServerPostHogClient() {
  console.log('[PostHog] Using HTTP API instead of posthog-node client')
  return {
    capture: (data: any) => {
      captureServerEvent(data.event, data.properties)
    },
    shutdown: () => Promise.resolve(),
  }
}

// No-op shutdown since we're using HTTP API
export async function shutdownPostHog() {
  console.log('[PostHog] HTTP API client - no shutdown needed')
}
