// Legacy file - redirects to server-only PostHog implementation
// This file exists only for backwards compatibility

export async function getServerPostHogClient() {
  // Only import server-side PostHog when actually needed
  const { getServerPostHogClient: serverClient } = await import(
    '@/lib/server/posthog'
  )
  return serverClient()
}

// Legacy export - deprecated
export default function PostHogClientSync() {
  console.warn(
    '[PostHog] Synchronous client deprecated. Use getServerPostHogClient() from @/lib/server/posthog'
  )
  return null
}
