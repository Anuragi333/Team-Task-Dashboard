export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "manager" | "member"
  role_id?: number
  avatar_url?: string
  created_at: string
  updated_at: string
  roleDetails?: Role
}

export interface Role {
  id: number
  name: string
  description?: string
  permissions: Record<string, any>
  level: number
  created_by?: number
  created_at: string
  updated_at: string
}

export interface AdminRequest {
  id: number
  email: string
  name: string
  reason?: string
  status: "pending" | "approved" | "rejected"
  requested_at: string
  reviewed_at?: string
  reviewed_by?: number
}

export interface Team {
  id: number
  name: string
  description?: string
  created_by: number
  created_at: string
  updated_at: string
  memberCount?: number
  taskCount?: number
}

export interface TeamMember {
  id: number
  team_id: number
  user_id: number
  role: "admin" | "manager" | "member"
  joined_at: string
  user?: User
}

export interface Task {
  id: number
  title: string
  description?: string
  status: "Not Started" | "In Progress" | "Completed"
  priority: "High" | "Medium" | "Low"
  assigned_to?: number
  created_by: number
  team_id: number
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  assigned_user?: User
  created_user?: User
  milestones?: Milestone[]
  comments?: Comment[]
}

export interface Milestone {
  id: number
  task_id: number
  title: string
  completed: boolean
  due_date?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  task_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  user?: User
}

export interface TaskHistory {
  id: number
  task_id: number
  user_id: number
  action: string
  old_value?: string
  new_value?: string
  created_at: string
  user?: User
}

export interface AuthUser {
  id: number
  email: string
  name: string
  role: string
}
