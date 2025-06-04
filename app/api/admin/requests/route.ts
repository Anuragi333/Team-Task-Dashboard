import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let result
    if (status) {
      result = await sql`
        SELECT ar.*, u.name as reviewer_name
        FROM admin_requests ar
        LEFT JOIN users u ON ar.reviewed_by = u.id
        WHERE ar.status = ${status}
        ORDER BY ar.requested_at DESC
      `
    } else {
      result = await sql`
        SELECT ar.*, u.name as reviewer_name
        FROM admin_requests ar
        LEFT JOIN users u ON ar.reviewed_by = u.id
        ORDER BY ar.requested_at DESC
      `
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error getting admin requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
