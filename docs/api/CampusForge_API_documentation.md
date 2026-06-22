# CampusForge API Documentation

## 1. Назначение документа

Этот документ описывает API для проекта **CampusForge** — SaaS-платформы для цифровизации проектной деятельности университета. API покрывает регистрацию и авторизацию пользователей, управление профилями, организациями, проектами, задачами, оцениванием, уведомлениями, подписками, модерацией и административными действиями.

Документ можно использовать как основу для:

- проектирования backend на NestJS;
- подготовки OpenAPI / Swagger-документации;
- разделения задач между frontend и backend;
- описания архитектуры в дипломной работе;
- публикации технической документации на GitHub.

---

## 2. REST

```text
Primary API: REST
Documentation: OpenAPI / Swagger
Realtime: WebSocket / Server-Sent Events для уведомлений
Optional future extension: GraphQL Gateway для сложных read-only запросов
```

---

## 3. Базовые соглашения API

### Base URL

```text
/api/v1
```

Пример:

```http
GET /api/v1/projects
```

### Формат данных

Все запросы и ответы используют JSON, кроме загрузки файлов.

```http
Content-Type: application/json
Accept: application/json
```

Для загрузки файлов:

```http
Content-Type: multipart/form-data
```

### Авторизация

Используется JWT:

```http
Authorization: Bearer <access_token>
```

Access token живёт короткое время. Refresh token используется для обновления сессии.

### Общий формат успешного ответа

```json
{
  "data": {},
  "meta": {}
}
```

### Общий формат ошибки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

### Пагинация

Для списков используется query-пагинация:

```http
GET /api/v1/projects?page=1&limit=20
```

Ответ:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### Сортировка

```http
GET /api/v1/projects?sort=created_at&order=desc
```

### Фильтрация

```http
GET /api/v1/projects?type=diploma&status=open&visibility=public
```

### Поиск

```http
GET /api/v1/projects?search=react
```

---

## 4. Основные роли доступа

### Системные роли

| Роль | Назначение |
|---|---|
| `guest` | Неавторизованный пользователь |
| `user` | Обычный пользователь платформы |
| `moderator` | Модератор платформы |
| `admin` | Администратор платформы |

### Организационные роли

| Роль | Назначение |
|---|---|
| `student` | Студент внутри университета |
| `teacher` | Преподаватель / научный руководитель |
| `university_admin` | Администратор университета |
| `department_admin` | Администратор кафедры |
| `company_representative` | Представитель компании |

### Проектные роли

| Роль | Назначение |
|---|---|
| `project_owner` | Владелец проекта |
| `project_captain` | Капитан команды |
| `project_member` | Участник проекта |
| `project_mentor` | Ментор проекта |
| `project_supervisor` | Научный руководитель |
| `project_reviewer` | Проверяющий |
| `project_jury` | Член жюри |

---

## 5. Auth API

### Назначение

Auth API отвечает за регистрацию, вход, обновление токенов, выход, подтверждение email и восстановление пароля.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Guest | Регистрация пользователя |
| `POST` | `/auth/login` | Guest | Вход по email и паролю |
| `POST` | `/auth/refresh` | Guest | Обновление access token |
| `POST` | `/auth/logout` | User | Выход с текущего устройства |
| `POST` | `/auth/logout-all` | User | Выход со всех устройств |
| `GET` | `/auth/me` | User | Получение текущего пользователя |
| `POST` | `/auth/email/verify/request` | User | Запрос письма подтверждения email |
| `POST` | `/auth/email/verify` | Guest | Подтверждение email по токену |
| `POST` | `/auth/password/forgot` | Guest | Запрос восстановления пароля |
| `POST` | `/auth/password/reset` | Guest | Сброс пароля по токену |
| `PATCH` | `/auth/password/change` | User | Смена пароля авторизованным пользователем |

### POST `/auth/register`

Создаёт аккаунт пользователя.

Request:

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123",
  "firstName": "Иван",
  "lastName": "Петров"
}
```

Response:

```json
{
  "data": {
    "userId": "uuid",
    "email": "student@example.com",
    "status": "pending"
  }
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "systemRole": "user"
    }
  }
}
```

---

## 6. Users API

### Назначение

Users API управляет аккаунтами пользователей, системными ролями, статусами и административными действиями над пользователями.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin, Moderator | Список пользователей |
| `GET` | `/users/:userId` | User, Admin, Moderator | Получение пользователя |
| `PATCH` | `/users/:userId` | Owner, Admin | Обновление базовых данных пользователя |
| `PATCH` | `/users/:userId/status` | Admin, Moderator | Изменение статуса пользователя |
| `PATCH` | `/users/:userId/system-role` | Admin | Изменение системной роли |
| `DELETE` | `/users/:userId` | Owner, Admin | Мягкое удаление аккаунта |
| `POST` | `/users/:userId/restore` | Admin | Восстановление пользователя |
| `GET` | `/users/:userId/sessions` | Owner, Admin | Список активных сессий |
| `DELETE` | `/users/:userId/sessions/:sessionId` | Owner, Admin | Завершение конкретной сессии |

### GET `/users`

Query parameters:

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Поиск по email, имени, фамилии |
| `status` | string | `pending`, `active`, `blocked`, `deleted` |
| `systemRole` | string | `user`, `moderator`, `admin` |
| `page` | number | Номер страницы |
| `limit` | number | Размер страницы |

---

## 7. User Profiles API

### Назначение

Работа с публичным профилем пользователя, студенческим профилем, преподавательским профилем, ссылками, навыками и документами.

### Base endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profiles/:userId` | Public / User | Публичный профиль пользователя |
| `GET` | `/profiles/me` | User | Свой профиль |
| `PATCH` | `/profiles/me` | User | Обновление своего профиля |
| `POST` | `/profiles/me/avatar` | User | Загрузка аватара |
| `DELETE` | `/profiles/me/avatar` | User | Удаление аватара |

