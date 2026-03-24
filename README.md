# Creative Project Manager

A comprehensive project management application designed specifically for creative teams. Built with Next.js, this app provides powerful tools for visualizing project timelines, managing assets, collaborating with team members, and engaging with clients.

## Features

### 🎨 Core Features
- **Interactive Gantt Charts** - Visualize projects and tasks with personal and team-wide Gantt charts
- **Project Management** - Create, organize, and track projects with multiple status views
- **Task Management** - Assign tasks, set priorities, track progress, and manage deadlines
- **Daily Task Lists** - Personalized daily task lists for individuals and team members
- **Real-time Collaboration** - Comments, mentions, and live updates on tasks

### 📁 Asset Management
- **File Upload & Organization** - Upload and organize creative assets by project and category
- **Google Drive Integration** - Sync with Google Drive for seamless file management
- **Auto-categorization** - Automatically organize files (branding, mockups, drafts, etc.)
- **Client Asset Portal** - Share specific assets with clients for review

### 🎯 Workflow Features
- **Status Tracking** - 11 comprehensive status markers:
  - In Production
  - Sent to Client
  - Waiting on Feedback
  - Making Changes
  - Submitting for Final
  - Submitting for 2nd Round
  - Approved
  - Needs Printing
  - Launched
  - Completed
  - Todo

- **Timeline Management** - Auto-generate timelines with key milestones:
  - Internal review date
  - Client draft date
  - Feedback deadline
  - Revisions deadline
  - Round 2 review date
  - Final submission date
  - Launch date

- **Email Integration** - Automatically extract tasks and projects from email and schedule them

### 👥 Team & Client Features
- **User Profiles** - Per-user profiles with customizable preferences
- **Team Collaboration** - Assign team members to projects and tasks
- **Client Portal** - Limited-access portal for clients to view projects needing review
- **Brand Guidelines** - Auto-generate visual brand guidelines from client assets

### 🔧 Technical Stack

**Frontend:**
- Next.js 14+ with App Router
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- React DnD for drag-and-drop

**Backend:**
- Next.js API Routes
- Prisma ORM
- SQLite (development) / PostgreSQL (production)

**Integrations:**
- Google Drive API for file management
- Email integration for task automation
- Next-Auth for authentication

**Libraries:**
- react-gantt-chart for Gantt visualization
- react-hot-toast for notifications
- Zustand for state management
- Recharts for analytics

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Drive API credentials (optional, for Drive integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure the following:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Projects listing and detail pages
│   ├── tasks/             # Task management pages
│   ├── assets/            # Asset management
│   ├── team/              # Team collaboration
│   ├── client-portal/     # Client-facing portal
│   └── layout.tsx         # Root layout
├── components/
│   ├── gantt/            # Gantt chart components
│   ├── task/             # Task-related components
│   ├── common/           # Reusable components
│   └── forms/            # Form components
├── lib/
│   ├── utils.ts          # Utility functions
│   ├── api.ts            # API helpers
│   └── db.ts             # Database utilities
├── types/
│   └── index.ts          # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── styles/
│   └── globals.css       # Global styles
└── api/                   # API route handlers
    ├── projects/         # Project endpoints
    ├── tasks/            # Task endpoints
    ├── assets/           # Asset endpoints
    └── auth/             # Authentication endpoints

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## Database Schema

The app uses Prisma ORM with the following main models:
- **User** - Team members and admin users
- **Project** - Creative projects
- **Task** - Individual tasks within projects
- **Timeline** - Project timeline with milestone dates
- **Asset** - Project files and creative assets
- **BrandGuide** - Brand guidelines and style information
- **Team** - Team groupings and memberships
- **ClientAccount** - Client information and portal access
- **Comment** - Task comments and feedback
- **Notification** - User notifications

## Usage

### Creating a Project
1. Click "New Project" button
2. Fill in project details (name, client, dates)
3. Add tasks to the timeline
4. Assign team members
5. Set milestone dates

### Managing Tasks
- Drag tasks to different statuses
- Update progress and estimated hours
- Add comments for collaboration
- Attach files to tasks
- Set priorities and due dates

### Using the Gantt Chart
- View team or personal Gantt charts
- Drag bars to reschedule tasks
- Click to view task details
- Filter by status, assignee, or priority
- Export timeline view

### Managing Assets
- Upload files to projects
- Auto-organize by category
- Share with clients
- View brand guidelines

## Configuration

### Gantt Chart Settings
Users can customize their Gantt chart view in their profile:
- Layout (compressed, expanded)
- Date range
- Grouping (by project, by team member)
- Color coding

### Email Integration
Set up email monitoring to automatically create tasks from incoming emails:
1. Configure email account in settings
2. Set up email rules/labels
3. Tasks are automatically created and scheduled

### Google Drive Integration
1. Authenticate with Google Drive
2. Select root folder for project assets
3. Files are automatically synced and organized by:
   - Client name
   - Project name
   - Asset type (branding, drafts, etc.)

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task status/details
- `DELETE /api/tasks/[id]` - Delete task

### Assets
- `POST /api/assets/upload` - Upload file
- `GET /api/assets` - List assets
- `DELETE /api/assets/[id]` - Delete asset

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

## Customization

### Styling
Tailwind CSS configuration is in `tailwind.config.ts`. Modify color schemes and spacing to match your brand.

### Task Statuses
Update task status options in `prisma/schema.prisma` and `src/lib/utils.ts`.

### Notifications
Configure notification types and frequency in user profile settings.

## Development

### Running Database Studio
```bash
npm run db:studio
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

### Self-hosted
1. Set up Node.js environment
2. Configure PostgreSQL database
3. Set environment variables
4. Run `npm run build && npm start`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Contact the development team

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Time tracking integration
- [ ] AI-powered task suggestions
- [ ] Slack integration
- [ ] Zapier integration
- [ ] Figma asset sync
- [ ] Advanced permission controls
- [ ] Project templates
- [ ] Custom workflows

## Changelog

### Version 0.1.0
- Initial project setup
- Core project and task management
- Basic Gantt chart
- Dashboard and project views
- Prisma database schema
