import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function markExistingQuestionsAsImported() {
  try {
    console.log('=== Marking Existing Questions as Imported ===');
    
    // Find all questions that don't have import tracking set
    const existingQuestions = await prisma.dSAQuestion.findMany({
      where: {
        OR: [
          { isImported: false },
          { isImported: null },
          { importBatchId: null }
        ]
      },
      select: {
        id: true,
        title: true,
        topic: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${existingQuestions.length} questions to mark as imported`);
    
    if (existingQuestions.length === 0) {
      console.log('No questions to update');
      return;
    }
    
    // Generate a batch ID for these existing questions
    const importBatchId = uuidv4();
    const importedAt = new Date();
    const originalFileName = 'DSA for PLACEMENTS.xlsx'; // Since this was the original file
    
    console.log(`Batch ID: ${importBatchId}`);
    console.log(`Marking ${existingQuestions.length} questions as imported...`);
    
    // Update all existing questions to mark them as imported
    const updateResult = await prisma.dSAQuestion.updateMany({
      where: {
        id: {
          in: existingQuestions.map(q => q.id)
        }
      },
      data: {
        isImported: true,
        importedBy: null, // Set to null since we don't have specific user context
        importedAt: importedAt,
        importBatchId: importBatchId,
        originalFileName: originalFileName
      }
    });
    
    console.log(`Updated ${updateResult.count} questions`);
    
    // Show summary by topic
    console.log('\n=== Summary by Topic ===');
    const topicSummary = existingQuestions.reduce((acc, q) => {
      acc[q.topic] = (acc[q.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(topicSummary).forEach(([topic, count]) => {
      console.log(`${topic}: ${count} questions`);
    });
    
    // Show first few questions as examples
    console.log('\n=== Sample Updated Questions ===');
    existingQuestions.slice(0, 5).forEach((q, index) => {
      console.log(`${index + 1}. ${q.title} (${q.topic})`);
    });
    
    if (existingQuestions.length > 5) {
      console.log(`... and ${existingQuestions.length - 5} more questions`);
    }
    
    console.log('\n✅ All existing questions have been marked as imported!');
    console.log(`Batch ID: ${importBatchId}`);
    console.log(`File Name: ${originalFileName}`);
    console.log(`Import Date: ${importedAt.toISOString()}`);
    
  } catch (error) {
    console.error('Error marking questions as imported:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
markExistingQuestionsAsImported().catch(console.error);
