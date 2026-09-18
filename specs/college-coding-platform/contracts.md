# Interface Contracts: Coding Platform Provider & API Endpoints

**Project**: College Coding Platform  
**Contracts Version**: 1.0.0

---

## 1. Coding Platform Provider Contract (`ICodingPlatformProvider`)

```typescript
export interface SolvedCountsDTO {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface ContestRatingDTO {
  rating: number | null;
  globalRank: number | null;
  topPercentage: number | null;
  attendedContestsCount: number;
  history: Array<{
    contestTitle: string;
    rating: number;
    ranking: number;
    problemsSolved: number;
    attendedAt: Date;
  }>;
}

export interface SubmissionItemDTO {
  problemSlug: string;
  problemTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Accepted';
  submittedAt: Date;
}

export interface StreakStatsDTO {
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface PlatformProfileSnapshotDTO {
  platform: 'LEETCODE' | 'CODEFORCES' | 'HACKERRANK';
  username: string;
  exists: boolean;
  avatarUrl?: string;
  stats: SolvedCountsDTO;
  contest: ContestRatingDTO;
  streak: StreakStatsDTO;
  recentSubmissions: SubmissionItemDTO[];
  fetchedAt: Date;
  rawPayload: Record<string, unknown>;
}

export interface ICodingPlatformProvider {
  readonly platform: 'LEETCODE' | 'CODEFORCES' | 'HACKERRANK';
  
  /**
   * Validates if a user handle exists on the external platform.
   */
  validateUsername(username: string): Promise<boolean>;

  /**
   * Fetches the complete statistics snapshot from the external platform.
   * Throws provider-specific errors: UserNotFoundError, RateLimitError, NetworkTimeoutError.
   */
  fetchUserSnapshot(username: string): Promise<PlatformProfileSnapshotDTO>;
}
```

---

## 2. API Endpoints & Route Handlers

### Public Endpoints

| Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaderboard` | Paginated college leaderboard with search, branch, and period filters | Public |
| `GET` | `/api/profiles/:username` | Public profile payload (excludes email and private tokens) | Public |
| `GET` | `/api/gender-war` | Gender War comparison aggregates across time windows | Public |
| `GET` | `/api/cards/:identifier` | Dynamic standalone SVG profile card (`image/svg+xml`) | Public (CORS open) |
| `GET` | `/api/cards/:identifier.png` | Optional raster PNG card for social image embeds | Public |

### Authenticated Student Endpoints

| Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student account with mandatory fields | Public |
| `GET` | `/api/me` | Current authenticated user profile and account status | Student / Admin |
| `PATCH` | `/api/me/profile` | Update editable profile metadata (name, branch, bio, gender) | Student |
| `POST` | `/api/me/link-leetcode` | Link and initiate verification for LeetCode handle | Student |
| `POST` | `/api/me/sync` | Trigger on-demand sync for own linked profile | Student (rate-limited) |
| `PUT` | `/api/me/card-config` | Update card theme, layout, and featured badges | Student |

### Administrative Endpoints (RBAC Protected)

| Method | Route | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Paginated search of all student accounts | `PLATFORM_ADMIN` |
| `PATCH` | `/api/admin/users/:id` | Update metadata or toggle active/disabled status | `PLATFORM_ADMIN` |
| `POST` | `/api/admin/users/:id/sync` | Trigger immediate sync for target user | `PLATFORM_ADMIN` |
| `GET` | `/api/admin/duplicates` | View flagged duplicate LeetCode account conflicts | `PLATFORM_ADMIN` |
| `POST` | `/api/admin/duplicates/resolve` | Resolve conflict (unlink handle or soft-delete) | `PLATFORM_ADMIN` |
| `POST` | `/api/admin/sync/batch` | Trigger platform-wide batch synchronization | `SUPER_ADMIN` (Step-up) |
| `GET` | `/api/admin/sync/health` | Real-time queue metrics, worker state, error logs | `PLATFORM_ADMIN` |
| `GET` | `/api/admin/achievements` | List all achievement definitions | `PLATFORM_ADMIN` |
| `POST` | `/api/admin/achievements` | Create/edit/archive achievement with condition rule | `PLATFORM_ADMIN` |
| `GET` | `/api/admin/audit-logs` | Search immutable administrative audit trail | `SUPER_ADMIN` |
| `POST` | `/api/admin/roles/grant` | Grant or revoke administrator privileges | `SUPER_ADMIN` (Step-up) |
