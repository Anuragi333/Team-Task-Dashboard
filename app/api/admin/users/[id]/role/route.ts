import { type NextRequest, NextResponse } from "next/server"
import { updateUserRole } from "../../../../../../lib/admin"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { roleId } = await request.json()
    const userId = Number.parseInt(params.id)

    if (!roleId) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 })
    }

    const success = await updateUserRole(userId, roleId)

    if (!success) {
      return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
