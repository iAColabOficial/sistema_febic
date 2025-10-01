--
-- PostgreSQL database dump
--

\restrict OxxjyFmAQmmb1cfiDdyjHLpwmncFe5FjszcfRHYliMigeTdghnnDf1Hf6GoeLDo

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: febic_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO febic_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: febic_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Category; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."Category" AS ENUM (
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'RELATO'
);


ALTER TYPE public."Category" OWNER TO febic_user;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."DocumentType" AS ENUM (
    'PROJETO_COMPLETO',
    'RESUMO_EXECUTIVO',
    'DIARIO_BORDO',
    'AUTORIZACAO_IMAGEM',
    'AUTORIZACAO_RESPONSAVEL',
    'COMPROVANTE_PAGAMENTO',
    'DECLARACAO_ORIENTADOR',
    'DECLARACAO_INSTITUICAO',
    'CERTIFICADO_APRESENTACAO',
    'RELATORIO_TECNICO',
    'ANEXOS_TECNICOS',
    'FOTOS_PROJETO',
    'VIDEOS_PROJETO',
    'PLANILHA_DADOS',
    'CERTIFICADO_FEIRA_AFILIADA',
    'OUTROS_DOCUMENTOS'
);


ALTER TYPE public."DocumentType" OWNER TO febic_user;

--
-- Name: EvaluatorApplicationStatus; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."EvaluatorApplicationStatus" AS ENUM (
    'PENDENTE',
    'APROVADA',
    'REPROVADA'
);


ALTER TYPE public."EvaluatorApplicationStatus" OWNER TO febic_user;

--
-- Name: InstitutionType; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."InstitutionType" AS ENUM (
    'PUBLICA_MUNICIPAL',
    'PUBLICA_ESTADUAL',
    'PUBLICA_FEDERAL',
    'PRIVADA',
    'FILANTROPIA',
    'COOPERATIVA',
    'ONG'
);


ALTER TYPE public."InstitutionType" OWNER TO febic_user;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'PIX',
    'BOLETO',
    'CARTAO_CREDITO',
    'CARTAO_DEBITO',
    'TRANSFERENCIA',
    'DINHEIRO'
);


ALTER TYPE public."PaymentMethod" OWNER TO febic_user;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDENTE',
    'PROCESSANDO',
    'APROVADO',
    'REJEITADO',
    'EXPIRADO',
    'ESTORNADO',
    'ISENTO'
);


ALTER TYPE public."PaymentStatus" OWNER TO febic_user;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'RASCUNHO',
    'SUBMETIDO',
    'EM_ANALISE_CIAS',
    'APROVADO_CIAS',
    'REPROVADO_CIAS',
    'AGUARDANDO_PAGAMENTO',
    'CONFIRMADO_VIRTUAL',
    'FINALISTA_PRESENCIAL',
    'PREMIADO',
    'ARQUIVADO'
);


ALTER TYPE public."ProjectStatus" OWNER TO febic_user;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: febic_user
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMINISTRADOR',
    'AUTOR',
    'AVALIADOR',
    'ORIENTADOR',
    'FEIRA_AFILIADA',
    'FINANCEIRO',
    'COORDENADOR_AVALIACOES'
);


