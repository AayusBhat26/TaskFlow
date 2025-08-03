import { google } from 'googleapis';
import axios from 'axios';

export interface EmailProvider {
  name: string;
  type: 'gmail' | 'outlook' | 'yahoo' | 'imap' | 'other';
  settings?: {
    host?: string;
    port?: number;
    secure?: boolean;
  };
}

export interface EmailSummary {
  provider: EmailProvider;
  totalEmails: number;
  unreadEmails: number;
  todayEmails: number;
  weekEmails: number;
  monthEmails: number;
  topSenders: Array<{
    email: string;
    name?: string;
    count: number;
  }>;
  categories: Record<string, number>;
  recentEmails: Array<{
    id: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
    isRead: boolean;
    isImportant?: boolean;
    labels?: string[];
  }>;
}

export interface EmailStats {
  emailSummaries: EmailSummary[];
  totalUnread: number;
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  mostActiveProvider: string;
  avgEmailsPerDay: number;
  topSenders: Array<{
    email: string;
    name?: string;
    count: number;
    provider: string;
  }>;
}

export class EmailService {
  private gmailService: any;

  constructor(private accessToken?: string) {
    if (accessToken) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      this.gmailService = google.gmail({ version: 'v1', auth });
    }
  }

  async getEmailStats(emailIds: string[]): Promise<EmailStats | null> {
    try {
      const emailSummaries: EmailSummary[] = [];

      for (const emailId of emailIds) {
        const provider = this.detectEmailProvider(emailId);
        let summary: EmailSummary | null = null;

        switch (provider.type) {
          case 'gmail':
            summary = await this.getGmailSummary(emailId, provider);
            break;
          case 'outlook':
            summary = await this.getOutlookSummary(emailId, provider);
            break;
          case 'yahoo':
            summary = await this.getYahooSummary(emailId, provider);
            break;
          default:
            summary = await this.getGenericEmailSummary(emailId, provider);
            break;
        }

        if (summary) {
          emailSummaries.push(summary);
        }
      }

      return this.aggregateEmailStats(emailSummaries);
    } catch (error) {
      console.error('Error fetching email stats:', error);
      return null;
    }
  }

  private detectEmailProvider(email: string): EmailProvider {
    const domain = email.split('@')[1]?.toLowerCase();

    switch (domain) {
      case 'gmail.com':
      case 'googlemail.com':
        return { name: 'Gmail', type: 'gmail' };
      case 'outlook.com':
      case 'hotmail.com':
      case 'live.com':
      case 'msn.com':
        return { name: 'Outlook', type: 'outlook' };
      case 'yahoo.com':
      case 'yahoo.co.uk':
      case 'yahoo.co.in':
        return { name: 'Yahoo', type: 'yahoo' };
      default:
        return {
          name: domain || 'Unknown',
          type: 'other',
          settings: {
            host: `imap.${domain}`,
            port: 993,
            secure: true
          }
        };
    }
  }

  private async getGmailSummary(email: string, provider: EmailProvider): Promise<EmailSummary | null> {
    try {
      if (!this.gmailService) {
        // Without OAuth, we can't access Gmail API
        // Return a mock summary or null
        return this.getMockEmailSummary(email, provider);
      }

      const [messages, profile] = await Promise.all([
        this.gmailService.users.messages.list({
          userId: 'me',
          maxResults: 100,
          q: 'newer_than:30d'
        }),
        this.gmailService.users.getProfile({ userId: 'me' })
      ]);

      const emailDetails = await Promise.all(
        (messages.data.messages || []).slice(0, 20).map(async (msg: any) => {
          const detail = await this.gmailService.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date']
          });

          const headers = detail.data.payload.headers;
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
          const from = headers.find((h: any) => h.name === 'From')?.value || '';
          const date = headers.find((h: any) => h.name === 'Date')?.value || '';

          return {
            id: msg.id,
            subject,
            from,
            date,
            snippet: detail.data.snippet || '',
            isRead: !detail.data.labelIds?.includes('UNREAD'),
            isImportant: detail.data.labelIds?.includes('IMPORTANT'),
            labels: detail.data.labelIds || []
          };
        })
      );

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const todayEmails = emailDetails.filter(email => 
        new Date(email.date) >= today
      ).length;

      const weekEmails = emailDetails.filter(email => 
        new Date(email.date) >= weekAgo
      ).length;

      const monthEmails = emailDetails.filter(email => 
        new Date(email.date) >= monthAgo
      ).length;

      const unreadEmails = emailDetails.filter(email => !email.isRead).length;

      // Analyze top senders
      const senderCounts: Record<string, number> = {};
      emailDetails.forEach(email => {
        const sender = email.from.split('<')[0].trim();
        senderCounts[sender] = (senderCounts[sender] || 0) + 1;
      });

      const topSenders = Object.entries(senderCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([email, count]) => ({ email, count }));

      return {
        provider,
        totalEmails: profile.data.messagesTotal || 0,
        unreadEmails,
        todayEmails,
        weekEmails,
        monthEmails,
        topSenders,
        categories: {
          'Primary': emailDetails.filter(e => e.labels?.includes('CATEGORY_PRIMARY')).length,
          'Social': emailDetails.filter(e => e.labels?.includes('CATEGORY_SOCIAL')).length,
          'Promotions': emailDetails.filter(e => e.labels?.includes('CATEGORY_PROMOTIONS')).length,
          'Updates': emailDetails.filter(e => e.labels?.includes('CATEGORY_UPDATES')).length,
          'Forums': emailDetails.filter(e => e.labels?.includes('CATEGORY_FORUMS')).length,
        },
        recentEmails: emailDetails.slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching Gmail data:', error);
      return this.getMockEmailSummary(email, provider);
    }
  }

  private async getOutlookSummary(email: string, provider: EmailProvider): Promise<EmailSummary | null> {
    try {
      // Microsoft Graph API would be used here with proper authentication
      // For now, return mock data
      return this.getMockEmailSummary(email, provider);
    } catch (error) {
      console.error('Error fetching Outlook data:', error);
      return this.getMockEmailSummary(email, provider);
    }
  }

  private async getYahooSummary(email: string, provider: EmailProvider): Promise<EmailSummary | null> {
    try {
      // Yahoo Mail API would be used here with proper authentication
      // For now, return mock data
      return this.getMockEmailSummary(email, provider);
    } catch (error) {
      console.error('Error fetching Yahoo data:', error);
      return this.getMockEmailSummary(email, provider);
    }
  }

  private async getGenericEmailSummary(email: string, provider: EmailProvider): Promise<EmailSummary | null> {
    try {
      // IMAP connection would be established here for generic email providers
      // For now, return mock data
      return this.getMockEmailSummary(email, provider);
    } catch (error) {
      console.error('Error fetching generic email data:', error);
      return this.getMockEmailSummary(email, provider);
    }
  }

  private getMockEmailSummary(email: string, provider: EmailProvider): EmailSummary {
    // Generate realistic mock data for demonstration
    const totalEmails = Math.floor(Math.random() * 10000) + 1000;
    const unreadEmails = Math.floor(Math.random() * 50) + 5;
    const todayEmails = Math.floor(Math.random() * 20) + 2;
    const weekEmails = Math.floor(Math.random() * 100) + 20;
    const monthEmails = Math.floor(Math.random() * 400) + 100;

    return {
      provider,
      totalEmails,
      unreadEmails,
      todayEmails,
      weekEmails,
      monthEmails,
      topSenders: [
        { email: 'noreply@github.com', name: 'GitHub', count: 15 },
        { email: 'notifications@linkedin.com', name: 'LinkedIn', count: 12 },
        { email: 'noreply@stackoverflow.com', name: 'Stack Overflow', count: 8 },
        { email: 'updates@medium.com', name: 'Medium', count: 6 },
        { email: 'team@vercel.com', name: 'Vercel', count: 4 }
      ],
      categories: {
        'Primary': Math.floor(totalEmails * 0.4),
        'Social': Math.floor(totalEmails * 0.2),
        'Promotions': Math.floor(totalEmails * 0.25),
        'Updates': Math.floor(totalEmails * 0.1),
        'Forums': Math.floor(totalEmails * 0.05)
      },
      recentEmails: [
        {
          id: '1',
          subject: 'Welcome to TaskFlow!',
          from: 'welcome@taskflow.com',
          date: new Date().toISOString(),
          snippet: 'Thank you for joining TaskFlow. Get started with your productivity journey...',
          isRead: false
        },
        {
          id: '2',
          subject: 'Your GitHub activity summary',
          from: 'noreply@github.com',
          date: new Date(Date.now() - 3600000).toISOString(),
          snippet: 'Here is your weekly GitHub activity summary...',
          isRead: true
        }
      ]
    };
  }

  private aggregateEmailStats(emailSummaries: EmailSummary[]): EmailStats {
    const totalUnread = emailSummaries.reduce((sum, summary) => sum + summary.unreadEmails, 0);
    const totalToday = emailSummaries.reduce((sum, summary) => sum + summary.todayEmails, 0);
    const totalWeek = emailSummaries.reduce((sum, summary) => sum + summary.weekEmails, 0);
    const totalMonth = emailSummaries.reduce((sum, summary) => sum + summary.monthEmails, 0);

    const mostActiveProvider = emailSummaries.reduce((max, summary) => 
      summary.totalEmails > max.totalEmails ? summary : max
    ).provider.name;

    const avgEmailsPerDay = totalMonth / 30;

    // Aggregate top senders across all providers
    const allSenders: Record<string, { count: number; provider: string; name?: string }> = {};
    
    emailSummaries.forEach(summary => {
      summary.topSenders.forEach(sender => {
        const key = sender.email;
        if (!allSenders[key]) {
          allSenders[key] = { count: 0, provider: summary.provider.name, name: sender.name };
        }
        allSenders[key].count += sender.count;
      });
    });

    const topSenders = Object.entries(allSenders)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([email, data]) => ({
        email,
        name: data.name,
        count: data.count,
        provider: data.provider
      }));

    return {
      emailSummaries,
      totalUnread,
      totalToday,
      totalWeek,
      totalMonth,
      mostActiveProvider,
      avgEmailsPerDay,
      topSenders
    };
  }
}
