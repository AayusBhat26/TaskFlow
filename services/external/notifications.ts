import { ExternalServicesData } from '@/services/external';

export interface ExternalNotification {
  id: string;
  type: 'leetcode' | 'codeforces' | 'github' | 'reddit' | 'email';
  title: string;
  message: string;
  url?: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
}

export class ExternalNotificationService {
  private static storageKey = 'external-notifications';

  static generateNotifications(
    currentData: ExternalServicesData,
    previousData?: ExternalServicesData | null
  ): ExternalNotification[] {
    const notifications: ExternalNotification[] = [];

    if (!previousData) {
      // First time data - welcome notifications
      if (currentData.leetcode) {
        notifications.push({
          id: `leetcode-welcome-${Date.now()}`,
          type: 'leetcode',
          title: 'LeetCode Connected! 🎉',
          message: `You have ${currentData.leetcode.totalSolved} problems solved. Keep it up!`,
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
          icon: '🧩'
        });
      }

      if (currentData.codeforces) {
        notifications.push({
          id: `codeforces-welcome-${Date.now()}`,
          type: 'codeforces',
          title: 'Codeforces Connected! 🚀',
          message: `Welcome ${currentData.codeforces.user.handle}! Rating: ${currentData.codeforces.user.rating}`,
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
          icon: '⚡'
        });
      }

      if (currentData.github) {
        notifications.push({
          id: `github-welcome-${Date.now()}`,
          type: 'github',
          title: 'GitHub Connected! 🐙',
          message: `${currentData.github.user.public_repos} repositories tracked. Current streak: ${currentData.github.currentStreak} days`,
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
          icon: '🐙'
        });
      }

      return notifications;
    }

    // Compare with previous data for changes
    
    // LeetCode notifications
    if (currentData.leetcode && previousData.leetcode) {
      const prevSolved = previousData.leetcode.totalSolved;
      const currentSolved = currentData.leetcode.totalSolved;
      
      if (currentSolved > prevSolved) {
        const newProblems = currentSolved - prevSolved;
        notifications.push({
          id: `leetcode-progress-${Date.now()}`,
          type: 'leetcode',
          title: 'LeetCode Progress! 🎯',
          message: `You solved ${newProblems} new problem${newProblems > 1 ? 's' : ''}! Total: ${currentSolved}`,
          timestamp: new Date(),
          isRead: false,
          priority: 'high',
          icon: '🎯'
        });
      }

      // Check for milestones
      const milestones = [50, 100, 200, 300, 500, 1000];
      const passedMilestone = milestones.find(m => prevSolved < m && currentSolved >= m);
      if (passedMilestone) {
        notifications.push({
          id: `leetcode-milestone-${passedMilestone}-${Date.now()}`,
          type: 'leetcode',
          title: 'LeetCode Milestone! 🏆',
          message: `Congratulations! You've reached ${passedMilestone} problems solved!`,
          timestamp: new Date(),
          isRead: false,
          priority: 'high',
          icon: '🏆'
        });
      }
    }

    // Codeforces notifications
    if (currentData.codeforces && previousData.codeforces) {
      const prevRating = previousData.codeforces.user.rating;
      const currentRating = currentData.codeforces.user.rating;
      
      if (currentRating > prevRating) {
        notifications.push({
          id: `codeforces-rating-${Date.now()}`,
          type: 'codeforces',
          title: 'Codeforces Rating Up! 📈',
          message: `Your rating increased from ${prevRating} to ${currentRating}! (+${currentRating - prevRating})`,
          timestamp: new Date(),
          isRead: false,
          priority: 'high',
          icon: '📈'
        });
      }

      const prevSolved = previousData.codeforces.solvedProblems;
      const currentSolved = currentData.codeforces.solvedProblems;
      
      if (currentSolved > prevSolved) {
        notifications.push({
          id: `codeforces-problems-${Date.now()}`,
          type: 'codeforces',
          title: 'Codeforces Progress! 🎯',
          message: `You solved ${currentSolved - prevSolved} new problem${currentSolved - prevSolved > 1 ? 's' : ''}!`,
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
          icon: '🎯'
        });
      }
    }

    // GitHub notifications
    if (currentData.github && previousData.github) {
      const prevStreak = previousData.github.currentStreak;
      const currentStreak = currentData.github.currentStreak;
      
      if (currentStreak > prevStreak && currentStreak % 7 === 0) {
        notifications.push({
          id: `github-streak-${Date.now()}`,
          type: 'github',
          title: 'GitHub Streak! 🔥',
          message: `Amazing! ${currentStreak}-day contribution streak!`,
          timestamp: new Date(),
          isRead: false,
          priority: 'high',
          icon: '🔥'
        });
      }

      const prevStars = previousData.github.totalStars;
      const currentStars = currentData.github.totalStars;
      
      if (currentStars > prevStars) {
        notifications.push({
          id: `github-stars-${Date.now()}`,
          type: 'github',
          title: 'GitHub Stars! ⭐',
          message: `Your repositories gained ${currentStars - prevStars} new star${currentStars - prevStars > 1 ? 's' : ''}!`,
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
          icon: '⭐'
        });
      }
    }

    // Reddit notifications
    if (currentData.reddit && previousData.reddit) {
      const prevKarma = previousData.reddit.totalKarma;
      const currentKarma = currentData.reddit.totalKarma;
      
      if (currentKarma > prevKarma + 10) { // Only notify for significant karma gains
        notifications.push({
          id: `reddit-karma-${Date.now()}`,
          type: 'reddit',
          title: 'Reddit Karma! 🎖️',
          message: `Your karma increased by ${currentKarma - prevKarma}! Total: ${currentKarma}`,
          timestamp: new Date(),
          isRead: false,
          priority: 'low',
          icon: '🎖️'
        });
      }
    }

    // Email notifications
    if (currentData.email && previousData.email) {
      const prevUnread = previousData.email.totalUnread;
      const currentUnread = currentData.email.totalUnread;
      
      if (currentUnread > prevUnread + 5) { // Only notify for significant email increases
        notifications.push({
          id: `email-unread-${Date.now()}`,
          type: 'email',
          title: 'New Emails! 📧',
          message: `You have ${currentUnread - prevUnread} new unread emails`,
          timestamp: new Date(),
          isRead: false,
          priority: 'medium',
          icon: '📧'
        });
      }

      if (currentUnread === 0 && prevUnread > 0) {
        notifications.push({
          id: `email-inbox-zero-${Date.now()}`,
          type: 'email',
          title: 'Inbox Zero! 🎉',
          message: 'Congratulations! You\'ve achieved inbox zero!',
          timestamp: new Date(),
          isRead: false,
          priority: 'high',
          icon: '🎉'
        });
      }
    }

    return notifications;
  }

