import { NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET() {
  try {
    const result = await sql`
      SELECT u.*, r.name as role_name, r.description as role_description, r.permissions, r.level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY r.level DESC, u.name ASC
    `

    const users = result.map((row: any) => ({
      ...row,
      roleDetails: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        permissions: row.permissions,
        level: row.level,
      },
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error getting users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