### Student profile endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profiles/me/student` | User | Получение своего студенческого профиля |
| `PUT` | `/profiles/me/student` | User | Создание или обновление студенческого профиля |
| `GET` | `/users/:userId/student-profile` | Teacher, Org Admin, Admin | Просмотр студенческого профиля |

### Teacher profile endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profiles/me/teacher` | User | Получение своего преподавательского профиля |
| `PUT` | `/profiles/me/teacher` | User | Создание или обновление преподавательского профиля |
| `GET` | `/users/:userId/teacher-profile` | User | Просмотр преподавательского профиля |

---

## 8. User Skills API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/skills` | Public | Список доступных навыков |
| `POST` | `/skills` | Admin, Moderator | Создание навыка |
| `PATCH` | `/skills/:skillId` | Admin, Moderator | Обновление навыка |
| `DELETE` | `/skills/:skillId` | Admin | Удаление навыка |
| `GET` | `/users/:userId/skills` | Public / User | Навыки пользователя |
| `PUT` | `/profiles/me/skills` | User | Полная замена списка навыков |
| `POST` | `/profiles/me/skills` | User | Добавление навыка |
| `PATCH` | `/profiles/me/skills/:skillId` | User | Обновление уровня навыка |
| `DELETE` | `/profiles/me/skills/:skillId` | User | Удаление навыка |

### POST `/profiles/me/skills`

Request:

```json
{
  "skillId": "uuid",
  "level": "intermediate",
  "isPrimary": true
}
```

---

## 9. User Links API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users/:userId/links` | Public / User | Ссылки пользователя |
| `POST` | `/profiles/me/links` | User | Добавление ссылки |
| `PATCH` | `/profiles/me/links/:linkId` | User | Обновление ссылки |
| `DELETE` | `/profiles/me/links/:linkId` | User | Удаление ссылки |

Supported link types:

```text
github, telegram, linkedin, portfolio, website, behance, dribbble, other
```

---

## 10. User Documents API

### Назначение

Документы пользователя: резюме, PDF-портфолио, сертификаты, дипломы, презентации и другие файлы. Сами файлы хранятся во внешнем хранилище, а в базе хранятся метаданные.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profiles/me/documents` | User | Мои документы |
| `GET` | `/users/:userId/documents` | Public / User | Публичные документы пользователя |
| `POST` | `/profiles/me/documents` | User | Загрузка документа |
| `PATCH` | `/profiles/me/documents/:documentId` | User | Обновление метаданных документа |
| `DELETE` | `/profiles/me/documents/:documentId` | User | Удаление документа |
| `GET` | `/users/:userId/documents/:documentId/download` | User / Public | Скачать документ |

### POST `/profiles/me/documents`

Content-Type:

```http
multipart/form-data
```

Fields:

| Field | Type | Description |
|---|---|---|
| `file` | file | PDF или другой документ |
| `documentType` | string | `resume`, `portfolio`, `certificate`, `diploma`, `presentation`, `other` |
| `title` | string | Название документа |
| `isPublic` | boolean | Публичный ли документ |

---

## 11. Roles and Permissions API

### Назначение

Управление ролями и правами доступа. В MVP часть ролей можно создать seed-скриптом и не давать редактировать через UI.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/roles` | Admin | Список ролей |
| `POST` | `/roles` | Admin | Создание роли |
| `GET` | `/roles/:roleId` | Admin | Получение роли |
| `PATCH` | `/roles/:roleId` | Admin | Обновление роли |
| `DELETE` | `/roles/:roleId` | Admin | Удаление роли |
| `GET` | `/permissions` | Admin | Список прав |
| `POST` | `/permissions` | Admin | Создание права |
| `POST` | `/roles/:roleId/permissions/:permissionId` | Admin | Добавить право роли |
| `DELETE` | `/roles/:roleId/permissions/:permissionId` | Admin | Удалить право у роли |

---

## 12. Organizations API

### Назначение

