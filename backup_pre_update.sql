--
-- PostgreSQL database dump
--

\restrict cTInIgkgH0KehfB2UXNYVxP2MyjyjwcV5NArv572PM6Ss0Zqxrp1BplxKtq3Wia

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
    'FINANCEIRO'
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
EXATAS	EXATAS	Ciências Exatas e da Terra	1	\N	t	2025-09-20 22:35:56.669	2025-09-20 22:35:56.669
BIOLOGICAS	BIOLOGICAS	Ciências Biológicas	1	\N	t	2025-09-20 22:35:56.672	2025-09-20 22:35:56.672
ENGENHARIAS	ENGENHARIAS	Engenharias	1	\N	t	2025-09-20 22:35:56.674	2025-09-20 22:35:56.674
SAUDE	SAUDE	Ciências da Saúde	1	\N	t	2025-09-20 22:35:56.676	2025-09-20 22:35:56.676
AGRARIAS	AGRARIAS	Ciências Agrárias	1	\N	t	2025-09-20 22:35:56.678	2025-09-20 22:35:56.678
SOCIAIS	SOCIAIS	Ciências Sociais	1	\N	t	2025-09-20 22:35:56.68	2025-09-20 22:35:56.68
HUMANAS	HUMANAS	Ciências Humanas	1	\N	t	2025-09-20 22:35:56.682	2025-09-20 22:35:56.682
cmfsuksjv00011hbd8kab3o24	MAT	Matemática	2	EXATAS	t	2025-09-20 22:35:56.684	2025-09-20 22:35:56.684
cmfsuksjy00031hbdco87mom1	EST	Probabilidade e Estatística	2	EXATAS	t	2025-09-20 22:35:56.686	2025-09-20 22:35:56.686
cmfsuksk000051hbdygtowe7q	CCP	Ciência da Computação	2	EXATAS	t	2025-09-20 22:35:56.688	2025-09-20 22:35:56.688
cmfsuksk100071hbdkb98k776	AST	Astronomia	2	EXATAS	t	2025-09-20 22:35:56.69	2025-09-20 22:35:56.69
cmfsuksk300091hbdonffqz12	FIS	Física	2	EXATAS	t	2025-09-20 22:35:56.691	2025-09-20 22:35:56.691
cmfsuksk5000b1hbdbc0p3sek	QUI	Química	2	EXATAS	t	2025-09-20 22:35:56.693	2025-09-20 22:35:56.693
cmfsuksk7000d1hbdxnq523o6	GEO	Geociências	2	EXATAS	t	2025-09-20 22:35:56.695	2025-09-20 22:35:56.695
cmfsuksk9000f1hbdtge2xbxr	OCE	Oceanografia	2	EXATAS	t	2025-09-20 22:35:56.697	2025-09-20 22:35:56.697
cmfsukska000h1hbdkgrf114i	BIG	Biologia Geral	2	BIOLOGICAS	t	2025-09-20 22:35:56.699	2025-09-20 22:35:56.699
cmfsukskd000j1hbd89wt17nv	GEN	Genética	2	BIOLOGICAS	t	2025-09-20 22:35:56.701	2025-09-20 22:35:56.701
cmfsukskg000l1hbdyv1z8f0m	BOT	Botânica	2	BIOLOGICAS	t	2025-09-20 22:35:56.704	2025-09-20 22:35:56.704
cmfsukskh000n1hbd398facb8	ZOO	Zoologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.706	2025-09-20 22:35:56.706
cmfsukski000p1hbd1grnkghj	ECL	Ecologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.707	2025-09-20 22:35:56.707
cmfsukskj000r1hbdtei6d5hb	MOR	Morfologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.708	2025-09-20 22:35:56.708
cmfsukskl000t1hbdx7v516tq	FSL	Fisiologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.709	2025-09-20 22:35:56.709
cmfsukskm000v1hbdgss5t03e	BIQ	Bioquímica	2	BIOLOGICAS	t	2025-09-20 22:35:56.71	2025-09-20 22:35:56.71
cmfsuksko000x1hbdx4wmj91j	BFI	Biofísica	2	BIOLOGICAS	t	2025-09-20 22:35:56.712	2025-09-20 22:35:56.712
cmfsukskp000z1hbdslyk245u	FMC	Farmacologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.714	2025-09-20 22:35:56.714
cmfsukskq00111hbd4gg4pxnd	IMU	Imunologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.715	2025-09-20 22:35:56.715
cmfsuksks00131hbdetvx19j4	MIC	Microbiologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.716	2025-09-20 22:35:56.716
cmfsukskt00151hbd7l58o0e0	PAR	Parasitologia	2	BIOLOGICAS	t	2025-09-20 22:35:56.718	2025-09-20 22:35:56.718
cmfsukskv00171hbd5x304mzs	CIV	Engenharia Civil	2	ENGENHARIAS	t	2025-09-20 22:35:56.719	2025-09-20 22:35:56.719
cmfsukskw00191hbdegzivwfr	MIN	Engenharia de Minas	2	ENGENHARIAS	t	2025-09-20 22:35:56.72	2025-09-20 22:35:56.72
cmfsukskx001b1hbd46pz00p4	EMM	Engenharia de Materiais e Metalúrgica	2	ENGENHARIAS	t	2025-09-20 22:35:56.721	2025-09-20 22:35:56.721
cmfsuksky001d1hbdrwwgp3v3	ELE	Engenharia Elétrica	2	ENGENHARIAS	t	2025-09-20 22:35:56.722	2025-09-20 22:35:56.722
cmfsukskz001f1hbdf6i5niis	MEC	Engenharia Mecânica	2	ENGENHARIAS	t	2025-09-20 22:35:56.723	2025-09-20 22:35:56.723
cmfsuksl0001h1hbdn2jyydrm	EQU	Engenharia Química	2	ENGENHARIAS	t	2025-09-20 22:35:56.724	2025-09-20 22:35:56.724
cmfsuksl1001j1hbdyy7kb603	EFL	Engenharia Florestal	2	ENGENHARIAS	t	2025-09-20 22:35:56.725	2025-09-20 22:35:56.725
cmfsuksl2001l1hbd11q156an	TRA	Engenharia de Transportes	2	ENGENHARIAS	t	2025-09-20 22:35:56.726	2025-09-20 22:35:56.726
cmfsuksl3001n1hbd7vyu7dfr	NAV	Engenharia Naval e Oceânica	2	ENGENHARIAS	t	2025-09-20 22:35:56.727	2025-09-20 22:35:56.727
cmfsuksl4001p1hbd8lx4qn2w	AER	Engenharia Aeroespacial	2	ENGENHARIAS	t	2025-09-20 22:35:56.728	2025-09-20 22:35:56.728
cmfsuksl5001r1hbdlr51xczx	NUC	Engenharia Nuclear	2	ENGENHARIAS	t	2025-09-20 22:35:56.729	2025-09-20 22:35:56.729
cmfsuksl6001t1hbdru2i4f8o	EAG	Engenharia Agrícola	2	ENGENHARIAS	t	2025-09-20 22:35:56.731	2025-09-20 22:35:56.731
cmfsuksl7001v1hbdz4k28th6	EBM	Engenharia Biomédica	2	ENGENHARIAS	t	2025-09-20 22:35:56.732	2025-09-20 22:35:56.732
cmfsuksl9001x1hbd4ieauo1s	ROB	Robótica e Inteligência Computacional	2	ENGENHARIAS	t	2025-09-20 22:35:56.733	2025-09-20 22:35:56.733
cmfsuksla001z1hbd57nq4qag	MED	Medicina	2	SAUDE	t	2025-09-20 22:35:56.734	2025-09-20 22:35:56.734
cmfsukslb00211hbdntzdg4q3	ODO	Odontologia	2	SAUDE	t	2025-09-20 22:35:56.735	2025-09-20 22:35:56.735
cmfsukslc00231hbd4yqu3pmk	FAR	Farmácia	2	SAUDE	t	2025-09-20 22:35:56.736	2025-09-20 22:35:56.736
cmfsuksld00251hbd0q2684yj	ENF	Enfermagem	2	SAUDE	t	2025-09-20 22:35:56.738	2025-09-20 22:35:56.738
cmfsuksle00271hbdp63a02u2	NUT	Nutrição	2	SAUDE	t	2025-09-20 22:35:56.739	2025-09-20 22:35:56.739
cmfsukslf00291hbdwzvgvnnw	SCO	Saúde Coletiva	2	SAUDE	t	2025-09-20 22:35:56.74	2025-09-20 22:35:56.74
cmfsukslg002b1hbdvggnaf8p	FON	Fonoaudiologia	2	SAUDE	t	2025-09-20 22:35:56.741	2025-09-20 22:35:56.741
cmfsukslh002d1hbdbl2yi2xb	FTO	Fisioterapia e Terapia Ocupacional	2	SAUDE	t	2025-09-20 22:35:56.742	2025-09-20 22:35:56.742
cmfsuksli002f1hbdz7npngi8	EDF	Educação Física	2	SAUDE	t	2025-09-20 22:35:56.743	2025-09-20 22:35:56.743
cmfsukslk002h1hbdy9ojotp8	AGR	Agronomia	2	AGRARIAS	t	2025-09-20 22:35:56.744	2025-09-20 22:35:56.744
cmfsuksll002j1hbddc1580an	RFL	Recursos Florestais e Engenharia Florestal	2	AGRARIAS	t	2025-09-20 22:35:56.745	2025-09-20 22:35:56.745
cmfsukslm002l1hbdurxmrihn	RPE	Recursos Pesqueiros e Engenharia de Pesca	2	AGRARIAS	t	2025-09-20 22:35:56.746	2025-09-20 22:35:56.746
cmfsuksln002n1hbd2d7ko9mx	VET	Medicina Veterinária	2	AGRARIAS	t	2025-09-20 22:35:56.747	2025-09-20 22:35:56.747
cmfsukslo002p1hbdc561ur4a	ZOT	Zootecnia	2	AGRARIAS	t	2025-09-20 22:35:56.749	2025-09-20 22:35:56.749
cmfsukslp002r1hbd4m04mlgp	CTA	Ciência e Tecnologia de Alimentos	2	AGRARIAS	t	2025-09-20 22:35:56.75	2025-09-20 22:35:56.75
cmfsukslq002t1hbd153a962c	DIR	Direito	2	SOCIAIS	t	2025-09-20 22:35:56.751	2025-09-20 22:35:56.751
cmfsukslr002v1hbd2sdncpwz	ADM	Administração	2	SOCIAIS	t	2025-09-20 22:35:56.752	2025-09-20 22:35:56.752
cmfsuksls002x1hbdgozfwdp1	ECO	Economia	2	SOCIAIS	t	2025-09-20 22:35:56.753	2025-09-20 22:35:56.753
cmfsukslt002z1hbdvg9l8kyx	ARQ	Arquitetura e Urbanismo	2	SOCIAIS	t	2025-09-20 22:35:56.754	2025-09-20 22:35:56.754
cmfsukslv00311hbdfj5ddpxg	PLA	Planejamento Urbano e Regional	2	SOCIAIS	t	2025-09-20 22:35:56.755	2025-09-20 22:35:56.755
cmfsukslw00331hbdkm92dz34	DEM	Demografia	2	SOCIAIS	t	2025-09-20 22:35:56.756	2025-09-20 22:35:56.756
cmfsukslx00351hbd7o9vijt9	CIN	Ciência da Informação	2	SOCIAIS	t	2025-09-20 22:35:56.757	2025-09-20 22:35:56.757
cmfsuksly00371hbdn6p5n5xg	MUS	Museologia	2	SOCIAIS	t	2025-09-20 22:35:56.759	2025-09-20 22:35:56.759
cmfsuksm000391hbd61w3juk7	COM	Comunicação	2	SOCIAIS	t	2025-09-20 22:35:56.76	2025-09-20 22:35:56.76
cmfsuksm1003b1hbd2kprbwxi	SER	Serviço Social	2	SOCIAIS	t	2025-09-20 22:35:56.762	2025-09-20 22:35:56.762
cmfsuksm3003d1hbdpjx4q3kb	TUR	Turismo	2	SOCIAIS	t	2025-09-20 22:35:56.763	2025-09-20 22:35:56.763
cmfsuksm5003f1hbdvzsyd0ge	FIL	Filosofia	2	HUMANAS	t	2025-09-20 22:35:56.765	2025-09-20 22:35:56.765
cmfsuksm6003h1hbd6l2h9wa5	SOC	Sociologia	2	HUMANAS	t	2025-09-20 22:35:56.767	2025-09-20 22:35:56.767
cmfsuksm8003j1hbdrd8l8n9z	ANT	Antropologia	2	HUMANAS	t	2025-09-20 22:35:56.768	2025-09-20 22:35:56.768
cmfsuksma003l1hbdvi7vedmz	ARH	Arqueologia	2	HUMANAS	t	2025-09-20 22:35:56.77	2025-09-20 22:35:56.77
cmfsuksmb003n1hbdlqxsij1a	HIS	História	2	HUMANAS	t	2025-09-20 22:35:56.772	2025-09-20 22:35:56.772
cmfsuksmd003p1hbdaykda42l	GEH	Geografia	2	HUMANAS	t	2025-09-20 22:35:56.773	2025-09-20 22:35:56.773
cmfsuksme003r1hbdweaga443	PSI	Psicologia	2	HUMANAS	t	2025-09-20 22:35:56.775	2025-09-20 22:35:56.775
cmfsuksmg003t1hbdqisv0mhb	EDU	Educação	2	HUMANAS	t	2025-09-20 22:35:56.776	2025-09-20 22:35:56.776
cmfsuksmh003v1hbd9dihcpi5	CPO	Ciência Política	2	HUMANAS	t	2025-09-20 22:35:56.778	2025-09-20 22:35:56.778
cmfsuksmj003x1hbd7oa7q116	TEO	Teologia	2	HUMANAS	t	2025-09-20 22:35:56.779	2025-09-20 22:35:56.779
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."AuditLog" (id, "userId", action, entity, "entityId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
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
cmftz6m9l0003j1s8h0y1iq1d	Gerador de numero de loteria	lksjaldkjlaskdjlqkj asdkjasldkjasd sadlkjas dasldkj asd	alkjdslksajdlskajlksajdlkasjl	lkajsdlkjsdlakjdlaskjdlaskjdlsakjdlaksjdlaskjdlkasjdlask	\N	\N	\N	IV	cmfsuksk000051hbdygtowe7q	{}	\N	ASDasdas	Lambari	SC	Brasil	t	f	f	f	f	SUBMETIDO	\N	f	t	120.00	\N	f	\N	2025-09-21 17:34:26.277	\N	\N	\N	\N	f	f	f	f	\N	cmftyv6xz0001j1s8h6r17wmm	2025-09-21 17:32:39.607	2025-09-21 17:34:26.278
cmfx75q6e00022pe3d5ja1yhr	Teste Teste	Teste TesteTeste TesteTeste TesteTeste TesteTeste Teste	Teste TesteTeste TesteTeste Teste	Teste TesteTeste TesteTeste TesteTeste TesteTeste TesteTeste Teste				VII	cmfsuksli002f1hbdz7npngi8	{}		Nossa	Pomerode	SC	Brasil	f	f	f	f	f	RASCUNHO	\N	f	t	120.00	\N	f		\N	\N	\N	\N	\N	f	f	f	f	\N	cmft1jp680000j1s8w01zybeu	2025-09-23 23:39:13.478	2025-09-23 23:39:13.478
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
cmftz6m9m0005j1s8jrm3nayg	cmftz6m9l0003j1s8h0y1iq1d	\N	Maria de Lurdes	maria@gmail.com	\N	\N	2000-10-10 00:00:00	Feminino	\N	\N	Lambari	SC	8888888888	Ensino Técnico	2	asdasdas	f	f	f	2025-09-21 17:32:39.607	2025-09-21 17:32:39.607
cmfx75q6j00032pe3ao1vd3fs	cmfx75q6e00022pe3d5ja1yhr	cmfsv0ngc0000r659h7v8w6mq	Bruno Soares	brunosoaresdesign@gmail.com	01572089156		1987-05-13 00:00:00	Masculino	(47) 99237-1595	Rua 30	Pomerode	SC	89107000	Ensino Médio	2	minha	f	f	f	2025-09-23 23:39:13.484	2025-09-23 23:39:13.484
\.


--
-- Data for Name: ProjectOrientador; Type: TABLE DATA; Schema: public; Owner: febic_user
--

COPY public."ProjectOrientador" (id, "projectId", "userId", name, email, cpf, phone, formation, area, institution, "position", city, state, "yearsExperience", "lattesUrl", "createdAt", "updatedAt") FROM stdin;
cmftz6m9m0007j1s81on2zl1j	cmftz6m9l0003j1s8h0y1iq1d	\N	Joao da SIlva	joao@gmaill.com	22746157055	\N	Mestre	Ciencia de dados	sadasdas	\N	Lambari	SC	1	\N	2025-09-21 17:32:39.607	2025-09-21 17:32:39.607
cmfx75q6o00042pe3eql9k9qu	cmfx75q6e00022pe3d5ja1yhr	cmft1jp680000j1s8w01zybeu	Ana Kelly 	ana@febic.com.br	06507442158	(12) 31231-2312	Fonoaudiologia	Fonoaudiologia	Nossa	Ensino Superior	Pomerode	SC	0		2025-09-23 23:39:13.488	2025-09-23 23:39:13.488
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
cmfsumv440000q1d7gpgokfq9	Test User	test@test.com	12345678901	$2a$10$ftbwVNZhZST0Rl3Ok2/B4uYFudZi0V7MMfEN.GD76/CRMK8IDeodO	(11) 99999-9999	\N	\N	Brasileiro	\N	\N	São Paulo	SP	\N	Brasil	\N	\N	\N	AUTOR	t	f	\N	2025-09-20 22:37:47.611	1	2025-09-20 22:37:33.317	2025-09-20 22:37:47.612
cmft1jp680000j1s8w01zybeu	Ana Kelly 	ana@febic.com.br	06507442158	$2a$12$7mPvyEIIyZU5AAmch4awFuFraE34B16.bdE5NuaUM0UOlr.xVtJWW	(12) 31231-2312	2001-05-05 00:00:00	Feminino	Brasileiro	Rua 10	Centro	Pomerode	SC	89107000	Brasil	Nossa	Ensino Superior	Fonoaudiologia	ORIENTADOR	t	f	\N	2025-09-23 23:41:04.517	13	2025-09-21 01:51:02.96	2025-09-23 23:41:04.518
cmfsv0ngc0000r659h7v8w6mq	Bruno Soares	brunosoaresdesign@gmail.com	01572089156	$2a$12$w5Azi5YLldudZd5kigT00usg0CyNRo8BBkt.1xaFlH6QLPficeetq	(47) 99237-1595	1987-05-13 00:00:00	Masculino	Brasileiro	Rua 30	Centro	Pomerode	SC	89107000	Brasil	minha	Pós-graduação	Redes	AUTOR	t	f	\N	2025-09-23 23:41:49.322	47	2025-09-20 22:48:16.572	2025-09-23 23:41:49.323
cmfu1b88k0000ud33vo190xmz	Admin FEBIC	admin@febic.com.br	99999999999	$2a$12$k6q0yxTfpSWNQmx/lm0K7.iGJ1ucMcr4VrLfmJh.utBcEMluAyLTO	(47) 99999-9999	\N	\N	Brasileiro	\N	\N	Blumenau	SC	\N	Brasil	\N	\N	\N	ADMINISTRADOR	t	f	\N	2025-09-23 23:47:12.068	13	2025-09-21 18:32:13.941	2025-09-23 23:47:12.07
cmftyv6xz0001j1s8h6r17wmm	Leandro Rodrigues	leandro@gmail.com	48564921014	$2a$12$tJgo/B7GZ1zZpisuE4tr0.tM/4Rt84mTNn6l91ccgEotTeutWXrfa	(49) 99991-9199	1990-01-01 00:00:00	Masculino	Brasileiro	sadasdasdas	Centro	Lambari	SC	88888888	Brasil	asdasdasd	Ensino Técnico	\N	ORIENTADOR	t	f	\N	2025-09-21 17:54:11.957	2	2025-09-21 17:23:46.535	2025-09-21 17:54:11.958
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

\unrestrict cTInIgkgH0KehfB2UXNYVxP2MyjyjwcV5NArv572PM6Ss0Zqxrp1BplxKtq3Wia

