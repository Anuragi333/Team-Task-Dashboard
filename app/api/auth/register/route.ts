import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "../../../../lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, role } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 })
    }

    const user = await createUser(email, name, password, role || "member")

    if (!user) {
      return NextResponse.json({ error: "Failed to create user. Email may already exist." }, { status: 400 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
