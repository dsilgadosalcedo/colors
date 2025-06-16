import { NextRequest, NextResponse } from 'next/server'
import { Metric } from 'web-vitals'
import PostHogClient from '@/lib/posthog'

export async function POST(request: NextRequest) {
  try {
    const metric: Metric = await request.json()

    // Log the metric in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Received Web Vital:', {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
      })
    }

    // Validate incoming metric
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Send metric to PostHog
    const posthog = PostHogClient()
    // Capture the web vital event
    posthog.capture({
      distinctId: 'anonymous',
      event: 'web_vital',
      properties: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
      },
    })
    // Ensure all events are flushed before response
    posthog.shutdown()

    return NextResponse.json({
      success: true,
      message: 'Metric recorded successfully',
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    )
  }
}
