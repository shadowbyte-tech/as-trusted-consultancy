import { NextRequest, NextResponse } from 'next/server';
import { readUsers } from '@/lib/database';
import { handleError } from '@/lib/errors';
import { API_MESSAGES, VALIDATION } from '@/lib/constants';
import { setPassword } from '@/lib/password-storage';
import bcrypt from 'bcryptjs';

/**
 * Password reset endpoint (without authentication)
 * Uses security question verification instead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, securityAnswer, newPassword } = body;

    if (!email || !securityAnswer || !newPassword) {
      return NextResponse.json(
        { error: API_MESSAGES.ERROR.MISSING_FIELDS, fields: ['email', 'securityAnswer', 'newPassword'] },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long` },
        { status: 400 }
      );
    }

    // Find user
    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return NextResponse.json(
        { error: API_MESSAGES.ERROR.USER_NOT_FOUND },
        { status: 404 }
      );
    }

    // Verify security answer (hardcoded for demo - in production, store per user)
    if (securityAnswer.toLowerCase() !== 'mani') {
      return NextResponse.json(
        { error: 'Incorrect security answer' },
        { status: 401 }
      );
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await setPassword(user.email, hashedPassword);

    return NextResponse.json({
      success: true,
      message: API_MESSAGES.SUCCESS.PASSWORD_CHANGED,
    });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}
