import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { handleError } from '@/lib/errors';
import { API_MESSAGES } from '@/lib/constants';
3
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: API_MESSAGES.ERROR.MISSING_FIELDS, fields: ['email', 'password'] },
        { status: 400 }
      );
    }

    const user = await authenticateUser({ email, password });
    
    if (!user) {
      return NextResponse.json(
        { error: API_MESSAGES.ERROR.INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    return NextResponse.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}
