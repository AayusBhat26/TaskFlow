import { db } from '../lib/db';
import { normalizeTopicName } from '../lib/topicNormalization';

async function normalizeExistingTopics() {
  console.log('=== Normalizing Existing Topic Names ===');
  
  // Get all imported questions
  const importedQuestions = await db.dSAQuestion.findMany({
    where: { isImported: true },
    select: { id: true, topic: true, title: true }
  });
  
  console.log(`Found ${importedQuestions.length} imported questions to normalize`);
  
  if (importedQuestions.length === 0) {
    console.log('No imported questions found.');
    return;
  }
  
  const updates: Array<{ id: string, oldTopic: string, newTopic: string }> = [];
  
  // Check what needs to be updated
  for (const question of importedQuestions) {
    const normalizedTopic = normalizeTopicName(question.topic);
    if (normalizedTopic !== question.topic) {
      updates.push({
        id: question.id,
        oldTopic: question.topic,
        newTopic: normalizedTopic
      });
    }
  }
  
  console.log(`\nFound ${updates.length} questions that need topic normalization:`);
  
  // Group by topic change for cleaner output
  const topicChanges: Record<string, string[]> = {};
  updates.forEach(update => {
    const key = `${update.oldTopic} → ${update.newTopic}`;
    if (!topicChanges[key]) {
      topicChanges[key] = [];
    }
    topicChanges[key].push(update.id);
  });
  
  Object.entries(topicChanges).forEach(([change, ids]) => {
    console.log(`  ${change}: ${ids.length} questions`);
  });
  
  if (updates.length === 0) {
    console.log('All topics are already normalized.');
    return;
  }
  
  // Apply updates
  console.log(`\nUpdating ${updates.length} questions...`);
  
  let updatedCount = 0;
  for (const update of updates) {
    try {
      await db.dSAQuestion.update({
        where: { id: update.id },
        data: { topic: update.newTopic }
      });
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount}/${updates.length} questions...`);
      }
    } catch (error) {
      console.error(`Failed to update question ${update.id}:`, error);
    }
  }
  
  console.log(`\nSuccessfully updated ${updatedCount} questions.`);
  
  // Show final topic distribution
  console.log('\n=== Final Topic Distribution ===');
  
  const curatedTopics = await db.dSAQuestion.groupBy({
    by: ['topic'],
    where: { isImported: false },
    _count: { topic: true }
  });
  
  const importedTopics = await db.dSAQuestion.groupBy({
    by: ['topic'],
    where: { isImported: true },
    _count: { topic: true }
  });
  
  console.log('\nCurated questions by topic:');
  curatedTopics.forEach(topic => {
    console.log(`  ${topic.topic}: ${topic._count.topic} questions`);
  });
  
  console.log('\nImported questions by topic (after normalization):');
  importedTopics.forEach(topic => {
    console.log(`  ${topic.topic}: ${topic._count.topic} questions`);
  });
  
  // Check for any potential duplicates that might need consolidation
  console.log('\n=== Checking for Duplicate Questions After Normalization ===');
  
  const allQuestions = await db.dSAQuestion.findMany({
    select: { id: true, title: true, topic: true, isImported: true }
  });
  
  const titleGroups: Record<string, typeof allQuestions> = {};
  allQuestions.forEach(q => {
    const key = `${q.title.toLowerCase().trim()}`;
    if (!titleGroups[key]) {
      titleGroups[key] = [];
    }
    titleGroups[key].push(q);
  });
  
  const duplicatesByTitle = Object.entries(titleGroups).filter(([title, questions]) => questions.length > 1);
  
  if (duplicatesByTitle.length > 0) {
    console.log(`Found ${duplicatesByTitle.length} potential duplicate questions by title:`);
    duplicatesByTitle.slice(0, 5).forEach(([title, questions]) => {
      console.log(`  "${title}" (${questions.length} instances):`);
      questions.forEach(q => {
        console.log(`    - ${q.topic} (${q.isImported ? 'imported' : 'curated'})`);
      });
    });
    
    if (duplicatesByTitle.length > 5) {
      console.log(`  ... and ${duplicatesByTitle.length - 5} more`);
    }
  } else {
    console.log('No duplicate questions found by title.');
  }
}

normalizeExistingTopics().catch(console.error).finally(() => process.exit(0));
