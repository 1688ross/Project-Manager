export type TaskStatus =
  | 'TODO'
  | 'IN_PRODUCTION'
  | 'SENT_TO_CLIENT'
  | 'WAITING_FEEDBACK'
  | 'MAKING_CHANGES'
  | 'SUBMITTING_FINAL'
  | 'SUBMITTING_ROUND_TWO'
  | 'APPROVED'
  | 'NEEDS_PRINTING'
  | 'LAUNCHED'
  | 'COMPLETED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'ON_HOLD'

// Event types from both manual creation AND email scanning
export type MilestoneEventType =
  | 'SUBMITTED' // Manual or email: deliverable sent to client
  | 'FEEDBACK' // Email: client has feedback/changes
  | 'APPROVED' // Manual or email: client approved deliverable
  | 'QUESTION' // Email: question about the project/deliverable
  | 'NEW_PROJECT' // Email: new project proposal
  | 'INFO' // Email: informational update

export type UserRole = 'ADMIN' | 'TEAM_LEAD' | 'TEAM_MEMBER' | 'CLIENT'

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  avatar?: string
}

export interface MilestoneHistory {
  id: string
  taskId: string
  eventType: MilestoneEventType
  dateOccurred: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  title: string
  description?: string
  status: ProjectStatus
  ownerId: string
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
  teamId?: string
  clientId?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  assigneeId?: string
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  startDate?: Date
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  updatedAt: Date
  history?: MilestoneHistory[]
}

export interface Timeline {
  id: string
  projectId: string
  internalReviewDate?: Date
  clientDraftDate?: Date
  feedbackDeadline?: Date
  revisionsDeadline?: Date
  roundTwoReviewDate?: Date
  finalSubmissionDate?: Date
  launchDate?: Date
}

export interface Asset {
  id: string
  projectId: string
  name: string
  fileType: string
  fileUrl: string
  category: 'BRANDING' | 'MOCKUP' | 'DRAFT' | 'APPROVED' | 'FINAL' | 'ARCHIVE' | 'CLIENT_PROVIDED'
  createdAt: Date
}

export interface BrandGuide {
  id: string
  projectId: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fonts?: string
  guidelines?: Record<string, any>
}

export interface GanttChartItem {
  id: string
  name: string
  start: Date
  end: Date
  progress?: number
  status: TaskStatus
  priority: Priority
  assignee?: User
}
