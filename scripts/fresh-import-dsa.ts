import * as XLSX from 'xlsx';
import { PrismaClient, Difficulty } from '@prisma/client';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface DSAQuestionRow {
  'S.No.'?: number;
  'Question Title'?: string;
  'Topic'?: string;
  'Difficulty'?: string;
  'Platform'?: string;
  'LeetCode Link'?: string;
  'GeeksforGeeks Link'?: string;
  'Description'?: string;
  'Companies'?: string;
  'Frequency'?: number;
  'Time Complexity'?: string;
  'Space Complexity'?: string;
  'Approach'?: string;
  'Tags'?: string;
  'Hints'?: string;
}

function parseDifficulty(difficulty: string): Difficulty {
  if (!difficulty) return Difficulty.MEDIUM;
  
  const normalized = difficulty.toLowerCase().trim();
  switch (normalized) {
    case 'easy':
      return Difficulty.EASY;
    case 'hard':
      return Difficulty.HARD;
    default:
      return Difficulty.MEDIUM;
  }
}

function parseStringArray(value: string): string[] {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

async function freshImportDSAData() {
  try {
    console.log('=== Fresh DSA Data Import ===');
    
    // Generate a unique batch ID for this import
    const importBatchId = uuidv4();
    const importedAt = new Date();
    const originalFileName = 'DSA for PLACEMENTS.xlsx';
    
    // For demo purposes, we'll use a dummy user ID
    // In real implementation, this would come from the authenticated user
    const dummyUserId = 'demo-user-import';
    
    console.log(`Import Batch ID: ${importBatchId}`);
    
    // First, clear existing DSA questions
    console.log('Clearing existing DSA questions...');
    const deletedProgress = await prisma.dSAProgress.deleteMany({});
    console.log(`Deleted ${deletedProgress.count} progress records`);
    
    const deletedQuestions = await prisma.dSAQuestion.deleteMany({});
    console.log(`Deleted ${deletedQuestions.count} existing questions`);
    
    // Read the Excel file
    const filePath = path.join(process.cwd(), 'content', 'DSA for PLACEMENTS.xlsx');
    console.log('Reading file:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data: DSAQuestionRow[] = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} rows in the Excel file`);
    
    // Display column headers for verification
    if (data.length > 0) {
      console.log('\n=== Excel Column Headers ===');
      Object.keys(data[0]).forEach((key, index) => {
        console.log(`${index + 1}. "${key}"`);
      });
    }
    
    let imported = 0;
    let skipped = 0;
    const importedQuestions: any[] = [];
    
    console.log('\n=== Starting Import Process ===');
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Try multiple possible column names for title
        const title = row['Question Title'] || 
                     row['Title'] || 
                     row['Question'] || 
                     row['Problem'] || 
                     (row as any)['question title'] ||
                     (row as any)['title'];
        
        // Skip rows without title
        if (!title || !title.toString().trim()) {
          console.log(`Row ${i + 1}: Skipped - No title found`);
          skipped++;
          continue;
        }
        
        // Determine the primary platform URL
        let primaryUrl = row['LeetCode Link'] || row['GeeksforGeeks Link'] || '';
        let platform = 'LeetCode';
        
        if (row['Platform']) {
          platform = row['Platform'];
        } else if (row['GeeksforGeeks Link'] && !row['LeetCode Link']) {
          platform = 'GeeksforGeeks';
        }
        
        const questionData = {
          title: title.toString().trim(),
          description: row['Description'] || '',
          topic: row['Topic'] || 'General',
          difficulty: parseDifficulty(row['Difficulty'] || ''),
          leetcodeUrl: primaryUrl,
          platform: platform,
          tags: parseStringArray(row['Tags'] || ''),
          hints: parseStringArray(row['Hints'] || ''),
          companies: parseStringArray(row['Companies'] || ''),
          frequency: parseInt(row['Frequency']?.toString() || '1') || 1,
          timeComplexity: row['Time Complexity'] || null,
          spaceComplexity: row['Space Complexity'] || null,
          approach: row['Approach'] || null,
          // Import tracking fields
          isImported: true,
          importedBy: null, // Set to null for now since we don't have user auth in script
          importedAt: importedAt,
          importBatchId: importBatchId,
          originalFileName: originalFileName,
        };
        
        // Create new question
        const createdQuestion = await prisma.dSAQuestion.create({
          data: questionData
        });
        
        imported++;
        importedQuestions.push({
          sno: row['S.No.'] || imported,
          title: questionData.title,
          topic: questionData.topic,
          difficulty: questionData.difficulty,
          platform: questionData.platform
        });
        
        console.log(`Row ${i + 1}: ✅ Imported - ${questionData.title} (${questionData.topic} - ${questionData.difficulty})`);
        
      } catch (error) {
        console.log(`Row ${i + 1}: ❌ Error - ${error}`);
        skipped++;
      }
    }
    
    console.log(`\n=== Import Summary ===`);
    console.log(`Total rows processed: ${data.length}`);
    console.log(`Successfully imported: ${imported} questions`);
    console.log(`Skipped: ${skipped} questions`);
    
    // Display imported questions in a nice table format
    if (importedQuestions.length > 0) {
      console.log(`\n=== First 20 Imported Questions ===`);
      console.log('S.No | Title                              | Topic        | Difficulty | Platform');
      console.log('-----|-----------------------------------|--------------|------------|----------');
      
      importedQuestions.slice(0, 20).forEach(q => {
        const sno = q.sno.toString().padEnd(4);
        const title = q.title.substring(0, 35).padEnd(35);
        const topic = q.topic.substring(0, 12).padEnd(12);
        const difficulty = q.difficulty.padEnd(10);
        const platform = q.platform.substring(0, 10);
        
        console.log(`${sno} | ${title} | ${topic} | ${difficulty} | ${platform}`);
      });
      
      if (importedQuestions.length > 20) {
        console.log(`... and ${importedQuestions.length - 20} more questions`);
      }
    }
    
  } catch (error) {
    console.error('Error during fresh import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fresh import
freshImportDSAData().catch(console.error);
