# Инструкция по деплою на Vercel

## Шаг 1: Подготовка проекта

1. Убедитесь, что все изменения сохранены и проект работает локально:
```bash
npm run dev
```

2. Проверьте, что файл `.gitignore` содержит все необходимые исключения (credentials файлы, .env и т.д.)

## Шаг 2: Коммит и пуш в GitHub

1. Добавьте все файлы в git:
```bash
git add .
```

2. Создайте коммит:
```bash
git commit -m "Initial commit: Next.js form with Google Sheets integration"
```

3. Создайте репозиторий на GitHub (если еще не создан):
   - Перейдите на https://github.com/new
   - Создайте новый репозиторий (например, `good-pd-page`)
   - НЕ добавляйте README, .gitignore или лицензию (они уже есть)

4. Подключите удаленный репозиторий и запушьте код:
```bash
git remote add origin https://github.com/ВАШ_USERNAME/good-pd-page.git
git branch -M main
git push -u origin main
```

## Шаг 3: Деплой на Vercel

1. Перейдите на https://vercel.com
2. Войдите в аккаунт (через GitHub)
3. Нажмите "Add New Project"
4. Выберите репозиторий `good-pd-page` из списка
5. Vercel автоматически определит настройки Next.js
6. **ВАЖНО: Настройте переменные окружения перед деплоем!**

## Шаг 4: Настройка переменных окружения в Vercel

Перед деплоем обязательно добавьте переменные окружения:

1. В настройках проекта Vercel перейдите в "Settings" > "Environment Variables"
2. Добавьте следующие переменные:

### Вариант 1: Использование JSON файла (рекомендуется для Vercel)

Если у вас есть файл с credentials, скопируйте его содержимое:

**GOOGLE_SERVICE_ACCOUNT_KEY**
- Значение: Весь JSON из файла credentials в одну строку
- Пример:
```
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"your-service@project.iam.gserviceaccount.com",...}
```
- Важно: Весь JSON должен быть в одной строке, кавычки внутри должны быть экранированы

**GOOGLE_SPREADSHEET_ID**
- Значение: ID вашей Google Таблицы (из URL между `/d/` и `/edit`)
- Пример: `1a2b3c4d5e6f7g8h9i0j`

3. Выберите окружения, где эти переменные будут доступны:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (опционально)

4. Нажмите "Save"

## Шаг 5: Деплой

1. После настройки переменных окружения вернитесь на вкладку "Deployments"
2. Нажмите "Deploy" или дождитесь автоматического деплоя после пуша в GitHub
3. Дождитесь завершения деплоя (обычно 1-2 минуты)

## Шаг 6: Проверка

1. После успешного деплоя откройте ваш сайт
2. Проверьте форму обратного звонка
3. Заполните и отправьте тестовую заявку
4. Проверьте, что данные появились в Google Таблице

## Автоматический деплой

После первого деплоя Vercel будет автоматически деплоить проект при каждом пуше в ветку `main`.

Для других веток создаются preview deployments.

## Troubleshooting

### Ошибка "Не настроена интеграция с Google Sheets"
- Проверьте, что переменные окружения добавлены в Vercel
- Убедитесь, что переменные доступны для Production окружения
- Проверьте формат JSON в GOOGLE_SERVICE_ACCOUNT_KEY

### Ошибка доступа к Google Таблице
- Убедитесь, что сервисный аккаунт имеет доступ к таблице (права редактора)
- Проверьте, что GOOGLE_SPREADSHEET_ID указан правильно

### Ошибка сборки
- Проверьте логи деплоя в Vercel
- Убедитесь, что все зависимости указаны в package.json
- Проверьте, что версия Node.js совместима (Vercel использует Node.js 18+ по умолчанию)

## Полезные ссылки

- [Документация Vercel](https://vercel.com/docs)
- [Next.js на Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Переменные окружения в Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

