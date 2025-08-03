/**
 * External Services Data Fetcher
 * This service will be used to fetch data from various external platforms
 * based on the usernames provided during onboarding
 */

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  reputation: number;
  recentSubmissions: Array<{
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
    timestamp: Date;
  }>;
}

export interface CodeforcesStats {
  username: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  contestsParticipated: number;
  recentContests: Array<{
    contestName: string;
    rank: number;
    ratingChange: number;
    date: Date;
  }>;
}

export interface GitHubStats {
  username: string;
  publicRepos: number;
  followers: number;
  following: number;
  contributions: number;
  streak: number;
  recentCommits: Array<{
    repository: string;
    message: string;
    date: Date;
    url: string;
  }>;
}

export interface RedditStats {
  username: string;
  totalKarma: number;
  postKarma: number;
  commentKarma: number;
  accountAge: number; // in days
  recentPosts: Array<{
    title: string;
    subreddit: string;
    score: number;
    date: Date;
    url: string;
  }>;
}

export interface EmailStats {
  emailAddress: string;
  totalEmails: number;
  unreadEmails: number;
  recentEmails: Array<{
    subject: string;
    sender: string;
    date: Date;
    isRead: boolean;
  }>;
}

export interface UserExternalData {
  leetcode?: LeetCodeStats;
  codeforces?: CodeforcesStats;
  github?: GitHubStats;
  reddit?: RedditStats;
  emails?: EmailStats[];
  lastUpdated: Date;
}

class ExternalDataService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  }

  /**
   * Fetch LeetCode statistics for a username
   */
  async fetchLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
    try {
      // Note: LeetCode doesn't have an official API, so this would use
      // a third-party service or web scraping approach
      const response = await fetch(`${this.baseUrl}/external/leetcode/${username}`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching LeetCode stats:', error);
      return null;
    }
  }

  /**
   * Fetch Codeforces statistics for a username
   */
  async fetchCodeforcesStats(username: string): Promise<CodeforcesStats | null> {
    try {
      // Codeforces has an official API
      const response = await fetch(`${this.baseUrl}/external/codeforces/${username}`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Codeforces stats:', error);
      return null;
    }
  }

  /**
   * Fetch GitHub statistics for a username
   */
  async fetchGitHubStats(username: string): Promise<GitHubStats | null> {
    try {
      // GitHub has a comprehensive REST API
      const response = await fetch(`${this.baseUrl}/external/github/${username}`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      return null;
    }
  }

  /**
   * Fetch Reddit statistics for a username
   */
  async fetchRedditStats(username: string): Promise<RedditStats | null> {
    try {
      // Reddit has an official API
      const response = await fetch(`${this.baseUrl}/external/reddit/${username}`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Reddit stats:', error);
      return null;
    }
  }

  /**
   * Fetch email statistics for email addresses
   */
  async fetchEmailStats(emailAddresses: string[]): Promise<EmailStats[]> {
    try {
      // This would require email API integration (Gmail, Outlook, etc.)
      const response = await fetch(`${this.baseUrl}/external/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: emailAddresses }),
      });
      
      if (!response.ok) return [];
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching email stats:', error);
      return [];
    }
  }

  /**
   * Fetch all external data for a user
   */
  async fetchUserExternalData(userData: {
    leetcodeUsername?: string;
    codeforcesUsername?: string;
    githubUsername?: string;
    redditUsername?: string;
    emailIds?: string[];
  }): Promise<UserExternalData> {
    const results: Partial<UserExternalData> = {
      lastUpdated: new Date(),
    };

    // Fetch data from all services in parallel
    const promises: Promise<void>[] = [];

    if (userData.leetcodeUsername) {
      promises.push(
        this.fetchLeetCodeStats(userData.leetcodeUsername).then(stats => {
          if (stats) results.leetcode = stats;
        })
      );
    }

    if (userData.codeforcesUsername) {
      promises.push(
        this.fetchCodeforcesStats(userData.codeforcesUsername).then(stats => {
          if (stats) results.codeforces = stats;
        })
      );
    }

    if (userData.githubUsername) {
      promises.push(
        this.fetchGitHubStats(userData.githubUsername).then(stats => {
          if (stats) results.github = stats;
        })
      );
    }

    if (userData.redditUsername) {
      promises.push(
        this.fetchRedditStats(userData.redditUsername).then(stats => {
          if (stats) results.reddit = stats;
        })
      );
    }

    if (userData.emailIds && userData.emailIds.length > 0) {
      promises.push(
        this.fetchEmailStats(userData.emailIds).then(stats => {
          if (stats.length > 0) results.emails = stats;
        })
      );
    }

    // Wait for all requests to complete
    await Promise.all(promises);

    return results as UserExternalData;
  }

  /**
   * Cache user external data (would typically store in database)
   */
  async cacheUserData(userId: string, data: UserExternalData): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/external/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, data }),
      });
    } catch (error) {
      console.error('Error caching external data:', error);
    }
  }

  /**
   * Get cached user external data
   */
  async getCachedUserData(userId: string): Promise<UserExternalData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/external/cache/${userId}`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error getting cached external data:', error);
      return null;
    }
  }
}

export const externalDataService = new ExternalDataService();