Организации представляют университеты, факультеты, кафедры, компании, акселераторы и студенческие объединения.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations` | Public / User | Каталог организаций |
| `GET` | `/organizations/:organizationId` | Public / User | Карточка организации |
| `POST` | `/organizations` | Admin | Создание организации вручную |
| `PATCH` | `/organizations/:organizationId` | Org Admin, Admin | Обновление организации |
| `DELETE` | `/organizations/:organizationId` | Admin | Архивирование организации |
| `GET` | `/organizations/:organizationId/children` | Public / User | Дочерние организации |
| `POST` | `/organizations/:organizationId/children` | Org Admin, Admin | Создание факультета/кафедры внутри организации |

### Query parameters for `GET /organizations`

| Parameter | Type | Description |
|---|---|---|
| `type` | string | `university`, `faculty`, `department`, `company`, `accelerator`, `student_club`, `other` |
| `status` | string | `pending`, `active`, `blocked`, `archived` |
| `city` | string | Фильтр по городу |
| `search` | string | Поиск по названию |

---

## 13. Organization Requests API

### Назначение

Заявки на подключение университета или компании к CampusForge.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/organization-requests` | Guest / User | Отправить заявку на подключение организации |
| `GET` | `/organization-requests` | Moderator, Admin | Список заявок |
| `GET` | `/organization-requests/:requestId` | Moderator, Admin, Request Owner | Просмотр заявки |
| `PATCH` | `/organization-requests/:requestId` | Request Owner | Обновление заявки, если она pending |
| `POST` | `/organization-requests/:requestId/approve` | Moderator, Admin | Одобрить заявку |
| `POST` | `/organization-requests/:requestId/reject` | Moderator, Admin | Отклонить заявку |
| `POST` | `/organization-requests/:requestId/cancel` | Request Owner | Отменить заявку |

### POST `/organization-requests`

Request:

```json
{
  "organizationName": "СПбГУПТД",
  "organizationType": "university",
  "contactName": "Иван Петров",
  "contactEmail": "admin@example.edu",
  "contactPhone": "+79990000000",
  "websiteUrl": "https://example.edu",
  "comment": "Хотим подключить университет к CampusForge"
}
```

---

## 14. Organization Memberships API

### Назначение

Управление пользователями внутри организации: студенты, преподаватели, администраторы, представители компаний.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/members` | Org Member, Org Admin, Admin | Список участников организации |
| `GET` | `/organizations/:organizationId/members/:memberId` | Org Member, Org Admin, Admin | Карточка участника |
| `POST` | `/organizations/:organizationId/members` | Org Admin, Admin | Добавить пользователя в организацию |
| `PATCH` | `/organizations/:organizationId/members/:memberId` | Org Admin, Admin | Изменить статус участника |
| `DELETE` | `/organizations/:organizationId/members/:memberId` | Org Admin, Admin | Удалить участника из организации |
| `POST` | `/organizations/:organizationId/members/:memberId/roles` | Org Admin, Admin | Назначить роль |
| `DELETE` | `/organizations/:organizationId/members/:memberId/roles/:roleId` | Org Admin, Admin | Удалить роль |

---

## 15. Organization Invitations API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/invitations` | Org Admin, Admin | Список приглашений |
| `POST` | `/organizations/:organizationId/invitations` | Org Admin, Admin | Пригласить пользователя по email |
| `POST` | `/organization-invitations/:token/accept` | Guest / User | Принять приглашение |
| `POST` | `/organizations/:organizationId/invitations/:invitationId/cancel` | Org Admin, Admin | Отменить приглашение |
| `POST` | `/organizations/:organizationId/invitations/:invitationId/resend` | Org Admin, Admin | Отправить приглашение повторно |

---

## 16. Organization Workspaces API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/workspace` | Org Member | Получить рабочее пространство |
| `POST` | `/organizations/:organizationId/workspace` | Admin | Создать workspace |
| `PATCH` | `/organizations/:organizationId/workspace` | Org Admin, Admin | Обновить настройки workspace |
| `POST` | `/organizations/:organizationId/workspace/close` | Admin | Закрыть workspace |
| `POST` | `/organizations/:organizationId/workspace/activate` | Admin | Активировать workspace |

---

## 17. Organization Domains, Links and Contacts API

### Domains

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/domains` | Org Admin, Admin | Список доменов |
| `POST` | `/organizations/:organizationId/domains` | Org Admin, Admin | Добавить email-домен |
| `POST` | `/organizations/:organizationId/domains/:domainId/verify` | Org Admin, Admin | Подтвердить домен |
| `DELETE` | `/organizations/:organizationId/domains/:domainId` | Org Admin, Admin | Удалить домен |

### Links

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/links` | Public | Ссылки организации |
| `POST` | `/organizations/:organizationId/links` | Org Admin, Admin | Добавить ссылку |
| `PATCH` | `/organizations/:organizationId/links/:linkId` | Org Admin, Admin | Обновить ссылку |
| `DELETE` | `/organizations/:organizationId/links/:linkId` | Org Admin, Admin | Удалить ссылку |

