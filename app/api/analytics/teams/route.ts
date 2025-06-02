import { type NextRequest, NextResponse } from "next/server"
import { getTeamAnalytics } from "../../../../lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const analytics = await getTeamAnalytics()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching team analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
