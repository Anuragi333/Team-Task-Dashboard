import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM roles
      ORDER BY level DESC, name ASC
    `
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error getting roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, level, permissions, created_by } = await request.json()

    if (!name || !level) {
      return NextResponse.json({ error: "Name and level are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO roles (name, description, permissions, level, created_by)
      VALUES (${name}, ${description || null}, ${JSON.stringify(permissions || {})}, ${level}, ${created_by})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