### Contacts

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/contacts` | Public / User | Контакты организации |
| `POST` | `/organizations/:organizationId/contacts` | Org Admin, Admin | Добавить контакт |
| `PATCH` | `/organizations/:organizationId/contacts/:contactId` | Org Admin, Admin | Обновить контакт |
| `DELETE` | `/organizations/:organizationId/contacts/:contactId` | Org Admin, Admin | Удалить контакт |

---

## 18. Academic Groups API

### Назначение

Учебные группы внутри университета, факультета или кафедры.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/academic-groups` | Org Member | Список групп |
| `POST` | `/organizations/:organizationId/academic-groups` | Org Admin, Department Admin, Admin | Создать группу |
| `GET` | `/academic-groups/:groupId` | Org Member | Получить группу |
| `PATCH` | `/academic-groups/:groupId` | Org Admin, Department Admin, Admin | Обновить группу |
| `DELETE` | `/academic-groups/:groupId` | Org Admin, Department Admin, Admin | Архивировать группу |
| `GET` | `/academic-groups/:groupId/students` | Teacher, Org Admin, Admin | Студенты группы |

---

## 19. Projects API

### Назначение

Проекты — центральная сущность CampusForge. Проект может быть личным, учебным, дипломным, курсовым, хакатонным, стартапом или кейсом компании.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects` | Public / User | Каталог проектов |
| `POST` | `/projects` | User | Создать проект |
| `GET` | `/projects/:projectId` | Public / Project Access | Карточка проекта |
| `PATCH` | `/projects/:projectId` | Project Owner, Captain, Org Admin, Admin | Обновить проект |
| `DELETE` | `/projects/:projectId` | Project Owner, Org Admin, Admin | Архивировать проект |
| `POST` | `/projects/:projectId/publish` | Project Owner, Org Admin, Admin | Опубликовать проект |
| `POST` | `/projects/:projectId/start` | Project Owner, Captain, Org Admin | Перевести в работу |
| `POST` | `/projects/:projectId/complete` | Project Owner, Captain, Teacher, Org Admin | Завершить проект |
| `POST` | `/projects/:projectId/archive` | Project Owner, Org Admin, Admin | Архивировать проект |
| `GET` | `/organizations/:organizationId/projects` | Org Member / Public | Проекты организации |
| `GET` | `/users/:userId/projects` | Public / User | Проекты пользователя |

### Query parameters for `GET /projects`

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Поиск по названию и описанию |
| `type` | string | Тип проекта |
| `format` | string | `individual`, `team` |
| `status` | string | Статус проекта |
| `visibility` | string | Видимость |
| `organizationId` | uuid | Фильтр по организации |
| `skillId` | uuid | Фильтр по навыку |
| `city` | string | Город организации |

### POST `/projects`

Request:

```json
{
  "organizationId": "uuid",
  "title": "CampusForge",
  "slug": "campusforge",
  "shortDescription": "Платформа для проектной деятельности университета",
  "description": "Подробное описание проекта",
  "type": "educational",
  "format": "team",
  "visibility": "organization",
  "maxMembers": 5,
  "startDate": "2026-09-01",
  "endDate": "2026-12-20"
}
```

---

## 20. Project Members API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/members` | Project Access | Участники проекта |
| `POST` | `/projects/:projectId/members` | Project Owner, Captain, Org Admin | Добавить участника вручную |
| `PATCH` | `/projects/:projectId/members/:memberId` | Project Owner, Captain, Org Admin | Изменить статус участника |
| `DELETE` | `/projects/:projectId/members/:memberId` | Project Owner, Captain, Org Admin | Удалить участника |
| `POST` | `/projects/:projectId/members/:memberId/roles` | Project Owner, Captain, Org Admin | Назначить проектную роль |
| `DELETE` | `/projects/:projectId/members/:memberId/roles/:roleId` | Project Owner, Captain, Org Admin | Удалить проектную роль |
| `POST` | `/projects/:projectId/leave` | Project Member | Выйти из проекта |

---

## 21. Project Applications API

### Назначение

Заявки пользователей на вступление в проект.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/applications` | Project Owner, Captain, Org Admin | Список заявок в проект |
| `POST` | `/projects/:projectId/applications` | User | Подать заявку в проект |
| `GET` | `/project-applications/me` | User | Мои заявки |
| `POST` | `/projects/:projectId/applications/:applicationId/accept` | Project Owner, Captain, Org Admin | Принять заявку |
| `POST` | `/projects/:projectId/applications/:applicationId/reject` | Project Owner, Captain, Org Admin | Отклонить заявку |
| `POST` | `/project-applications/:applicationId/cancel` | Application Owner | Отменить свою заявку |

---

## 22. Project Invitations API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/invitations` | Project Owner, Captain, Org Admin | Список приглашений проекта |
| `POST` | `/projects/:projectId/invitations` | Project Owner, Captain, Org Admin | Пригласить пользователя |
| `GET` | `/project-invitations/me` | User | Мои приглашения |
| `POST` | `/project-invitations/:invitationId/accept` | Invited User | Принять приглашение |
| `POST` | `/project-invitations/:invitationId/reject` | Invited User | Отклонить приглашение |
| `POST` | `/projects/:projectId/invitations/:invitationId/cancel` | Project Owner, Captain, Org Admin | Отменить приглашение |

