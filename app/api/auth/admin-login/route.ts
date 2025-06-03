import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "../../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user has admin privileges (level 8 or higher)
    if (!user.roleDetails || user.roleDetails.level < 8) {
      return NextResponse.json({ error: "Insufficient privileges" }, { status: 403 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error in admin login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
