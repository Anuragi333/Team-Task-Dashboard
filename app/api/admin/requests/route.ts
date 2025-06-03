import { type NextRequest, NextResponse } from "next/server"
import { getAdminRequests } from "../../../../lib/admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined

    const requests = await getAdminRequests(status)
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error getting admin requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
