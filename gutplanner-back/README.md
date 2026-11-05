# Backend — GutPlanner

- Instalar: `python -m pip install -r requirements.txt`.
- Configurar no ambiente `MONGODB_URI` e `MONGODB_DATABASE` (padrão: `gutplanner`). O `.env` existente é carregado automaticamente ao iniciar o backend local.
- MongoDB precisa de replica set para as transações de exclusão e anexos.
- Produção: `ENVIRONMENT=production` e `PUBLIC_URL=https://seu-dominio`.
- Iniciar: `uvicorn main:app`. A inicialização cria índices e disponibiliza os serviços em `app.state.services`.
- `app.state.authorizationStore` consulta sessões persistidas, expiração, versão da senha e participação no projeto.
- Controllers dos contratos de negócio estão conectados aos serviços e expostos em `/api`.
- Recuperação usa SMTP configurado no ambiente; o Compose de desenvolvimento conecta automaticamente ao Mailpit.
- Convites são registrados como pendentes. Envio e aceite ainda não têm contrato no Swagger; criar convite não concede acesso automaticamente.
- Anexos ficam em documentos MongoDB separados, com limite de 5 MB. O Controller deverá limitar a leitura do upload antes de materializar o conteúdo.
- Testes: `python -m unittest discover -s tests -v`. Os testes de serviços usam repositórios simulados; não substituem testes de integração com MongoDB.

## Segurança dos anexos

- Apenas PDF, PNG e JPEG, até 5 MiB por arquivo. Extensão, MIME e assinatura inicial precisam corresponder; isso sozinho não comprova segurança.
- Sessão, CSRF e acesso à tarefa são conferidos antes do multipart. Corpo limitado a 6 MiB, incluindo overhead; até 4 uploads simultâneos por processo, 30 segundos totais para recebimento e 15 segundos de inatividade.
- ClamAV via INSTREAM antes de persistir. Somente resposta explícita `stream: OK` libera armazenamento; ameaça retorna 422, falha/timeout retorna 503. Sem scanner funcionando, uploads ficam bloqueados.
- Arquivos ficam no MongoDB com ID gerado pelo servidor, nunca em caminhos derivados do nome. Não são executados, descompactados ou convertidos pelo backend. Multipart pode usar temporários do sistema; isolar e limitar esse diretório no deploy.
- Anexos antigos sem marca de inspeção são examinados antes do download. PDFs são entregues como download; imagens mantêm visualização. Não há garantia de ausência de malware desconhecido.

### ClamAV e VPS — configuração necessária antes de publicar

Configure `CLAMAV_HOST` e `CLAMAV_PORT` no backend no `.env` existente. Instale um ClamAV suportado, atualize as assinaturas com `freshclam` e mantenha atualizações automáticas monitoradas. No `clamd.conf`, integre estas opções à configuração da instalação:

```conf
TCPSocket 3310
TCPAddr 127.0.0.1
StreamMaxLength 6M
MaxFileSize 6M
MaxScanSize 25M
MaxRecursion 8
MaxFiles 100
HeuristicAlerts yes
AlertExceedsMax yes
AlertEncrypted yes
ScanPDF yes
ScanArchive yes
ReadTimeout 15
CommandReadTimeout 5
```

Rejeitar criptografia e limites de inspeção evita aceitar como limpo um conteúdo que não pôde ser inspecionado. Valide a compatibilidade das opções com a versão instalada. Não configure `VirusEvent` para executar comandos com dados do arquivo.

Em contêineres separados, use o nome privado do scanner no backend e sua interface interna no clamd; não publique 3310. Clamd TCP não tem autenticação nem TLS. MongoDB também deve permanecer privado.

API e scanner devem executar com usuários sem root/sudo, sem modo privilegiado, sem acesso ao socket Docker, às chaves SSH ou aos diretórios do host. Use filesystem somente leitura quando possível, temporários isolados com limites e restrições `noexec,nosuid,nodev`, limites de memória/CPU e credencial MongoDB restrita ao banco da aplicação. Restrinja SSH por firewall e autenticação por chave; não altere SSH remotamente sem validar acesso alternativo.

A integração no código não instala nem configura esses controles na VPS. Antes do deploy, valide scanner real, assinaturas atualizadas, rejeição do arquivo de teste oficial EICAR, PDFs/imagens legítimos e indisponibilidade do scanner. Os testes locais usam um servidor de protocolo simulado, não um antivírus real. Quotas totais por usuário/projeto ainda precisam ser definidas para limitar crescimento do armazenamento.

