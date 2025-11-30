import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

interface FormData {
  fullName: string
  phone: string
  email: string
}

// Валидация телефона на сервере
function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }
  
  // Удаляем все форматирующие символы
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')
  
  // Проверяем, что номер начинается с 7 и имеет ровно 11 цифр
  if (cleaned.length !== 11 || !cleaned.startsWith('7')) {
    return false
  }
  
  // Проверяем, что все символы - цифры
  return /^7\d{10}$/.test(cleaned)
}

// Валидация email на сервере
function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(email)) {
    return false
  }
  
  const parts = email.split('@')
  if (parts.length !== 2) {
    return false
  }
  
  const domain = parts[1]
  if (!domain.includes('.') || domain.split('.')[domain.split('.').length - 1].length < 2) {
    return false
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body: FormData = await request.json()
    const { fullName, phone, email } = body

    // Валидация данных
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { error: 'Пожалуйста, введите ваше ФИО' },
        { status: 400 }
      )
    }

    if (fullName.trim().length < 3) {
      return NextResponse.json(
        { error: 'ФИО должно содержать минимум 3 символа' },
        { status: 400 }
      )
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Пожалуйста, введите ваш телефон' },
        { status: 400 }
      )
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Введите полный номер телефона в формате +7 (999) 123-45-67' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Пожалуйста, введите ваш email' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Введите корректный email адрес (например: example@mail.com)' },
        { status: 400 }
      )
    }

    // Получаем учетные данные из переменных окружения или файла
    let serviceAccountKey
    const credentialsFromEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

    // Пробуем загрузить из файла (если есть)
    const credentialsFile = process.env.GOOGLE_CREDENTIALS_FILE || 'bad-pd-local-f0c62f8d6a8a.json'
    const credentialsPath = path.join(process.cwd(), credentialsFile)

    if (fs.existsSync(credentialsPath)) {
      try {
        const fileContent = fs.readFileSync(credentialsPath, 'utf8')
        serviceAccountKey = JSON.parse(fileContent)
      } catch (e) {
        console.error('Ошибка при чтении файла credentials:', e)
      }
    }

    // Если не загрузили из файла, пробуем из переменной окружения
    if (!serviceAccountKey && credentialsFromEnv) {
      try {
        serviceAccountKey = JSON.parse(credentialsFromEnv)
      } catch (e) {
        return NextResponse.json(
          { error: 'Неверный формат учетных данных Google' },
          { status: 500 }
        )
      }
    }

    if (!serviceAccountKey || !spreadsheetId) {
      console.error('Отсутствуют настройки Google Sheets')
      return NextResponse.json(
        { error: 'Серверная ошибка: не настроена интеграция с Google Sheets' },
        { status: 500 }
      )
    }

    // Создаем клиент для работы с Google Sheets API
    const auth = new google.auth.JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Добавляем данные в таблицу
    const timestamp = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
    })

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Лист1!A:D', // Замените 'Лист1' на название вашего листа
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, fullName, phone, email]],
      },
    })

    return NextResponse.json(
      { message: 'Данные успешно сохранены' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Произошла ошибка при сохранении данных',
      },
      { status: 500 }
    )
  }
}

