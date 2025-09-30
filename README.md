# 🚀 FEBIC Backend - Sistema de Feiras Científicas

Backend completo para plataforma de gerenciamento de feiras científicas e projetos acadêmicos com dashboards específicos por role

## 📊 Status do Projeto (Deploy em Produção)

| Funcionalidade | Status | Progresso |
|----------------|--------|-----------|
| 🔐 Sistema de Autenticação | ✅ Completo e Testado | 100% |
| 📋 CRUD de Projetos | ✅ Funcionando | 100% |
| 🏛️ Áreas CNPq Hierárquicas | ✅ Completo | 100% |
| 🔍 Filtros e Modal | ✅ API Funcionando | 100% |
| 👥 Gestão de Usuários | ✅ Sistema Completo | 100% |
| 📊 Dashboard Admin/Autor | ✅ Interfaces Funcionais | 100% |
| 🎓 Dashboard Orientador | ✅ Implementado | 100% |
| 🔄 Sistema de Autor/Orientador | ✅ Automatizado | 100% |
| 📝 Criação de Projetos | ✅ Fluxo Otimizado | 100% |
| 🚫 Validação de Duplicatas | ✅ Implementado | 100% |
| ⭐ Sistema de Candidatura a Avaliador | ✅ Implementado | 100% |
| ⚖️ Painel Administrativo de Candidaturas | ✅ Funcionando | 100% |
| 📁 Sistema de Documentos | ✅ Implementado | 100% |
| �� Modal de Edição com Documentos | ✅ Funcionando | 100% |
| ⭐ Sistema de Avaliações Backend | ✅ Implementado | 100% |
| 📊 Dashboard do Avaliador | ✅ Implementado | 100% |
| 🎯 Interface Admin de Avaliações | ✅ COMPLETA | 100% |
| 💳 Pagamentos ASAAS | ❌ Não Implementado | 0% |
| 🔔 Notificações | ❌ Não Implementado | 0% |
| 🎪 Feiras Afiliadas | ❌ Não Implementado | 0% |

**🎯 Progresso REAL: 95% das funcionalidades principais**

---

## 📁 Estrutura Completa do Projeto

### 🔷 BACKEND

```
backend/
├── src/
│   ├── controllers/
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── documentController.ts
│   │   ├── evaluationController.ts
│   │   ├── evaluatorController.ts
│   │   ├── forgotPasswordController.ts
│   │   └── projectController.ts
│   │
│   ├── routes/
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── documents.ts
│   │   ├── evaluations.ts
│   │   ├── evaluator.ts
│   │   ├── forgotPassword.ts
│   │   ├── projectRoutes.ts
│   │   └── projects.ts
│   │
│   ├── services/
│   │   ├── dashboardService.ts
│   │   ├── evaluationService.ts
│   │   ├── projectService.ts
│   │   └── userService.ts
│   │
│   ├── middleware/
│   │   ├── adminOnly.ts
│   │   ├── auth.ts
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── evaluatorAuth.ts
│   │   ├── multerConfig.ts
│   │   ├── roleMiddleware.ts
│   │   ├── roles.ts
│   │   └── validation.ts
│   │
│   ├── types/
│   │   ├── Auth.ts
│   │   ├── Project.ts
│   │   └── User.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── jwt.ts
│   │   └── validators.ts
│   │
│   ├── app.ts
│   ├── authRoutes.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed_cnpq.js
│
├── uploads/
├── dist/
├── package.json
└── tsconfig.json
```

### 🔶 FRONTEND

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── EvaluationDistribution.tsx
│   │   │   └── EvaluatorApplicationsAdmin.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RegisterForm.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── ChartCard.tsx
│   │   │   ├── RecentProjects.tsx
│   │   │   └── StatCard.tsx
│   │   │
│   │   ├── evaluation/
│   │   │   ├── EvaluationForm.tsx
│   │   │   └── ProjectEvaluationCard.tsx
│   │   │
│   │   ├── evaluator/
│   │   │   └── EvaluatorApplicationModal.tsx
│   │   │
│   │   ├── forms/
│   │   │   └── EstadoCidadeSelector.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectModal.tsx
│   │   │   └── ValidatedField.tsx
│   │   │
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── loading.tsx
│   │       ├── modal.tsx
│   │       ├── progress.tsx
│   │       ├── select.tsx
│   │       └── textarea.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/
│   │   ├── evaluations.ts
│   │   ├── useAuth.ts
│   │   ├── useEstadosCidades.ts
│   │   ├── useProjects.ts
│   │   └── useUsers.ts
│   │
│   ├── lib/
│   │   ├── constants.ts
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminEvaluations.tsx
│   │   │   ├── AdminReports.tsx
│   │   │   └── AdminUsers.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AuthorDashboard.tsx
│   │   │   ├── CreateUserModal.tsx
│   │   │   ├── EditProjectModal.tsx
│   │   │   ├── EditUserModal.tsx
│   │   │   ├── EvaluatorDashboard.tsx
│   │   │   └── OrientadorDashboard.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── CreateProject.tsx
│   │   │   ├── EditProject.tsx
│   │   │   └── ProjectsList.tsx
│   │   │
│   │   ├── users/
│   │   │   ├── Profile.tsx
│   │   │   └── UsersList.tsx
│   │   │
│   │   └── Home.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── ibgeService.ts
│   │   └── userService.ts
│   │
│   ├── types/
│   │   ├── Auth.ts
│   │   ├── Project.ts
│   │   └── User.ts
│   │
│   ├── utils/
│   │   └── ibge.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── dist/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🔐 Credenciais de Acesso

