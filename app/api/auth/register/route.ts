import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateVerificationCode } from '@/lib/auth'
import { createUser, getUserByEmail } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password y username son requeridos' },
        { status: 400 }
      )
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const verificationCode = generateVerificationCode()

    const user = await createUser(email, passwordHash, username, verificationCode)

    // Send verification email (skip in development)
    if (process.env.NODE_ENV === 'production') {
      await sendVerificationEmail(email, verificationCode)
    } else {
      console.log(`📧 DEV MODE: Verification code for ${email}: ${verificationCode}`)
    }

    return NextResponse.json(
      { message: 'Usuario registrado. Verifica tu email.', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error al registrarse' },
      { status: 500 }
    )
  }
}
