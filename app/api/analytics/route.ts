import { NextRequest, NextResponse } from 'next/server'
import { Metric } from 'web-vitals'
import { captureServerEvent } from '@/lib/server/posthog'

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
    await captureServerEvent('web_vital', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_id: metric.id,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
    })

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
