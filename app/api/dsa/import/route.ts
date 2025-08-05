import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { normalizeTopicName } from '@/lib/topicNormalization';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { questions, fileName, importName } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid questions data' },
        { status: 400 }
      );
    }

    if (!importName || !importName.trim()) {
      return NextResponse.json(
        { error: 'Import name is required' },
        { status: 400 }
      );
    }

    // Generate import batch info
    const importBatchId = uuidv4();
    const importedAt = new Date();
    const originalFileName = fileName || 'imported_questions.xlsx';
    const customImportName = importName.trim();

    // Validate and process questions
    const processedQuestions = questions.map((q: any) => ({
      title: q.title || q.Title || q.name || q.Name || '',
      description: q.description || q.Description || q.desc || '',
      topic: normalizeTopicName(q.topic || q.Topic || q.category || q.Category || 'General'),
      difficulty: (q.difficulty || q.Difficulty || 'MEDIUM').toUpperCase(),
      leetcodeUrl: q.leetcodeUrl || q.url || q.link || q.Link || '',
      platform: q.platform || q.Platform || 'LeetCode',
      tags: Array.isArray(q.tags) ? q.tags : (q.tags || '').split(',').filter(Boolean),
      hints: Array.isArray(q.hints) ? q.hints : [],
      companies: Array.isArray(q.companies) ? q.companies : (q.companies || '').split(',').filter(Boolean),
      frequency: parseInt(q.frequency || q.Frequency || '1') || 1,
      timeComplexity: q.timeComplexity || q.time_complexity || '',
      spaceComplexity: q.spaceComplexity || q.space_complexity || '',
      approach: q.approach || q.Approach || '',
      // Import tracking fields
      isImported: true,
      importedBy: session.user.id,
      importedAt: importedAt,
      importBatchId: importBatchId,
      importBatchName: customImportName,
      originalFileName: originalFileName,
    })).filter(q => q.title); // Filter out questions without titles

    if (processedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions found in the data' },
        { status: 400 }
      );
    }

    // Batch insert questions (skip duplicates)
    const results: { created: number; skipped: number; errors: string[] } = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const questionData of processedQuestions) {
      try {
        // Check if question already exists
        const existing = await db.dSAQuestion.findFirst({
          where: {
            title: questionData.title,
            topic: questionData.topic
          }
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        // Create the question
        await db.dSAQuestion.create({
          data: questionData
        });
        
        results.created++;
      } catch (error) {
        results.errors.push(`Failed to create question "${questionData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. Created: ${results.created}, Skipped: ${results.skipped}`,
      results,
      importInfo: {
        batchId: importBatchId,
        fileName: originalFileName,
        importedAt: importedAt,
        userId: session.user.id
      }
    });

  } catch (error) {
    console.error('Error importing DSA questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