---

## 23. Project Skills, Links and Documents API

### Project skills

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/skills` | Public / Project Access | Навыки проекта |
| `POST` | `/projects/:projectId/skills` | Project Owner, Captain | Добавить навык |
| `PATCH` | `/projects/:projectId/skills/:skillId` | Project Owner, Captain | Обновить навык |
| `DELETE` | `/projects/:projectId/skills/:skillId` | Project Owner, Captain | Удалить навык |

### Project links

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/links` | Public / Project Access | Ссылки проекта |
| `POST` | `/projects/:projectId/links` | Project Owner, Captain, Member | Добавить ссылку |
| `PATCH` | `/projects/:projectId/links/:linkId` | Project Owner, Captain | Обновить ссылку |
| `DELETE` | `/projects/:projectId/links/:linkId` | Project Owner, Captain | Удалить ссылку |

### Project documents

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/documents` | Project Access | Документы проекта |
| `POST` | `/projects/:projectId/documents` | Project Member | Загрузить документ |
| `PATCH` | `/projects/:projectId/documents/:documentId` | Uploader, Captain, Owner | Обновить метаданные документа |
| `DELETE` | `/projects/:projectId/documents/:documentId` | Uploader, Captain, Owner | Удалить документ |
| `GET` | `/projects/:projectId/documents/:documentId/download` | Project Access | Скачать документ |

---

## 24. Task Boards API

### Назначение

Доски задач используются для Kanban-управления проектами.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/boards` | Project Member | Доски проекта |
| `POST` | `/projects/:projectId/boards` | Project Owner, Captain | Создать доску |
| `GET` | `/task-boards/:boardId` | Project Member | Получить доску |
| `PATCH` | `/task-boards/:boardId` | Project Owner, Captain | Обновить доску |
| `DELETE` | `/task-boards/:boardId` | Project Owner, Captain | Архивировать доску |

---

## 25. Task Columns API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/task-boards/:boardId/columns` | Project Member | Колонки доски |
| `POST` | `/task-boards/:boardId/columns` | Project Owner, Captain | Создать колонку |
| `PATCH` | `/task-columns/:columnId` | Project Owner, Captain | Обновить колонку |
| `DELETE` | `/task-columns/:columnId` | Project Owner, Captain | Удалить колонку |
| `PATCH` | `/task-boards/:boardId/columns/reorder` | Project Owner, Captain | Изменить порядок колонок |

### PATCH `/task-boards/:boardId/columns/reorder`

Request:

```json
{
  "columns": [
    { "columnId": "uuid", "position": 0 },
    { "columnId": "uuid", "position": 1 }
  ]
}
```

---

## 26. Tasks API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/task-boards/:boardId/tasks` | Project Member | Задачи доски |
| `POST` | `/task-boards/:boardId/tasks` | Project Member | Создать задачу |
| `GET` | `/tasks/:taskId` | Project Member | Получить задачу |
| `PATCH` | `/tasks/:taskId` | Task Author, Assignee, Captain, Owner | Обновить задачу |
| `DELETE` | `/tasks/:taskId` | Task Author, Captain, Owner | Удалить задачу |
| `PATCH` | `/tasks/:taskId/move` | Project Member | Переместить задачу в другую колонку |
| `POST` | `/tasks/:taskId/complete` | Assignee, Captain, Owner | Завершить задачу |
| `POST` | `/tasks/:taskId/reopen` | Assignee, Captain, Owner | Переоткрыть задачу |
| `GET` | `/tasks/my` | User | Мои задачи |

### POST `/task-boards/:boardId/tasks`

Request:

```json
{
  "columnId": "uuid",
  "title": "Сделать страницу проекта",
  "description": "Сверстать и подключить страницу карточки проекта",
  "priority": "high",
  "dueDate": "2026-10-10T18:00:00Z",
  "assigneeIds": ["uuid"]
}
```

### PATCH `/tasks/:taskId/move`

Request:

```json
{
  "columnId": "uuid",
  "position": 2
}
```

---

## 27. Task Assignees, Comments and Attachments API

### Assignees

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/tasks/:taskId/assignees` | Project Member | Исполнители задачи |
| `POST` | `/tasks/:taskId/assignees` | Project Member | Назначить исполнителя |
| `DELETE` | `/tasks/:taskId/assignees/:userId` | Project Member | Удалить исполнителя |

### Comments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/tasks/:taskId/comments` | Project Member | Комментарии задачи |
| `POST` | `/tasks/:taskId/comments` | Project Member | Добавить комментарий |
| `PATCH` | `/task-comments/:commentId` | Comment Author | Обновить комментарий |
| `DELETE` | `/task-comments/:commentId` | Comment Author, Captain, Owner | Удалить комментарий |

### Attachments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/tasks/:taskId/attachments` | Project Member | Файлы задачи |
| `POST` | `/tasks/:taskId/attachments` | Project Member | Загрузить файл |
| `DELETE` | `/task-attachments/:attachmentId` | Uploader, Captain, Owner | Удалить файл |
| `GET` | `/task-attachments/:attachmentId/download` | Project Member | Скачать файл |

