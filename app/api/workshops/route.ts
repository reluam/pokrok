import { NextResponse } from 'next/server'
import { getWorkshops } from '@/lib/admin-db'

export async function GET() {
  try {
    const allWorkshops = await getWorkshops()
    const enabledWorkshops = allWorkshops.filter(workshop => workshop.enabled)
    return NextResponse.json(enabledWorkshops)
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array on error
  }
}
