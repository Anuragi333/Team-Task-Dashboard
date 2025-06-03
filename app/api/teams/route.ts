import { type NextRequest, NextResponse } from "next/server"
import { getTeams, createTeam } from "../../../lib/teams"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const teams = await getTeams(userId ? Number.parseInt(userId) : undefined)
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamData = await request.json()

    const team = await createTeam(teamData)

    if (!team) {
      return NextResponse.json({ error: "Failed to create team" }, { status: 400 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
