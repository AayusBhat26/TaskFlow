import { NextRequest, NextResponse } from 'next/server';
import { CodeforcesService } from '@/services/external/codeforces';

interface SolvedQuestion {
  id: string;
  title: string;
  number?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  solvedDate: string;
  url: string;
  platform: 'codeforces';
  rating?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { codeforcesUsername } = await request.json();

    if (!codeforcesUsername) {
      return NextResponse.json(
        { error: 'Codeforces username must be provided' },
        { status: 400 }
      );
    }

    const codeforcesService = new CodeforcesService();
    const codeforcesData = await codeforcesService.getUserStats(codeforcesUsername);

    // Transform Codeforces submissions to our format
    const codeforcesQuestions: SolvedQuestion[] = codeforcesData?.recentSubmissions
      ?.filter(submission => submission.verdict === 'OK')
      .map(submission => ({
        id: `${submission.problem.contestId}-${submission.problem.index}`,
        title: submission.problem.name,
        difficulty: getRatingDifficulty(submission.problem.rating || 800),
        topics: submission.problem.tags || ['General'],
        solvedDate: new Date(submission.creationTimeSeconds * 1000).toISOString(),
        url: `https://codeforces.com/problemset/problem/${submission.problem.contestId}/${submission.problem.index}`,
        platform: 'codeforces' as const,
        rating: submission.problem.rating,
      })) || [];

    // Remove duplicates and sort by solve date
    const uniqueCodeforcesQuestions = removeDuplicates(codeforcesQuestions, 'id');

    const response = {
      codeforces: uniqueCodeforcesQuestions.sort((a, b) => 
        new Date(b.solvedDate).getTime() - new Date(a.solvedDate).getTime()
      ),
      lastUpdated: new Date().toISOString(),
      stats: {
        totalSolved: uniqueCodeforcesQuestions.length,
        codeforcesCount: uniqueCodeforcesQuestions.length,
        topicsCount: new Set(uniqueCodeforcesQuestions.flatMap(q => q.topics)).size,
        difficultyBreakdown: {
          easy: uniqueCodeforcesQuestions.filter(q => q.difficulty === 'Easy').length,
          medium: uniqueCodeforcesQuestions.filter(q => q.difficulty === 'Medium').length,
          hard: uniqueCodeforcesQuestions.filter(q => q.difficulty === 'Hard').length,
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching solved questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solved questions' },
      { status: 500 }
    );
  }
}

function getRatingDifficulty(rating: number): 'Easy' | 'Medium' | 'Hard' {
  if (rating <= 1200) return 'Easy';
  if (rating <= 1600) return 'Medium';
  return 'Hard';
}

function removeDuplicates<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}
