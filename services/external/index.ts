import { LeetCodeService, LeetCodeStats } from './leetcode';
import { CodeforcesService, CodeforcesStats } from './codeforces';
import { GitHubService, GitHubStats } from './github';
import { RedditService, RedditStats } from './reddit';
import { EmailService, EmailStats } from './email';

// Export all stats interfaces
export type { LeetCodeStats, CodeforcesStats, GitHubStats, RedditStats, EmailStats };

export interface ExternalServicesData {
  leetcode?: LeetCodeStats;
  codeforces?: CodeforcesStats;
  github?: GitHubStats;
  reddit?: RedditStats;
  email?: EmailStats;
  lastUpdated: Date;
  nextUpdate: Date;
}

export interface UserExternalServices {
  leetcodeUsername?: string | null;
  codeforcesUsername?: string | null;
  redditUsername?: string | null;
  githubUsername?: string | null;
  emailIds?: string[];
}

export interface ExternalServiceConfig {
  githubToken?: string;
  gmailAccessToken?: string;
  updateInterval: number; // in minutes
}

export class ExternalServicesAggregator {
  private leetcodeService: LeetCodeService;
  private codeforcesService: CodeforcesService;
  private githubService: GitHubService;
  private redditService: RedditService;
  private emailService: EmailService;

  constructor(private config: ExternalServiceConfig = { updateInterval: 60 }) {
    this.leetcodeService = new LeetCodeService();
    this.codeforcesService = new CodeforcesService();
    this.githubService = new GitHubService(config.githubToken);
    this.redditService = new RedditService();
    this.emailService = new EmailService(config.gmailAccessToken);
  }

  async fetchAllUserData(userServices: UserExternalServices): Promise<ExternalServicesData> {
    const results: Partial<ExternalServicesData> = {};
    const fetchPromises: Promise<void>[] = [];

    // Fetch LeetCode data
    if (userServices.leetcodeUsername) {
      fetchPromises.push(
        this.leetcodeService.getUserStats(userServices.leetcodeUsername)
          .then(data => { results.leetcode = data || undefined; })
          .catch(error => console.error('LeetCode fetch error:', error))
      );
    }

    // Fetch Codeforces data
    if (userServices.codeforcesUsername) {
      fetchPromises.push(
        this.codeforcesService.getUserStats(userServices.codeforcesUsername)
          .then(data => { results.codeforces = data || undefined; })
          .catch(error => console.error('Codeforces fetch error:', error))
      );
    }

    // Fetch GitHub data
    if (userServices.githubUsername) {
      fetchPromises.push(
        this.githubService.getUserStats(userServices.githubUsername)
          .then(data => { results.github = data || undefined; })
          .catch(error => console.error('GitHub fetch error:', error))
      );
    }

    // Fetch Reddit data
    if (userServices.redditUsername) {
      fetchPromises.push(
        this.redditService.getUserStats(userServices.redditUsername)
          .then(data => { results.reddit = data || undefined; })
          .catch(error => console.error('Reddit fetch error:', error))
      );
    }

    // Fetch Email data
    if (userServices.emailIds && userServices.emailIds.length > 0) {
      fetchPromises.push(
        this.emailService.getEmailStats(userServices.emailIds)
          .then(data => { results.email = data || undefined; })
          .catch(error => console.error('Email fetch error:', error))
      );
    }

    // Wait for all fetches to complete
    await Promise.all(fetchPromises);

    const now = new Date();
    const nextUpdate = new Date(now.getTime() + this.config.updateInterval * 60 * 1000);

    return {
      ...results,
      lastUpdated: now,
      nextUpdate
    } as ExternalServicesData;
  }

  async fetchLeetCodeData(username: string): Promise<LeetCodeStats | null> {
    return this.leetcodeService.getUserStats(username);
  }

  async fetchCodeforcesData(username: string): Promise<CodeforcesStats | null> {
    return this.codeforcesService.getUserStats(username);
  }

  async fetchGitHubData(username: string): Promise<GitHubStats | null> {
    return this.githubService.getUserStats(username);
  }

  async fetchRedditData(username: string): Promise<RedditStats | null> {
    return this.redditService.getUserStats(username);
  }

  async fetchEmailData(emailIds: string[]): Promise<EmailStats | null> {
    return this.emailService.getEmailStats(emailIds);
  }

