import axios from 'axios';

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  bio?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language?: string;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export interface GitHubContribution {
  date: string;
  count: number;
  level: number;
}

export interface GitHubStats {
  user: GitHubUser;
  repositories: GitHubRepository[];
  recentCommits: GitHubCommit[];
  contributions: GitHubContribution[];
  languageStats: Record<string, number>;
  totalCommits: number;
  totalStars: number;
  totalForks: number;
  streakDays: number;
  longestStreak: number;
  currentStreak: number;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private getHeaders() {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json'
    } : {
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  async getUserStats(username: string): Promise<GitHubStats | null> {
    try {
      const [user, repositories, contributions] = await Promise.all([
        this.getUserInfo(username),
        this.getUserRepositories(username),
        this.getContributions(username)
      ]);

      if (!user) return null;

      const recentCommits = await this.getRecentCommits(username, repositories?.slice(0, 5) || []);
      const languageStats = await this.getLanguageStats(username, repositories || []);
      const streakData = this.calculateStreaks(contributions || []);

      return {
        user,
        repositories: repositories || [],
        recentCommits: recentCommits || [],
        contributions: contributions || [],
        languageStats,
        totalCommits: contributions?.reduce((sum, day) => sum + day.count, 0) || 0,
        totalStars: repositories?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0,
        totalForks: repositories?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0,
        streakDays: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        currentStreak: streakData.currentStreak,
      };
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      return null;
    }
  }

  private async getUserInfo(username: string): Promise<GitHubUser | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      return null;
    }
  }

  private async getUserRepositories(username: string): Promise<GitHubRepository[] | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/repos`, {
        headers: this.getHeaders(),
        params: {
          sort: 'updated',
          per_page: 50,
          type: 'owner'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return null;
    }
  }

  private async getRecentCommits(username: string, repositories: GitHubRepository[]): Promise<GitHubCommit[]> {
    try {
      const commitPromises = repositories.map(async (repo) => {
        try {
          const response = await axios.get(`${this.baseUrl}/repos/${repo.full_name}/commits`, {
            headers: this.getHeaders(),
            params: {
              author: username,
              per_page: 5
            }
          });
          return response.data.map((commit: any) => ({
            ...commit,
            repository: repo.name
          }));
        } catch (error) {
          return [];
        }
      });

      const allCommits = await Promise.all(commitPromises);
      return allCommits.flat().slice(0, 20);
    } catch (error) {
      console.error('Error fetching recent commits:', error);
      return [];
    }
  }

  private async getContributions(username: string): Promise<GitHubContribution[] | null> {
    try {
      // This would typically require scraping GitHub's contribution graph
      // or using GitHub's GraphQL API with authentication
      // For now, we'll return a mock structure
      const contributions: GitHubContribution[] = [];
      const today = new Date();
      
      for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        contributions.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10), // Mock data
          level: Math.floor(Math.random() * 5)
        });
      }
      
      return contributions;
    } catch (error) {
      console.error('Error fetching contributions:', error);
      return null;
    }
  }

  private async getLanguageStats(username: string, repositories: GitHubRepository[]): Promise<Record<string, number>> {
    try {
      const languageStats: Record<string, number> = {};

      const languagePromises = repositories.map(async (repo) => {
        try {
          const response = await axios.get(`${this.baseUrl}/repos/${repo.full_name}/languages`, {
            headers: this.getHeaders()
          });
          
          Object.entries(response.data).forEach(([language, bytes]) => {
            languageStats[language] = (languageStats[language] || 0) + (bytes as number);
          });
        } catch (error) {
          // Skip if we can't fetch language data for this repo
        }
      });

      await Promise.all(languagePromises);
      return languageStats;
    } catch (error) {
      console.error('Error fetching language stats:', error);
      return {};
    }
  }

  private calculateStreaks(contributions: GitHubContribution[]) {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate from most recent date backwards
    const sortedContributions = contributions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < sortedContributions.length; i++) {
      const contribution = sortedContributions[i];
      
      if (contribution.count > 0) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak; // Current streak from today
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (i === 0) currentStreak = 0; // No activity today
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    return { currentStreak, longestStreak };
  }

  async getNotifications(username: string): Promise<any[]> {
    try {
      if (!this.token) return [];

      const response = await axios.get(`${this.baseUrl}/notifications`, {
        headers: this.getHeaders(),
        params: {
          participating: true,
          per_page: 20
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub notifications:', error);
      return [];
    }
  }
}
