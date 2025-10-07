import { NextResponse } from 'next/server'
import { getCoachingPackages } from '@/lib/admin-db'

export async function GET() {
  try {
    const packages = await getCoachingPackages()
    // Only return enabled packages for public API
    const enabledPackages = packages.filter(pkg => pkg.enabled)
    return NextResponse.json(enabledPackages)
  } catch (error) {
    console.error('Error fetching coaching packages:', error)
    return NextResponse.json({ error: 'Failed to fetch coaching packages' }, { status: 500 })
  }
}