Referências: [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [ClamAV INSTREAM](https://docs.clamav.net/manual/Usage/ClamdProtocol.html), [configuração oficial](https://github.com/Cisco-Talos/clamav/blob/main/etc/clamd.conf.sample).


## Recuperação de senha por e-mail

Configure SMTP_HOST, SMTP_PORT, SMTP_SECURITY, SMTP_FROM e, quando exigidos, SMTP_USER/SMTP_PASSWORD no .env do backend. Sem SMTP_HOST, a recuperação retorna 503. Credenciais nunca devem ser versionadas. PUBLIC_URL define o domínio do link; produção exige HTTPS e SMTP com TLS.

Para desenvolvimento, use Mailpit local com SMTP em 127.0.0.1:1025 e caixa web em http://localhost:8025. Exemplo Docker: `docker run --rm --name gutplanner-mailpit -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 axllent/mailpit`. Para esse teste local, ajuste SMTP_HOST=127.0.0.1, SMTP_PORT=1025 e SMTP_SECURITY=none no .env existente e reinicie o backend; em produção, use os dados do provedor e TLS. Use um endereço cadastrado para gerar a mensagem; ela fica na caixa local. Não é enviado e-mail real. Fixe uma versão/imagem revisada no deploy.

O link abre /redefinir-senha com o token no fragmento; a tela remove o token da barra de endereço após lê-lo. O token expira em 30 minutos, só é armazenado como hash e é consumido na mesma atualização atômica que troca a senha, no documento do usuário. A recuperação funciona também com MongoDB standalone. Solicite um novo link caso tenha sido gerado antes dessa alteração. A troca invalida as sessões anteriores. Não encaminhe links reais nem os registre em logs. Um novo pedido substitui o token anterior.


Mailpit instalado para testes neste Windows em `.local/mailpit/mailpit.exe` (ignorado pelo Git). Para iniciar novamente pela raiz: `.\.local\mailpit\mailpit.exe --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025 --allowed-hosts localhost,127.0.0.1 --disable-version-check`. Abra http://localhost:8025. Em desenvolvimento, os links usam DEVELOPMENT_ORIGIN quando configurada; em produção usam PUBLIC_URL. Nunca copie SMTP_SECURITY=none para produção.


## Backend em Docker (desenvolvimento)

Na pasta `gutplanner-back`, execute com Docker Desktop no modo de contêineres Linux:

```powershell
docker compose -f compose.dev.yaml up -d --build
```

O Compose inicia a API FastAPI, MongoDB com replica set de um nó, inicialização do replica set, Mailpit e ClamAV. O scanner precisa baixar as assinaturas na primeira inicialização; a API aguarda MongoDB e Mailpit ficarem saudáveis; ela inicia assim que o ClamAV começa, sem aguardar o download das assinaturas. Enquanto o scanner não responder, uploads falham fechados com erro 503. Reserve pelo menos 6 GB de RAM para o Docker; o limite do scanner é 4 GB.

- API e Swagger: http://localhost:8000/api/docs
- Caixa de e-mail de testes: http://localhost:8025
- Frontend: execute `npm start` na pasta `gutplanner-front` e abra http://localhost:4200. Seu proxy `/api` continua apontando para a API local na porta 8000.

Antes de subir, pare a API Python local e a instância anterior do Mailpit, para liberar as portas 8000 e 8025. Não é necessário parar o MongoDB instalado no Windows, pois o MongoDB Docker não publica a porta 27017.

As configurações de desenvolvimento estão no próprio Compose: SMTP usa `mailpit:1025`, antivírus usa `clamav:3310` e MongoDB usa `mongo:27017`. Não exige credenciais de e-mail nem outro `.env`. PUBLIC_URL é obrigatório e vem do `.env` existente (https://planner.guttester.io); o Compose falha se estiver ausente. DEVELOPMENT_ORIGIN continua http://localhost:4200 para testes locais. O Compose também aceita BACKEND_PORT opcional; as configurações dos serviços no contêiner substituem as conexões locais. O `.env` não é copiado para a imagem.

O banco Docker começa vazio e é independente do MongoDB do Windows. Cadastre uma conta de teste antes de pedir recuperação. Os links abrem em localhost:4200 em desenvolvimento. O Compose local cria suas próprias redes e não depende de uma rede externa. A integração anterior com o proxy fica preservada no arquivo opcional `Docker/compose.external.yaml`. Para usá-la, execute `docker compose --env-file .env -f compose.dev.yaml -f Docker/compose.external.yaml up -d --build` na pasta do backend; a rede externa precisa existir somente nesse modo. O MongoDB permanece apenas na rede interna sem autenticação, exclusivamente para este ambiente local; não publique este arquivo como configuração de produção na VPS.

As pastas MongoDB e as assinaturas ClamAV persistem em volumes nomeados. As mensagens Mailpit são temporárias. A API e o scanner executam sem root; banco e scanner não publicam portas. A imagem da API copia somente dependências, `main.py` e `src`, sem testes, segredos ou arquivos locais.

```powershell
# Estado dos serviços
docker compose -f compose.dev.yaml ps
# Diagnosticar o scanner (primeira inicialização pode baixar assinaturas)
docker compose -f compose.dev.yaml logs --tail=120 clamav
# Acompanhar inicialização dos outros serviços
docker compose -f compose.dev.yaml logs -f backend mongo-init clamav
# Atualizar o backend depois de alterar código
docker compose -f compose.dev.yaml up -d --build backend
# Encerrar preservando os dados
docker compose -f compose.dev.yaml down
```

O build não usa bind mount nem reload automático: reconstrua a imagem após mudanças. Evite `down -v` se quiser preservar os dados. Frontend e Caddy continuam fora deste Compose. Na VPS, conecte o Caddy à rede `Guttester` e use `reverse_proxy gutplanner-backend:8000` para `/api/*`, preservando o prefixo.

Referências: [dependências no Compose](https://docs.docker.com/compose/how-tos/startup-order/) e [ClamAV Docker](https://docs.clamav.net/manual/Installing/Docker.html).
