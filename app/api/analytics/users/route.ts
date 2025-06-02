import { type NextRequest, NextResponse } from "next/server"
import { getUserAnalytics } from "../../../../lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")

    const analytics = await getUserAnalytics(teamId ? Number.parseInt(teamId) : undefined)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
