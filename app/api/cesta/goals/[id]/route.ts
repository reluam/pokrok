import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { updateGoal, deleteGoal, getUserByClerkId, determineGoalCategoryWithSettings } from '@/lib/cesta-db'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 API: GET /api/cesta/goals/[id] called with params:', params)
  return NextResponse.json({ test: 'GET handler works', id: params.id })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 API: PATCH /api/cesta/goals/[id] called with params:', params)
  console.log('🚀 API: Request method:', request.method)
  console.log('🚀 API: Request URL:', request.url)
  // Immediate sanity response toggle (uncomment to force-proof handler reachability)
  // return NextResponse.json({ ok: true, reached: 'PATCH handler', id: params.id })
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const raw = await request.json()
    const {
      title,
      description,
      target_date,
      area_id,
      priority,
      progressType,
      progressTarget,
      progressCurrent,
      progressUnit
    } = raw || {}

    console.log('API: Received goal update data:', {
      title,
      description,
      target_date,
      area_id,
      priority,
      progressType,
      progressTarget,
      progressCurrent,
      progressUnit
    })

    // Normalize inputs
    const normalizedAreaId = area_id === '' ? null : area_id
    const targetDateObj = target_date ? new Date(target_date) : (target_date === null ? null : undefined)

    // Only compute category if target_date was explicitly provided
    const shouldUpdateCategory = target_date !== undefined
    const category = shouldUpdateCategory && (targetDateObj === null || targetDateObj instanceof Date)
      ? await determineGoalCategoryWithSettings(targetDateObj ?? null)
      : undefined

    const updatedGoal = await updateGoal(
      params.id,
      dbUser.id,
      {
        title,
        description,
        target_date: targetDateObj === undefined ? undefined : (targetDateObj === null ? null as any : targetDateObj),
        area_id: normalizedAreaId ?? undefined,
        priority,
        category,
        progress_type: progressType,
        progress_target: progressTarget,
        progress_current: progressCurrent,
        progress_unit: progressUnit
      }
    )
    
    console.log('🚀 API: Returning updated goal:', updatedGoal)
    return NextResponse.json({ goal: updatedGoal })
  } catch (error) {
    console.error('🚀 API: Error updating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 API: POST /api/cesta/goals/[id] called with params:', params)
  // Delegate to PATCH logic to keep behavior identical
  return PATCH(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await getUserByClerkId(userId)
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await deleteGoal(params.id, dbUser.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
