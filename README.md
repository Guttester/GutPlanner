# GutPlanner

Gerenciador de projetos e tarefas com quadro Kanban, desenvolvido com Angular e FastAPI.

## Funcionalidades

- Cadastro, autenticação e recuperação de senha.
- Gerenciamento de projetos e tarefas.
- Kanban com movimentação de tarefas por status.
- Criticidade, responsáveis, prazos, etiquetas e checklists.
- Comentários e vínculo entre tarefas da categoria Bug.
- Anexos PDF, PNG e JPEG, até 5 MiB por arquivo, verificados pelo ClamAV.
- Temas claro e escuro e interface responsiva.

## Tecnologias

Angular 19, TypeScript, Tailwind CSS, Python 3.12, FastAPI, Pydantic, MongoDB e Docker Compose. Mailpit captura e-mails de desenvolvimento; ClamAV verifica os anexos.

## Pré-requisitos

- Git.
- Node.js 22 com npm.
- Docker com suporte a contêineres Linux e Docker Compose v2.
- Aproximadamente 6 GB de RAM disponíveis para os serviços Docker.

## Instalação

Após clonar o repositório, execute os comandos abaixo a partir da raiz.

### 1. Dependências do frontend

```bash
cd gutplanner-front
npm ci
cd ..
```

As dependências do backend são instaladas automaticamente na imagem Docker a partir de `gutplanner-back/requirements.txt`. Não é necessário instalar Python na máquina para executar pelo Compose.

### 2. Configuração inicial

Crie `gutplanner-back/.env` caso ainda não exista, ou ajuste o arquivo existente com os valores locais:

```dotenv
ENVIRONMENT=development
PUBLIC_URL=http://localhost:4200
DEVELOPMENT_ORIGIN=http://localhost:4200
```

Não versione credenciais ou segredos. O Compose configura automaticamente as conexões entre API, MongoDB, Mailpit e ClamAV. Nenhuma conta de e-mail real ou rede Docker preexistente é necessária.

### 3. Backend e serviços

Com o Docker iniciado, execute na raiz:

```bash
docker compose --env-file gutplanner-back/.env -f gutplanner-back/compose.dev.yaml up -d --build
```

Esse comando instala as dependências e inicia a API, MongoDB, Mailpit e ClamAV. Na primeira execução, o scanner baixa suas assinaturas. Uploads ficam indisponíveis enquanto ele não estiver pronto. O banco criado no Docker começa vazio e persiste entre execuções.

### 4. Frontend

Em outro terminal:

```bash
cd gutplanner-front
npm start
```

| Serviço | Endereço local |
| --- | --- |
| Aplicação | http://localhost:4200 |
| Swagger da API | http://localhost:8000/api/docs |
| E-mails de teste | http://localhost:8025 |

Cadastre uma conta antes de solicitar recuperação. Um endereço fictício válido, como `pessoa@example.com`, pode ser usado: a mensagem será capturada pelo Mailpit. Use o mesmo endereço no cadastro e na recuperação.

As portas 4200, 8000 e 8025 precisam estar disponíveis. Para encerrar os serviços Docker, execute na raiz:

```bash
docker compose --env-file gutplanner-back/.env -f gutplanner-back/compose.dev.yaml down
```

## Estrutura

```text
gutplanner-front/
  src/app/
    component/      Componentes compartilhados
    core/           Modelos, serviços e infraestrutura do frontend
    features/       Funcionalidades da aplicação
gutplanner-back/
  main.py           Entrada da API
  src/
    Controller/     Rotas HTTP
    Service/        Regras de negócio
    Repository/     Acesso ao banco
    Model/          Modelos e validações
    Core/           Configuração e segurança
    Database/       Conexão e índices MongoDB
  Docker/           Arquivos de contêineres e serviços
  compose.dev.yaml  Ambiente local
```