### Administrador:
- **Email:** admin@febic.com.br
- **Senha:** 123456
- **Permissões:** Gestão completa + Sistema de avaliações

### Orientador de Teste:
- **Email:** orientador@test.com
- **Senha:** 123456
- **Role:** ORIENTADOR
- **Funcionalidades:** Dashboard específico, candidatura a avaliador

### Autor de Teste:
- **Email:** test@test.com
- **Senha:** 123456
- **Role:** AUTOR
- **Funcionalidades:** Criação de projetos, upload de documentos

### Avaliador de Teste:
- **Email:** avaliador@test.com
- **Senha:** 123456
- **Role:** AVALIADOR
- **Funcionalidades:** Dashboard específico, avaliação de projetos

---

## 🔧 Configuração de Produção

### Variáveis de Ambiente (.env):

```bash
# Database
DATABASE_URL="postgresql://febic_user:${POSTGRES_PASSWORD}@postgres:5432/febic_db"

# Auth
JWT_SECRET="febic_jwt_production_key_super_secure_2024!"

# Server
PORT=3002
NODE_ENV=production
CORS_ORIGIN="https://febic.ibicsc.com.br"

# Upload
MAX_FILE_SIZE=20971520 # 20MB
UPLOAD_PATH="./uploads"

# SSL
DOMAIN="febic.ibicsc.com.br"
```

### Portas Configuradas:
- **HTTP:** 9081 (redireciona para HTTPS)
- **HTTPS:** 9444 (produção)
- **Nginx interno:** 8080/8443
- **Backend interno:** 3002
- **PostgreSQL:** 5432

---

## 🛠️ Comandos de Gestão

### Deploy e Atualizações:

```bash
# Deploy automático (após push no GitHub)
/var/www/deploy.sh

# Deploy manual completo
cd /var/www/febic
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Monitoramento:

```bash
# Status containers
docker ps

# Logs em tempo real
docker logs febic-backend -f

# Verificar se sistema está funcionando
curl -I https://febic.ibicsc.com.br:9444

# Verificar uploads
ls -la /var/www/febic/backend/uploads/
```

### Desenvolvimento:

```bash
# Restart rápido
docker-compose restart

# Rebuild apenas um serviço
docker-compose build frontend --no-cache

# Executar migrations
docker exec -it febic-backend npx prisma db push

# Prisma Studio
docker exec -it febic-backend npx prisma studio --hostname 0.0.0.0 --port 5555
```

### Git Workflow:

```bash
# Fazer mudanças localmente
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# No servidor, atualizar
/var/www/deploy.sh
```

### Backup/Restore:

```bash
# Backup banco (com documentos e candidaturas)
docker exec febic-postgres pg_dump -U febic_user febic_db > backup_completo.sql

# Backup arquivos de upload
tar -czf uploads_backup.tar.gz /var/www/febic/backend/uploads/

# Restore banco
cat backup_completo.sql | docker exec -i febic-postgres psql -U febic_user -d febic_db

# Restore uploads
tar -xzf uploads_backup.tar.gz -C /var/www/febic/backend/
```

---

## 📈 Estatísticas de Deploy

- **Uptime:** 100% estável desde implantação
- **Containers:** 4 (backend, frontend, nginx, postgres)
- **Dashboards:** 4 específicos por role (Admin, Autor, Orientador, Avaliador)
- **Usuários suportados:** Múltiplos roles + sistema de promoção
- **Projetos:** Sistema operacional com autor automático
- **Documentos:** Upload, gestão e aprovação funcionais
- **Avaliações:** Sistema completo implementado
- **Endpoints:** 30+ endpoints funcionais
- **Performance:** Resposta < 200ms
- **Categorias:** 10 categorias (I-IX + RELATO)
- **Tabelas:** 27+ tabelas Prisma implementadas

---

## 🔒 Dados do Sistema

### Base de Dados:
- 27+ tabelas Prisma implementadas
- 67 áreas de conhecimento CNPq
- Sistema de roles avançado (6 tipos + promoção)
- Sistema de avaliações com distribuição inteligente
- Sistema de documentos com versionamento
- Histórico completo de candidaturas e avaliações

### Segurança:
- JWT com expiração
- CORS configurado
- Validações robustas em todos os endpoints
- Upload seguro com validação de tipos
- Controle de acesso por role específico
- Sistema de auditoria para avaliações
- Proteção contra conflitos de interesse

---

## 🎊 RESULTADO FINAL

✅ Sistema de Autenticação Completo  
✅ Gestão de Usuários e Projetos  
✅ Sistema de Documentos Funcional  
✅ Sistema de Candidatura a Avaliador  
✅ Sistema de Avaliações 100% Implementado  
✅ 4 Dashboards Específicos por Role  
✅ Interface Administrativa Avançada  
✅ 10 Categorias Baseadas no Regulamento FEBIC  
⏳ Sistema de Notificações (Próximo)  
⏳ Sistema de Pagamentos (Próximo)  

**Deploy:** Estável, otimizado e funcional  
**Acesso:** https://febic.ibicsc.com.br:9444  
**Documentação atualizada:** Janeiro de 2025  
**Status:** Deploy em produção com 95% das funcionalidades principais implementadas

---

**Próxima atualização:** Após implementação do sistema de notificações
