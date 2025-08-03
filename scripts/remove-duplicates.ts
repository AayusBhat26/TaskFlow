import { db } from '../lib/db';

async function removeDuplicateQuestions() {
  console.log('=== Removing Duplicate Questions ===');
  
  // Get all curated questions
  const curatedQuestions = await db.dSAQuestion.findMany({
    where: { isImported: false },
    select: { id: true, title: true, topic: true, description: true },
    orderBy: { createdAt: 'asc' } // Keep the first created one
  });
  
  // Group by title to find duplicates
  const titleGroups: Record<string, typeof curatedQuestions> = {};
  curatedQuestions.forEach(q => {
    if (!titleGroups[q.title]) {
      titleGroups[q.title] = [];
    }
    titleGroups[q.title].push(q);
  });
  
  // Find and remove duplicates (keep the first one, remove the rest)
  const duplicatesToRemove: string[] = [];
  const questionsKept: Array<{title: string, keepId: string, removedIds: string[]}> = [];
  
  Object.entries(titleGroups).forEach(([title, questions]) => {
    if (questions.length > 1) {
      const keepQuestion = questions[0]; // Keep the first one (earliest created)
      const duplicateQuestions = questions.slice(1); // Remove the rest
      
      duplicatesToRemove.push(...duplicateQuestions.map(q => q.id));
      questionsKept.push({
        title,
        keepId: keepQuestion.id,
        removedIds: duplicateQuestions.map(q => q.id)
      });
      
      console.log(`\n"${title}": Keeping ${keepQuestion.topic} (${keepQuestion.id}), removing ${duplicateQuestions.map(q => q.topic).join(', ')}`);
    }
  });
  
  if (duplicatesToRemove.length === 0) {
    console.log('No duplicates found to remove.');
    return;
  }
  
  console.log(`\nFound ${duplicatesToRemove.length} duplicate questions to remove.`);
  
  // First, we need to handle any progress records that might reference these duplicate questions
  console.log('\nChecking for progress records on duplicate questions...');
  
  const progressOnDuplicates = await db.dSAProgress.findMany({
    where: {
      questionId: {
        in: duplicatesToRemove
      }
    },
    include: {
      question: {
        select: { title: true, topic: true }
      }
    }
  });
  
  if (progressOnDuplicates.length > 0) {
    console.log(`Found ${progressOnDuplicates.length} progress records on duplicate questions.`);
    
    // For each progress record on a duplicate, check if there's already progress on the kept question
    for (const progress of progressOnDuplicates) {
      const questionTitle = progress.question.title;
      const keptQuestion = questionsKept.find(q => q.title === questionTitle);
      
      if (keptQuestion) {
        // Check if user already has progress on the kept question
        const existingProgress = await db.dSAProgress.findUnique({
          where: {
            userId_questionId: {
              userId: progress.userId,
              questionId: keptQuestion.keepId
            }
          }
        });
        
        if (existingProgress) {
          console.log(`User already has progress on kept question "${questionTitle}", removing duplicate progress.`);
          await db.dSAProgress.delete({
            where: { id: progress.id }
          });
        } else {
          console.log(`Moving progress from duplicate to kept question for "${questionTitle}".`);
          await db.dSAProgress.update({
            where: { id: progress.id },
            data: { questionId: keptQuestion.keepId }
          });
        }
      }
    }
  }
  
  // Now remove the duplicate questions
  console.log(`\nRemoving ${duplicatesToRemove.length} duplicate questions...`);
  const deletedCount = await db.dSAQuestion.deleteMany({
    where: {
      id: {
        in: duplicatesToRemove
      }
    }
  });
  
  console.log(`Successfully removed ${deletedCount.count} duplicate questions.`);
  
  // Verify the results
  console.log('\n=== Verification ===');
  const remainingQuestions = await db.dSAQuestion.count({
    where: { isImported: false }
  });
  
  console.log(`Remaining curated questions: ${remainingQuestions}`);
  
  // Check topics again
  const topicsAfter = await db.dSAQuestion.groupBy({
    by: ['topic'],
    where: { isImported: false },
    _count: { topic: true }
  });
  
  console.log('\nTopics after cleanup:');
  topicsAfter.forEach(topic => {
    console.log(`${topic.topic}: ${topic._count.topic} questions`);
  });
}

removeDuplicateQuestions().catch(console.error).finally(() => process.exit(0));
