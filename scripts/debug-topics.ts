import { db } from '../lib/db';

async function debugTopics() {
  console.log('=== Debugging DSA Topics ===');
  
  // Check all questions by isImported status
  const curatedQuestions = await db.dSAQuestion.findMany({
    where: { isImported: false },
    select: { topic: true, title: true, isImported: true }
  });
  
  const importedQuestions = await db.dSAQuestion.findMany({
    where: { isImported: true },
    select: { topic: true, title: true, isImported: true }
  });
  
  console.log(`Total curated questions: ${curatedQuestions.length}`);
  console.log(`Total imported questions: ${importedQuestions.length}`);
  
  // Group curated questions by topic
  const curatedTopics: Record<string, number> = {};
  curatedQuestions.forEach(q => {
    curatedTopics[q.topic] = (curatedTopics[q.topic] || 0) + 1;
  });
  
  // Group imported questions by topic
  const importedTopics: Record<string, number> = {};
  importedQuestions.forEach(q => {
    importedTopics[q.topic] = (importedTopics[q.topic] || 0) + 1;
  });
  
  console.log('\n=== Curated Questions by Topic ===');
  Object.entries(curatedTopics)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([topic, count]) => {
      console.log(`${topic}: ${count} questions`);
    });
  
  console.log('\n=== Imported Questions by Topic ===');
  Object.entries(importedTopics)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([topic, count]) => {
      console.log(`${topic}: ${count} questions`);
    });
  
  // Check for duplicate topics (same topic in both curated and imported)
  const allCuratedTopics = new Set(Object.keys(curatedTopics));
  const allImportedTopics = new Set(Object.keys(importedTopics));
  const duplicateTopics = [...allCuratedTopics].filter(topic => allImportedTopics.has(topic));
  
  if (duplicateTopics.length > 0) {
    console.log('\n=== Duplicate Topics Found ===');
    duplicateTopics.forEach(topic => {
      console.log(`${topic}: ${curatedTopics[topic]} curated + ${importedTopics[topic]} imported = ${curatedTopics[topic] + importedTopics[topic]} total`);
    });
  }
  
  // Check the API groupBy query that's causing issues
  console.log('\n=== API GroupBy Result ===');
  const apiResult = await db.dSAQuestion.groupBy({
    by: ['topic'],
    where: {
      isImported: false
    },
    _count: {
      topic: true
    }
  });
  
  apiResult.forEach(result => {
    console.log(`${result.topic}: ${result._count.topic} questions`);
  });
}

debugTopics().catch(console.error).finally(() => process.exit(0));
