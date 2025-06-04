import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user with role details
    const result = await sql`
      SELECT u.*, r.name as role_name, r.description as role_description, 
             r.permissions, r.level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ${email}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = result[0]
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user has admin privileges (level 8 or higher)
    if (!user.level || user.level < 8) {
      return NextResponse.json({ error: "Insufficient privileges" }, { status: 403 })
    }

    // Remove password_hash from returned user
    const { password_hash, ...userWithoutPassword } = user
    const userWithRole = {
      ...userWithoutPassword,
      roleDetails: {
        id: user.role_id,
        name: user.role_name,
        description: user.role_description,
        permissions: user.permissions,
        level: user.level,
        created_at: "",
        updated_at: "",
      },
    }

    return NextResponse.json({ user: userWithRole })
  } catch (error) {
    console.error("Error in admin login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
