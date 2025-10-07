import { NextRequest, NextResponse } from 'next/server'
import { getCoachingPackages, createCoachingPackage } from '@/lib/admin-db'
import { CoachingPackage } from '@/lib/admin-types'

export async function GET() {
  try {
    const packages = await getCoachingPackages()
    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching coaching packages:', error)
    return NextResponse.json({ error: 'Failed to fetch coaching packages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const packageData: Omit<CoachingPackage, 'id' | 'createdAt' | 'updatedAt'> = await request.json()
    
    // Validate required fields
    if (!packageData.title || !packageData.subtitle || !packageData.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newPackage = await createCoachingPackage(packageData)
    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating coaching package:', error)
    return NextResponse.json({ error: 'Failed to create coaching package' }, { status: 500 })
  }
}