  // Utility methods for quick insights
  generateUserInsights(data: ExternalServicesData): string[] {
    const insights: string[] = [];

    // LeetCode insights
    if (data.leetcode) {
      insights.push(`You've solved ${data.leetcode.totalSolved} problems on LeetCode! Keep up the great work!`);
      if (data.leetcode.contestRating > 0) {
        insights.push(`Your LeetCode contest rating is ${data.leetcode.contestRating}. Great competitive programming skills!`);
      }
      if (data.leetcode.globalRanking && data.leetcode.globalRanking <= 100000) {
        insights.push(`You're in the top ${Math.ceil(data.leetcode.globalRanking / 1000)}k globally on LeetCode!`);
      }
      if (data.leetcode.contestsAttended > 0) {
        insights.push(`You've participated in ${data.leetcode.contestsAttended} LeetCode contests. Contest participation builds strong problem-solving skills!`);
      }
    }

    if (data.codeforces) {
      const { user, solvedProblems, contestsParticipated } = data.codeforces;
      insights.push(`You're rated ${user.rating} (${user.rank}) on Codeforces with ${solvedProblems} problems solved`);
      insights.push(`You've participated in ${contestsParticipated} contests on Codeforces`);
    }

    if (data.github) {
      const { user, totalCommits, totalStars, currentStreak } = data.github;
      insights.push(`You have ${user.public_repos} public repositories on GitHub with ${totalStars} total stars`);
      insights.push(`Your current GitHub contribution streak is ${currentStreak} days`);
      
      if (totalCommits > 0) {
        insights.push(`You've made ${totalCommits} commits in the last year`);
      }
    }

    if (data.reddit) {
      const { totalKarma, accountAge, postsCount } = data.reddit;
      insights.push(`You have ${totalKarma.toLocaleString()} total karma on Reddit (account age: ${accountAge} days)`);
      insights.push(`You've made ${postsCount} posts on Reddit`);
    }

    if (data.email) {
      const { totalUnread, totalToday, avgEmailsPerDay } = data.email;
      insights.push(`You have ${totalUnread} unread emails and received ${totalToday} emails today`);
      insights.push(`You receive an average of ${Math.round(avgEmailsPerDay)} emails per day`);
    }

    return insights;
  }

  generateDailyDigest(data: ExternalServicesData): {
    title: string;
    summary: string;
    highlights: string[];
    actionItems: string[];
  } {
    const highlights: string[] = [];
    const actionItems: string[] = [];

    // Codeforces highlights
    if (data.codeforces?.recentSubmissions.length) {
      const acceptedToday = data.codeforces.recentSubmissions.filter(s => 
        s.verdict === 'OK' && 
        Date.now() - s.creationTimeSeconds * 1000 < 24 * 60 * 60 * 1000
      ).length;
      if (acceptedToday > 0) {
        highlights.push(`${acceptedToday} problems solved on Codeforces today`);
      }
    }

    // GitHub highlights
    if (data.github?.recentCommits.length) {
      const commitsToday = data.github.recentCommits.filter(c => 
        Date.now() - new Date(c.commit.author.date).getTime() < 24 * 60 * 60 * 1000
      ).length;
      if (commitsToday > 0) {
        highlights.push(`${commitsToday} commits made on GitHub today`);
      }
    }

    // Email highlights
    if (data.email?.totalToday) {
      highlights.push(`${data.email.totalToday} new emails received today`);
      if (data.email.totalUnread > 10) {
        actionItems.push(`You have ${data.email.totalUnread} unread emails - consider clearing your inbox`);
      }
    }

    // Reddit highlights
    if (data.reddit?.recentPosts.length) {
      const postsToday = data.reddit.recentPosts.filter(p => 
        Date.now() - p.created_utc * 1000 < 24 * 60 * 60 * 1000
      ).length;
      if (postsToday > 0) {
        highlights.push(`${postsToday} posts made on Reddit today`);
      }
    }

    // Generate action items
    if (data.github && data.github.currentStreak === 0) {
      actionItems.push('Your GitHub contribution streak has ended - consider making a commit today');
    }

    return {
      title: 'Daily Activity Digest',
      summary: highlights.length > 0 
        ? `Today you've been active across ${highlights.length} platforms` 
        : 'No major activity detected today',
      highlights,
      actionItems
    };
  }

  shouldUpdateData(lastUpdated: Date): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff >= this.config.updateInterval;
  }
}
