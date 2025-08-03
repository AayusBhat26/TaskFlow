import * as XLSX from 'xlsx';
import { PrismaClient, Difficulty } from '@prisma/client';
import path from 'path';

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

async function importDSAData() {
  try {
    console.log('Starting DSA data import...');
    
    // Read the Excel file
    const filePath = path.join(process.cwd(), 'content', 'DSA for PLACEMENTS.xlsx');
    console.log('Reading file:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data: DSAQuestionRow[] = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} rows in the Excel file`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const row of data) {
      try {
        // Skip rows without title
        if (!row['Question Title']) {
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
          title: row['Question Title'].trim(),
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
        };
        
        // Check if question already exists
        const existing = await prisma.dSAQuestion.findFirst({
          where: {
            title: questionData.title,
            topic: questionData.topic
          }
        });
        
        if (existing) {
          console.log(`Question "${questionData.title}" already exists, skipping...`);
          skipped++;
          continue;
        }
        
        // Create new question
        await prisma.dSAQuestion.create({
          data: questionData
        });
        
        imported++;
        console.log(`Imported: ${questionData.title} (${questionData.topic} - ${questionData.difficulty})`);
        
      } catch (error) {
        console.error(`Error importing row:`, row, error);
        skipped++;
      }
    }
    
    console.log(`\nImport completed!`);
    console.log(`Imported: ${imported} questions`);
    console.log(`Skipped: ${skipped} questions`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importDSAData().catch(console.error);
