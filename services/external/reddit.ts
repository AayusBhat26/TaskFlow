import axios from 'axios';

export interface RedditUser {
  name: string;
  id: string;
  created: number;
  created_utc: number;
  link_karma: number;
  comment_karma: number;
  total_karma: number;
  is_gold: boolean;
  is_mod: boolean;
  has_verified_email: boolean;
  icon_img: string;
  subreddit: {
    display_name: string;
    title: string;
    icon_img: string;
    subscribers: number;
  };
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  score: number;
  ups: number;
  downs: number;
  upvote_ratio: number;
  num_comments: number;
  created: number;
  created_utc: number;
  url: string;
  permalink: string;
  is_self: boolean;
  thumbnail: string;
  post_hint?: string;
  domain: string;
  gilded: number;
  stickied: boolean;
  locked: boolean;
  archived: boolean;
}

export interface RedditComment {
  id: string;
  body: string;
  body_html: string;
  author: string;
  subreddit: string;
  score: number;
  ups: number;
  downs: number;
  created: number;
  created_utc: number;
  permalink: string;
  parent_id: string;
  link_id: string;
  link_title: string;
  link_permalink: string;
  gilded: number;
  stickied: boolean;
  distinguished?: string;
}

export interface RedditStats {
  user: RedditUser;
  recentPosts: RedditPost[];
  recentComments: RedditComment[];
  postKarma: number;
  commentKarma: number;
  totalKarma: number;
  accountAge: number;
  postsCount: number;
  commentsCount: number;
  topSubreddits: Record<string, number>;
  avgPostScore: number;
  avgCommentScore: number;
  mostPopularPost: RedditPost | null;
  mostPopularComment: RedditComment | null;
}

export class RedditService {
  private baseUrl = 'https://www.reddit.com';
  private userAgent = 'TaskFlow/1.0';

  async getUserStats(username: string): Promise<RedditStats | null> {
    try {
      const [userInfo, posts, comments] = await Promise.all([
        this.getUserInfo(username),
        this.getUserPosts(username),
        this.getUserComments(username)
      ]);

      if (!userInfo) return null;

      const stats = this.analyzeActivity(posts || [], comments || []);

      return {
        user: userInfo,
        recentPosts: (posts || []).slice(0, 10),
        recentComments: (comments || []).slice(0, 20),
        postKarma: userInfo.link_karma,
        commentKarma: userInfo.comment_karma,
        totalKarma: userInfo.total_karma,
        accountAge: Math.floor((Date.now() / 1000 - userInfo.created_utc) / (24 * 60 * 60)),
        postsCount: posts?.length || 0,
        commentsCount: comments?.length || 0,
        topSubreddits: stats.topSubreddits,
        avgPostScore: stats.avgPostScore,
        avgCommentScore: stats.avgCommentScore,
        mostPopularPost: stats.mostPopularPost,
        mostPopularComment: stats.mostPopularComment,
      };
    } catch (error) {
      console.error('Error fetching Reddit data:', error);
      return null;
    }
  }

  private async getUserInfo(username: string): Promise<RedditUser | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}/about.json`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.data?.data) return null;

      return {
        ...response.data.data,
        total_karma: response.data.data.link_karma + response.data.data.comment_karma
      };
    } catch (error) {
      console.error('Error fetching Reddit user info:', error);
      return null;
    }
  }

  private async getUserPosts(username: string): Promise<RedditPost[] | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}/submitted.json`, {
        headers: {
          'User-Agent': this.userAgent
        },
        params: {
          limit: 100,
          sort: 'new'
        }
      });

      if (!response.data?.data?.children) return null;

      return response.data.data.children.map((child: any) => ({
        ...child.data,
        permalink: `${this.baseUrl}${child.data.permalink}`
      }));
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      return null;
    }
  }

  private async getUserComments(username: string): Promise<RedditComment[] | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${username}/comments.json`, {
        headers: {
          'User-Agent': this.userAgent
        },
        params: {
          limit: 100,
          sort: 'new'
        }
      });

      if (!response.data?.data?.children) return null;

      return response.data.data.children.map((child: any) => ({
        ...child.data,
        permalink: `${this.baseUrl}${child.data.permalink}`,
        link_permalink: `${this.baseUrl}${child.data.link_permalink}`
      }));
    } catch (error) {
      console.error('Error fetching Reddit comments:', error);
      return null;
    }
  }

  private analyzeActivity(posts: RedditPost[], comments: RedditComment[]) {
    const topSubreddits: Record<string, number> = {};
    
    // Analyze posts
    posts.forEach(post => {
      topSubreddits[post.subreddit] = (topSubreddits[post.subreddit] || 0) + 1;
    });

    // Analyze comments
    comments.forEach(comment => {
      topSubreddits[comment.subreddit] = (topSubreddits[comment.subreddit] || 0) + 1;
    });

    // Calculate averages
    const avgPostScore = posts.length > 0 
      ? posts.reduce((sum, post) => sum + post.score, 0) / posts.length 
      : 0;

    const avgCommentScore = comments.length > 0 
      ? comments.reduce((sum, comment) => sum + comment.score, 0) / comments.length 
      : 0;

    // Find most popular content
    const mostPopularPost = posts.length > 0 
      ? posts.reduce((max, post) => post.score > max.score ? post : max)
      : null;

    const mostPopularComment = comments.length > 0 
      ? comments.reduce((max, comment) => comment.score > max.score ? comment : max)
      : null;

    return {
      topSubreddits,
      avgPostScore,
      avgCommentScore,
      mostPopularPost,
      mostPopularComment
    };
  }

  async getSubredditInfo(subreddit: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/r/${subreddit}/about.json`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching subreddit info:', error);
      return null;
    }
  }

  async getHotPosts(subreddit: string, limit = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/r/${subreddit}/hot.json`, {
        headers: {
          'User-Agent': this.userAgent
        },
        params: { limit }
      });

      if (!response.data?.data?.children) return [];

      return response.data.data.children.map((child: any) => ({
        ...child.data,
        permalink: `${this.baseUrl}${child.data.permalink}`
      }));
    } catch (error) {
      console.error('Error fetching hot posts:', error);
      return [];
    }
  }
}
