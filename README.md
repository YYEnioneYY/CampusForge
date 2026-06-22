# CampusForge

**CampusForge** — SaaS-платформа для цифровизации проектной деятельности университета.

Платформа помогает студентам находить проекты и команды, преподавателям сопровождать курсовые и ВКР, университетам управлять проектной активностью, а компаниям публиковать кейсы и находить молодых специалистов по реальным проектным результатам.

---

## Возможности

- регистрация и авторизация пользователей;
- профили студентов, преподавателей, менторов и представителей компаний;
- навыки, ссылки, документы и проектное портфолио;
- университеты, кафедры, факультеты, компании и рабочие пространства;
- создание личных, учебных, командных, хакатонных и исследовательских проектов;
- заявки и приглашения в проектные команды;
- роли участников проекта;
- Kanban-доски, задачи, исполнители, комментарии и вложения;
- критерии оценивания, оценки, баллы и отзывы;
- уведомления о заявках, задачах, дедлайнах и оценках;
- тарифы, подписки и лимиты;
- поиск по пользователям, проектам, организациям и навыкам;
- аналитика для организаций и администраторов.

---

## Основные типы проектов

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

Проекты могут быть индивидуальными или командными.

---

## Роли

Глобальные роли:

```text
user
moderator
admin
```

Организационные роли:

```text
student
teacher
university_admin
department_admin
company_representative
mentor
jury
```

Проектные роли:

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

## Архитектура

Внешний API проекта:

```text
REST API
```

Backend разделён на доменные сервисы:

```text
Auth Service
User Service
Organization Service
Project Service
Task Service
Evaluation Service
Notification Service
Subscription Service
File Service
Search Service
Analytics Service
Moderation Service
Admin Service
```

---

## Стек

| Слой | Технологии |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS, TypeScript, REST API |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, refresh tokens, RBAC |
| Files | MinIO / S3-compatible storage |
| Cache / Queue | Redis, RabbitMQ или NATS |
| Infrastructure | Docker, Docker Compose, Nginx |

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

## Структура репозитория

```text
campusforge/
  apps/
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
  docker-compose.yml
  README.md
```

---

## Документация

```text
docs/database.md                 — структура базы данных
docs/api.md                      — описание REST API
docs/microservices.md            — микросервисная архитектура
docs/project-overview.md         — описание продукта
```

---

## Краткая идея

CampusForge превращает университетские проекты из разрозненных чатов, таблиц и файлов в управляемую цифровую систему: с командами, задачами, ролями, сроками, оценками, аналитикой и портфолио.
