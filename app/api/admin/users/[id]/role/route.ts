import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../../../lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roleId } = await request.json()
    const userId = Number.parseInt(params.id)

    if (!roleId) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 })
    }

    await sql`
      UPDATE users 
      SET role_id = ${roleId}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
