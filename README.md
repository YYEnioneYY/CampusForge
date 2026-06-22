# CampusForge

<p align="center">
  <strong>Цифровая экосистема проектной деятельности университета</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React TypeScript" />
  <img src="https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Infrastructure-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## О проекте

**CampusForge** — SaaS-платформа для цифровизации проектной деятельности университета.

Платформа помогает студентам находить проекты и команды, преподавателям сопровождать курсовые и ВКР, университетам управлять проектной активностью, а компаниям публиковать кейсы и находить молодых специалистов по реальным проектным результатам.

CampusForge превращает разрозненные чаты, таблицы и файлы в единую управляемую систему: с командами, задачами, ролями, сроками, документами, оценками, уведомлениями, аналитикой и портфолио.

---

## Ключевые возможности

- регистрация, авторизация и управление пользователями;
- профили студентов, преподавателей, менторов и представителей компаний;
- навыки, ссылки, документы и проектное портфолио;
- университеты, факультеты, кафедры, компании и рабочие пространства;
- личные, учебные, командные, хакатонные и исследовательские проекты;
- заявки и приглашения в проектные команды;
- роли участников внутри организаций и проектов;
- Kanban-доски, задачи, исполнители, комментарии и вложения;
- критерии оценивания, баллы, отзывы преподавателей, менторов и жюри;
- уведомления о заявках, задачах, дедлайнах, комментариях и оценках;
- тарифы, подписки, лимиты и счётчики использования;
- поиск по пользователям, проектам, организациям и навыкам;
- аналитика для организаций, преподавателей и администраторов.

---

## Технологический стек

| Слой | Технологии |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Feature-Sliced Design |
| Backend | NestJS, TypeScript, REST API, WebSocket |
| Database | PostgreSQL, Prisma ORM |
| Cache | Redis |
| Message Broker | Kafka |
| Files | MinIO / S3-compatible storage |
| Auth | JWT access tokens, refresh tokens, RBAC |
| Infrastructure | Docker, Docker Compose, Nginx |
| Documentation | Markdown, Swagger / OpenAPI |

---

## Архитектура

Проект построен как сервисная система с единым входом через **API Gateway**.

```text
Frontend
   |
API Gateway
   |
   |-- Auth Service
   |-- User Service
   |-- Organization Service
   |-- Project Service
   |-- Task Service
   |-- Evaluation Service
   |-- Notification Service
   |-- Subscription Service
   |-- File Service
   |-- Search Service
   |-- Analytics Service
   |-- Moderation Service
   |-- Admin Service
```

Внешний API проекта:

```text
REST API
```

Внутреннее взаимодействие сервисов:

```text
HTTP / gRPC + Kafka events
```

Realtime-функциональность:

```text
WebSocket
```

---

## Основные сервисы

| Сервис | Назначение |
|---|---|
| API Gateway | Единая точка входа во внутренние сервисы |
| Auth Service | Регистрация, вход, JWT, refresh-токены, подтверждение email |
| User Service | Профили пользователей, навыки, ссылки, документы |
| Organization Service | Университеты, кафедры, компании, рабочие пространства |
| Project Service | Проекты, участники, роли, заявки, приглашения |
| Task Service | Доски задач, колонки, задачи, комментарии, вложения |
| Evaluation Service | Критерии, оценки, баллы, отзывы |
| Notification Service | Уведомления и настройки доставки |
| Subscription Service | Тарифы, лимиты, подписки, использование |
| File Service | Загрузка и выдача файлов |
| Search Service | Поиск по проектам, пользователям и организациям |
| Analytics Service | Отчёты, статистика и дашборды |
| Moderation Service | Модерация организаций, проектов и жалоб |
| Admin Service | Системное управление платформой |

---

## Типы проектов

```text
personal       — личный проект
coursework     — курсовая работа
diploma        — диплом / ВКР
educational    — учебный проект
hackathon      — хакатонный проект
company_case   — кейс от компании
startup        — стартап
research       — исследовательский проект
```

Проекты могут быть:

```text
individual — индивидуальные
team       — командные
```

---

## Роли

### Глобальные роли

```text
user
moderator
admin
```

### Роли в организации

```text
student
teacher
university_admin
department_admin
company_representative
mentor
jury
```

### Роли в проекте

```text
project_owner
project_captain
project_member
project_mentor
project_supervisor
project_reviewer
project_jury
```

---

## Запуск проекта

Проект полностью запускается через **Docker Compose**.

### 1. Клонировать репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/CampusForge.git
cd CampusForge
```

### 2. Создать файл окружения

```bash
cp .env.example .env
```

### 3. Запустить проект

```bash
docker compose up --build
```

После запуска Docker Compose поднимает все основные части системы:

```text
frontend
api-gateway
backend services
postgres
redis
kafka
minio
nginx
```

### 4. Остановить проект

```bash
docker compose down
```

### 5. Остановить проект и удалить volumes

```bash
docker compose down -v
```

---

## Переменные окружения

Основные переменные окружения хранятся в `.env`.

Пример:

```env
NODE_ENV=development

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=campusforge
POSTGRES_PASSWORD=campusforge
POSTGRES_DB=campusforge

REDIS_HOST=redis
REDIS_PORT=6379

KAFKA_BROKER=kafka:9092

JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=campusforge
MINIO_SECRET_KEY=campusforge
MINIO_BUCKET=campusforge-files
```

---

## Структура репозитория

```text
campusforge/
  apps/
    frontend/
    api-gateway/
    auth-service/
    user-service/
    organization-service/
    project-service/
    task-service/
    evaluation-service/
    notification-service/
    subscription-service/
    file-service/
    search-service/
    analytics-service/
    moderation-service/
    admin-service/

  libs/
    common/
    contracts/
    config/
    database/
    logger/
    auth/
    events/

  docs/
    README.md
    project-overview.md
    project-concept.docx
    database.md
    api.md
    microservices.md

  docker-compose.yml
  .env.example
  README.md
```

---

## Документация

Подробная документация находится в папке `/docs`.

| Документ | Описание |
|---|---|
| `docs/project-overview.md` | Описание продукта |
| `docs/project-concept.docx` | Полная концепция проекта |
| `docs/database.md` | Структура базы данных |
| `docs/api.md` | REST API проекта |
| `docs/microservices.md` | Микросервисная архитектура |
| `docs/README.md` | Навигация по документации |

---

## Основные модули

```text
auth
users
organizations
projects
tasks
evaluations
notifications
subscriptions
files
search
analytics
moderation
admin
```

---

## Инфраструктура

```text
PostgreSQL  — основная реляционная база данных
Redis       — кэш, временные данные, rate limiting
Kafka       — обмен событиями между сервисами
MinIO       — хранение файлов и документов
Nginx       — reverse proxy
Docker      — контейнеризация
```

---

## Краткая идея

CampusForge объединяет проектную деятельность университета в одной цифровой среде: от поиска команды и создания проекта до задач, оценивания, аналитики и портфолио студента.
