import { type NextRequest, NextResponse } from "next/server"
import { getRoles, createRole } from "../../../../lib/admin"

export async function GET() {
  try {
    const roles = await getRoles()
    return NextResponse.json(roles)
  } catch (error) {
    console.error("Error getting roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleData = await request.json()

    if (!roleData.name || !roleData.level) {
      return NextResponse.json({ error: "Name and level are required" }, { status: 400 })
    }

    const role = await createRole(roleData)

    if (!role) {
      return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
