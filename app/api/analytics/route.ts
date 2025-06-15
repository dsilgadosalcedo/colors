import { NextRequest, NextResponse } from 'next/server'
import { Metric } from 'web-vitals'

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

    // In production, you would send this to your analytics service
    // Examples: Google Analytics, Mixpanel, PostHog, etc.

    // For now, we'll just validate and acknowledge receipt
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // TODO: Integrate with your preferred analytics service
    // Example integrations:

    // Google Analytics 4:
    // gtag('event', 'web_vital', {
    //   name: metric.name,
    //   value: metric.value,
    //   metric_id: metric.id,
    //   metric_rating: metric.rating,
    // });

    // PostHog:
    // posthog.capture('web_vital', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   metric_id: metric.id,
    //   metric_rating: metric.rating,
    // });

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
