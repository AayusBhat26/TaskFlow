import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('leetcodeData') as File;
    const platform = formData.get('platform') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    let data;

    try {
      // Try parsing as JSON first
      data = JSON.parse(text);
    } catch {
      // If JSON parsing fails, try CSV parsing
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      });
    }

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Process and store the LeetCode data
    const processedData = data.map(item => ({
      userId: session.user.id,
      title: item.title || item.Title,
      questionId: parseInt(item.questionId || item.QuestionId || item.id || '0'),
      status: item.status || item.Status || 'Unknown',
      language: item.lang || item.language || item.Language,
      timestamp: item.timestamp || item.Timestamp || new Date().toISOString(),
      difficulty: item.difficulty || item.Difficulty,
      topics: typeof item.topics === 'string' ? item.topics.split(',') : (item.topics || []),
      runtime: item.runtime || item.Runtime,
      memory: item.memory || item.Memory,
      platform: platform || 'leetcode'
    }));

    // Store in database (assuming you have a leetcode_submissions table)
    // For now, we'll just return the processed data
    const result = {
      message: 'LeetCode data uploaded successfully',
      count: processedData.length,
      data: processedData.slice(0, 5) // Return first 5 items as preview
    };

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Error uploading LeetCode data:', error);
    return NextResponse.json(
      { error: 'Failed to upload LeetCode data' },
      { status: 500 }
    );
  }
}