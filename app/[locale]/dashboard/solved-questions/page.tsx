import { Suspense } from 'react';
import { SolvedQuestionsContainer } from '../../../../components/solved-questions/SolvedQuestionsContainer';
import { checkIfUserCompletedOnboarding } from '@/lib/checkIfUserCompletedOnboarding';
import { db } from '@/lib/db';

export default async function SolvedQuestionsPage() {
  const session = await checkIfUserCompletedOnboarding("/dashboard/solved-questions");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      codeforcesUsername: true,
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Solved Questions</h1>
        <p className="text-muted-foreground">
          View all your solved problems from Codeforces, organized by topics
        </p>
      </div>
      
      <Suspense fallback={<div>Loading solved questions...</div>}>
        <SolvedQuestionsContainer 
          codeforcesUsername={user?.codeforcesUsername || null}
        />
      </Suspense>
    </div>
  );
}
