import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    console.log('Testing database connection...');
    console.log('DB object exists:', !!db);
    console.log('DB conversation model exists:', !!db?.conversation);
    
    // Test a simple query
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log('Database connection test result:', result);
    
    // Test conversation table access
    const conversationCount = await db.conversation.count();
    console.log('Conversation count:', conversationCount);
    
    return NextResponse.json({ 
      success: true, 
      dbExists: !!db,
      conversationModelExists: !!db?.conversation,
      testQuery: result,
      conversationCount 
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        dbExists: !!db,
        conversationModelExists: !!db?.conversation
      },
      { status: 500 }
    );
  }
}
