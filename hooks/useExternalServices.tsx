import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ExternalServicesData } from '@/services/external';

export interface UseExternalServicesOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useExternalServices = (options: UseExternalServicesOptions = {}) => {
  const { enabled = true, refetchInterval = 5 * 60 * 1000 } = options; // 5 minutes default
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['external-services'],
    queryFn: async (): Promise<{ data: ExternalServicesData | null; insights: string[]; dailyDigest: any }> => {
      const response = await axios.get('/api/external-services');
      return response.data;
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.get('/api/external-services');
      return response.data;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(['external-services'], newData);
    },
  });

  const fetchSpecificService = useMutation({
    mutationFn: async ({ service, username }: { service: string; username: string }) => {
      const response = await axios.post('/api/external-services', { service, username });
      return response.data;
    },
  });

  const refreshData = () => {
    refreshMutation.mutate();
  };

  const fetchServiceData = (service: string, username: string) => {
    return fetchSpecificService.mutateAsync({ service, username });
  };

  const hasData = data?.data !== null && data?.data !== undefined;
  
  const shouldShowEmptyState = !isLoading && !hasData && !error;

  return {
    data: data?.data,
    insights: data?.insights || [],
    dailyDigest: data?.dailyDigest,
    isLoading,
    isRefetching: isRefetching || refreshMutation.isPending,
    error,
    hasData,
    shouldShowEmptyState,
    refetch,
    refreshData,
    fetchServiceData,
    isFetchingSpecific: fetchSpecificService.isPending,
  };
};

export const useExternalServiceValidation = () => {
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateService = async (service: string, username: string): Promise<boolean> => {
    setIsValidating(true);
    try {
      const response = await axios.post('/api/external-services', { service, username });
      const isValid = response.data.success && response.data.data !== null;
      
      setValidationResults(prev => ({
        ...prev,
        [`${service}-${username}`]: isValid
      }));
      
      return isValid;
    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        [`${service}-${username}`]: false
      }));
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validateAllServices = async (services: Record<string, string>) => {
    setIsValidating(true);
    const results: Record<string, boolean> = {};
    
    for (const [service, username] of Object.entries(services)) {
      if (username) {
        try {
          const response = await axios.post('/api/external-services', { service, username });
          results[`${service}-${username}`] = response.data.success && response.data.data !== null;
        } catch (error) {
          results[`${service}-${username}`] = false;
        }
      }
    }
    
    setValidationResults(results);
    setIsValidating(false);
    return results;
  };

  const getValidationStatus = (service: string, username: string): boolean | undefined => {
    return validationResults[`${service}-${username}`];
  };

  return {
    validateService,
    validateAllServices,
    getValidationStatus,
    isValidating,
    validationResults,
  };
};

export const useExternalServiceInsights = (data: ExternalServicesData | null | undefined) => {
  const [insights, setInsights] = useState<{
    achievements: string[];
    recommendations: string[];
    trends: string[];
    goals: string[];
  }>({
    achievements: [],
    recommendations: [],
    trends: [],
    goals: []
  });

  useEffect(() => {
    if (!data) {
      setInsights({ achievements: [], recommendations: [], trends: [], goals: [] });
      return;
    }

    const achievements: string[] = [];
    const recommendations: string[] = [];
    const trends: string[] = [];
    const goals: string[] = [];

    // LeetCode insights
    if (data.leetcode) {
      const { totalSolved, easySolved, mediumSolved, hardSolved } = data.leetcode;
      
      if (totalSolved >= 100) {
        achievements.push(`🎉 You've solved ${totalSolved} LeetCode problems!`);
      }
      
      if (hardSolved > 0) {
        achievements.push(`💪 You've conquered ${hardSolved} hard problems on LeetCode!`);
      }

      const nextMilestone = Math.ceil(totalSolved / 50) * 50;
      if (nextMilestone > totalSolved) {
        goals.push(`🎯 Solve ${nextMilestone - totalSolved} more problems to reach ${nextMilestone} on LeetCode`);
      }

      if (easySolved > mediumSolved + hardSolved) {
        recommendations.push("📈 Consider tackling more medium and hard problems to improve your skills");
      }
    }

    // Codeforces insights
    if (data.codeforces) {
      const { user, solvedProblems, contestsParticipated } = data.codeforces;
      
      if (user.rating >= 1200) {
        achievements.push(`⭐ You're rated ${user.rating} on Codeforces (${user.rank})!`);
      }
      
      if (contestsParticipated >= 10) {
        achievements.push(`🏆 You've participated in ${contestsParticipated} Codeforces contests!`);
      }

      if (contestsParticipated < 5) {
        recommendations.push("🚀 Participate in more Codeforces contests to improve your rating");
      }

      goals.push(`🎯 Solve ${Math.max(50 - (solvedProblems % 50), 1)} more problems to reach your next 50-problem milestone`);
    }

    // GitHub insights
    if (data.github) {
      const { user, totalStars, currentStreak, longestStreak } = data.github;
      
      if (totalStars >= 10) {
        achievements.push(`⭐ Your repositories have earned ${totalStars} stars!`);
      }
      
      if (currentStreak >= 7) {
        achievements.push(`🔥 ${currentStreak}-day GitHub contribution streak!`);
      }

      if (currentStreak === 0) {
        recommendations.push("💻 Make a commit today to start a new contribution streak");
      }

      if (user.public_repos >= 10) {
        achievements.push(`📦 You've created ${user.public_repos} public repositories!`);
      }

      trends.push(`📊 Your longest contribution streak was ${longestStreak} days`);
    }

    // Reddit insights
    if (data.reddit) {
      const { totalKarma, postsCount, commentsCount } = data.reddit;
      
      if (totalKarma >= 1000) {
        achievements.push(`🏅 You have ${totalKarma.toLocaleString()} total karma on Reddit!`);
      }
      
      if (postsCount >= 50) {
        achievements.push(`📝 You've made ${postsCount} posts on Reddit!`);
      }

      const engagement = commentsCount / Math.max(postsCount, 1);
      if (engagement > 5) {
        trends.push("💬 You're very active in Reddit discussions");
      }
    }

    // Email insights
    if (data.email) {
      const { totalUnread, avgEmailsPerDay } = data.email;
      
      if (totalUnread === 0) {
        achievements.push("📧 Inbox Zero achieved!");
      } else if (totalUnread > 50) {
        recommendations.push(`📥 You have ${totalUnread} unread emails - consider organizing your inbox`);
      }

      if (avgEmailsPerDay > 50) {
        trends.push("📈 You receive a high volume of emails daily");
        recommendations.push("🔧 Consider setting up email filters to manage your inbox better");
      }
    }

    setInsights({ achievements, recommendations, trends, goals });
  }, [data]);

  return insights;
};
