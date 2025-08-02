# Points System Implementation

## Overview
Implemented a comprehensive points system for TaskFlow where users earn points by completing pomodoro sessions and tasks.

## Points Earning System

### Pomodoro Sessions
- **25 minutes**: 10 points
- **30-40 minutes**: 20 points  
- **60+ minutes**: 45 points

### Task Completion
- **Any task**: 5 points

## Database Changes

### New Models Added

#### User Model Updates
- Added `points` field (Int, default: 0)

#### PomodoroSession Model
```prisma
model PomodoroSession {
  id          String   @id @default(cuid())
  userId      String
  duration    Int      // Duration in minutes
  workspaceId String?  // Optional workspace context
  completedAt DateTime @default(now())
  pointsEarned Int     // Points earned for this session
  
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace? @relation(fields: [workspaceId], references: [id], onDelete: SetNull)
}
```

#### PointTransaction Model
```prisma
model PointTransaction {
  id          String    @id @default(cuid())
  userId      String
  points      Int       // Can be positive (earned) or negative (spent)
  type        PointType
  description String
  relatedId   String?   // Related task/session ID for reference
  createdAt   DateTime  @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum PointType {
  POMODORO_COMPLETED
  TASK_COMPLETED
  MANUAL_ADJUSTMENT
}
```

#### Task Model Updates
- Added `isCompleted` field (Boolean, default: false)
- Added `completedAt` field (DateTime?, optional)

## API Endpoints

### POST /api/pomodoro/complete
Complete a pomodoro session and award points.

**Request Body:**
```json
{
  "duration": 25,
  "workspaceId": "optional-workspace-id"
}
```

**Response:**
```json
{
  "success": true,
  "session": { /* PomodoroSession object */ },
  "pointsEarned": 10,
  "totalPoints": 125,
  "message": "Congratulations! You earned 10 points for completing a 25-minute pomodoro session!"
}
```

### POST /api/task/complete  
Complete a task and award points.

**Request Body:**
```json
{
  "taskId": "task-id",
  "workspaceId": "workspace-id"
}
```

**Response:**
```json
{
  "success": true,
  "task": { /* Updated task object */ },
  "pointsEarned": 5,
  "totalPoints": 130,
  "message": "Task completed! You earned 5 points!"
}
```

### GET /api/points
Get user points and transaction history.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)  
- `type` (optional: POMODORO_COMPLETED, TASK_COMPLETED, MANUAL_ADJUSTMENT)

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "username": "username", 
    "totalPoints": 130
  },
  "transactions": [ /* Array of transactions */ ],
  "pagination": { /* Pagination info */ },
  "stats": {
    "POMODORO_COMPLETED": { "totalPoints": 80, "count": 6 },
    "TASK_COMPLETED": { "totalPoints": 50, "count": 10 }
  }
}
```

## Components

### PointsDisplay
- Shows current user points
- Displays points history in a modal
- Shows statistics breakdown by type
- Located in header for easy access

### TaskCompleteButton  
- Button to complete tasks and earn points
- Shows loading state and success feedback
- Integrated into task read-only view
- Disabled for completed tasks

### Updated PomodoroContainer
- Automatically awards points when work sessions complete
- Shows toast notifications for points earned
- Supports workspace context for tracking

## Utility Functions

### lib/points.ts
- `calculatePomodoroPoints(duration)` - Calculate points for pomodoro duration
- `calculateTaskCompletionPoints()` - Get points for task completion  
- `awardPoints()` - Award points and create transaction record
- `recordPomodoroCompletion()` - Record pomodoro session with points
- `recordTaskCompletion()` - Record task completion with points

## Hooks

### useCompleteTask
- React Query mutation for completing tasks
- Handles success/error states
- Invalidates related queries
- Shows toast notifications

## Integration Points

### Header Integration
- PointsDisplay component added to DashboardHeader
- Shows current points and provides access to history

### Task Integration  
- TaskCompleteButton added to ReadOnlyContent component
- Only visible for users with edit permissions
- Respects task completion status

### Pomodoro Integration
- PomodoroContainer updated to award points on completion
- Supports optional workspace context
- Shows success notifications

## Migration Applied
- Migration `20250802211712_add_points_system` successfully applied
- All database schema changes are live

## Usage Examples

### Completing a Pomodoro
```typescript
// Automatically called when PomodoroContainer work session ends
const response = await fetch('/api/pomodoro/complete', {
  method: 'POST',
  body: JSON.stringify({ duration: 25, workspaceId: 'workspace-123' })
});
```

### Completing a Task  
```typescript
// Using the useCompleteTask hook
const completeTask = useCompleteTask();
completeTask.mutate({ taskId: 'task-123', workspaceId: 'workspace-123' });
```

### Displaying Points
```tsx
// Automatically shown in header
<PointsDisplay />
```

## Next Steps (Optional Enhancements)

1. **Leaderboards** - Compare points with workspace members
2. **Achievements** - Special rewards for milestones  
3. **Point Shop** - Spend points on rewards
4. **Streak Bonuses** - Extra points for consecutive days
5. **Team Challenges** - Collaborative point goals
6. **Export Reports** - Download points/productivity reports

## Files Modified/Created

### Created Files:
- `lib/points.ts` - Points calculation utilities
- `app/api/pomodoro/complete/route.ts` - Pomodoro completion API
- `app/api/task/complete/route.ts` - Task completion API  
- `app/api/points/route.ts` - Points and history API
- `components/points/PointsDisplay.tsx` - Points display component
- `components/tasks/TaskCompleteButton.tsx` - Task completion button
- `hooks/useCompleteTask.tsx` - Task completion hook

### Modified Files:
- `prisma/schema.prisma` - Added new models and fields
- `components/header/DashboardHeader.tsx` - Added PointsDisplay
- `components/tasks/readOnly/ReadOnlyContent.tsx` - Added TaskCompleteButton  
- `components/pomodoro/timer/PomodoroContainer.tsx` - Added points integration

The points system is now fully functional and integrated into the existing TaskFlow application!
