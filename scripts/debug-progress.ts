import { db } from '../lib/db';

async function debugProgress() {
  console.log('=== Debugging DSA Progress ===');
  
  // Get all progress records with question details
  const allProgress = await db.dSAProgress.findMany({
    include: {
      question: {
        select: {
          topic: true,
          title: true,
          isImported: true
        }
      }
    }
  });
  
  console.log(`Total progress records: ${allProgress.length}`);
  
  // Group by question type
  const curatedProgress = allProgress.filter(p => !p.question.isImported);
  const importedProgress = allProgress.filter(p => p.question.isImported);
  
  console.log(`Progress on curated questions: ${curatedProgress.length}`);
  console.log(`Progress on imported questions: ${importedProgress.length}`);
  
  if (curatedProgress.length > 0) {
    console.log('\n=== Progress on Curated Questions ===');
    curatedProgress.forEach(p => {
      console.log(`${p.question.topic}: ${p.question.title} - ${p.status}`);
    });
  }
  
  if (importedProgress.length > 0) {
    console.log('\n=== Progress on Imported Questions ===');
    importedProgress.forEach(p => {
      console.log(`${p.question.topic}: ${p.question.title} - ${p.status}`);
    });
  }
}

debugProgress().catch(console.error).finally(() => process.exit(0));
