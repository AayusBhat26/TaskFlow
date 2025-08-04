import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challenges = await db.challenge.findMany({
      where: { isActive: true },
      include: {
        userChallenges: {
          where: { userId: session.user.id },
          select: {
            id: true,
            progress: true,
            isCompleted: true,
            startedAt: true,
            completedAt: true
          }
        }
      },
      orderBy: [
        { type: 'asc' },
        { difficulty: 'asc' }
      ]
    });

    const challengesWithProgress = challenges.map(challenge => ({
      ...challenge,
      userProgress: challenge.userChallenges[0] || {
        progress: 0,
        isCompleted: false,
        startedAt: null,
        completedAt: null
      }
    }));

    return NextResponse.json(challengesWithProgress);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId } = await request.json();

    // Check if user already started this challenge
    const existingChallenge = await db.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId
        }
      }
    });

    if (existingChallenge) {
      return NextResponse.json(
        { error: 'Challenge already started' },
        { status: 400 }
      );
    }

    // Start the challenge
    const userChallenge = await db.userChallenge.create({
      data: {
        userId: session.user.id,
        challengeId,
        progress: 0,
        isCompleted: false
      }
    });

    return NextResponse.json(userChallenge);
  } catch (error) {
    console.error('Error starting challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
