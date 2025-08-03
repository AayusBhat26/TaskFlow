import * as XLSX from 'xlsx';
import { PrismaClient, Difficulty } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

async function debugDSAImport() {
  try {
    console.log('=== DSA Import Debug ===');
    
    // First, check current database state
    const existingQuestions = await prisma.dSAQuestion.count();
    console.log(`Current questions in database: ${existingQuestions}`);
    
    if (existingQuestions > 0) {
      const sampleQuestions = await prisma.dSAQuestion.findMany({
        take: 3,
        select: { title: true, topic: true, difficulty: true }
      });
      console.log('Sample existing questions:', sampleQuestions);
    }
    
    // Read the Excel file
    const filePath = path.join(process.cwd(), 'content', 'DSA for PLACEMENTS.xlsx');
    console.log('Reading file:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet names:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the range and headers
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    console.log(`Sheet range: ${worksheet['!ref']}`);
    
    // Get headers
    const headers: string[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        headers.push(cell.v.toString());
      }
    }
    console.log('Headers found:', headers);
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Total rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log('First row keys:', Object.keys(data[0]));
      console.log('First row sample:', data[0]);
      console.log('Second row sample:', data[1]);
      console.log('Third row sample:', data[2]);
    }
    
    // Check for questions without titles
    let noTitleCount = 0;
    let validQuestions = 0;
    
    for (const row of data) {
      const rowData = row as any;
      
      // Try different possible column names for title
      const possibleTitles = [
        rowData['Question Title'],
        rowData['Title'],
        rowData['Question'],
        rowData['Problem'],
        rowData['question title'],
        rowData['title']
      ];
      
      const title = possibleTitles.find(t => t && t.toString().trim());
      
      if (!title) {
        noTitleCount++;
      } else {
        validQuestions++;
        if (validQuestions <= 3) {
          console.log(`Sample valid question ${validQuestions}:`, {
            title: title,
            topic: rowData['Topic'] || rowData['topic'],
            difficulty: rowData['Difficulty'] || rowData['difficulty']
          });
        }
      }
    }
    
    console.log(`Questions without titles: ${noTitleCount}`);
    console.log(`Valid questions: ${validQuestions}`);
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDSAImport().catch(console.error);