ALTER TYPE public."UserRole" OWNER TO febic_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AreaConhecimento; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."AreaConhecimento" (
    id text NOT NULL,
    sigla text NOT NULL,
    nome text NOT NULL,
    nivel integer NOT NULL,
    "paiId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AreaConhecimento" OWNER TO febic_user;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO febic_user;

--
-- Name: EvaluatorApplication; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."EvaluatorApplication" (
    id text NOT NULL,
    "userId" text NOT NULL,
    motivation text NOT NULL,
    experience text NOT NULL,
    expertise text,
    categories text[],
    "areasOfKnowledge" text[],
    status public."EvaluatorApplicationStatus" DEFAULT 'PENDENTE'::public."EvaluatorApplicationStatus" NOT NULL,
    "adminNotes" text,
    "evaluatedAt" timestamp(3) without time zone,
    "evaluatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EvaluatorApplication" OWNER TO febic_user;

--
-- Name: FeiraAfiliada; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."FeiraAfiliada" (
    id text NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    edition text NOT NULL,
    year integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "credencialToken" text NOT NULL,
    "maxProjects" integer DEFAULT 50 NOT NULL,
    "contactName" text NOT NULL,
    "contactEmail" text NOT NULL,
    "contactPhone" text,
    "managerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FeiraAfiliada" OWNER TO febic_user;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    objective text NOT NULL,
    methodology text NOT NULL,
    results text,
    conclusion text,
    bibliography text,
    category public."Category" NOT NULL,
    "areaConhecimentoId" text NOT NULL,
    keywords text[],
    "researchLine" text,
    institution text NOT NULL,
    "institutionCity" text NOT NULL,
    "institutionState" text NOT NULL,
    "institutionCountry" text DEFAULT 'Brasil'::text NOT NULL,
    "isPublicSchool" boolean DEFAULT false NOT NULL,
    "isRuralSchool" boolean DEFAULT false NOT NULL,
    "isIndigenous" boolean DEFAULT false NOT NULL,
    "hasDisability" boolean DEFAULT false NOT NULL,
    "socialVulnerability" boolean DEFAULT false NOT NULL,
    status public."ProjectStatus" DEFAULT 'RASCUNHO'::public."ProjectStatus" NOT NULL,
    "currentStage" text,
    "isPaid" boolean DEFAULT false NOT NULL,
    "paymentRequired" boolean DEFAULT true NOT NULL,
    "paymentAmount" numeric(10,2) DEFAULT 120.00 NOT NULL,
    "paymentDueDate" timestamp(3) without time zone,
    "isPaymentExempt" boolean DEFAULT false NOT NULL,
    "exemptionReason" text,
    "submissionDate" timestamp(3) without time zone,
    "ciasResultDate" timestamp(3) without time zone,
    "virtualStartDate" timestamp(3) without time zone,
    "virtualEndDate" timestamp(3) without time zone,
    "presentialDate" timestamp(3) without time zone,
    "passedCias" boolean DEFAULT false NOT NULL,
    "passedVirtual" boolean DEFAULT false NOT NULL,
    "isFinalist" boolean DEFAULT false NOT NULL,
    "isAwarded" boolean DEFAULT false NOT NULL,
    "feiraAfiliadaId" text,
    "ownerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Project" OWNER TO febic_user;

--
-- Name: ProjectAvaliacao; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."ProjectAvaliacao" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "avaliadorId" text NOT NULL,
    "notaInovacao" numeric(3,1),
    "notaMetodologia" numeric(3,1),
    "notaRelevancia" numeric(3,1),
    "notaApresentacao" numeric(3,1),
    "notaImpacto" numeric(3,1),
    "notaViabilidade" numeric(3,1),
    "notaFinal" numeric(3,1),
    "pesoTotal" numeric(3,2) DEFAULT 1.00,
    "comentarioGeral" text,
    "pontosFortes" text,
    "pontosMelhoria" text,
    sugestoes text,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectAvaliacao" OWNER TO febic_user;

--
-- Name: ProjectAward; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."ProjectAward" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    title text NOT NULL,
    description text,
    "position" integer,
    "certificateGenerated" boolean DEFAULT false NOT NULL,
    "certificatePath" text,
    "certificateCode" text,
    "awardedBy" text,
    amount numeric(10,2),
    "awardedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectAward" OWNER TO febic_user;

--
-- Name: ProjectDocument; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."ProjectDocument" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    name text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    description text,
    version integer DEFAULT 1 NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isApproved" boolean,
    "rejectionReason" text,
    "isPublic" boolean DEFAULT false NOT NULL,
    "downloadCount" integer DEFAULT 0 NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectDocument" OWNER TO febic_user;

--
-- Name: ProjectMember; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."ProjectMember" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text,
    name text NOT NULL,
    email text,
    cpf text,
    rg text,
    "birthDate" timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    phone text,
    address text,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text,
    "schoolLevel" text NOT NULL,
    "schoolYear" text,
    institution text NOT NULL,
    "isIndigenous" boolean DEFAULT false NOT NULL,
    "hasDisability" boolean DEFAULT false NOT NULL,
    "isRural" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectMember" OWNER TO febic_user;

--
-- Name: ProjectOrientador; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."ProjectOrientador" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text,
    name text NOT NULL,
    email text NOT NULL,
    cpf text,
    phone text,
    formation text NOT NULL,
    area text NOT NULL,
    institution text NOT NULL,
    "position" text,
    city text NOT NULL,
    state text NOT NULL,
    "yearsExperience" integer,
    "lattesUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectOrientador" OWNER TO febic_user;

--
-- Name: ProjectPagamento; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."ProjectPagamento" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDENTE'::public."PaymentStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod",
    "externalId" text,
    "paymentUrl" text,
    "qrCodePix" text,
    barcode text,
    "payerName" text,
    "payerCpf" text,
    "payerEmail" text,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "transactionId" text,
    "authorizationCode" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectPagamento" OWNER TO febic_user;

--
-- Name: SystemConfig; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."SystemConfig" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemConfig" OWNER TO febic_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    cpf text,
    "passwordHash" text NOT NULL,
    phone text,
    "birthDate" timestamp(3) without time zone,
    gender text,
    nationality text DEFAULT 'Brasileiro'::text,
    address text,
    neighborhood text,
    city text,
    state text,
    "zipCode" text,
    country text DEFAULT 'Brasil'::text,
    institution text,
    "position" text,
    formation text,
    role public."UserRole" DEFAULT 'AUTOR'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone,
    "lastLogin" timestamp(3) without time zone,
    "loginCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO febic_user;

--
-- Name: UserNotification; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public."UserNotification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "isSent" boolean DEFAULT false NOT NULL,
    data jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserNotification" OWNER TO febic_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: febic_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO febic_user;

--
-- Data for Name: AreaConhecimento; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."AreaConhecimento" (id, sigla, nome, nivel, "paiId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."AuditLog" (id, "userId", action, entity, "entityId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: EvaluatorApplication; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."EvaluatorApplication" (id, "userId", motivation, experience, expertise, categories, "areasOfKnowledge", status, "adminNotes", "evaluatedAt", "evaluatedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FeiraAfiliada; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."FeiraAfiliada" (id, name, city, state, edition, year, "startDate", "endDate", "isActive", "credencialToken", "maxProjects", "contactName", "contactEmail", "contactPhone", "managerId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."Project" (id, title, summary, objective, methodology, results, conclusion, bibliography, category, "areaConhecimentoId", keywords, "researchLine", institution, "institutionCity", "institutionState", "institutionCountry", "isPublicSchool", "isRuralSchool", "isIndigenous", "hasDisability", "socialVulnerability", status, "currentStage", "isPaid", "paymentRequired", "paymentAmount", "paymentDueDate", "isPaymentExempt", "exemptionReason", "submissionDate", "ciasResultDate", "virtualStartDate", "virtualEndDate", "presentialDate", "passedCias", "passedVirtual", "isFinalist", "isAwarded", "feiraAfiliadaId", "ownerId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectAvaliacao; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."ProjectAvaliacao" (id, "projectId", "avaliadorId", "notaInovacao", "notaMetodologia", "notaRelevancia", "notaApresentacao", "notaImpacto", "notaViabilidade", "notaFinal", "pesoTotal", "comentarioGeral", "pontosFortes", "pontosMelhoria", sugestoes, "isCompleted", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectAward; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."ProjectAward" (id, "projectId", title, description, "position", "certificateGenerated", "certificatePath", "certificateCode", "awardedBy", amount, "awardedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectDocument; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."ProjectDocument" (id, "projectId", name, "filePath", "fileSize", "mimeType", description, version, "isRequired", "isApproved", "rejectionReason", "isPublic", "downloadCount", "uploadedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectMember; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."ProjectMember" (id, "projectId", "userId", name, email, cpf, rg, "birthDate", gender, phone, address, city, state, "zipCode", "schoolLevel", "schoolYear", institution, "isIndigenous", "hasDisability", "isRural", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectOrientador; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."ProjectOrientador" (id, "projectId", "userId", name, email, cpf, phone, formation, area, institution, "position", city, state, "yearsExperience", "lattesUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectPagamento; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."ProjectPagamento" (id, "projectId", amount, status, "paymentMethod", "externalId", "paymentUrl", "qrCodePix", barcode, "payerName", "payerCpf", "payerEmail", "dueDate", "paidAt", "expiresAt", "transactionId", "authorizationCode", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SystemConfig; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."SystemConfig" (id, key, value, type, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."User" (id, name, email, cpf, "passwordHash", phone, "birthDate", gender, nationality, address, neighborhood, city, state, "zipCode", country, institution, "position", formation, role, "isActive", "emailVerified", "emailVerifiedAt", "lastLogin", "loginCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserNotification; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."UserNotification" (id, "userId", title, message, type, "isRead", "isSent", data, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
906ea822-6eba-42ac-b416-902e9d22fdd1	e3d549dcae6814ba223c0daec24b8f306aa0a93456e9cdff36bc079b700359e4	2025-09-30 21:18:15.150181+00	20250930211815_add_coordenador_avaliacoes_role	\N	\N	2025-09-30 21:18:15.029721+00	1
\.


--
-- Name: AreaConhecimento AreaConhecimento_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."AreaConhecimento"
    ADD CONSTRAINT "AreaConhecimento_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: EvaluatorApplication EvaluatorApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."EvaluatorApplication"
    ADD CONSTRAINT "EvaluatorApplication_pkey" PRIMARY KEY (id);


--
-- Name: FeiraAfiliada FeiraAfiliada_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."FeiraAfiliada"
    ADD CONSTRAINT "FeiraAfiliada_pkey" PRIMARY KEY (id);


--
-- Name: ProjectAvaliacao ProjectAvaliacao_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectAvaliacao"
    ADD CONSTRAINT "ProjectAvaliacao_pkey" PRIMARY KEY (id);


--
-- Name: ProjectAward ProjectAward_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectAward"
    ADD CONSTRAINT "ProjectAward_pkey" PRIMARY KEY (id);


--
-- Name: ProjectDocument ProjectDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectDocument"
    ADD CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY (id);


--
-- Name: ProjectMember ProjectMember_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY (id);


--
-- Name: ProjectOrientador ProjectOrientador_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectOrientador"
    ADD CONSTRAINT "ProjectOrientador_pkey" PRIMARY KEY (id);


--
-- Name: ProjectPagamento ProjectPagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectPagamento"
    ADD CONSTRAINT "ProjectPagamento_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: SystemConfig SystemConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."SystemConfig"
    ADD CONSTRAINT "SystemConfig_pkey" PRIMARY KEY (id);


--
-- Name: UserNotification UserNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."UserNotification"
    ADD CONSTRAINT "UserNotification_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AreaConhecimento_sigla_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "AreaConhecimento_sigla_key" ON public."AreaConhecimento" USING btree (sigla);


--
-- Name: EvaluatorApplication_createdAt_idx; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE INDEX "EvaluatorApplication_createdAt_idx" ON public."EvaluatorApplication" USING btree ("createdAt");


--
-- Name: EvaluatorApplication_status_idx; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE INDEX "EvaluatorApplication_status_idx" ON public."EvaluatorApplication" USING btree (status);


--
-- Name: EvaluatorApplication_userId_idx; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE INDEX "EvaluatorApplication_userId_idx" ON public."EvaluatorApplication" USING btree ("userId");


--
-- Name: FeiraAfiliada_credencialToken_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "FeiraAfiliada_credencialToken_key" ON public."FeiraAfiliada" USING btree ("credencialToken");


--
-- Name: ProjectAvaliacao_projectId_avaliadorId_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "ProjectAvaliacao_projectId_avaliadorId_key" ON public."ProjectAvaliacao" USING btree ("projectId", "avaliadorId");


--
-- Name: ProjectAward_certificateCode_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "ProjectAward_certificateCode_key" ON public."ProjectAward" USING btree ("certificateCode");


--
-- Name: ProjectMember_projectId_cpf_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "ProjectMember_projectId_cpf_key" ON public."ProjectMember" USING btree ("projectId", cpf);


--
-- Name: ProjectOrientador_projectId_email_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "ProjectOrientador_projectId_email_key" ON public."ProjectOrientador" USING btree ("projectId", email);


--
-- Name: SystemConfig_key_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "SystemConfig_key_key" ON public."SystemConfig" USING btree (key);


--
-- Name: User_cpf_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "User_cpf_key" ON public."User" USING btree (cpf);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: febic_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AreaConhecimento AreaConhecimento_paiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."AreaConhecimento"
    ADD CONSTRAINT "AreaConhecimento_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES public."AreaConhecimento"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EvaluatorApplication EvaluatorApplication_evaluatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."EvaluatorApplication"
    ADD CONSTRAINT "EvaluatorApplication_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EvaluatorApplication EvaluatorApplication_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."EvaluatorApplication"
    ADD CONSTRAINT "EvaluatorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FeiraAfiliada FeiraAfiliada_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."FeiraAfiliada"
    ADD CONSTRAINT "FeiraAfiliada_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAvaliacao ProjectAvaliacao_avaliadorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectAvaliacao"
    ADD CONSTRAINT "ProjectAvaliacao_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAvaliacao ProjectAvaliacao_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectAvaliacao"
    ADD CONSTRAINT "ProjectAvaliacao_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectAward ProjectAward_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectAward"
    ADD CONSTRAINT "ProjectAward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectDocument ProjectDocument_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectDocument"
    ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMember ProjectMember_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMember ProjectMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectMember"
    ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProjectOrientador ProjectOrientador_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectOrientador"
    ADD CONSTRAINT "ProjectOrientador_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectOrientador ProjectOrientador_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectOrientador"
    ADD CONSTRAINT "ProjectOrientador_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProjectPagamento ProjectPagamento_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."ProjectPagamento"
    ADD CONSTRAINT "ProjectPagamento_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_areaConhecimentoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_areaConhecimentoId_fkey" FOREIGN KEY ("areaConhecimentoId") REFERENCES public."AreaConhecimento"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Project Project_feiraAfiliadaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_feiraAfiliadaId_fkey" FOREIGN KEY ("feiraAfiliadaId") REFERENCES public."FeiraAfiliada"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Project Project_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserNotification UserNotification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: febic_user
--

ALTER TABLE ONLY public."UserNotification"
    ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: febic_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict OxxjyFmAQmmb1cfiDdyjHLpwmncFe5FjszcfRHYliMigeTdghnnDf1Hf6GoeLDo

