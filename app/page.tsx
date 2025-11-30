'use client'

import { useState, useEffect } from 'react'

interface FormData {
  fullName: string
  phone: string
  email: string
}

interface FieldErrors {
  fullName?: string
  phone?: string
  email?: string
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Предотвращаем проблемы с гидратацией
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Форматирование телефона в формат +7 (999) 123-45-67
  const formatPhone = (value: string): string => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '')
    
    // Если пусто, возвращаем пустую строку
    if (!digits) {
      return ''
    }
    
    let phoneDigits = digits
    
    // Если начинается с 8, заменяем на 7
    if (phoneDigits.startsWith('8')) {
      phoneDigits = '7' + phoneDigits.slice(1)
    }
    // Если начинается с 7, оставляем как есть
    else if (phoneDigits.startsWith('7')) {
      // Уже начинается с 7, ничего не делаем
    }
    // Если 11 цифр и не начинается с 7 или 8, заменяем первую цифру на 7
    else if (phoneDigits.length === 11) {
      phoneDigits = '7' + phoneDigits.slice(1)
    }
    // Если меньше 11 цифр и не начинается с 7, добавляем 7 в начало
    else {
      phoneDigits = '7' + phoneDigits
    }
    
    // Ограничиваем до 11 цифр (7 + 10 цифр номера)
    phoneDigits = phoneDigits.slice(0, 11)
    
    // Форматируем в +7 (999) 123-45-67
    if (phoneDigits.length === 0) {
      return ''
    } else if (phoneDigits.length <= 1) {
      return `+${phoneDigits}`
    } else if (phoneDigits.length <= 4) {
      return `+${phoneDigits.slice(0, 1)} (${phoneDigits.slice(1)}`
    } else if (phoneDigits.length <= 7) {
      return `+${phoneDigits.slice(0, 1)} (${phoneDigits.slice(1, 4)}) ${phoneDigits.slice(4)}`
    } else if (phoneDigits.length <= 9) {
      return `+${phoneDigits.slice(0, 1)} (${phoneDigits.slice(1, 4)}) ${phoneDigits.slice(4, 7)}-${phoneDigits.slice(7)}`
    } else {
      return `+${phoneDigits.slice(0, 1)} (${phoneDigits.slice(1, 4)}) ${phoneDigits.slice(4, 7)}-${phoneDigits.slice(7, 9)}-${phoneDigits.slice(9, 11)}`
    }
  }

  // Валидация телефона (российские форматы)
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Пожалуйста, введите ваш телефон'
    }
    
    // Удаляем все пробелы, скобки, дефисы и плюсы для проверки
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')
    
    // Проверяем, что номер начинается с 7 и имеет 11 цифр
    if (cleaned.length !== 11 || !cleaned.startsWith('7')) {
      return 'Введите полный номер телефона в формате +7 (999) 123-45-67'
    }
    
    // Проверяем, что все символы - цифры
    if (!/^7\d{10}$/.test(cleaned)) {
      return 'Номер должен содержать только цифры'
    }
    
    return null
  }

  // Валидация email
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'Пожалуйста, введите ваш email'
    }
    
    // Более строгая валидация email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(email)) {
      return 'Введите корректный email адрес (например: example@mail.com)'
    }
    
    // Проверка на минимальную длину домена
    const parts = email.split('@')
    if (parts.length !== 2) {
      return 'Email должен содержать символ @'
    }
    
    const domain = parts[1]
    if (!domain.includes('.') || domain.split('.')[domain.split('.').length - 1].length < 2) {
      return 'Email должен содержать корректный домен (например: .com, .ru)'
    }
    
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Специальная обработка для телефона
    if (name === 'phone') {
      // Форматируем номер телефона
      const formatted = formatPhone(value)
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }))
      
      // Очищаем ошибки
      setError(null)
      setFieldErrors((prev) => ({
        ...prev,
        phone: undefined,
      }))
      
      // Валидация в реальном времени (только если номер полный)
      const digits = formatted.replace(/\D/g, '')
      if (digits.length === 11) {
        const phoneError = validatePhone(formatted)
        if (phoneError) {
          setFieldErrors((prev) => ({
            ...prev,
            phone: phoneError,
          }))
        }
      }
    } else {
      // Обычная обработка для других полей
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
      
      // Очищаем общую ошибку и ошибку конкретного поля
      setError(null)
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
      
      // Валидация в реальном времени для email
      if (name === 'email') {
        const emailError = validateEmail(value)
        if (emailError) {
          setFieldErrors((prev) => ({
            ...prev,
            email: emailError,
          }))
        }
      }
    }
  }
  
  // Обработка клавиш для телефона (предотвращение ввода нецифровых символов)
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем: цифры, Backspace, Delete, Tab, Arrow keys, Home, End
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Home', 'End'
    ]
    
    // Если это не разрешенная клавиша и не цифра
    if (!allowedKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
      e.preventDefault()
    }
    
    // Разрешаем Ctrl/Cmd + A, C, V, X для копирования/вставки
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return
    }
  }
  
  // Обработка вставки для телефона
  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const formatted = formatPhone(pastedText)
    setFormData((prev) => ({
      ...prev,
      phone: formatted,
    }))
    setError(null)
    setFieldErrors((prev) => ({
      ...prev,
      phone: undefined,
    }))
  }

  const validateForm = (): boolean => {
    const errors: FieldErrors = {}
    let isValid = true

    // Валидация ФИО
    if (!formData.fullName.trim()) {
      errors.fullName = 'Пожалуйста, введите ваше ФИО'
      isValid = false
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'ФИО должно содержать минимум 3 символа'
      isValid = false
    }

    // Валидация телефона
    const phoneError = validatePhone(formData.phone)
    if (phoneError) {
      errors.phone = phoneError
      isValid = false
    }

    // Валидация email
    const emailError = validateEmail(formData.email)
    if (emailError) {
      errors.email = emailError
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('https://api.pd-local.croakerzzz.ru/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'prod-api-key-abc123',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Произошла ошибка при отправке формы')
      }

      setSuccess(true)
      setFormData({
        fullName: '',
        phone: '',
        email: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="hero-section">
          <h1 className="hero-title">TechSolutions</h1>
          <p className="hero-description">
            Профессиональные IT-решения для вашего бизнеса. 
            Оставьте заявку, и наш специалист свяжется с вами в течение 15 минут!
          </p>
        </div>

        <div className="features">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">Быстрый ответ</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💼</div>
            <div className="feature-text">Профессионалы</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div className="feature-text">Индивидуальный подход</div>
          </div>
        </div>

        {success && (
          <div className="success-message">
            Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              ФИО *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`form-input ${fieldErrors.fullName ? 'form-input-error' : ''}`}
              placeholder="Иванов Иван Иванович"
              disabled={isSubmitting}
            />
            {fieldErrors.fullName && (
              <div className="error-message">{fieldErrors.fullName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Телефон *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
              className={`form-input ${fieldErrors.phone ? 'form-input-error' : ''}`}
              placeholder="+7 (___) ___-__-__"
              maxLength={18}
              disabled={isSubmitting}
              autoComplete="tel"
            />
            {fieldErrors.phone && (
              <div className="error-message">{fieldErrors.phone}</div>
            )}
            {isMounted && !fieldErrors.phone && formData.phone && (
              <div className="phone-hint">
                {formData.phone.replace(/\D/g, '').length < 11 
                  ? `Введите еще ${11 - formData.phone.replace(/\D/g, '').length} цифр`
                  : '✓ Номер введен полностью'}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${fieldErrors.email ? 'form-input-error' : ''}`}
              placeholder="example@mail.com"
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <div className="error-message">{fieldErrors.email}</div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="form-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Заказать обратный звонок'}
          </button>
        </form>
      </div>
    </div>
  )
}

