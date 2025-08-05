import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Trophy, 
  GitBranch, 
  MessageSquare, 
  Mail, 
  TrendingUp, 
  Calendar,
  Star,
  GitCommit,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { ExternalServicesData, LeetCodeStats, CodeforcesStats, GitHubStats, RedditStats, EmailStats } from '@/services/external';

interface Props {
  data: ExternalServicesData & {
    insights?: string[];
    dailyDigest?: {
      title: string;
      summary: string;
      highlights: string[];
      actionItems: string[];
    };
  };
}

export const ExternalServicesDashboard = ({ data }: Props) => {
  const { leetcode, codeforces, github, reddit, email } = data;
  const insights = data.insights || [];
  const dailyDigest = data.dailyDigest;

  return (
    <div className="space-y-6">
      {/* Daily Digest */}
      {dailyDigest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {dailyDigest.title}
            </CardTitle>
            <CardDescription>{dailyDigest.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyDigest.highlights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Today's Highlights</h4>
                  <ul className="space-y-1">
                    {dailyDigest.highlights.map((highlight: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {dailyDigest.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Action Items</h4>
                  <ul className="space-y-1">
                    {dailyDigest.actionItems.map((item: string, index: number) => (
                      <li key={index} className="text-sm text-destructive">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Progress Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Platform Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {leetcode && <TabsTrigger value="leetcode">LeetCode</TabsTrigger>}
          {codeforces && <TabsTrigger value="codeforces">Codeforces</TabsTrigger>}
          {github && <TabsTrigger value="github">GitHub</TabsTrigger>}
          {reddit && <TabsTrigger value="reddit">Reddit</TabsTrigger>}
          {email && <TabsTrigger value="email">Email</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leetcode && <LeetCodeOverview data={leetcode} />}
            {codeforces && <CodeforcesOverview data={codeforces} />}
            {github && <GitHubOverview data={github} />}
            {reddit && <RedditOverview data={reddit} />}
            {email && <EmailOverview data={email} />}
          </div>
        </TabsContent>

        {leetcode && (
          <TabsContent value="leetcode">
            <LeetCodeDetails data={leetcode} />
          </TabsContent>
        )}

        {codeforces && (
          <TabsContent value="codeforces">
            <CodeforcesDetails data={codeforces} />
          </TabsContent>
        )}

        {github && (
          <TabsContent value="github">
            <GitHubDetails data={github} />
          </TabsContent>
        )}

        {reddit && (
          <TabsContent value="reddit">
            <RedditDetails data={reddit} />
          </TabsContent>
        )}

        {email && (
          <TabsContent value="email">
            <EmailDetails data={email} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Overview Components
const LeetCodeOverview = ({ data }: { data: LeetCodeStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="w-4 h-4 bg-primary rounded"></div>
        LeetCode
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Contest Rating</span>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {data.contestRating || 'Unrated'}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Problems Solved</span>
          <Badge variant="default">{data.totalSolved}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Global Ranking</span>
          <Badge variant="outline">#{data.globalRanking?.toLocaleString() || 'N/A'}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Contests Attended</span>
          <Badge variant="secondary">{data.contestsAttended}</Badge>
        </div>
        <Progress value={(data.totalSolved / data.totalQuestions) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          {Math.round((data.totalSolved / data.totalQuestions) * 100)}% of all problems solved
        </p>
      </div>
    </CardContent>
  </Card>
);

const CodeforcesOverview = ({ data }: { data: CodeforcesStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="w-4 h-4 bg-primary rounded"></div>
        Codeforces
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Rating</span>
          <Badge variant="secondary">{data.user.rating}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Rank</span>
          <Badge variant="outline">{data.user.rank}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Problems Solved</span>
          <Badge variant="default">{data.solvedProblems}</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

const GitHubOverview = ({ data }: { data: GitHubStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <GitBranch className="w-4 h-4" />
        GitHub
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Public Repos</span>
          <Badge variant="secondary">{data.user.public_repos}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Total Stars</span>
          <Badge variant="outline">{data.totalStars}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Current Streak</span>
          <Badge variant="default">{data.currentStreak} days</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

const RedditOverview = ({ data }: { data: RedditStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Reddit
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Total Karma</span>
          <Badge variant="secondary">{data.totalKarma.toLocaleString()}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Account Age</span>
          <Badge variant="outline">{data.accountAge} days</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Posts Made</span>
          <Badge variant="default">{data.postsCount}</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EmailOverview = ({ data }: { data: EmailStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Mail className="w-4 h-4" />
        Email
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Unread</span>
          <Badge variant="destructive">{data.totalUnread}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Today</span>
          <Badge variant="secondary">{data.totalToday}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Avg/Day</span>
          <Badge variant="outline">{Math.round(data.avgEmailsPerDay)}</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Detailed Components (placeholders for now)
const LeetCodeDetails = ({ data }: { data: LeetCodeStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Contest Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {data.contestRating || 'Unrated'}
            </div>
            <p className="text-sm text-muted-foreground">Contest Rating</p>
          </div>
          <div className="flex justify-between items-center">
            <span>Contests Attended</span>
            <Badge variant="secondary">{data.contestsAttended}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Global Ranking</span>
            <Badge variant="outline">#{data.globalRanking?.toLocaleString() || 'N/A'}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-foreground" />
          Problem Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Easy</span>
            <Badge className="bg-muted text-muted-foreground">
              {data.easySolved}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Medium</span>
            <Badge className="bg-secondary text-secondary-foreground">
              {data.mediumSolved}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Hard</span>
            <Badge className="bg-destructive text-destructive-foreground">
              {data.hardSolved}
            </Badge>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center font-medium">
              <span>Total Solved</span>
              <Badge variant="default">{data.totalSolved}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Progress Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round((data.totalSolved / data.totalQuestions) * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">Problems Completed</p>
          </div>
          <Progress value={(data.totalSolved / data.totalQuestions) * 100} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{data.totalSolved} solved</span>
            <span>{data.totalQuestions} total</span>
          </div>
          {data.recentSubmissions && data.recentSubmissions.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Recent Activity</p>
              <div className="space-y-1">
                {data.recentSubmissions.slice(0, 3).map((submission: any, index: number) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {submission.title} ({submission.statusDisplay})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

const CodeforcesDetails = ({ data }: { data: CodeforcesStats }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.solvedProblems}</div>
            <div className="text-sm text-muted-foreground">Problems Solved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.contestsParticipated}</div>
            <div className="text-sm text-muted-foreground">Contests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.acceptedSubmissions}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.totalSubmissions}</div>
            <div className="text-sm text-muted-foreground">Total Submissions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const GitHubDetails = ({ data }: { data: GitHubStats }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="w-4 h-4" />
            Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{data.totalCommits}</div>
            <div className="text-sm text-muted-foreground">Total Commits</div>
            <div className="text-sm">Current streak: {data.currentStreak} days</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{data.totalStars}</div>
            <div className="text-sm text-muted-foreground">Total Stars</div>
            <div className="text-sm">{data.totalForks} total forks</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{data.user.public_repos}</div>
            <div className="text-sm text-muted-foreground">Public Repos</div>
            <div className="text-sm">{data.user.followers} followers</div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const RedditDetails = ({ data }: { data: RedditStats }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Karma Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Post Karma</span>
              <Badge variant="secondary">{data.postKarma.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Comment Karma</span>
              <Badge variant="outline">{data.commentKarma.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Karma</span>
              <Badge variant="default">{data.totalKarma.toLocaleString()}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Posts Made</span>
              <Badge variant="secondary">{data.postsCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Comments Made</span>
              <Badge variant="outline">{data.commentsCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Account Age</span>
              <Badge variant="default">{data.accountAge} days</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const EmailDetails = ({ data }: { data: EmailStats }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Unread</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{data.totalUnread}</div>
          <div className="text-sm text-muted-foreground">Emails</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalToday}</div>
          <div className="text-sm text-muted-foreground">New emails</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalWeek}</div>
          <div className="text-sm text-muted-foreground">Emails</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalMonth}</div>
          <div className="text-sm text-muted-foreground">Emails</div>
        </CardContent>
      </Card>
    </div>

    {data.topSenders.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>Top Senders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topSenders.slice(0, 5).map((sender, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{sender.name || sender.email}</span>
                <Badge variant="outline">{sender.count} emails</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
