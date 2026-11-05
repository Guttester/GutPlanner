# Contratos â€” GutPlanner

AuthService e ProfileService jÃ¡ possuem chamadas HTTP no frontend; os demais contratos abaixo mapeiam operaÃ§Ãµes locais das features para integraÃ§Ã£o futura. O backend ainda nÃ£o implementa estas rotas.

## Login, cadastro e recuperaÃ§Ã£o â€” AuthService

```http
GET /api/auth/csrf
GET /api/auth/session
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register
POST /api/auth/password/recovery
PUT /api/auth/password
```

## Meu perfil â€” AccountSettingsService

```http
GET /api/user/me
PATCH /api/user/me
GET /api/projetos/{idProjeto}/convites
POST /api/projetos/{idProjeto}/convites
DELETE /api/projetos/{idProjeto}/convites/{idConvite}
```

## Dashboard e sidebar â€” ProjectsService

```http
GET /api/projetos
GET /api/projetos/{idProjeto}
POST /api/projetos
DELETE /api/projetos/{idProjeto}
```

## Dashboard, tarefas e Kanban â€” TaskService

```http
GET /api/tarefas
GET /api/projetos/{idProjeto}/tarefas
GET /api/projetos/{idProjeto}/tarefas/{idTarefa}
POST /api/projetos/{idProjeto}/tarefas
PUT /api/projetos/{idProjeto}/tarefas/{idTarefa}
DELETE /api/projetos/{idProjeto}/tarefas/{idTarefa}
PATCH /api/projetos/{idProjeto}/tarefas/{idTarefa}/status
PATCH /api/projetos/{idProjeto}/tarefas/{idTarefa}/checklist/{idItem}
POST /api/projetos/{idProjeto}/tarefas/{idTarefa}/comentarios
```

## Cadastro, ediÃ§Ã£o e Kanban â€” AttachmentService

```http
POST /api/projetos/{idProjeto}/tarefas/{idTarefa}/anexos
GET /api/projetos/{idProjeto}/tarefas/{idTarefa}/anexos/{idAnexo}
DELETE /api/projetos/{idProjeto}/tarefas/{idTarefa}/anexos/{idAnexo}
```

## Contato â€” ProfileService (API externa)

```http
GET https://guttester.io/profile
```

POST /api/auth/password/reset
