# Центр развития особенных детей

React/Vite SPA с backend на Express для сохранения анкет, расчёта результата и просмотра отчётов в админке.

## Что настроено

- `POST /api/submissions` принимает анкету, валидирует ответы и считает итог на сервере.
- `GET /api/submissions` и `GET /api/submissions/:id` питают результат и админ-панель.
- Данные сохраняются в `server/data/submissions.json`.
- В dev-режиме фронтенд проксирует `/api` на backend.
- В production backend может раздавать собранный `dist`.

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. При необходимости скопировать переменные окружения из `.env.example`.

3. Запустить frontend и backend вместе:

```bash
npm run dev
```

4. Для production-сценария:

```bash
npm run build
npm start
```

## Переменные окружения

- `PORT` — порт backend, по умолчанию `3001`.
- `DATA_FILE` — путь к JSON-файлу с анкетами.
- `VITE_DEV_API_TARGET` — куда Vite проксирует `/api` в dev.
- `VITE_API_URL` — базовый URL API для отдельного деплоя фронтенда.

## Проверка

```bash
npm run build
```