---

## 28. Evaluation API

### Назначение

Оценивание проектов преподавателями, научными руководителями, менторами, жюри или представителями компаний.

---

## 29. Evaluation Criteria Sets API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/evaluation-criteria-sets` | User | Список наборов критериев |
| `POST` | `/evaluation-criteria-sets` | Teacher, Org Admin, Admin | Создать набор критериев |
| `GET` | `/evaluation-criteria-sets/:setId` | User | Получить набор критериев |
| `PATCH` | `/evaluation-criteria-sets/:setId` | Creator, Org Admin, Admin | Обновить набор критериев |
| `DELETE` | `/evaluation-criteria-sets/:setId` | Creator, Org Admin, Admin | Удалить набор критериев |
| `GET` | `/organizations/:organizationId/evaluation-criteria-sets` | Org Member | Наборы критериев организации |

---

## 30. Evaluation Criteria API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/evaluation-criteria-sets/:setId/criteria` | User | Критерии набора |
| `POST` | `/evaluation-criteria-sets/:setId/criteria` | Creator, Org Admin, Admin | Добавить критерий |
| `PATCH` | `/evaluation-criteria/:criterionId` | Creator, Org Admin, Admin | Обновить критерий |
| `DELETE` | `/evaluation-criteria/:criterionId` | Creator, Org Admin, Admin | Удалить критерий |
| `PATCH` | `/evaluation-criteria-sets/:setId/criteria/reorder` | Creator, Org Admin, Admin | Изменить порядок критериев |

---

## 31. Project Evaluations API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/evaluations` | Project Member, Teacher, Org Admin | Оценки проекта |
| `POST` | `/projects/:projectId/evaluations` | Teacher, Mentor, Jury, Reviewer, Org Admin | Создать оценку |
| `GET` | `/project-evaluations/:evaluationId` | Evaluation Access | Получить оценку |
| `PATCH` | `/project-evaluations/:evaluationId` | Evaluator | Обновить черновик оценки |
| `POST` | `/project-evaluations/:evaluationId/submit` | Evaluator | Отправить оценку |
| `DELETE` | `/project-evaluations/:evaluationId` | Evaluator, Org Admin, Admin | Удалить оценку |
| `GET` | `/users/:userId/evaluations` | User, Teacher, Org Admin | Оценки конкретного пользователя |

### POST `/projects/:projectId/evaluations`

Request:

```json
{
  "criteriaSetId": "uuid",
  "targetType": "project",
  "targetUserId": null,
  "comment": "Хорошая реализация проекта",
  "scores": [
    {
      "criterionId": "uuid",
      "score": 27,
      "comment": "Техническая часть выполнена хорошо"
    }
  ]
}
```

---

## 32. Project Reviews API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects/:projectId/reviews` | Project Access | Отзывы проекта |
| `POST` | `/projects/:projectId/reviews` | Teacher, Mentor, Company Rep, Project Member | Создать отзыв |
| `PATCH` | `/project-reviews/:reviewId` | Review Author | Обновить отзыв |
| `DELETE` | `/project-reviews/:reviewId` | Review Author, Org Admin, Admin | Удалить отзыв |
| `GET` | `/users/:userId/reviews` | Public / User | Отзывы пользователя |

---

## 33. Notifications API

### Назначение

Уведомления используются для заявок, приглашений, задач, комментариев, дедлайнов, оценок и системных сообщений.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | User | Мои уведомления |
| `GET` | `/notifications/unread-count` | User | Количество непрочитанных |
| `PATCH` | `/notifications/:notificationId/read` | User | Отметить как прочитанное |
| `PATCH` | `/notifications/read-all` | User | Отметить все как прочитанные |
| `DELETE` | `/notifications/:notificationId` | User | Удалить уведомление |
| `DELETE` | `/notifications` | User | Очистить уведомления |

### Query parameters

| Parameter | Type | Description |
|---|---|---|
| `isRead` | boolean | Фильтр по прочитанным |
| `type` | string | Тип уведомления |
| `page` | number | Страница |
| `limit` | number | Размер страницы |

---

## 34. Notification Settings API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notification-settings/me` | User | Мои настройки уведомлений |
| `PUT` | `/notification-settings/me` | User | Полное обновление настроек |
| `PATCH` | `/notification-settings/me` | User | Частичное обновление настроек |

### PATCH `/notification-settings/me`

Request:

```json
{
  "emailEnabled": true,
  "telegramEnabled": false,
  "deadlineRemindersEnabled": true,
  "marketingEnabled": false
}
```

---

## 35. Realtime Notifications API

Для уведомлений в реальном времени используется WebSocket.

### WebSocket URL

```text
/ws/notifications
```

### Authentication

```text
Authorization: Bearer <access_token>
```

### Events from server

| Event | Description |
|---|---|
| `notification.created` | Новое уведомление |
| `notification.read` | Уведомление прочитано |
| `notification.deleted` | Уведомление удалено |
| `task.updated` | Обновлена задача |
| `project.updated` | Обновлён проект |