  static saveNotifications(notifications: ExternalNotification[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  static getNotifications(): ExternalNotification[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  }

  static markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.saveNotifications(updated);
  }

  static markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
  }

  static deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(updated);
  }

  static clearOldNotifications(daysOld: number = 7): void {
    const notifications = this.getNotifications();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    
    const updated = notifications.filter(n => n.timestamp > cutoff);
    this.saveNotifications(updated);
  }

  static getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.isRead).length;
  }

  static getNotificationsByType(type: ExternalNotification['type']): ExternalNotification[] {
    const notifications = this.getNotifications();
    return notifications.filter(n => n.type === type);
  }

  static generateDailyReminders(): ExternalNotification[] {
    const notifications: ExternalNotification[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Morning coding reminder (9 AM)
    if (hour === 9) {
      notifications.push({
        id: `daily-coding-${now.toDateString()}`,
        type: 'leetcode',
        title: 'Daily Coding Challenge! 💻',
        message: 'Good morning! Ready to solve some problems today?',
        timestamp: now,
        isRead: false,
        priority: 'low',
        icon: '💻'
      });
    }

    // Evening review reminder (8 PM)
    if (hour === 20) {
      notifications.push({
        id: `daily-review-${now.toDateString()}`,
        type: 'github',
        title: 'Daily Review! 📊',
        message: 'How was your coding day? Check your progress!',
        timestamp: now,
        isRead: false,
        priority: 'low',
        icon: '📊'
      });
    }

    return notifications;
  }
}
