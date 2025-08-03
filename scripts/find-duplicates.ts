import { db } from '../lib/db';

async function findDuplicates() {
  console.log('=== Finding Duplicate Questions ===');
  
  // Get all curated questions
  const curatedQuestions = await db.dSAQuestion.findMany({
    where: { isImported: false },
    select: { id: true, title: true, topic: true, description: true }
  });
  
  // Group by title to find duplicates
  const titleGroups: Record<string, typeof curatedQuestions> = {};
  curatedQuestions.forEach(q => {
    if (!titleGroups[q.title]) {
      titleGroups[q.title] = [];
    }
    titleGroups[q.title].push(q);
  });
  
  // Find titles with multiple questions
  const duplicates = Object.entries(titleGroups).filter(([title, questions]) => questions.length > 1);
  
  if (duplicates.length > 0) {
    console.log('Duplicate questions found:');
    duplicates.forEach(([title, questions]) => {
      console.log(`\n"${title}" appears ${questions.length} times:`);
      questions.forEach(q => {
        console.log(`  ID: ${q.id}, Topic: ${q.topic}`);
      });
    });
  } else {
    console.log('No duplicate questions found by title.');
  }
  
  // Also check for questions with same description
  const descGroups: Record<string, typeof curatedQuestions> = {};
  curatedQuestions.forEach(q => {
    const desc = q.description || '';
    if (desc && desc.length > 10) { // Only check meaningful descriptions
      if (!descGroups[desc]) {
        descGroups[desc] = [];
      }
      descGroups[desc].push(q);
    }
  });
  
  const descDuplicates = Object.entries(descGroups).filter(([desc, questions]) => questions.length > 1);
  
  if (descDuplicates.length > 0) {
    console.log('\nDuplicate questions found by description:');
    descDuplicates.forEach(([desc, questions]) => {
      console.log(`\nDescription: "${desc.substring(0, 100)}..." appears ${questions.length} times:`);
      questions.forEach(q => {
        console.log(`  ID: ${q.id}, Title: ${q.title}, Topic: ${q.topic}`);
      });
    });
  } else {
    console.log('No duplicate questions found by description.');
  }
}

findDuplicates().catch(console.error).finally(() => process.exit(0));