Example payload:

```json
{
  "event": "notification.created",
  "data": {
    "id": "uuid",
    "type": "project_invitation",
    "title": "Вас пригласили в проект",
    "createdAt": "2026-06-22T12:00:00Z"
  }
}
```

---

## 36. Subscription Plans API

### Назначение

Тарифные планы для студентов, университетов и компаний.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/subscription-plans` | Public | Список активных тарифов |
| `GET` | `/subscription-plans/:planId` | Public | Получить тариф |
| `POST` | `/subscription-plans` | Admin | Создать тариф |
| `PATCH` | `/subscription-plans/:planId` | Admin | Обновить тариф |
| `DELETE` | `/subscription-plans/:planId` | Admin | Архивировать тариф |

---

## 37. Subscription Plan Limits API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/subscription-plans/:planId/limits` | Public / Admin | Лимиты тарифа |
| `POST` | `/subscription-plans/:planId/limits` | Admin | Добавить лимит |
| `PATCH` | `/subscription-plan-limits/:limitId` | Admin | Обновить лимит |
| `DELETE` | `/subscription-plan-limits/:limitId` | Admin | Удалить лимит |

Example limits:

```json
[
  { "limitKey": "max_projects", "valueType": "number", "numberValue": 10 },
  { "limitKey": "max_users", "valueType": "number", "numberValue": 100 },
  { "limitKey": "analytics_enabled", "valueType": "boolean", "booleanValue": true }
]
```

---

## 38. Subscriptions API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/subscriptions/me` | User | Моя подписка |
| `POST` | `/subscriptions` | User, Org Admin, Admin | Создать подписку |
| `GET` | `/subscriptions/:subscriptionId` | Owner, Org Admin, Admin | Получить подписку |
| `POST` | `/subscriptions/:subscriptionId/cancel` | Owner, Org Admin, Admin | Отменить подписку |
| `POST` | `/subscriptions/:subscriptionId/renew` | Owner, Org Admin, Admin | Продлить подписку |
| `GET` | `/organizations/:organizationId/subscription` | Org Admin, Admin | Подписка организации |
| `POST` | `/organizations/:organizationId/subscription` | Org Admin, Admin | Оформить подписку организации |
| `GET` | `/admin/subscriptions` | Admin | Все подписки |

### POST `/subscriptions`

Request:

```json
{
  "planId": "uuid",
  "subscriberType": "organization",
  "subscriberId": "uuid"
}
```

---

## 39. Usage Counters API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/usage/me` | User | Использование лимитов пользователя |
| `GET` | `/organizations/:organizationId/usage` | Org Admin, Admin | Использование лимитов организации |
| `POST` | `/usage/recalculate` | Admin | Пересчитать usage counters |

Example response:

```json
{
  "data": {
    "subscriberType": "organization",
    "subscriberId": "uuid",
    "counters": [
      { "counterKey": "users_count", "counterValue": 86 },
      { "counterKey": "projects_count", "counterValue": 42 },
      { "counterKey": "storage_used_mb", "counterValue": 2048 }
    ]
  }
}
```

---

## 40. Invoices and Payments API

Для MVP платежи можно сделать заглушкой, но API лучше заложить заранее.

### Invoices

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/invoices/me` | User | Мои счета |
| `GET` | `/organizations/:organizationId/invoices` | Org Admin, Admin | Счета организации |
| `GET` | `/invoices/:invoiceId` | Owner, Org Admin, Admin | Получить счёт |
| `POST` | `/subscriptions/:subscriptionId/invoices` | Admin | Создать счёт |
| `POST` | `/invoices/:invoiceId/cancel` | Admin | Отменить счёт |

### Payments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/invoices/:invoiceId/pay` | Owner, Org Admin | Начать оплату |
| `GET` | `/payments/:paymentId` | Owner, Org Admin, Admin | Получить платёж |
| `POST` | `/payments/webhook/:provider` | Payment Provider | Webhook платёжной системы |
| `GET` | `/admin/payments` | Admin | Все платежи |

---

## 41. Moderation API

### Назначение

