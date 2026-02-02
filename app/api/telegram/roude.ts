import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Определяем тип формы
    const formType = data.formType || 'contact'
    
    // Формируем сообщение
    let message = ''
    
    if (formType === 'consultation') {
      message = `📋 *Новая заявка на консультацию!*\n\n`
    } else {
      message = `📞 *Новый запрос с сайта!*\n\n`
    }
    
    message += `👤 *Имя:* ${data.name || 'Не указано'}\n`
    message += `📞 *Телефон:* ${data.phone || 'Не указан'}\n`
    message += `📧 *Email:* ${data.email || 'Не указан'}\n`
    
    if (data.message) {
      message += `📝 *Сообщение:* ${data.message}\n`
    }
    
    if (data.project_type) {
      message += `🏠 *Тип проекта:* ${data.project_type}\n`
    }
    
    if (data.area) {
      message += `📏 *Площадь:* ${data.area} м²\n`
    }
    
    message += `⏰ *Время:* ${new Date().toLocaleString('ru-RU')}\n`
    
    // Отправляем в Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    const result = await response.json()
    
    if (!result.ok) {
      console.error('Ошибка Telegram:', result)
      return NextResponse.json(
        { error: result.description },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Ошибка:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
