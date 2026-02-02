import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Тестовый endpoint работает',
    timestamp: new Date().toISOString(),
    envVars: {
      telegramToken: process.env.TELEGRAM_BOT_TOKEN ? '✅ Найден' : '❌ Отсутствует',
      telegramChatId: process.env.TELEGRAM_CHAT_ID ? '✅ Найден' : '❌ Отсутствует',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Найден' : '❌ Отсутствует',
    }
  })
}
