import { type NextRequest, NextResponse } from "next/server"
import { getTaskAnalytics } from "../../../../lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const userId = searchParams.get("userId")

    const analytics = await getTaskAnalytics(
      teamId ? Number.parseInt(teamId) : undefined,
      userId ? Number.parseInt(userId) : undefined,
    )

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching task analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
