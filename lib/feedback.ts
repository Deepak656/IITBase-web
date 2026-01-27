// app/api/feedback/route.ts
//lib/path.ts ( new path)
import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  feedbackType: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    
    const { feedbackType, name, email, subject, message } = body;

    // Validate required fields
    if (!feedbackType || !name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'All fields are required',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Invalid email format',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    // TODO: Implement actual backend logic here
    // For now, we'll just log the feedback
    // In production, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Create ticket in support system
    
    console.log('Feedback received:', {
      feedbackType,
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(
      {
        success: true,
        data: {
          id: Math.random().toString(36).substring(7),
          feedbackType,
          name,
          email,
          subject,
          message,
          createdAt: new Date().toISOString()
        },
        message: 'Feedback submitted successfully',
        timestamp: Date.now()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'Internal server error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}