Модераторы проверяют заявки организаций, жалобы, публичные проекты и потенциально нежелательный контент.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/moderation/dashboard` | Moderator, Admin | Сводка модерации |
| `GET` | `/moderation/organization-requests` | Moderator, Admin | Заявки организаций на проверку |
| `GET` | `/moderation/projects` | Moderator, Admin | Проекты на проверке |
| `POST` | `/moderation/projects/:projectId/approve` | Moderator, Admin | Одобрить проект |
| `POST` | `/moderation/projects/:projectId/reject` | Moderator, Admin | Отклонить проект |
| `POST` | `/moderation/users/:userId/block` | Moderator, Admin | Заблокировать пользователя |
| `POST` | `/moderation/users/:userId/unblock` | Moderator, Admin | Разблокировать пользователя |
| `POST` | `/moderation/organizations/:organizationId/block` | Moderator, Admin | Заблокировать организацию |
| `POST` | `/moderation/organizations/:organizationId/unblock` | Moderator, Admin | Разблокировать организацию |

---

## 42. Admin API

### Назначение

Полный системный доступ к платформе.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Admin | Общая админская сводка |
| `GET` | `/admin/users` | Admin | Все пользователи |
| `GET` | `/admin/organizations` | Admin | Все организации |
| `GET` | `/admin/projects` | Admin | Все проекты |
| `GET` | `/admin/tasks` | Admin | Все задачи |
| `GET` | `/admin/evaluations` | Admin | Все оценки |
| `GET` | `/admin/notifications` | Admin | Системные уведомления |
| `GET` | `/admin/subscriptions` | Admin | Все подписки |
| `GET` | `/admin/usage` | Admin | Использование лимитов |
| `GET` | `/admin/system-health` | Admin | Состояние системы |

---

## 43. Search API

### Назначение

Единый поиск по платформе.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/search` | Public / User | Глобальный поиск |
| `GET` | `/search/users` | User | Поиск пользователей |
| `GET` | `/search/projects` | Public / User | Поиск проектов |
| `GET` | `/search/organizations` | Public / User | Поиск организаций |
| `GET` | `/search/skills` | Public | Поиск навыков |

### GET `/search`

Example:

```http
GET /api/v1/search?q=react&type=projects,users,organizations
```

---

## 44. Recommendations API

Для MVP рекомендации могут быть простыми: совпадение навыков пользователя и навыков проекта.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/recommendations/projects` | User | Рекомендованные проекты |
| `GET` | `/recommendations/users-for-project/:projectId` | Project Owner, Captain | Рекомендованные участники |
| `GET` | `/recommendations/skills` | User | Рекомендованные навыки для профиля |

---

## 45. Analytics API

### Назначение

Аналитика для университетов, кафедр, компаний и администраторов.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/organizations/:organizationId/analytics/overview` | Org Admin, Admin | Общая аналитика организации |
| `GET` | `/organizations/:organizationId/analytics/projects` | Org Admin, Admin | Аналитика проектов |
| `GET` | `/organizations/:organizationId/analytics/students` | Org Admin, Admin | Активность студентов |
| `GET` | `/organizations/:organizationId/analytics/skills` | Org Admin, Admin | Карта навыков |
| `GET` | `/organizations/:organizationId/analytics/deadlines` | Org Admin, Admin | Дедлайны и просрочки |
| `GET` | `/admin/analytics/overview` | Admin | Общая аналитика платформы |

---

## 46. Files API

### Назначение

Универсальный API для работы с файлами, если нужно вынести загрузку отдельно от конкретных сущностей.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/files/upload` | User | Загрузить файл |
| `GET` | `/files/:fileId` | File Access | Получить метаданные файла |
| `GET` | `/files/:fileId/download` | File Access | Скачать файл |
| `DELETE` | `/files/:fileId` | Owner, Admin | Удалить файл |

Для MVP можно не делать отдельную таблицу `files`, а использовать `user_documents`, `project_documents`, `task_attachments`.

---

## 47. Public API

### Назначение

Публичные страницы, доступные без авторизации.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/public/projects` | Guest | Публичные проекты |
| `GET` | `/public/projects/:slug` | Guest | Публичная карточка проекта |
| `GET` | `/public/users/:userId/profile` | Guest | Публичный профиль пользователя |
| `GET` | `/public/organizations` | Guest | Публичные организации |
| `GET` | `/public/organizations/:slug` | Guest | Публичная карточка организации |
| `GET` | `/public/subscription-plans` | Guest | Публичные тарифы |

---

## 48. Access Control Summary

| Domain | User | Moderator | Admin | Org Admin | Project Owner / Captain | Project Member |
|---|---:|---:|---:|---:|---:|---:|
| Own profile | yes | yes | yes | no | no | no |
| Public profiles | yes | yes | yes | yes | yes | yes |
| User blocking | no | yes | yes | no | no | no |
| Organization approval | no | yes | yes | no | no | no |
| Organization settings | no | no | yes | yes | no | no |
| Project creation | yes | yes | yes | yes | yes | yes |
| Project editing | owner only | yes | yes | org projects | yes | limited |
| Task management | own projects | yes | yes | org projects | yes | yes |
| Evaluation | if evaluator | yes | yes | org projects | if allowed | view only |
| Subscriptions | own only | no | yes | organization only | no | no |

---

## 49. MVP API Scope

### MVP 1

```text
Auth
Users
Profiles
Skills
Organizations
Organization Requests
Organization Memberships
Projects
Project Members
Project Applications
Project Invitations
Task Boards
Tasks
Task Comments
Notifications
```

### MVP 2

```text
Project Documents
User Documents
Evaluation Criteria
Project Evaluations
Project Reviews
Subscription Plans
Subscriptions
Usage Counters
Analytics Overview
Moderation Dashboard
```

### Future — развитие продукта

```text
Payments
Advanced Analytics
Recommendations
GraphQL Gateway
Realtime Project Collaboration
Mobile Push Notifications
Certificates
Hackathons / Events
Portfolio Builder
```
