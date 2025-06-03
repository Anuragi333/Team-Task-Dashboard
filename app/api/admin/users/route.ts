import { NextResponse } from "next/server"
import { getUsersWithRoles } from "../../../../lib/admin"

export async function GET() {
  try {
    const users = await getUsersWithRoles()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error getting users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
