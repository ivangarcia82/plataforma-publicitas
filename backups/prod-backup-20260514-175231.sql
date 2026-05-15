--
-- PostgreSQL database dump
--

\restrict jUxIYm1N3yy8tGAyIjdOetTkqdztPdfsGtTgTGqQHvZeaFe4CsuGF4ZddGup4zP

-- Dumped from database version 17.8 (9c8634e)
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: CitaComercial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CitaComercial" (
    id text NOT NULL,
    dia text NOT NULL,
    status text DEFAULT 'Tentativa'::text NOT NULL,
    horario text NOT NULL,
    transporte text DEFAULT ''::text NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clienteId" text NOT NULL,
    "ejecutivoId" text NOT NULL
);


--
-- Name: CitaGenerada; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CitaGenerada" (
    id text NOT NULL,
    fecha text NOT NULL,
    accion text DEFAULT 'Otro'::text NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clienteId" text NOT NULL,
    "ejecutivoId" text NOT NULL
);


--
-- Name: Cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cliente" (
    id text NOT NULL,
    nombre text NOT NULL,
    cargo text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    telefono text DEFAULT ''::text NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    "empresaId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Ejecutivo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Ejecutivo" (
    id text NOT NULL,
    nombre text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    telefono text DEFAULT ''::text NOT NULL,
    cargo text DEFAULT ''::text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Empresa" (
    id text NOT NULL,
    nombre text NOT NULL,
    "ciudadEstado" text DEFAULT ''::text NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ejecutivoId" text NOT NULL
);


--
-- Name: InventarioObsequio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventarioObsequio" (
    id text NOT NULL,
    nombre text NOT NULL,
    "stockTotal" integer NOT NULL,
    "stockActual" integer NOT NULL,
    "alertaMinimo" integer DEFAULT 5 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MaterialDigital; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaterialDigital" (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text DEFAULT ''::text NOT NULL,
    categoria text DEFAULT 'General'::text NOT NULL,
    url text NOT NULL,
    tipo text DEFAULT 'pdf'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Obsequio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Obsequio" (
    id text NOT NULL,
    fecha text NOT NULL,
    "tipoCliente" text DEFAULT 'Prospecto'::text NOT NULL,
    observaciones text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    articulo text DEFAULT ''::text NOT NULL,
    "clienteId" text NOT NULL,
    "ejecutivoId" text NOT NULL
);


--
-- Name: ParticipanteRifa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ParticipanteRifa" (
    id text NOT NULL,
    nombre text NOT NULL,
    empresa text DEFAULT ''::text NOT NULL,
    cargo text DEFAULT ''::text NOT NULL,
    email text NOT NULL,
    telefono text DEFAULT ''::text NOT NULL,
    "diaRifa" text NOT NULL,
    "numeroTicket" integer NOT NULL,
    "ejecutivoId" text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    comentario text DEFAULT ''::text NOT NULL,
    "reviewId" text,
    "ganoEn" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    entregado boolean DEFAULT false NOT NULL,
    rechazado boolean DEFAULT false NOT NULL
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    nombre text NOT NULL,
    empresa text DEFAULT ''::text NOT NULL,
    cargo text DEFAULT ''::text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    texto text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: StaffMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StaffMember" (
    id text NOT NULL,
    nombre text NOT NULL,
    rol text DEFAULT 'Staff'::text NOT NULL,
    "diaAsignado" text NOT NULL,
    "horarioEntrada" text NOT NULL,
    "horarioSalida" text NOT NULL,
    "horaComida" text DEFAULT ''::text NOT NULL,
    seccion text DEFAULT ''::text NOT NULL,
    "viaticoCantidad" double precision DEFAULT 0 NOT NULL,
    "viaticoStatus" text DEFAULT 'Pendiente'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    nombre text NOT NULL,
    rol text DEFAULT 'ejecutivo'::text NOT NULL,
    "ejecutivoId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Data for Name: CitaComercial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CitaComercial" (id, dia, status, horario, transporte, notas, "createdAt", "updatedAt", "clienteId", "ejecutivoId") FROM stdin;
cmp48jmzh003mv3hjgc9ka7fs	Día 1	Tentativa				2026-05-13 15:49:46.397	2026-05-13 15:49:46.397	cmp48jmy4003kv3hj9cbb36h6	cmp48jj4j0001v3hjp9e9fydv
cmp48jn64003sv3hj1pneadii	Día 1	Tentativa				2026-05-13 15:49:46.637	2026-05-13 15:49:46.637	cmp48jn4t003qv3hj07q26gti	cmp48jj770003v3hj03s9h7on
cmp48jn7f003uv3hj9ekcztg7	Día 2	Tentativa				2026-05-13 15:49:46.684	2026-05-13 15:49:46.684	cmp48jn4t003qv3hj07q26gti	cmp48jj770003v3hj03s9h7on
cmp48jn8s003wv3hjgdnj8lev	Día 3	Tentativa				2026-05-13 15:49:46.733	2026-05-13 15:49:46.733	cmp48jn4t003qv3hj07q26gti	cmp48jj770003v3hj03s9h7on
cmp48jnbf0040v3hjklgcoyz9	Día 1	Tentativa				2026-05-13 15:49:46.828	2026-05-13 15:49:46.828	cmp48jna4003yv3hj9j588tiv	cmp48jj770003v3hj03s9h7on
cmp48jncs0042v3hj3wupoiez	Día 2	Tentativa				2026-05-13 15:49:46.877	2026-05-13 15:49:46.877	cmp48jna4003yv3hj9j588tiv	cmp48jj770003v3hj03s9h7on
cmp48jne50044v3hjvp8kj2a4	Día 3	Tentativa				2026-05-13 15:49:46.925	2026-05-13 15:49:46.925	cmp48jna4003yv3hj9j588tiv	cmp48jj770003v3hj03s9h7on
cmp48jni00048v3hjsg6f3gic	Día 1	Tentativa				2026-05-13 15:49:47.064	2026-05-13 15:49:47.064	cmp48jngo0046v3hjnb1h73tb	cmp48jj770003v3hj03s9h7on
cmp48jnjd004av3hj33a9k24v	Día 2	Tentativa				2026-05-13 15:49:47.113	2026-05-13 15:49:47.113	cmp48jngo0046v3hjnb1h73tb	cmp48jj770003v3hj03s9h7on
cmp48jnko004cv3hj6ahg1vf9	Día 3	Tentativa				2026-05-13 15:49:47.16	2026-05-13 15:49:47.16	cmp48jngo0046v3hjnb1h73tb	cmp48jj770003v3hj03s9h7on
cmp48jnnd004gv3hjtrbossqs	Día 1	Tentativa				2026-05-13 15:49:47.257	2026-05-13 15:49:47.257	cmp48jnm0004ev3hj748kyo82	cmp48jj770003v3hj03s9h7on
cmp48jnoq004iv3hj4fg9w4js	Día 2	Tentativa				2026-05-13 15:49:47.306	2026-05-13 15:49:47.306	cmp48jnm0004ev3hj748kyo82	cmp48jj770003v3hj03s9h7on
cmp48jnq2004kv3hjws1qh6y3	Día 3	Tentativa				2026-05-13 15:49:47.354	2026-05-13 15:49:47.354	cmp48jnm0004ev3hj748kyo82	cmp48jj770003v3hj03s9h7on
cmp48jnso004ov3hjmijt897j	Día 1	Tentativa				2026-05-13 15:49:47.448	2026-05-13 15:49:47.448	cmp48jnrd004mv3hjs64ukjra	cmp48jj770003v3hj03s9h7on
cmp48jnv9004qv3hjrmqneez7	Día 2	Tentativa				2026-05-13 15:49:47.542	2026-05-13 15:49:47.542	cmp48jnrd004mv3hjs64ukjra	cmp48jj770003v3hj03s9h7on
cmp48jnwn004sv3hj3ptqyy5w	Día 3	Tentativa				2026-05-13 15:49:47.592	2026-05-13 15:49:47.592	cmp48jnrd004mv3hjs64ukjra	cmp48jj770003v3hj03s9h7on
cmp48jnzb004wv3hj7227zv2j	Día 3	Tentativa				2026-05-13 15:49:47.688	2026-05-13 15:49:47.688	cmp48jnxz004uv3hji1p3mjnh	cmp48jj1u0000v3hjfqqv7nms
cmp48jo1x0050v3hjdi3lps4v	Día 1	Tentativa				2026-05-13 15:49:47.782	2026-05-13 15:49:47.782	cmp48jo0n004yv3hjuhu1j3f8	cmp48jj1u0000v3hjfqqv7nms
cmp48jo3c0052v3hje1om83l2	Día 2	Tentativa				2026-05-13 15:49:47.832	2026-05-13 15:49:47.832	cmp48jo0n004yv3hjuhu1j3f8	cmp48jj1u0000v3hjfqqv7nms
cmp48jo4m0054v3hjarrs3adq	Día 3	Tentativa				2026-05-13 15:49:47.879	2026-05-13 15:49:47.879	cmp48jo0n004yv3hjuhu1j3f8	cmp48jj1u0000v3hjfqqv7nms
cmp48jo770058v3hjvmyh6tct	Día 3	Tentativa				2026-05-13 15:49:47.972	2026-05-13 15:49:47.972	cmp48jo5x0056v3hjfpd81ep7	cmp48jj1u0000v3hjfqqv7nms
cmp48job5005cv3hj2hyqq3w6	Día 1	Tentativa				2026-05-13 15:49:48.113	2026-05-13 15:49:48.113	cmp48jo9u005av3hji4jq0o3w	cmp48jj5u0002v3hj6fczxj4o
cmp48jocg005ev3hjj3msu5om	Día 2	Tentativa				2026-05-13 15:49:48.16	2026-05-13 15:49:48.16	cmp48jo9u005av3hji4jq0o3w	cmp48jj5u0002v3hj6fczxj4o
cmp48jodq005gv3hj07v24wca	Día 3	Tentativa				2026-05-13 15:49:48.207	2026-05-13 15:49:48.207	cmp48jo9u005av3hji4jq0o3w	cmp48jj5u0002v3hj6fczxj4o
cmp48jogd005kv3hjf2p6r47o	Día 1	Tentativa				2026-05-13 15:49:48.302	2026-05-13 15:49:48.302	cmp48jof2005iv3hj8y2kb8tl	cmp48jj5u0002v3hj6fczxj4o
cmp48johp005mv3hjscmjj8vq	Día 2	Tentativa				2026-05-13 15:49:48.349	2026-05-13 15:49:48.349	cmp48jof2005iv3hj8y2kb8tl	cmp48jj5u0002v3hj6fczxj4o
cmp48joj1005ov3hjx2grsi3r	Día 3	Tentativa				2026-05-13 15:49:48.397	2026-05-13 15:49:48.397	cmp48jof2005iv3hj8y2kb8tl	cmp48jj5u0002v3hj6fczxj4o
cmp48jopr005wv3hjfvatslga	Día 1	Tentativa				2026-05-13 15:49:48.64	2026-05-13 15:49:48.64	cmp48joof005uv3hj0jg1oxrc	cmp48jj5u0002v3hj6fczxj4o
cmp48jor4005yv3hj3ecfy6o6	Día 2	Tentativa				2026-05-13 15:49:48.688	2026-05-13 15:49:48.688	cmp48joof005uv3hj0jg1oxrc	cmp48jj5u0002v3hj6fczxj4o
cmp48josf0060v3hjccdhubct	Día 3	Tentativa				2026-05-13 15:49:48.735	2026-05-13 15:49:48.735	cmp48joof005uv3hj0jg1oxrc	cmp48jj5u0002v3hj6fczxj4o
cmp48jov00064v3hjmhgcvd5a	Día 3	Tentativa				2026-05-13 15:49:48.829	2026-05-13 15:49:48.829	cmp48jotq0062v3hjmotcpvqe	cmp48jj5u0002v3hj6fczxj4o
cmp48joxr0068v3hj2cerpbtu	Día 1	Tentativa				2026-05-13 15:49:48.927	2026-05-13 15:49:48.927	cmp48jowb0066v3hjqcx9j3uo	cmp48jj5u0002v3hj6fczxj4o
cmp48joz4006av3hj5bmifotw	Día 2	Tentativa				2026-05-13 15:49:48.976	2026-05-13 15:49:48.976	cmp48jowb0066v3hjqcx9j3uo	cmp48jj5u0002v3hj6fczxj4o
cmp48jp0h006cv3hjbqh2d98h	Día 3	Tentativa				2026-05-13 15:49:49.026	2026-05-13 15:49:49.026	cmp48jowb0066v3hjqcx9j3uo	cmp48jj5u0002v3hj6fczxj4o
cmp48jp5g006gv3hjkbadu688	Día 3	Tentativa				2026-05-13 15:49:49.205	2026-05-13 15:49:49.205	cmp48jp45006ev3hjwbr5dast	cmp48jj5u0002v3hj6fczxj4o
cmp48jp9i006mv3hjce4iq7qs	Día 1	Tentativa				2026-05-13 15:49:49.35	2026-05-13 15:49:49.35	cmp48jp84006kv3hj3k095i8i	cmp48jj770003v3hj03s9h7on
cmp48jpat006ov3hjlelu20pw	Día 2	Tentativa				2026-05-13 15:49:49.397	2026-05-13 15:49:49.397	cmp48jp84006kv3hj3k095i8i	cmp48jj770003v3hj03s9h7on
cmp48jpc4006qv3hjbbvix9oe	Día 3	Tentativa				2026-05-13 15:49:49.445	2026-05-13 15:49:49.445	cmp48jp84006kv3hj3k095i8i	cmp48jj770003v3hj03s9h7on
cmp48jpn70074v3hjjytbkm5t	Día 1	Tentativa				2026-05-13 15:49:49.843	2026-05-13 15:49:49.843	cmp48jpln0072v3hjhibt38ri	cmp48jj1u0000v3hjfqqv7nms
cmp48jpoi0076v3hj3fqr4x7w	Día 2	Tentativa				2026-05-13 15:49:49.891	2026-05-13 15:49:49.891	cmp48jpln0072v3hjhibt38ri	cmp48jj1u0000v3hjfqqv7nms
cmp48jppt0078v3hj8w8ngbaf	Día 3	Tentativa				2026-05-13 15:49:49.938	2026-05-13 15:49:49.938	cmp48jpln0072v3hjhibt38ri	cmp48jj1u0000v3hjfqqv7nms
cmp48jpsg007cv3hjw1op8wn1	Día 1	Tentativa				2026-05-13 15:49:50.033	2026-05-13 15:49:50.033	cmp48jpr6007av3hjv2wwi3qj	cmp48jj1u0000v3hjfqqv7nms
cmp48jpxd007gv3hj91756acd	Día 1	Tentativa				2026-05-13 15:49:50.209	2026-05-13 15:49:50.209	cmp48jpw2007ev3hj7b8ujgqy	cmp48jj5u0002v3hj6fczxj4o
cmp48jpyo007iv3hjc4rg2lyh	Día 2	Tentativa				2026-05-13 15:49:50.256	2026-05-13 15:49:50.256	cmp48jpw2007ev3hj7b8ujgqy	cmp48jj5u0002v3hj6fczxj4o
cmp48jpzy007kv3hjhrbfeezq	Día 3	Tentativa				2026-05-13 15:49:50.302	2026-05-13 15:49:50.302	cmp48jpw2007ev3hj7b8ujgqy	cmp48jj5u0002v3hj6fczxj4o
cmp48jq2k007ov3hj7bpnydkw	Día 1	Tentativa				2026-05-13 15:49:50.397	2026-05-13 15:49:50.397	cmp48jq19007mv3hjxiojszbr	cmp48jj5u0002v3hj6fczxj4o
cmp48jq3v007qv3hjapzuxy8m	Día 2	Tentativa				2026-05-13 15:49:50.444	2026-05-13 15:49:50.444	cmp48jq19007mv3hjxiojszbr	cmp48jj5u0002v3hj6fczxj4o
cmp48jq58007sv3hjaevth6bx	Día 3	Tentativa				2026-05-13 15:49:50.492	2026-05-13 15:49:50.492	cmp48jq19007mv3hjxiojszbr	cmp48jj5u0002v3hj6fczxj4o
cmp48jq7x007wv3hj18votubk	Día 1	Tentativa				2026-05-13 15:49:50.589	2026-05-13 15:49:50.589	cmp48jq6m007uv3hjslp0om6s	cmp48jj5u0002v3hj6fczxj4o
cmp48jqan007yv3hjyk8mfz3o	Día 2	Tentativa				2026-05-13 15:49:50.687	2026-05-13 15:49:50.687	cmp48jq6m007uv3hjslp0om6s	cmp48jj5u0002v3hj6fczxj4o
cmp48jqby0080v3hjdyzdu3n0	Día 3	Tentativa				2026-05-13 15:49:50.735	2026-05-13 15:49:50.735	cmp48jq6m007uv3hjslp0om6s	cmp48jj5u0002v3hj6fczxj4o
cmp48jqeo0084v3hjjx719kua	Día 1	Tentativa				2026-05-13 15:49:50.832	2026-05-13 15:49:50.832	cmp48jqdb0082v3hj0zbbyv5t	cmp48jj5u0002v3hj6fczxj4o
cmp48jqg00086v3hjhalfolkn	Día 2	Tentativa				2026-05-13 15:49:50.88	2026-05-13 15:49:50.88	cmp48jqdb0082v3hj0zbbyv5t	cmp48jj5u0002v3hj6fczxj4o
cmp48jqhe0088v3hj6r2pxe15	Día 3	Tentativa				2026-05-13 15:49:50.93	2026-05-13 15:49:50.93	cmp48jqdb0082v3hj0zbbyv5t	cmp48jj5u0002v3hj6fczxj4o
cmp48jqk1008cv3hjk9x9igcn	Día 3	Tentativa				2026-05-13 15:49:51.025	2026-05-13 15:49:51.025	cmp48jqiq008av3hjpo5a9l25	cmp48jj5u0002v3hj6fczxj4o
cmp48jqrv008kv3hjb5hetmhy	Día 1	Tentativa				2026-05-13 15:49:51.307	2026-05-13 15:49:51.307	cmp48jqqi008iv3hj6tfcbgky	cmp48jj5u0002v3hj6fczxj4o
cmp48jqta008mv3hj3fwh7kmu	Día 2	Tentativa				2026-05-13 15:49:51.358	2026-05-13 15:49:51.358	cmp48jqqi008iv3hj6tfcbgky	cmp48jj5u0002v3hj6fczxj4o
cmp48jquq008ov3hjmgnmfdwv	Día 3	Tentativa				2026-05-13 15:49:51.411	2026-05-13 15:49:51.411	cmp48jqqi008iv3hj6tfcbgky	cmp48jj5u0002v3hj6fczxj4o
cmp48jr3s008yv3hjshem2ldy	Día 3	Tentativa				2026-05-13 15:49:51.736	2026-05-13 15:49:51.736	cmp48jr03008wv3hj7engvcqw	cmp48jjhn0009v3hjacuuw1n5
cmp48jr7r0094v3hjbc735luf	Día 3	Tentativa				2026-05-13 15:49:51.88	2026-05-13 15:49:51.88	cmp48jr6f0092v3hj7119t8on	cmp48jjhn0009v3hjacuuw1n5
cmp48jrbq009av3hj9qlv0mhr	Día 3	Tentativa				2026-05-13 15:49:52.022	2026-05-13 15:49:52.022	cmp48jraf0098v3hjquzehrfu	cmp48jjck0007v3hj727m3tkr
cmp48jrec009ev3hjneme8c2p	Día 3	Tentativa				2026-05-13 15:49:52.116	2026-05-13 15:49:52.116	cmp48jrd1009cv3hjimgngw2a	cmp48jjck0007v3hj727m3tkr
cmp48jrid009iv3hjbu6otb1o	Día 2	Tentativa				2026-05-13 15:49:52.262	2026-05-13 15:49:52.262	cmp48jrfo009gv3hjqx5veh45	cmp48jjck0007v3hj727m3tkr
cmp48jrmg009ov3hjmqimtxg1	Día 3	Tentativa				2026-05-13 15:49:52.408	2026-05-13 15:49:52.408	cmp48jrl2009mv3hj73f3q6vk	cmp48jjck0007v3hj727m3tkr
cmp48jrrs009wv3hjcr0luaq4	Día 1	Tentativa				2026-05-13 15:49:52.601	2026-05-13 15:49:52.601	cmp48jrqh009uv3hjn2b1c9mc	cmp48jj1u0000v3hjfqqv7nms
cmp48jrwv00a0v3hjmk6c6ti6	Día 1	Tentativa				2026-05-13 15:49:52.783	2026-05-13 15:49:52.783	cmp48jrt7009yv3hjs7shd4av	cmp48jj1u0000v3hjfqqv7nms
cmp48jrzj00a4v3hj6hso3ga8	Día 1	Tentativa				2026-05-13 15:49:52.879	2026-05-13 15:49:52.879	cmp48jry700a2v3hjqih6qeqk	cmp48jj770003v3hj03s9h7on
cmp48js0y00a6v3hj2qwdgc73	Día 2	Tentativa				2026-05-13 15:49:52.93	2026-05-13 15:49:52.93	cmp48jry700a2v3hjqih6qeqk	cmp48jj770003v3hj03s9h7on
cmp48js2900a8v3hj15rh7d9b	Día 3	Tentativa				2026-05-13 15:49:52.977	2026-05-13 15:49:52.977	cmp48jry700a2v3hjqih6qeqk	cmp48jj770003v3hj03s9h7on
cmp48js4x00acv3hjlttdq8uo	Día 3	Tentativa				2026-05-13 15:49:53.073	2026-05-13 15:49:53.073	cmp48js3n00aav3hjbzuiibdd	cmp48jjix000av3hjaoyfoqux
cmp48js8v00aiv3hja546yxdi	Día 1	Tentativa				2026-05-13 15:49:53.216	2026-05-13 15:49:53.216	cmp48js7k00agv3hjj42m075o	cmp48jj770003v3hj03s9h7on
cmp48jsbi00akv3hjjle5xpn0	Día 2	Tentativa				2026-05-13 15:49:53.311	2026-05-13 15:49:53.311	cmp48js7k00agv3hjj42m075o	cmp48jj770003v3hj03s9h7on
cmp48jsct00amv3hjgdqe75md	Día 3	Tentativa				2026-05-13 15:49:53.358	2026-05-13 15:49:53.358	cmp48js7k00agv3hjj42m075o	cmp48jj770003v3hj03s9h7on
cmp48jsfj00aqv3hj2r20bhto	Día 3	Tentativa				2026-05-13 15:49:53.455	2026-05-13 15:49:53.455	cmp48jse600aov3hjxuo0ot37	cmp48jj770003v3hj03s9h7on
cmp48jsi500auv3hjhy4suhup	Día 1	Tentativa				2026-05-13 15:49:53.55	2026-05-13 15:49:53.55	cmp48jsgu00asv3hj842t4136	cmp48jj770003v3hj03s9h7on
cmp48jsks00ayv3hjrdh90jw4	Día 1	Tentativa				2026-05-13 15:49:53.644	2026-05-13 15:49:53.644	cmp48jsjg00awv3hjnyqhg2of	cmp48jjga0008v3hj2c0xpcuy
cmp48jsm400b0v3hjcw6dz904	Día 2	Tentativa				2026-05-13 15:49:53.692	2026-05-13 15:49:53.692	cmp48jsjg00awv3hjnyqhg2of	cmp48jjga0008v3hj2c0xpcuy
cmp48jsng00b2v3hjrajt6uq8	Día 3	Tentativa				2026-05-13 15:49:53.741	2026-05-13 15:49:53.741	cmp48jsjg00awv3hjnyqhg2of	cmp48jjga0008v3hj2c0xpcuy
cmp48jsre00b6v3hjfrfhuh8k	Día 1	Tentativa				2026-05-13 15:49:53.882	2026-05-13 15:49:53.882	cmp48jsq100b4v3hj9g6qafum	cmp48jjga0008v3hj2c0xpcuy
cmp48jssq00b8v3hjkbgenw8j	Día 2	Tentativa				2026-05-13 15:49:53.93	2026-05-13 15:49:53.93	cmp48jsq100b4v3hj9g6qafum	cmp48jjga0008v3hj2c0xpcuy
cmp48jsu100bav3hj50wwr0jc	Día 3	Tentativa				2026-05-13 15:49:53.978	2026-05-13 15:49:53.978	cmp48jsq100b4v3hj9g6qafum	cmp48jjga0008v3hj2c0xpcuy
cmp48jswp00bev3hjeykmx828	Día 1	Tentativa				2026-05-13 15:49:54.073	2026-05-13 15:49:54.073	cmp48jsvc00bcv3hji8p8chsp	cmp48jjga0008v3hj2c0xpcuy
cmp48jsy100bgv3hj9x4w0ybq	Día 2	Tentativa				2026-05-13 15:49:54.122	2026-05-13 15:49:54.122	cmp48jsvc00bcv3hji8p8chsp	cmp48jjga0008v3hj2c0xpcuy
cmp48jszb00biv3hjmsy5k9xw	Día 3	Tentativa				2026-05-13 15:49:54.168	2026-05-13 15:49:54.168	cmp48jsvc00bcv3hji8p8chsp	cmp48jjga0008v3hj2c0xpcuy
cmp48jt8m00buv3hjx1s938zi	Día 3	Tentativa				2026-05-13 15:49:54.502	2026-05-13 15:49:54.502	cmp48jt7900bsv3hj3uuby29v	cmp48jjk8000bv3hjmhw4iosd
cmp48jtcl00c0v3hjpf7hed9h	Día 1	Tentativa				2026-05-13 15:49:54.646	2026-05-13 15:49:54.646	cmp48jtb800byv3hjumvfwdyv	cmp48jjk8000bv3hjmhw4iosd
cmp48jtdw00c2v3hj61atslkb	Día 2	Tentativa				2026-05-13 15:49:54.693	2026-05-13 15:49:54.693	cmp48jtb800byv3hjumvfwdyv	cmp48jjk8000bv3hjmhw4iosd
cmp48jtf700c4v3hjriugmj7q	Día 3	Tentativa				2026-05-13 15:49:54.74	2026-05-13 15:49:54.74	cmp48jtb800byv3hjumvfwdyv	cmp48jjk8000bv3hjmhw4iosd
cmp48jtjc00c8v3hjfa12544t	Día 1	Tentativa				2026-05-13 15:49:54.888	2026-05-13 15:49:54.888	cmp48jtgj00c6v3hjshztft3g	cmp48jjk8000bv3hjmhw4iosd
cmp48jtko00cav3hjnq5q0scq	Día 2	Tentativa				2026-05-13 15:49:54.936	2026-05-13 15:49:54.936	cmp48jtgj00c6v3hjshztft3g	cmp48jjk8000bv3hjmhw4iosd
cmp48jtm000ccv3hjcmpqh7sv	Día 3	Tentativa				2026-05-13 15:49:54.985	2026-05-13 15:49:54.985	cmp48jtgj00c6v3hjshztft3g	cmp48jjk8000bv3hjmhw4iosd
cmp48ju4800cyv3hj44fwpdk6	Día 1	Tentativa				2026-05-13 15:49:55.64	2026-05-13 15:49:55.64	cmp48ju2w00cwv3hjryq3vcgb	cmp48jjb80006v3hjotw5somx
cmp48ju8700d4v3hjkyfxrni2	Día 1	Tentativa				2026-05-13 15:49:55.783	2026-05-13 15:49:55.783	cmp48ju6u00d2v3hj4j7fs5a9	cmp48jjb80006v3hjotw5somx
cmp48jucb00d8v3hjqbveizz2	Día 1	Tentativa				2026-05-13 15:49:55.932	2026-05-13 15:49:55.932	cmp48ju9i00d6v3hjyxkq6rd5	cmp48jjix000av3hjaoyfoqux
cmp48judn00dav3hj2b0y02o2	Día 2	Tentativa				2026-05-13 15:49:55.979	2026-05-13 15:49:55.979	cmp48ju9i00d6v3hjyxkq6rd5	cmp48jjix000av3hjaoyfoqux
cmp48juey00dcv3hjrzh1qv53	Día 3	Tentativa				2026-05-13 15:49:56.027	2026-05-13 15:49:56.027	cmp48ju9i00d6v3hjyxkq6rd5	cmp48jjix000av3hjaoyfoqux
cmp48juiy00div3hj610njbsd	Día 1	Tentativa				2026-05-13 15:49:56.17	2026-05-13 15:49:56.17	cmp48juhn00dgv3hjh0b9f17f	cmp48jjix000av3hjaoyfoqux
cmp48jukb00dkv3hjro89jsoi	Día 2	Tentativa				2026-05-13 15:49:56.219	2026-05-13 15:49:56.219	cmp48juhn00dgv3hjh0b9f17f	cmp48jjix000av3hjaoyfoqux
cmp48julm00dmv3hj25bv4okf	Día 3	Tentativa				2026-05-13 15:49:56.266	2026-05-13 15:49:56.266	cmp48juhn00dgv3hjh0b9f17f	cmp48jjix000av3hjaoyfoqux
cmp48jvzr00fgv3hjzyyqkwdu	Día 1	Tentativa				2026-05-13 15:49:58.071	2026-05-13 15:49:58.071	cmp48jvw300fev3hjrauqu56o	cmp48jj770003v3hj03s9h7on
cmp48jw1200fiv3hj3cgyx4xf	Día 2	Tentativa				2026-05-13 15:49:58.118	2026-05-13 15:49:58.118	cmp48jvw300fev3hjrauqu56o	cmp48jj770003v3hj03s9h7on
cmp48jw2d00fkv3hj26j4qd2d	Día 3	Tentativa				2026-05-13 15:49:58.166	2026-05-13 15:49:58.166	cmp48jvw300fev3hjrauqu56o	cmp48jj770003v3hj03s9h7on
cmp48jw5100fov3hj58u0yxqv	Día 2	Tentativa				2026-05-13 15:49:58.261	2026-05-13 15:49:58.261	cmp48jw3q00fmv3hju69lsotx	cmp48jj770003v3hj03s9h7on
cmp48jw7n00fsv3hjlm4bles2	Día 2	Tentativa				2026-05-13 15:49:58.355	2026-05-13 15:49:58.355	cmp48jw6d00fqv3hjat8wy2uf	cmp48jj770003v3hj03s9h7on
cmp48jwa700fwv3hjsl73j9fg	Día 2	Tentativa				2026-05-13 15:49:58.448	2026-05-13 15:49:58.448	cmp48jw8x00fuv3hj4hh30iv3	cmp48jj770003v3hj03s9h7on
cmp48jweh00g0v3hjs59x62a2	Día 1	Tentativa				2026-05-13 15:49:58.601	2026-05-13 15:49:58.601	cmp48jwd400fyv3hjaoj75fpk	cmp48jj770003v3hj03s9h7on
cmp48jwfu00g2v3hj6rg6lj3w	Día 2	Tentativa				2026-05-13 15:49:58.65	2026-05-13 15:49:58.65	cmp48jwd400fyv3hjaoj75fpk	cmp48jj770003v3hj03s9h7on
cmp48jwh500g4v3hj22hqrc15	Día 3	Tentativa				2026-05-13 15:49:58.698	2026-05-13 15:49:58.698	cmp48jwd400fyv3hjaoj75fpk	cmp48jj770003v3hj03s9h7on
cmp48jwju00g8v3hjlpd8f9ns	Día 1	Tentativa				2026-05-13 15:49:58.794	2026-05-13 15:49:58.794	cmp48jwig00g6v3hjebowjps8	cmp48jj770003v3hj03s9h7on
cmp48jwmh00gcv3hjkhky5494	Día 1	Tentativa				2026-05-13 15:49:58.889	2026-05-13 15:49:58.889	cmp48jwl500gav3hjfnqhq9lr	cmp48jj770003v3hj03s9h7on
cmp48jwnt00gev3hjx83p9iw8	Día 2	Tentativa				2026-05-13 15:49:58.938	2026-05-13 15:49:58.938	cmp48jwl500gav3hjfnqhq9lr	cmp48jj770003v3hj03s9h7on
cmp48jwp500ggv3hjur6et2e4	Día 3	Tentativa				2026-05-13 15:49:58.986	2026-05-13 15:49:58.986	cmp48jwl500gav3hjfnqhq9lr	cmp48jj770003v3hj03s9h7on
cmp48jwvj00gmv3hjxscxryed	Día 1	Tentativa				2026-05-13 15:49:59.215	2026-05-13 15:49:59.215	cmp48jwu700gkv3hjme587d9i	cmp48jj770003v3hj03s9h7on
cmp48jwwv00gov3hjnqetdhq9	Día 2	Tentativa				2026-05-13 15:49:59.263	2026-05-13 15:49:59.263	cmp48jwu700gkv3hjme587d9i	cmp48jj770003v3hj03s9h7on
cmp48jwy600gqv3hjbasasj06	Día 3	Tentativa				2026-05-13 15:49:59.311	2026-05-13 15:49:59.311	cmp48jwu700gkv3hjme587d9i	cmp48jj770003v3hj03s9h7on
cmp48jx0s00guv3hjz2zd5wfn	Día 2	Tentativa				2026-05-13 15:49:59.404	2026-05-13 15:49:59.404	cmp48jwzh00gsv3hj5c055q3d	cmp48jj770003v3hj03s9h7on
cmp48jx6700h0v3hjh60b1b5t	Día 1	Tentativa				2026-05-13 15:49:59.6	2026-05-13 15:49:59.6	cmp48jx3e00gyv3hjxzmuvma6	cmp48jj770003v3hj03s9h7on
cmp48jx7l00h2v3hjyts9oqj9	Día 2	Tentativa				2026-05-13 15:49:59.65	2026-05-13 15:49:59.65	cmp48jx3e00gyv3hjxzmuvma6	cmp48jj770003v3hj03s9h7on
cmp48jx8w00h4v3hj02prxxf9	Día 3	Tentativa				2026-05-13 15:49:59.696	2026-05-13 15:49:59.696	cmp48jx3e00gyv3hjxzmuvma6	cmp48jj770003v3hj03s9h7on
cmp48jxi500hiv3hjr1yk9x99	Día 1	Tentativa				2026-05-13 15:50:00.029	2026-05-13 15:50:00.029	cmp48jxgu00hgv3hjy6gt8b9w	cmp48jjga0008v3hj2c0xpcuy
cmp48jxkr00hkv3hj64c5rxym	Día 2	Tentativa				2026-05-13 15:50:00.124	2026-05-13 15:50:00.124	cmp48jxgu00hgv3hjy6gt8b9w	cmp48jjga0008v3hj2c0xpcuy
cmp48jxm300hmv3hjd6dggg48	Día 3	Tentativa				2026-05-13 15:50:00.171	2026-05-13 15:50:00.171	cmp48jxgu00hgv3hjy6gt8b9w	cmp48jjga0008v3hj2c0xpcuy
cmp48jxsm00hwv3hjz3o7crwg	Día 1	Tentativa				2026-05-13 15:50:00.406	2026-05-13 15:50:00.406	cmp48jxrb00huv3hjdgbixxo5	cmp48jj1u0000v3hjfqqv7nms
cmp48jxtx00hyv3hjh2ujpole	Día 2	Tentativa				2026-05-13 15:50:00.453	2026-05-13 15:50:00.453	cmp48jxrb00huv3hjdgbixxo5	cmp48jj1u0000v3hjfqqv7nms
cmp48jxv700i0v3hjh3gorvy1	Día 3	Tentativa				2026-05-13 15:50:00.499	2026-05-13 15:50:00.499	cmp48jxrb00huv3hjdgbixxo5	cmp48jj1u0000v3hjfqqv7nms
cmp48jy1x00i8v3hjqfl5geev	Día 3	Tentativa				2026-05-13 15:50:00.742	2026-05-13 15:50:00.742	cmp48jy0m00i6v3hj8aobiyeu	cmp48jj1u0000v3hjfqqv7nms
cmp48jy4n00icv3hjrtgti4zk	Día 1	Tentativa				2026-05-13 15:50:00.839	2026-05-13 15:50:00.839	cmp48jy3b00iav3hjn3w507nc	cmp48jj1u0000v3hjfqqv7nms
cmp48jy6000iev3hjpbnkn6w0	Día 2	Tentativa				2026-05-13 15:50:00.889	2026-05-13 15:50:00.889	cmp48jy3b00iav3hjn3w507nc	cmp48jj1u0000v3hjfqqv7nms
cmp48jy7b00igv3hjgiqupbc5	Día 3	Tentativa				2026-05-13 15:50:00.935	2026-05-13 15:50:00.935	cmp48jy3b00iav3hjn3w507nc	cmp48jj1u0000v3hjfqqv7nms
cmp48jy9y00ikv3hjsc2d8jnv	Día 1	Tentativa				2026-05-13 15:50:01.03	2026-05-13 15:50:01.03	cmp48jy8n00iiv3hjiasy4kop	cmp48jj1u0000v3hjfqqv7nms
cmp48jyb800imv3hj21kb9a2t	Día 2	Tentativa				2026-05-13 15:50:01.076	2026-05-13 15:50:01.076	cmp48jy8n00iiv3hjiasy4kop	cmp48jj1u0000v3hjfqqv7nms
cmp48jydw00iov3hjayd91eyh	Día 3	Tentativa				2026-05-13 15:50:01.173	2026-05-13 15:50:01.173	cmp48jy8n00iiv3hjiasy4kop	cmp48jj1u0000v3hjfqqv7nms
cmp48jyj900iwv3hjlodsy8ov	Día 1	Tentativa				2026-05-13 15:50:01.365	2026-05-13 15:50:01.365	cmp48jyhu00iuv3hjct0v2udl	cmp48jjlk000cv3hjw78bttij
cmp48jykm00iyv3hj1jgorkig	Día 2	Tentativa				2026-05-13 15:50:01.414	2026-05-13 15:50:01.414	cmp48jyhu00iuv3hjct0v2udl	cmp48jjlk000cv3hjw78bttij
cmp48jyly00j0v3hjl2pnlnv2	Día 3	Tentativa				2026-05-13 15:50:01.463	2026-05-13 15:50:01.463	cmp48jyhu00iuv3hjct0v2udl	cmp48jjlk000cv3hjw78bttij
cmp48jytq00j8v3hjk9b0a290	Día 1	Tentativa				2026-05-13 15:50:01.743	2026-05-13 15:50:01.743	cmp48jyq300j6v3hjx5iy5oo2	cmp48jjmw000dv3hjcnkqlaat
cmp48jyv300jav3hjrtppk5o1	Día 2	Tentativa				2026-05-13 15:50:01.791	2026-05-13 15:50:01.791	cmp48jyq300j6v3hjx5iy5oo2	cmp48jjmw000dv3hjcnkqlaat
cmp48jywg00jcv3hj5dkz6p7i	Día 3	Tentativa				2026-05-13 15:50:01.84	2026-05-13 15:50:01.84	cmp48jyq300j6v3hjx5iy5oo2	cmp48jjmw000dv3hjcnkqlaat
cmp48jyz300jgv3hjghtnm2pz	Día 1	Tentativa				2026-05-13 15:50:01.936	2026-05-13 15:50:01.936	cmp48jyxr00jev3hj2et6ltxf	cmp48jjmw000dv3hjcnkqlaat
cmp48jz0f00jiv3hjxdffyvvd	Día 2	Tentativa				2026-05-13 15:50:01.984	2026-05-13 15:50:01.984	cmp48jyxr00jev3hj2et6ltxf	cmp48jjmw000dv3hjcnkqlaat
cmp48jz1r00jkv3hjkwb4ysdk	Día 3	Tentativa				2026-05-13 15:50:02.031	2026-05-13 15:50:02.031	cmp48jyxr00jev3hj2et6ltxf	cmp48jjmw000dv3hjcnkqlaat
cmp48jzb800jwv3hjcn1svsgu	Día 3	Tentativa				2026-05-13 15:50:02.372	2026-05-13 15:50:02.372	cmp48jz9x00juv3hjz63m5c46	cmp48jj770003v3hj03s9h7on
cmp48jzdw00k0v3hjxkpiu1l9	Día 3	Tentativa				2026-05-13 15:50:02.468	2026-05-13 15:50:02.468	cmp48jzck00jyv3hjsez28p19	cmp48jj770003v3hj03s9h7on
cmp48jzgl00k4v3hjfo9bwqwp	Día 3	Tentativa				2026-05-13 15:50:02.565	2026-05-13 15:50:02.565	cmp48jzf800k2v3hj201tk69t	cmp48jjo7000ev3hjzwj116e0
cmp48jzln00k8v3hjdr44ioq3	Día 3	Tentativa				2026-05-13 15:50:02.747	2026-05-13 15:50:02.747	cmp48jzhz00k6v3hjsxqlrmq0	cmp48jjo7000ev3hjzwj116e0
cmp48jzoc00kcv3hjqckh94ck	Día 3	Tentativa				2026-05-13 15:50:02.844	2026-05-13 15:50:02.844	cmp48jzn100kav3hj1sorzuwj	cmp48jjo7000ev3hjzwj116e0
cmp48jzqz00kgv3hj5v7kdwxa	Día 1	Tentativa				2026-05-13 15:50:02.94	2026-05-13 15:50:02.94	cmp48jzpo00kev3hj4ng1zaux	cmp48jjo7000ev3hjzwj116e0
cmp48jzsc00kiv3hjh1dn3nea	Día 2	Tentativa				2026-05-13 15:50:02.989	2026-05-13 15:50:02.989	cmp48jzpo00kev3hj4ng1zaux	cmp48jjo7000ev3hjzwj116e0
cmp48jzto00kkv3hjbhhjrszy	Día 3	Tentativa				2026-05-13 15:50:03.036	2026-05-13 15:50:03.036	cmp48jzpo00kev3hj4ng1zaux	cmp48jjo7000ev3hjzwj116e0
cmp48jzwb00kov3hj4w100px0	Día 2	Tentativa				2026-05-13 15:50:03.131	2026-05-13 15:50:03.131	cmp48jzuz00kmv3hjpw56se9a	cmp48jjo7000ev3hjzwj116e0
cmp48k02v00kuv3hjwtpxmrrb	Día 1	Tentativa				2026-05-13 15:50:03.367	2026-05-13 15:50:03.367	cmp48k01j00ksv3hjucd23l4a	cmp48jjo7000ev3hjzwj116e0
\.


--
-- Data for Name: CitaGenerada; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CitaGenerada" (id, fecha, accion, notas, "createdAt", "updatedAt", "clienteId", "ejecutivoId") FROM stdin;
\.


--
-- Data for Name: Cliente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Cliente" (id, nombre, cargo, email, telefono, notas, "empresaId", "createdAt", "updatedAt") FROM stdin;
cmp48jmvg003iv3hj9vktzo6e	Ivan Edwin Rodriguez Garcia	Dir Recursos Humanos	ivaned.rodriguezgarcia@gruposantander.com	+525513313772		cmp48jl7j001av3hjuf2sf1rw	2026-05-13 15:49:46.252	2026-05-13 15:49:46.252
cmp48jmy4003kv3hj9cbb36h6	Mariana Morales Merida	Becaria Marketing Vascular	mariana.moralesmerida@abbott.com	+525549585435		cmp48jla6001cv3hjdtow1tu8	2026-05-13 15:49:46.349	2026-05-13 15:49:46.349
cmp48jn3i003ov3hjuoh53kwg	Alberto Calderón David	Dir. General	info@grupoacd.com	+527771132681		cmp48jlbi001ev3hjitoyq0fe	2026-05-13 15:49:46.542	2026-05-13 15:49:46.542
cmp48jn4t003qv3hj07q26gti	Ana Sumano	Buying & Sourcing Manager	ana.sumano@adm-indica.com	+525528880142		cmp48jlcu001gv3hj8psgflme	2026-05-13 15:49:46.589	2026-05-13 15:49:46.589
cmp48jna4003yv3hj9j588tiv	Luis Fernando Parrodi	Procurement	luisbernardo.parrodi@adm-indicia.com	+525551025756		cmp48jlfw001iv3hj5s6m1aug	2026-05-13 15:49:46.781	2026-05-13 15:49:46.781
cmp48jngo0046v3hjnb1h73tb	Aileen Palacios	Senior Account Manager	aileen.palacios@adm-indicia.com	+525535557783		cmp48jlfw001iv3hj5s6m1aug	2026-05-13 15:49:47.017	2026-05-13 15:49:47.017
cmp48jnm0004ev3hj748kyo82	Gabriela Zapata	Account Executive	gabriela.zapata@adm-indicia.com	+525510706871		cmp48jlfw001iv3hj5s6m1aug	2026-05-13 15:49:47.209	2026-05-13 15:49:47.209
cmp48jnrd004mv3hjs64ukjra	Cinthya Mendez Miranda	Account Executive	cinthya.mendez@adm-indicia.com	+50672953169		cmp48jlfw001iv3hj5s6m1aug	2026-05-13 15:49:47.401	2026-05-13 15:49:47.401
cmp48jnxz004uv3hji1p3mjnh	Itzia Areli Colli Souto	Adquisiciones	itzia.colli@suramexico.com	+525564685602		cmp48jlh7001kv3hjaa2lv3nb	2026-05-13 15:49:47.639	2026-05-13 15:49:47.639
cmp48jo0n004yv3hjuhu1j3f8	Ana Patricia Cervera Ascencion	Especialista de Marketing y Reputación	ana.cervera@suramexico.com	+528333327626		cmp48jlh7001kv3hjaa2lv3nb	2026-05-13 15:49:47.735	2026-05-13 15:49:47.735
cmp48jo5x0056v3hjfpd81ep7	Guadalupe Sedeño	Adquisiciones	guadalupe.sedeno@suramexico.com	+525536677394		cmp48jlh7001kv3hjaa2lv3nb	2026-05-13 15:49:47.925	2026-05-13 15:49:47.925
cmp48jo9u005av3hji4jq0o3w	Alberto de Jesús García Herrera	Community manager	beto@dette.mx	+525586481223		cmp48jlij001mv3hjsua7wskj	2026-05-13 15:49:48.066	2026-05-13 15:49:48.066
cmp48jof2005iv3hj8y2kb8tl	Alberto de Jesús García	Community Manager	betowp6@gmail.com	+525534172420		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:48.254	2026-05-13 15:49:48.254
cmp48jokc005qv3hjeodx1fjq	Monserrath Paz	Marcom Specialist	monserrath.paz@agilent.com	+525543374667		cmp48jll7001qv3hjx3ylo7ig	2026-05-13 15:49:48.445	2026-05-13 15:49:48.445
cmp48jolo005sv3hjuwx2kwr3	Marysol Morán Blanco	Directora Ejecutiva	direccion@anade.org.mx	+525580276284		cmp48jlmi001sv3hj6rebm2wc	2026-05-13 15:49:48.493	2026-05-13 15:49:48.493
cmp48joof005uv3hj0jg1oxrc	Alexis Alcalá García	Producción.	ag@antiagency.mx	+525535651805		cmp48jlnt001uv3hjdacgmf74	2026-05-13 15:49:48.592	2026-05-13 15:49:48.592
cmp48jotq0062v3hjmotcpvqe	Alejandro García Muñoz	Productor Sr.	am@antiagency.mx	+525521286300		cmp48jlnt001uv3hjdacgmf74	2026-05-13 15:49:48.783	2026-05-13 15:49:48.783
cmp48jowb0066v3hjqcx9j3uo	Rob Vega	Productor	rv@antiagency.mx	+525579415188		cmp48jlnt001uv3hjdacgmf74	2026-05-13 15:49:48.875	2026-05-13 15:49:48.875
cmp48jp45006ev3hjwbr5dast	Alejandro Pasapera Conde Martínez	Director de Producción	apc@antiagency.mx	+525537338015		cmp48jlnt001uv3hjdacgmf74	2026-05-13 15:49:49.158	2026-05-13 15:49:49.158
cmp48jp6s006iv3hjw4307fbd	Alejandro Pasapera Conde	Marketing	apc@antiagency.mx	+525537338015		cmp48jlnt001uv3hjdacgmf74	2026-05-13 15:49:49.253	2026-05-13 15:49:49.253
cmp48jp84006kv3hj3k095i8i	Andrea Nuñez	Ejecutiva de ventas	anunez@ifahto.com	+525561368123		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:49.301	2026-05-13 15:49:49.301
cmp48jpdf006sv3hj0h5dyw8g	ALICIA MEDINA	DIRECCIÓN DE SOLUCIONES	amedinagallegos@gmail.com	+525535720756		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:49.492	2026-05-13 15:49:49.492
cmp48jpeq006uv3hj5vef1u01	Melanie Y Hernandez Vasquez	Logistica	melanie.hernandez@link-worldwide.com	+525580209072		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:49:49.539	2026-05-13 15:49:49.539
cmp48jphj006wv3hjd9vz5cfz	LUIS ANDRES FERNANDEZ CESAR	Account Director	luis.fernandez@link-worldwide.com	+529994524606		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:49:49.639	2026-05-13 15:49:49.639
cmp48jpiv006yv3hjjsytaigf	LUIS ANDRES FERNANDEZ CESAR	Account Director	luis.fernandez@link-worldwide.com	+529994524606		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:49:49.688	2026-05-13 15:49:49.688
cmp48jpkb0070v3hjsnonsh5c	Blanca Leos	Project Manager MX- Heineken	blanca.leos@link-worldwide.com	+528124270215		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:49:49.739	2026-05-13 15:49:49.739
cmp48jpln0072v3hjhibt38ri	Blanca Leos Castillo	Project Manager	blanca.leos@link-worldwide.com	+528124270215		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:49:49.788	2026-05-13 15:49:49.788
cmp48jpr6007av3hjv2wwi3qj	IRIS RUIZ	Logística	iris.ruiz@link-worldwide.com	+525551046806		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:49:49.986	2026-05-13 15:49:49.986
cmp48jpw2007ev3hj7b8ujgqy	MARCO PEREZ VALDEZ	PRODUCTOR	marco.perez@avanna.com.mx	+525610210057		cmp48jlrq0020v3hjvqvpjk4t	2026-05-13 15:49:50.162	2026-05-13 15:49:50.162
cmp48jq19007mv3hjxiojszbr	Lizandro Fernández	Director	lizandro@avanna.com.mx	+525562512045		cmp48jlrq0020v3hjvqvpjk4t	2026-05-13 15:49:50.349	2026-05-13 15:49:50.349
cmp48jq6m007uv3hjslp0om6s	Paulina Peralta Oliva	Head de Cuentas	paulina.peralta@avanna.com.mx	+525544660989		cmp48jlrq0020v3hjvqvpjk4t	2026-05-13 15:49:50.542	2026-05-13 15:49:50.542
cmp48jqdb0082v3hj0zbbyv5t	Yuritzin Maldonado	DIRECCION DE CUENTAS	yuritzin.maldonado@avanna.com.mx	+525549404271		cmp48jlrq0020v3hjvqvpjk4t	2026-05-13 15:49:50.783	2026-05-13 15:49:50.783
cmp48jqiq008av3hjpo5a9l25	Alejandra Zavaleta	DIR VENTAS	alejandra.zavaleta@pmpackaging.com	+525535210257		cmp48jlug0022v3hjt7q4d5rt	2026-05-13 15:49:50.978	2026-05-13 15:49:50.978
cmp48jqle008ev3hjvkoqb3cp	Giovanni Mendez	Customer Marketing On Trade	montserrat.tovar@hhglobal.com	+525543531618		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:51.074	2026-05-13 15:49:51.074
cmp48jqms008gv3hjmb65wb3n	Brenda Ramírez	Customer Marketing Coordinator	montserrat.tovar@hhglobal.com	+525543531618		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:51.124	2026-05-13 15:49:51.124
cmp48jqqi008iv3hj6tfcbgky	Roberth Mendoza	Dirección	bamboo.print@hotmail.com	+525549886458		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:49:51.259	2026-05-13 15:49:51.259
cmp48jqw3008qv3hj82ms6z5d	jose angel cervantes	Director Educación financiera	jacervantes@tvazteca.com.mx	+525591994114		cmp48jlyf0028v3hj92lhmndq	2026-05-13 15:49:51.459	2026-05-13 15:49:51.459
cmp48jqxe008sv3hjh9gwbray	Erika Escorza	Analista de compras	ewel76@hotmail.com	+525529022998		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:49:51.507	2026-05-13 15:49:51.507
cmp48jqys008uv3hjqvkg4yae	Brenda Monge	Gerente Trade Marketing	b.monge@biocodex.mx	+525560706834		cmp48jlzq002av3hjkgqzqv54	2026-05-13 15:49:51.556	2026-05-13 15:49:51.556
cmp48jr03008wv3hj7engvcqw	Naidelyn Avilés	DIRECCION GENERAL	naviles@biva.mx	+525518172258		cmp48jm11002cv3hj0p4y3tvl	2026-05-13 15:49:51.604	2026-05-13 15:49:51.604
cmp48jr530090v3hjptyhxq9t	Alejandra Flores	GERENTE DE EVENTOS INSTITUCIONALES	aflores@biva.mx	+525524932369		cmp48jm11002cv3hj0p4y3tvl	2026-05-13 15:49:51.784	2026-05-13 15:49:51.784
cmp48jr6f0092v3hj7119t8on	JUANA MARIA GUADALUPE PEREZ GUTIERREZ	SERVICIOS GENERALES	jmperez@grupobmv.com.mx	+525255339963		cmp48jm2d002ev3hj4ui1ybiu	2026-05-13 15:49:51.832	2026-05-13 15:49:51.832
cmp48jr930096v3hjveem9umi	Michelle Szymanski	COMERCIAL Y COMMS	mszymanski@biva.mx	+525580378597		cmp48jm11002cv3hj0p4y3tvl	2026-05-13 15:49:51.927	2026-05-13 15:49:51.927
cmp48jraf0098v3hjquzehrfu	Sofia Vianey Vazquez Corona	Especialista de Compras	svazquez@grupobmv.com.mx	+525514676175		cmp48jm2d002ev3hj4ui1ybiu	2026-05-13 15:49:51.975	2026-05-13 15:49:51.975
cmp48jrd1009cv3hjimgngw2a	Sofia Vianey Vazquez Corona	Especialista de Compras	svazquez@grupobmv.com.mx	+525514676175		cmp48jm2d002ev3hj4ui1ybiu	2026-05-13 15:49:52.07	2026-05-13 15:49:52.07
cmp48jrfo009gv3hjqx5veh45	Erika Espino Silva	Analista comercial	eespinos@grupobmv.com.mx	+525553429000		cmp48jm2d002ev3hj4ui1ybiu	2026-05-13 15:49:52.164	2026-05-13 15:49:52.164
cmp48jrjr009kv3hjr7blt1jt	Alejandro Sarabia-Parra	Branding manager	alek.nemon@gmail.com	+525540553639		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:52.312	2026-05-13 15:49:52.312
cmp48jrl2009mv3hj73f3q6vk	JOCELYN PORTILLO ERREGUIN	Compras	jportillo@grupobmv.com.mx	+525523369191		cmp48jm2d002ev3hj4ui1ybiu	2026-05-13 15:49:52.358	2026-05-13 15:49:52.358
cmp48jrnr009qv3hj5bw1u9n9	RAUL GONZALEZ	PROPIETARIO	betos5301@hotmail.com	+525525397871		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:49:52.455	2026-05-13 15:49:52.455
cmp48jrp3009sv3hjvykn80d7	Nancy Zetina Mayen	Jefatura de marketing	nancy.zetina@valladolidcaja.com	+524431280086		cmp48jm3q002gv3hjq6pmh6v3	2026-05-13 15:49:52.503	2026-05-13 15:49:52.503
cmp48jrqh009uv3hjn2b1c9mc	Armando Badillo	Trade Marketing / Supervisor	abadillo@cusa.canon.com	+525625585481		cmp48jm51002iv3hjc1800vv7	2026-05-13 15:49:52.553	2026-05-13 15:49:52.553
cmp48jrt7009yv3hjs7shd4av	Alvaro Pérez	Gerente de Trade Marketing	aperez@cusa.canon.com	+525514787622		cmp48jm51002iv3hjc1800vv7	2026-05-13 15:49:52.652	2026-05-13 15:49:52.652
cmp48jry700a2v3hjqih6qeqk	Javier Aragon	Líder de compras	javiera@cinemex.net	+525567665849		cmp48jm6a002kv3hj7zl9gcny	2026-05-13 15:49:52.831	2026-05-13 15:49:52.831
cmp48js3n00aav3hjbzuiibdd	Aideé Nieves	Compras	aidee.nieves@cnhmexico.com.mx	+524422367439		cmp48jm8z002mv3hj660fpjbn	2026-05-13 15:49:53.027	2026-05-13 15:49:53.027
cmp48js6900aev3hjcsy7jl02	Daniel Riuz	Especialista Ventas Promocionales	daniel.ruiz@cnhmexico.com.mx	+524421559806		cmp48jm8z002mv3hj660fpjbn	2026-05-13 15:49:53.121	2026-05-13 15:49:53.121
cmp48js7k00agv3hjj42m075o	ISRAEL VAZQUEZ	EJECUTIVO TRADE / MARKETING	vgisrael@roshfrans.com	+525580444704		cmp48jmad002ov3hjlmcvjyl9	2026-05-13 15:49:53.168	2026-05-13 15:49:53.168
cmp48jse600aov3hjxuo0ot37	Alberto Flores Andrade	Encargado de atencion a clientes	falberto@roshfrans.com	+525514522558		cmp48jmad002ov3hjlmcvjyl9	2026-05-13 15:49:53.406	2026-05-13 15:49:53.406
cmp48jsgu00asv3hj842t4136	ALBERTO FLORES ANDRADE	Encargado de atención a cliente	falberto@roshfrans.com	+525514522558		cmp48jmad002ov3hjlmcvjyl9	2026-05-13 15:49:53.503	2026-05-13 15:49:53.503
cmp48jsjg00awv3hjnyqhg2of	Javier Horacio Camacho Xolalpa	Responsable de compras estratégicas	jhcamacho@cruzrojamexicana.org.mx	+525580100913		cmp48jmbo002qv3hj7dlluw2x	2026-05-13 15:49:53.597	2026-05-13 15:49:53.597
cmp48jsq100b4v3hj9g6qafum	Javier Horacio Camacho Xolalpa	Responsable de compras estratégicas	jhcamacho@cruzrojamexicana.org.mx	+525580100913		cmp48jmbo002qv3hj7dlluw2x	2026-05-13 15:49:53.833	2026-05-13 15:49:53.833
cmp48jsvc00bcv3hji8p8chsp	ISABEL GONZALEZ	RESPONSABLE DE CUENTAS POR PAGAR/FINANZAS	igonzalez@cruzrojamexicana.org.mx	+525540826882		cmp48jmbo002qv3hj7dlluw2x	2026-05-13 15:49:54.025	2026-05-13 15:49:54.025
cmp48jt0n00bkv3hjiajt7a09	Alberto de Jesús García Herrera	Community manager	betowp6@gmail.com	+525586481223		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:54.215	2026-05-13 15:49:54.215
cmp48jt2000bmv3hj4i6lecly	Edgar Torres	Productor	edgar.torres@drive-mx.com	+525610900115		cmp48jmd0002sv3hjw4eklroe	2026-05-13 15:49:54.264	2026-05-13 15:49:54.264
cmp48jt4n00bov3hjiudp45c4	Edgar Torres Arias	Productor	edgar.torres@drive-mx.com	+525610900115		cmp48jmd0002sv3hjw4eklroe	2026-05-13 15:49:54.359	2026-05-13 15:49:54.359
cmp48jt5x00bqv3hjdac6f86b	Ricardo Alfonso Perez Estrada	Productor	vmra_4@hotmail.com	+525539783917		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:49:54.405	2026-05-13 15:49:54.405
cmp48jt7900bsv3hj3uuby29v	RICARDO ALFONSO PEREZ ESTRADA	PRODUCTORR	ricardo.perez@drive-mx.com	+525539783917		cmp48jmd0002sv3hjw4eklroe	2026-05-13 15:49:54.453	2026-05-13 15:49:54.453
cmp48jt9x00bwv3hjyt4ssgwq	Angelica Zamora	Compradora de Servicios corporativos	angezamorara@gmail.com	+525539692810		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:54.549	2026-05-13 15:49:54.549
cmp48jtb800byv3hjumvfwdyv	ABEL Salinas	JEFE DE MARKETING	abels508@gruma.com	+528991009618		cmp48jmeb002uv3hju35zym5r	2026-05-13 15:49:54.596	2026-05-13 15:49:54.596
cmp48jtgj00c6v3hjshztft3g	Abel Salinas	Mercadotecnia	abels508@gruma.com	+528991009618		cmp48jmeb002uv3hju35zym5r	2026-05-13 15:49:54.787	2026-05-13 15:49:54.787
cmp48jtnc00cev3hjj0b8swao	ISABEL DUARTE	JEFA DE MARKETING	iduarte@gruma.com	+527291027843		cmp48jmeb002uv3hju35zym5r	2026-05-13 15:49:55.032	2026-05-13 15:49:55.032
cmp48jtom00cgv3hjz0021kbv	Ricardo Castro	Especialista en Branding	lcastroh@grupobmv.com.mx	+525524956133		cmp48jm2d002ev3hj4ui1ybiu	2026-05-13 15:49:55.078	2026-05-13 15:49:55.078
cmp48jtpx00civ3hjtlq10v7p	Ricardo Castro	Especialista en Branding	lcastroh@grupobmv.com.mx	+525524956133		cmp48jm2d002ev3hj4ui1ybiu	2026-05-13 15:49:55.126	2026-05-13 15:49:55.126
cmp48jtra00ckv3hjt8fgie9r	JIMENA Gonzalez Reyes	Comunicación y Relaciones Públicas	jimenag@cinemex.net	+525534561073		cmp48jm6a002kv3hj7zl9gcny	2026-05-13 15:49:55.175	2026-05-13 15:49:55.175
cmp48jtsk00cmv3hjw9o0fwh5	Sayuri Estrella Jimenez Martinez	Comprador	becario160@cinemex.net	+525567713934		cmp48jm6a002kv3hj7zl9gcny	2026-05-13 15:49:55.22	2026-05-13 15:49:55.22
cmp48jttv00cov3hj13nf16n5	Angélica González Sánchez	Coordinador de Compras	agonzalez@cinemex.net	+525586869044		cmp48jm6a002kv3hj7zl9gcny	2026-05-13 15:49:55.267	2026-05-13 15:49:55.267
cmp48jtv700cqv3hj83dhem86	Yazmin Vega	Especialista de Marketing y Publicidad	yazmin.vega@licon.com.mx	+525518172097		cmp48jmfl002wv3hjnfpwywnc	2026-05-13 15:49:55.315	2026-05-13 15:49:55.315
cmp48jtyz00csv3hj80lsy7ar	Yazmin Alejandra Vega Huerta	Especialista de Marketing y Publicidad	yazmin.vega@licon.com.mx	+525518172097		cmp48jmfl002wv3hjnfpwywnc	2026-05-13 15:49:55.452	2026-05-13 15:49:55.452
cmp48ju0b00cuv3hjd5pgsm0b	Oscar Porras	Gerente de Mercadotecnia y Comunicación	ldg.oscar.porras@gmail.com	+525534342238		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:55.499	2026-05-13 15:49:55.499
cmp48ju2w00cwv3hjryq3vcgb	Alejandra DIAZ AGUILAR	Bienestar	alejandra.diaz@elektra.com.mx	+525666752280		cmp48jmgz002yv3hjm8t7g5sn	2026-05-13 15:49:55.546	2026-05-13 15:49:55.546
cmp48ju5j00d0v3hjj4sxtizl	Dalila Espinosa Aldana	Gerente de Marketing	dalilaesaldana@gmail.com	+525541843144		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:55.687	2026-05-13 15:49:55.687
cmp48ju6u00d2v3hj4j7fs5a9	Verónica Amigon Lopez	Gerente	vamigon@bancoazteca.com.mx	+525580058236		cmp48jmia0030v3hjpkbr5i2s	2026-05-13 15:49:55.734	2026-05-13 15:49:55.734
cmp48ju9i00d6v3hjyxkq6rd5	Adrian Martinez	Coordinador	adrian.martinez@helvex.com.mx	+525559521375		cmp48jmjl0032v3hjdrcgfpzo	2026-05-13 15:49:55.831	2026-05-13 15:49:55.831
cmp48juga00dev3hjj99jnh7m	ETELBERTO LANDIN	Coordinador	beto_5_5@hotmail.com.mx	+525518362988		cmp48jmkv0034v3hjdmbbwo33	2026-05-13 15:49:56.075	2026-05-13 15:49:56.075
cmp48juhn00dgv3hjh0b9f17f	GUSTAVO MORA DEL MORAL	CANAL MERCADOTECNIA	gustavo.mora@helvex.com.mx	+525559177625		cmp48jmjl0032v3hjdrcgfpzo	2026-05-13 15:49:56.123	2026-05-13 15:49:56.123
cmp48jumx00dov3hjqho7p08p	JOSE EDUARDO CUEVAS CUREÑO	Coordinador de canal MKT	jose.cuevas@helvex.com.mx	+525619987601		cmp48jmjl0032v3hjdrcgfpzo	2026-05-13 15:49:56.313	2026-05-13 15:49:56.313
cmp48juo800dqv3hjwnk9v040	Elia Escudero	Account Coordinator	elia.escudero@hhglobal.com	+525548608549		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.361	2026-05-13 15:49:56.361
cmp48juqu00dsv3hjgkzwt6k9	Marian Tlayeca	Account Analyst	camila_4_90@hotmail.com	+525630824832		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:49:56.455	2026-05-13 15:49:56.455
cmp48jus500duv3hjkqyoezco	Luis Arellano	Account Manager	luis.arellano@hhglobal.com	+525563164022		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.502	2026-05-13 15:49:56.502
cmp48jutg00dwv3hjlzd634vz	Priscila Alanis	Regional Account Director LATAM	priscila.alanis@hhglobal.com	+525585322621		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.548	2026-05-13 15:49:56.548
cmp48juuv00dyv3hj1wu22ghv	Raúl Ayala Palacios	account	raul.ayala@hhglobal.com	+525534559777		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.599	2026-05-13 15:49:56.599
cmp48juw600e0v3hjhtg6qbul	Mayra Ivonne Rodriguez Escobar	Account coordinator	mayra.rodriguez@hhglobal.com	+525591956784		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.647	2026-05-13 15:49:56.647
cmp48juxh00e2v3hjr90yl08k	Verónica Pérez Aguilera	Client Engagement	vero.perez@hhglobal.com	+525578443549		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.694	2026-05-13 15:49:56.694
cmp48juys00e4v3hj7uuqc3ys	Mariel Barrera	Strategic Sourcing	mariel.barrera@hhglobal.com	+525579309513		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.741	2026-05-13 15:49:56.741
cmp48jv0300e6v3hjsbyzgfzo	Camila Olvera Perera	Strategic Sourcing	camila.olvera@hhglobal.com	+525578443544		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.788	2026-05-13 15:49:56.788
cmp48jv1f00e8v3hj5y5q7oha	Sarah Mondellini	Senior Director LATAM	sarah.mondellini@hhglobal.com	+525513536539		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.836	2026-05-13 15:49:56.836
cmp48jv2r00eav3hjnqmfpwtw	Claudia Aguilar Rosales	Sr. Strategic Sourcing Manager	claudia.aguilar@hhglobal.com	+525541449809		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.883	2026-05-13 15:49:56.883
cmp48jv5g00ecv3hjj1hrcn36	Montserrat Tovar Garcia	Account Coordinator	montserrat.tovar@hhglobal.com	+525543531618		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:56.98	2026-05-13 15:49:56.98
cmp48jv6r00eev3hj8my8ykfa	Estephania Figueroa Meneses	Account Manager	estephania.figueroa@hhglobal.com	+525536558716		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.027	2026-05-13 15:49:57.027
cmp48jv8100egv3hjwskjfg5v	Jonathan Ruiz	Account Manager MX / CAC	jonathan.ruiz@hhglobal.com	+525523246041		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.073	2026-05-13 15:49:57.073
cmp48jv9c00eiv3hjhnxmi9jv	Mario Andrés Guadarrama Maciel	Marketing. Account Analyst	andres.maciel@hhglobal.com	+525641702836		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.121	2026-05-13 15:49:57.121
cmp48jvao00ekv3hjsvwx922b	Alexis Martinez Arenas	Account analyst	alexis.martinez@hhglobal.com	+525573723137		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.168	2026-05-13 15:49:57.168
cmp48jvc000emv3hj380ddrhe	David Guzmán	Sr. Account Manager	david.guzman@hhglobal.com	+525526941310		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.216	2026-05-13 15:49:57.216
cmp48jvdb00eov3hj9df1d2sh	Perla Aguilar Paredes	Account Manager	perla.aguilar@hhglobal.com	+525578651416		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.264	2026-05-13 15:49:57.264
cmp48jvem00eqv3hjyp0ja8hi	Gabriel Ramirez	Strategic Sourcing Director LATAM	gabriel.ramirez@hhglobal.com	+525579201950		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.31	2026-05-13 15:49:57.31
cmp48jvfx00esv3hjr5yiocbu	Larisa Lanuza	Coordinador de marca	larisa.lanuza@hhglobal.com	+525574967936		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.358	2026-05-13 15:49:57.358
cmp48jvh700euv3hjz34ff0dl	Sarah Mondellini	Senior Director LATAM, Client Engagement	sarah.mondellini@hhglobal.com	+525513536539		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.404	2026-05-13 15:49:57.404
cmp48jvk500ewv3hjca9gsllj	Raúl Ayala Palacios	Account Analist	raul.ayala@hhglobal.com	+525534559777		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.509	2026-05-13 15:49:57.509
cmp48jvlg00eyv3hjdt32v4c8	Mariel Barrera	Strategic Sourcing	mariel.barrera@hhglobal.com	+525579309513		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.557	2026-05-13 15:49:57.557
cmp48jvmr00f0v3hjw98upwdu	David Guzmán	Sr. Account Manager	david.guzman@hhglobal.com	+525526941310		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.603	2026-05-13 15:49:57.603
cmp48jvo200f2v3hjpfn2ky7u	María Peña	Account Manager	maria.pena@hhglobal.com	+525514740679		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.651	2026-05-13 15:49:57.651
cmp48jvpf00f4v3hjp4umqhh2	Aldo Torres Contreras	Account Coordinator	aldo.torres@hhglobal.com	+525528962935		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.699	2026-05-13 15:49:57.699
cmp48jvqs00f6v3hjim2k8nhf	Carlos Ramirez	Account Manager	carlos.ramirez1@hhglobal.com	+525533877758		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.749	2026-05-13 15:49:57.749
cmp48jvs200f8v3hjlcis5anz	Elia Escudero	Account Coordinator	elia.escudero@hhglobal.com	+525548608549		cmp48jlvs0024v3hjufl9h4yz	2026-05-13 15:49:57.795	2026-05-13 15:49:57.795
cmp48jvte00fav3hjhwp2laqr	Jacobo Gonzalez	Creativo	prodesignmx@gmail.com	+525654007670		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:57.842	2026-05-13 15:49:57.842
cmp48jvup00fcv3hjqktc72t7	Gabriela Galván	Gerente de Ventas	ggideascomerciales@gmail.com	+525524258518		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:57.89	2026-05-13 15:49:57.89
cmp48jvw300fev3hjrauqu56o	Marco Hernandez	Productor Jr	mhernandez@ifahto.com	+525638078399		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:57.939	2026-05-13 15:49:57.939
cmp48jw3q00fmv3hju69lsotx	Magali Vasquez	Productora	mvasquez@ifahto.com	+525636687433		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:58.214	2026-05-13 15:49:58.214
cmp48jw6d00fqv3hjat8wy2uf	Brenda Mendoza	Ejecutiva de cuentas	bmendoza@ifahto.com	+525581536826		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:58.31	2026-05-13 15:49:58.31
cmp48jw8x00fuv3hj4hh30iv3	Denisse Godinez\\|	productor jr	dgodinez@ifahto.com	+525539559654		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:58.402	2026-05-13 15:49:58.402
cmp48jwd400fyv3hjaoj75fpk	Irving Tapia Jahen	Preproducción	ztapi13e@gmail.com	+527122598428		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:58.552	2026-05-13 15:49:58.552
cmp48jwig00g6v3hjebowjps8	Erika Méndez Buenrostro	Ejecutiva de cuentas Sr.	ebuenrostro@ifahto.com	+525530266197		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:58.744	2026-05-13 15:49:58.744
cmp48jwl500gav3hjfnqhq9lr	Valeria Joaly López Guzmán	Preproductor	jlopez@ifahto.com	+527732176624		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:58.842	2026-05-13 15:49:58.842
cmp48jwsw00giv3hjdp4d0rhu	Mariana Bravo	Productora	mbravo@ifahto.com	+525548781798		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:59.12	2026-05-13 15:49:59.12
cmp48jwu700gkv3hjme587d9i	Francisco Fajardo	Director Operaciones	ffajardo@ifahto.com	+525554589317		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:59.168	2026-05-13 15:49:59.168
cmp48jwzh00gsv3hj5c055q3d	Magali Vasquez	Produccion	mvasquez@ifahto.com	+525636687433		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:59.358	2026-05-13 15:49:59.358
cmp48jx2300gwv3hj3gd1401r	PAUL LOBATO VALDEZ	Director / Producción	plobato@ifahto.com	+525530284494		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:59.451	2026-05-13 15:49:59.451
cmp48jx3e00gyv3hjxzmuvma6	Francisco Fajardo	Director de operaciones	ffajardo@ifahto.com	+525554589317		cmp48jlp4001wv3hj0otq7dos	2026-05-13 15:49:59.499	2026-05-13 15:49:59.499
cmp48jxa700h6v3hjuort1jmp	Oscar Solis	DIRECTOR	maquitronventas@gmail.com	+525585341039		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:59.744	2026-05-13 15:49:59.744
cmp48jxbj00h8v3hjn3df61ul	DULCE CANO	ASISTENTE COMERCIAL	ventas.solari.inc.mx@gmail.com	+525645532128		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:49:59.792	2026-05-13 15:49:59.792
cmp48jxcu00hav3hj5s2cd42f	Abraham Bello	Ventas	ae_bello@hotmail.com	+527226873553		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:49:59.839	2026-05-13 15:49:59.839
cmp48jxe700hcv3hj7n0h449a	Iris Ruiz	Logistica	iris.ruiz@link-worldwide.com	+525551046806		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:49:59.888	2026-05-13 15:49:59.888
cmp48jxfh00hev3hjtss8zbos	DAFNE ROBLES	PRODUCTORA	daf_2109@hotmail.com	+525560933261		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:49:59.934	2026-05-13 15:49:59.934
cmp48jxgu00hgv3hjy6gt8b9w	Diego Rivera	Subdirector de Marketing	diego.rivera@licon.com.mx	+525530336791		cmp48jmfl002wv3hjnfpwywnc	2026-05-13 15:49:59.982	2026-05-13 15:49:59.982
cmp48jxne00hov3hj4q99mvla	Diego Josimar Rivera Rivero	Subdirector de Marketing	diego.rivera@licon.com.mx	+525585339405		cmp48jmfl002wv3hjnfpwywnc	2026-05-13 15:50:00.218	2026-05-13 15:50:00.218
cmp48jxoo00hqv3hj0b71wkxb	Jorge Iván Martínez Osegueda	Administrador Operativo de Marketing	jorge.martinez@licon.com.mx	+525591884563		cmp48jmfl002wv3hjnfpwywnc	2026-05-13 15:50:00.264	2026-05-13 15:50:00.264
cmp48jxq000hsv3hjqgcurw3j	Mario Martinez B.	Director de Cuenta	mariombarber@gmail.com	+525591982592		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:00.313	2026-05-13 15:50:00.313
cmp48jxrb00huv3hjdgbixxo5	Gerardo Escamilla	Key Account Manager	gerardo.escamilla@link-worldwide.com	+525546909752		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:00.36	2026-05-13 15:50:00.36
cmp48jxwi00i2v3hjdflnbmda	Lesly Juarez Adauto	Procurement	lesly.juarez@link-worldwide.com	+525661050332		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:00.546	2026-05-13 15:50:00.546
cmp48jxzc00i4v3hjoluu4310	Laura Lanz	Account Manager	laura.lanz@link-worldwide.com	+525580321234		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:00.648	2026-05-13 15:50:00.648
cmp48jy0m00i6v3hj8aobiyeu	Yoselin Ramirez Diaz	Manager	yoselin.ramirez@link-worldwide.com	+529511390845		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:00.695	2026-05-13 15:50:00.695
cmp48jy3b00iav3hjn3w507nc	Laura Lanz	Account Manager	laura.lanz@link-worldwide.com	+525580321234		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:00.791	2026-05-13 15:50:00.791
cmp48jy8n00iiv3hjiasy4kop	Laura Lanz	Account Manager	laura.lanz@link-worldwide.com	+525580321234		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:00.983	2026-05-13 15:50:00.983
cmp48jyf700iqv3hjasxfaa57	Laura Lanz	Account Manager	laura.lanz@link-worldwide.com	+525580321234		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:01.219	2026-05-13 15:50:01.219
cmp48jygi00isv3hj3yom0kdb	Julian Villanueva	Project Manager - Nestlé	julian.villanueva@link-worldwide.com	+529991125189		cmp48jlqe001yv3hj81kk1ah3	2026-05-13 15:50:01.266	2026-05-13 15:50:01.266
cmp48jyhu00iuv3hjct0v2udl	Jazmin Alejandra Acosta Guevara	Líder de Eventos y activaciones	jazmin.acosta@logrand.com	+528115444950		cmp48jmnk0036v3hjqylkjsin	2026-05-13 15:50:01.315	2026-05-13 15:50:01.315
cmp48jynd00j2v3hjhedg9fbe	Viviane Aguilera	Marketing	vivianea646@gruma.com	+525554356066		cmp48jmeb002uv3hju35zym5r	2026-05-13 15:50:01.514	2026-05-13 15:50:01.514
cmp48jyoq00j4v3hjtjhtii52	HAZIEL IGLESIAS	Gerencia	haziel_emmanuel@hotmail.com	+525516060265		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:50:01.563	2026-05-13 15:50:01.563
cmp48jyq300j6v3hjx5iy5oo2	Miguel Saavedra Tellez\\|	Team Leader	miguel.saavedra@mercadolibre.com.mx	+525535663428		cmp48jmou0038v3hj2fm9rbh2	2026-05-13 15:50:01.612	2026-05-13 15:50:01.612
cmp48jyxr00jev3hj2et6ltxf	Irving Jovany Caballero Campos	MARKETING	ext_irvicaba@mercadolibre.com.mx	+525569168795		cmp48jmou0038v3hj2fm9rbh2	2026-05-13 15:50:01.887	2026-05-13 15:50:01.887
cmp48jz3200jmv3hj24pg6v9y	Eugenio Ricardez Sánchez	Diseñador	contacto.patito@gmail.com	+529612177774		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:02.079	2026-05-13 15:50:02.079
cmp48jz4e00jov3hjrqrwatc6	JAIR LOPEZ MUÑOZ	MKT	lopezmunozjair@gmail.com	+525528629032		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:02.126	2026-05-13 15:50:02.126
cmp48jz7800jqv3hjzma7bcsa	JAIR LOPEZ MUÑOZ	Especialista de marca	lopezmunozjair@gmail.com	+525528629032		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:02.228	2026-05-13 15:50:02.228
cmp48jz8l00jsv3hjzmczf96p	Alejandra Zavaleta	Director ventas CDMX	alejandra.zavaleta@pmpackaging.com	+525535210257		cmp48jlug0022v3hjt7q4d5rt	2026-05-13 15:50:02.277	2026-05-13 15:50:02.277
cmp48jz9x00juv3hjz63m5c46	LAURA CABRERA	Analista Administrativo	cclaura@roshfrans.com	+525591610099		cmp48jmad002ov3hjlmcvjyl9	2026-05-13 15:50:02.325	2026-05-13 15:50:02.325
cmp48jzck00jyv3hjsez28p19	Cesar Campos	Compensaciones y beneficios	cesarj.campos.r@gmail.com	+525538988594		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:02.42	2026-05-13 15:50:02.42
cmp48jzf800k2v3hj201tk69t	Adriana Vargas	Asistente de Dirección	avargas@mnyl.com.mx	+525533325954		cmp48jmq5003av3hjymqe695d	2026-05-13 15:50:02.517	2026-05-13 15:50:02.517
cmp48jzhz00k6v3hjsxqlrmq0	JOSE LUIS HERNANDEZ CANCHOLA	COORD. CULTURA Y EXPERIENCIA DEL EMPLEADO	jlhernandez@mnyl.com.mx	+525635969288		cmp48jmq5003av3hjymqe695d	2026-05-13 15:50:02.615	2026-05-13 15:50:02.615
cmp48jzn100kav3hj1sorzuwj	Jesús Cerda Troncoso	Comprador Jr	jesus.cerda@siegfried.com.mx	+525554543215		cmp48jmrg003cv3hjb48qypq3	2026-05-13 15:50:02.797	2026-05-13 15:50:02.797
cmp48jzpo00kev3hj4ng1zaux	Enya Jezabel Arias Reza	Comprador Jr	enya.arias@siegfried.com.mx	+525543430651		cmp48jmrg003cv3hjb48qypq3	2026-05-13 15:50:02.893	2026-05-13 15:50:02.893
cmp48jzuz00kmv3hjpw56se9a	Pricila Reyes	Comprador	pricila.reyes@siegfried.com.mx	+525548775425		cmp48jmrg003cv3hjb48qypq3	2026-05-13 15:50:03.084	2026-05-13 15:50:03.084
cmp48jzxm00kqv3hj2ufib2qb	Alejandra Ximena Aguilar George	Jefa de compras de indirectos MKT/Comercial	alejandra.aguilar@siegfried.com.mx	+525579701178		cmp48jmrg003cv3hjb48qypq3	2026-05-13 15:50:03.179	2026-05-13 15:50:03.179
cmp48k01j00ksv3hjucd23l4a	Claudia Arce	marketing	claudia.arce@siegfried.com.mx	+525579199153		cmp48jmrg003cv3hjb48qypq3	2026-05-13 15:50:03.32	2026-05-13 15:50:03.32
cmp48k04600kwv3hjjx1tl8l8	Erendida Sevilla	Coordinación de procesos	esevillat@mnyl.com.mx	+525513597078		cmp48jmq5003av3hjymqe695d	2026-05-13 15:50:03.414	2026-05-13 15:50:03.414
cmp48k05i00kyv3hjlttus7kf	Gabriela Romero Hernández	08810	fernandahuesca82@gmail.com	+525611956294		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:03.462	2026-05-13 15:50:03.462
cmp48k06t00l0v3hjuyd5mu1y	mariana tlayeca peña	Account Analyts	camila_4_90@hotmail.com	+525630824832		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:50:03.509	2026-05-13 15:50:03.509
cmp48k08400l2v3hjwpz5cnpj	Adriana Campos	Jefe de de bienestar	aacc1709@gmail.com	+525534449720		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:03.557	2026-05-13 15:50:03.557
cmp48k09f00l4v3hjey1niz6h	Vanessa Belmont	Gerente de Comunicación Interna	vanessa.belmont@tvazteca.com.mx	+525551048745		cmp48jlyf0028v3hj92lhmndq	2026-05-13 15:50:03.604	2026-05-13 15:50:03.604
cmp48k0aq00l6v3hjqo1jqcp1	Stephany Vázquez Guerrero	CEO	steph_va94@hotmail.com	+525633227667		cmp48jlx40026v3hjgjl4k251	2026-05-13 15:50:03.651	2026-05-13 15:50:03.651
cmp48k0c200l8v3hjnrr3jx9n	Dan Rodrigo Chapela Ceron	Marketing manager bss	danchapelac13@gmail.com	+525646217115		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:03.698	2026-05-13 15:50:03.698
cmp48k0er00lav3hjkc64c9m1	Dan Rodrigo Chapela Ceron	Marketing manager	danchapelac13@gmail.com	+525646217115		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:03.796	2026-05-13 15:50:03.796
cmp48k0g300lcv3hj946ll3qy	Dan Rodrigo Chapela	Marketing manager bss	danchapelac13@gmail.com	+525646217115		cmp48jljv001ov3hjlhaobsoc	2026-05-13 15:50:03.844	2026-05-13 15:50:03.844
cmp48k0hf00lev3hjvqgwj1go	Samuel Padilla	Comprador Senior	samuel.padilla@volvo.com	+525541925187		cmp48jmst003ev3hjaiwnz0q2	2026-05-13 15:50:03.891	2026-05-13 15:50:03.891
cmp48k0iq00lgv3hjlr4vl5d2	Andrea Martinez	Postventa	andrea.martinez@volvo.com	+525543536119		cmp48jmst003ev3hjaiwnz0q2	2026-05-13 15:50:03.939	2026-05-13 15:50:03.939
cmp48k0k100liv3hjhj3nybo6	Mariana Diaz	Procurement	mariana.diazguerrero@wbd.com	+525539433296		cmp48jmu4003gv3hjsmhpwabt	2026-05-13 15:50:03.986	2026-05-13 15:50:03.986
cmp48k0lc00lkv3hj9mp0i9lk	Paola Arechiga	Procurement	paola.arechiga@wbd.com	+525573652777		cmp48jmu4003gv3hjsmhpwabt	2026-05-13 15:50:04.032	2026-05-13 15:50:04.032
\.


--
-- Data for Name: Ejecutivo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Ejecutivo" (id, nombre, email, telefono, cargo, activo, "createdAt", "updatedAt") FROM stdin;
cmp48jj1u0000v3hjfqqv7nms	Noe Sanchez	nsanchez@generandoideas.com			t	2026-05-13 15:49:41.299	2026-05-13 15:49:41.299
cmp48jj4j0001v3hjp9e9fydv	Gil Tapia	gtapia@generandoideas.com			t	2026-05-13 15:49:41.395	2026-05-13 15:49:41.395
cmp48jj5u0002v3hj6fczxj4o	Mitzy Olguin	molguin@generandoideas.com			t	2026-05-13 15:49:41.443	2026-05-13 15:49:41.443
cmp48jj770003v3hj03s9h7on	Manuel Quintanilla	mquintanilla@generandoideas.com			t	2026-05-13 15:49:41.491	2026-05-13 15:49:41.491
cmp48jj8i0004v3hjg5jg3k9p	Monserrat Perez	mperez@generandoideas.com			t	2026-05-13 15:49:41.538	2026-05-13 15:49:41.538
cmp48jj9x0005v3hjy2kw366l	Kathya Nieves	knieves@generandoideas.com			t	2026-05-13 15:49:41.59	2026-05-13 15:49:41.59
cmp48jjb80006v3hjotw5somx	Erika Aguilar	eaguilar@generandoideas.com			t	2026-05-13 15:49:41.636	2026-05-13 15:49:41.636
cmp48jjck0007v3hj727m3tkr	Wiliam Garcia	wgarcia@generandoideas.com			t	2026-05-13 15:49:41.684	2026-05-13 15:49:41.684
cmp48jjga0008v3hj2c0xpcuy	Eduardo Morales	emorales@generandoideas.com			t	2026-05-13 15:49:41.819	2026-05-13 15:49:41.819
cmp48jjhn0009v3hjacuuw1n5	Ariana Flores	aflores@generandoideas.com			t	2026-05-13 15:49:41.867	2026-05-13 15:49:41.867
cmp48jjix000av3hjaoyfoqux	Antonio Quiroz	aquiroz@generandoideas.com			t	2026-05-13 15:49:41.914	2026-05-13 15:49:41.914
cmp48jjk8000bv3hjmhw4iosd	Carolina Bernal	cbernal@generandoideas.com			t	2026-05-13 15:49:41.961	2026-05-13 15:49:41.961
cmp48jjlk000cv3hjw78bttij	Gaby Maldonado	gmaldonado@generandoideas.com			t	2026-05-13 15:49:42.009	2026-05-13 15:49:42.009
cmp48jjmw000dv3hjcnkqlaat	Brian Cedillo	bcedillo@generandoideas.com			t	2026-05-13 15:49:42.056	2026-05-13 15:49:42.056
cmp48jjo7000ev3hjzwj116e0	Andrea Espinosa	aespinosa@generandoideas.com			t	2026-05-13 15:49:42.103	2026-05-13 15:49:42.103
cmp64ag9j0000l804a41huwy3	Gil Valdespino	gvaldespino@generandoideas.com	55 2696 4950	CEO	t	2026-05-14 23:26:11.671	2026-05-14 23:26:11.671
cmp64b4bc0001l804z4hwa3mm	Marketing	marketing@generandoideas.com	55 3482 9153	Costumer Success	t	2026-05-14 23:26:42.841	2026-05-14 23:26:42.841
\.


--
-- Data for Name: Empresa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Empresa" (id, nombre, "ciudadEstado", notas, "createdAt", "updatedAt", "ejecutivoId") FROM stdin;
cmp48jl7j001av3hjuf2sf1rw	Santander		Dominio: gruposantander.com	2026-05-13 15:49:44.096	2026-05-13 15:49:44.096	cmp48jj1u0000v3hjfqqv7nms
cmp48jla6001cv3hjdtow1tu8	Abbott		Dominio: abbott.com	2026-05-13 15:49:44.191	2026-05-13 15:49:44.191	cmp48jj4j0001v3hjp9e9fydv
cmp48jlbi001ev3hjitoyq0fe	ACD Competencias & Coaching		Dominio: grupoacd.com	2026-05-13 15:49:44.238	2026-05-13 15:49:44.238	cmp48jj5u0002v3hj6fczxj4o
cmp48jlcu001gv3hj8psgflme	adm - Indicia		Dominio: adm-indica.com	2026-05-13 15:49:44.286	2026-05-13 15:49:44.286	cmp48jj770003v3hj03s9h7on
cmp48jlfw001iv3hj5s6m1aug	ADM GROUP		Dominio: adm-indicia.com	2026-05-13 15:49:44.396	2026-05-13 15:49:44.396	cmp48jj770003v3hj03s9h7on
cmp48jlh7001kv3hjaa2lv3nb	AFORE SURA		Dominio: suramexico.com	2026-05-13 15:49:44.444	2026-05-13 15:49:44.444	cmp48jj1u0000v3hjfqqv7nms
cmp48jlij001mv3hjsua7wskj	Agencia de Publicidad Dette		Dominio: dette.mx	2026-05-13 15:49:44.491	2026-05-13 15:49:44.491	cmp48jj5u0002v3hj6fczxj4o
cmp48jljv001ov3hjlhaobsoc	Agencia de Publicidad Dette		Dominio: gmail.com	2026-05-13 15:49:44.54	2026-05-13 15:49:44.54	cmp48jj5u0002v3hj6fczxj4o
cmp48jll7001qv3hjx3ylo7ig	Agilent		Dominio: agilent.com	2026-05-13 15:49:44.588	2026-05-13 15:49:44.588	cmp48jj8i0004v3hjg5jg3k9p
cmp48jlmi001sv3hj6rebm2wc	ANADE		Dominio: anade.org.mx	2026-05-13 15:49:44.634	2026-05-13 15:49:44.634	cmp48jj9x0005v3hjy2kw366l
cmp48jlnt001uv3hjdacgmf74	Antiagency		Dominio: antiagency.mx	2026-05-13 15:49:44.682	2026-05-13 15:49:44.682	cmp48jj5u0002v3hj6fczxj4o
cmp48jlp4001wv3hj0otq7dos	IFAHTO		Dominio: ifahto.com	2026-05-13 15:49:44.728	2026-05-13 15:49:44.728	cmp48jj770003v3hj03s9h7on
cmp48jlqe001yv3hj81kk1ah3	ASL LINK		Dominio: link-worldwide.com	2026-05-13 15:49:44.775	2026-05-13 15:49:44.775	cmp48jj1u0000v3hjfqqv7nms
cmp48jlrq0020v3hjvqvpjk4t	AVANNA		Dominio: avanna.com.mx	2026-05-13 15:49:44.823	2026-05-13 15:49:44.823	cmp48jj5u0002v3hj6fczxj4o
cmp48jlug0022v3hjt7q4d5rt	AZ IMPRESORES		Dominio: pmpackaging.com	2026-05-13 15:49:44.92	2026-05-13 15:49:44.92	cmp48jj5u0002v3hj6fczxj4o
cmp48jlvs0024v3hjufl9h4yz	Bacardí		Dominio: hhglobal.com	2026-05-13 15:49:44.969	2026-05-13 15:49:44.969	cmp48jj8i0004v3hjg5jg3k9p
cmp48jlx40026v3hjgjl4k251	BAMBOO PRINT		Dominio: hotmail.com	2026-05-13 15:49:45.016	2026-05-13 15:49:45.016	cmp48jj5u0002v3hj6fczxj4o
cmp48jlyf0028v3hj92lhmndq	banco azteca		Dominio: tvazteca.com.mx	2026-05-13 15:49:45.063	2026-05-13 15:49:45.063	cmp48jjb80006v3hjotw5somx
cmp48jlzq002av3hjkgqzqv54	Biocodex		Dominio: biocodex.mx	2026-05-13 15:49:45.11	2026-05-13 15:49:45.11	cmp48jjga0008v3hj2c0xpcuy
cmp48jm11002cv3hj0p4y3tvl	BIVA		Dominio: biva.mx	2026-05-13 15:49:45.158	2026-05-13 15:49:45.158	cmp48jjhn0009v3hjacuuw1n5
cmp48jm2d002ev3hj4ui1ybiu	BMV		Dominio: grupobmv.com.mx	2026-05-13 15:49:45.205	2026-05-13 15:49:45.205	cmp48jjhn0009v3hjacuuw1n5
cmp48jm3q002gv3hjq6pmh6v3	Caja Morelia valladolid		Dominio: valladolidcaja.com	2026-05-13 15:49:45.254	2026-05-13 15:49:45.254	cmp48jjck0007v3hj727m3tkr
cmp48jm51002iv3hjc1800vv7	Canon		Dominio: cusa.canon.com	2026-05-13 15:49:45.301	2026-05-13 15:49:45.301	cmp48jj1u0000v3hjfqqv7nms
cmp48jm6a002kv3hj7zl9gcny	Cinemex		Dominio: cinemex.net	2026-05-13 15:49:45.347	2026-05-13 15:49:45.347	cmp48jj770003v3hj03s9h7on
cmp48jm8z002mv3hj660fpjbn	CNH DE MEXICO		Dominio: cnhmexico.com.mx	2026-05-13 15:49:45.444	2026-05-13 15:49:45.444	cmp48jjix000av3hjaoyfoqux
cmp48jmad002ov3hjlmcvjyl9	COMERCIAL ROSHFRANS		Dominio: roshfrans.com	2026-05-13 15:49:45.493	2026-05-13 15:49:45.493	cmp48jj770003v3hj03s9h7on
cmp48jmbo002qv3hj7dlluw2x	Cruz Roja Mexicana		Dominio: cruzrojamexicana.org.mx	2026-05-13 15:49:45.541	2026-05-13 15:49:45.541	cmp48jjga0008v3hj2c0xpcuy
cmp48jmd0002sv3hjw4eklroe	Drive		Dominio: drive-mx.com	2026-05-13 15:49:45.588	2026-05-13 15:49:45.588	cmp48jjk8000bv3hjmhw4iosd
cmp48jmeb002uv3hju35zym5r	GRUMA		Dominio: gruma.com	2026-05-13 15:49:45.635	2026-05-13 15:49:45.635	cmp48jjk8000bv3hjmhw4iosd
cmp48jmfl002wv3hjnfpwywnc	Grupo LICON		Dominio: licon.com.mx	2026-05-13 15:49:45.682	2026-05-13 15:49:45.682	cmp48jjga0008v3hj2c0xpcuy
cmp48jmgz002yv3hjm8t7g5sn	GRUPO SALINAS		Dominio: elektra.com.mx	2026-05-13 15:49:45.732	2026-05-13 15:49:45.732	cmp48jjb80006v3hjotw5somx
cmp48jmia0030v3hjpkbr5i2s	GS		Dominio: bancoazteca.com.mx	2026-05-13 15:49:45.779	2026-05-13 15:49:45.779	cmp48jjb80006v3hjotw5somx
cmp48jmjl0032v3hjdrcgfpzo	Helvex		Dominio: helvex.com.mx	2026-05-13 15:49:45.825	2026-05-13 15:49:45.825	cmp48jjix000av3hjaoyfoqux
cmp48jmkv0034v3hjdmbbwo33	HELVEX		Dominio: hotmail.com.mx	2026-05-13 15:49:45.872	2026-05-13 15:49:45.872	cmp48jjix000av3hjaoyfoqux
cmp48jmnk0036v3hjqylkjsin	Logrand Entertainment Group		Dominio: logrand.com	2026-05-13 15:49:45.968	2026-05-13 15:49:45.968	cmp48jjlk000cv3hjw78bttij
cmp48jmou0038v3hj2fm9rbh2	Mercado Libre		Dominio: mercadolibre.com.mx	2026-05-13 15:49:46.015	2026-05-13 15:49:46.015	cmp48jjmw000dv3hjcnkqlaat
cmp48jmq5003av3hjymqe695d	Seguros Monterrey New York Life		Dominio: mnyl.com.mx	2026-05-13 15:49:46.062	2026-05-13 15:49:46.062	cmp48jjo7000ev3hjzwj116e0
cmp48jmrg003cv3hjb48qypq3	Siegfried Rhein		Dominio: siegfried.com.mx	2026-05-13 15:49:46.109	2026-05-13 15:49:46.109	cmp48jjo7000ev3hjzwj116e0
cmp48jmst003ev3hjaiwnz0q2	VOLVO GROUP MEXICO		Dominio: volvo.com	2026-05-13 15:49:46.157	2026-05-13 15:49:46.157	cmp48jj4j0001v3hjp9e9fydv
cmp48jmu4003gv3hjsmhpwabt	Warner Bros discovery		Dominio: wbd.com	2026-05-13 15:49:46.204	2026-05-13 15:49:46.204	cmp48jjck0007v3hj727m3tkr
\.


--
-- Data for Name: InventarioObsequio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventarioObsequio" (id, nombre, "stockTotal", "stockActual", "alertaMinimo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MaterialDigital; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MaterialDigital" (id, nombre, descripcion, categoria, url, tipo, "createdAt", "updatedAt") FROM stdin;
mat_expo_info	Información Expo Publicitas	Información general del evento	Presentaciones	/uploads/ExpoPublicitas.Información.png	png	2026-05-13 15:51:03.957	2026-05-13 15:51:03.957
mat_gim_uber	GIM Uber - Expo Publicitas	Información de Uber para asistentes GIM	Otro	/uploads/GIM.ExpoPublicitas.Uber.jpg	jpg	2026-05-13 15:51:03.957	2026-05-13 15:51:03.957
mat_gim_mailing	GIM Mailing Beneficios	Mailing con beneficios para GIM	Otro	/uploads/GIM.Mailing.ExpoPublicitas.Beneficios.jpg	jpg	2026-05-13 15:51:03.957	2026-05-13 15:51:03.957
\.


--
-- Data for Name: Obsequio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Obsequio" (id, fecha, "tipoCliente", observaciones, "createdAt", "updatedAt", articulo, "clienteId", "ejecutivoId") FROM stdin;
\.


--
-- Data for Name: ParticipanteRifa; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ParticipanteRifa" (id, nombre, empresa, cargo, email, telefono, "diaRifa", "numeroTicket", "ejecutivoId", rating, comentario, "reviewId", "ganoEn", "createdAt", entregado, rechazado) FROM stdin;
cmp62lhzt0002v3g96lfjn3zg	Héctor Romero	Soriana	Director Financiero	hector.romero+Día1_3@demo.com	+52 55 74238556	Día 1	3	cmp48jj770003v3hj03s9h7on	4		\N	2026-05-14 22:39:14.962	2026-05-14 22:38:47.896	f	f
cmp62lhzs0000v3g9gj1mle4x	Andrés Espinoza	Kimberly-Clark	Coordinador	andres.espinoza+Día1_1@demo.com	+52 55 18379019	Día 1	1	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0001v3g9dtuxbm60	Fernanda Torres	Nestlé México	Gerente de Operaciones	fernanda.torres+Día1_2@demo.com	+52 55 18938409	Día 1	2	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0003v3g9lcfsa3a4	Daniela Martínez	Bachoco	Gerente de Producto	daniela.martinez+Día1_4@demo.com	+52 55 89933236	Día 1	4	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0004v3g9djpgklaw	Ximena Ortega	Lala	Gerente de Marketing	ximena.ortega+Día1_5@demo.com	+52 55 19430084	Día 1	5	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0005v3g9l9kv5mny	Maximiliano Martínez	GE México	Gerente Comercial	maximiliano.martinez+Día1_6@demo.com	+52 55 87812321	Día 1	6	cmp48jjlk000cv3hjw78bttij	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0006v3g96o1dc5fh	Wendy Cervantes	Herdez	CEO	wendy.cervantes+Día1_7@demo.com	+52 55 70219284	Día 1	7	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0007v3g9bo3c15gk	Wendy Ávila	Walmart México	Gerente de Operaciones	wendy.avila+Día1_8@demo.com	+52 55 83720453	Día 1	8	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0008v3g92dron724	Maximiliano González	Colgate	Coordinador	maximiliano.gonzalez+Día1_9@demo.com	+52 55 24646744	Día 1	9	cmp48jjmw000dv3hjcnkqlaat	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0009v3g9suuem0vd	Wendy Pérez	Grupo Bimbo	Director de TI	wendy.perez+Día1_10@demo.com	+52 55 19549835	Día 1	10	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000av3g9yxpyxltf	Inés Jiménez	Alpura	Coordinador	ines.jimenez+Día1_11@demo.com	+52 55 83378114	Día 1	11	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000bv3g98y5yne4b	Mariana Torres	Bosch México	Coordinador	mariana.torres+Día1_12@demo.com	+52 55 58888648	Día 1	12	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000cv3g94vs20jz7	Renata Cordero	Unilever	Gerente Comercial	renata.cordero+Día1_13@demo.com	+52 55 67220271	Día 1	13	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000dv3g943u4jsd9	Sebastián Cervantes	Bachoco	Director Comercial	sebastian.cervantes+Día1_14@demo.com	+52 55 28331481	Día 1	14	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000ev3g9tlxp2hf5	Andrea Espinoza	Colgate	Subdirector	andrea.espinoza+Día1_15@demo.com	+52 55 60887393	Día 1	15	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000fv3g9cstiu2lp	Andrés Núñez	Pilgrim's	VP Ventas	andres.nunez+Día1_16@demo.com	+52 55 81094988	Día 1	16	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000gv3g9xe3ea4e1	Andrés López	Kimberly-Clark	Director Comercial	andres.lopez+Día1_17@demo.com	+52 55 39645153	Día 1	17	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000hv3g97fvtuj5w	Carolina Vega	Sigma	Gerente Comercial	carolina.vega+Día1_18@demo.com	+52 55 75479951	Día 1	18	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000iv3g9xv2sdu0t	Elena Ramírez	Whirlpool	CEO	elena.ramirez+Día1_19@demo.com	+52 55 87968400	Día 1	19	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000jv3g9mvkahadv	Constanza Castro	Modelo	Jefe de Compras	constanza.castro+Día1_20@demo.com	+52 55 62144222	Día 1	20	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000kv3g9wcrnvdv1	Zacarías González	Cinépolis	Director de TI	zacarias.gonzalez+Día1_21@demo.com	+52 55 94490216	Día 1	21	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000lv3g9lvwytdpu	Natalia Jiménez	Bosch México	Coordinador	natalia.jimenez+Día1_22@demo.com	+52 55 93427055	Día 1	22	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000mv3g91cvrp13b	Inés Jiménez	Procter & Gamble	Coordinador Regional	ines.jimenez+Día1_23@demo.com	+52 55 66988486	Día 1	23	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000nv3g9g7ehl70h	Zacarías Cordero	Telcel	Director General	zacarias.cordero+Día1_24@demo.com	+52 55 15949082	Día 1	24	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000ov3g9979r0t1n	Silvia Silva	Modelo	Gerente de Producto	silvia.silva+Día1_25@demo.com	+52 55 92458717	Día 1	25	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000pv3g9qsnntpws	Iván Morales	Nestlé México	Subdirector	ivan.morales+Día1_26@demo.com	+52 55 27841584	Día 1	26	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000qv3g90yke5iai	Mariana Romero	Procter & Gamble	Gerente de Marketing	mariana.romero+Día1_27@demo.com	+52 55 45632382	Día 1	27	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000rv3g9v3j8rzvq	Andrea Aguilar	Sigma	Director General	andrea.aguilar+Día1_28@demo.com	+52 55 56691336	Día 1	28	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000sv3g95fbfycrd	Tadeo Ramírez	Unilever	Director Marketing	tadeo.ramirez+Día1_29@demo.com	+52 55 44275343	Día 1	29	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000tv3g93oyyfhlb	Javier López	Bimbo	Subdirector	javier.lopez+Día1_30@demo.com	+52 55 74073383	Día 1	30	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000uv3g9j7i7vt6h	Héctor Ramírez	Grupo Bimbo	Director Financiero	hector.ramirez+Día1_31@demo.com	+52 55 36860680	Día 1	31	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000vv3g92h4ya3nx	Yolanda López	Unilever	Gerente de Operaciones	yolanda.lopez+Día1_32@demo.com	+52 55 19438590	Día 1	32	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000wv3g97lxuru97	Emilio Aguilar	Grupo Helvex	Gerente Comercial	emilio.aguilar+Día1_33@demo.com	+52 55 75844101	Día 1	33	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000xv3g9kq2op4oi	Isabella González	Procter & Gamble	Gerente Comercial	isabella.gonzalez+Día1_34@demo.com	+52 55 96632727	Día 1	34	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000yv3g9bgrz989x	Bruno Salinas	Bosch México	Gerente de Operaciones	bruno.salinas+Día1_35@demo.com	+52 55 70943325	Día 1	35	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt000zv3g9gdsf78hy	Tadeo Cervantes	BBVA	Gerente de Marketing	tadeo.cervantes+Día1_36@demo.com	+52 55 21792825	Día 1	36	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0010v3g9t7uzp15h	Úrsula Ruiz	Grupo Helvex	CEO	ursula.ruiz+Día1_37@demo.com	+52 55 40856161	Día 1	37	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0011v3g9br4k52rx	Federico Hernández	Siemens	Gerente Comercial	federico.hernandez+Día1_38@demo.com	+52 55 77502599	Día 1	38	cmp48jjix000av3hjaoyfoqux	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0012v3g9dujxv0ar	Daniel Hernández	Liverpool	VP Ventas	daniel.hernandez+Día1_39@demo.com	+52 55 15521031	Día 1	39	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0013v3g9g94cl4km	Lucía González	Cementos Atlas	VP Ventas	lucia.gonzalez+Día1_40@demo.com	+52 55 59250456	Día 1	40	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0014v3g98nkp3eog	Héctor Torres	PepsiCo México	Subdirector	hector.torres+Día1_41@demo.com	+52 55 33124927	Día 1	41	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0015v3g97xqz02ii	Federico López	Bosch México	VP Ventas	federico.lopez+Día1_42@demo.com	+52 55 35102075	Día 1	42	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0016v3g9yxy41344	Fernanda Núñez	Liverpool	Gerente de Producto	fernanda.nunez+Día1_43@demo.com	+52 55 47222406	Día 1	43	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0017v3g9rpwacuhc	Nicolás Rodríguez	Colgate	Gerente Comercial	nicolas.rodriguez+Día1_44@demo.com	+52 55 12323983	Día 1	44	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0018v3g9vqgtvhf8	Héctor Cruz	Mabe	Director General	hector.cruz+Día1_45@demo.com	+52 55 77806080	Día 1	45	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt0019v3g9ogr8ewc7	Alejandra Pérez	Telcel	VP Ventas	alejandra.perez+Día1_46@demo.com	+52 55 19549759	Día 1	46	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001av3g9zjdiv47k	Ximeno Aguilar	Unilever	Gerente Comercial	ximeno.aguilar+Día1_47@demo.com	+52 55 66842539	Día 1	47	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001bv3g9f62im5ma	Patricio Ruiz	Nestlé México	VP Ventas	patricio.ruiz+Día1_48@demo.com	+52 55 57273864	Día 1	48	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001cv3g9vhhel4e3	Pablo Ávila	Aeroméxico	CEO	pablo.avila+Día1_49@demo.com	+52 55 44265165	Día 1	49	cmp48jjix000av3hjaoyfoqux	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001dv3g93ooreyw2	Natalia Castro	Mabe	Director General	natalia.castro+Día1_50@demo.com	+52 55 76163230	Día 1	50	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001ev3g9bewpc2xg	Diego Mendoza	Telcel	CEO	diego.mendoza+Día1_51@demo.com	+52 55 75485401	Día 1	51	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001fv3g918dav44z	Daniela Ramírez	Jumex	Coordinador Regional	daniela.ramirez+Día1_52@demo.com	+52 55 59521994	Día 1	52	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001gv3g93q3ef5wd	Gabriela Romero	Lala	Coordinador	gabriela.romero+Día1_53@demo.com	+52 55 32102261	Día 1	53	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001hv3g9vrexpljp	Alejandra Castro	Jumex	Gerente de Operaciones	alejandra.castro+Día1_54@demo.com	+52 55 66610408	Día 1	54	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001iv3g9yxrjmc4q	Zacarías Castro	Soriana	Director Financiero	zacarias.castro+Día1_55@demo.com	+52 55 70866981	Día 1	55	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001jv3g92tk8ccyk	Yolanda Rodríguez	OXXO	Subdirector	yolanda.rodriguez+Día1_56@demo.com	+52 55 78284249	Día 1	56	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001kv3g9lcxh15ak	Zacarías Jiménez	Grupo Helvex	Gerente Comercial	zacarias.jimenez+Día1_57@demo.com	+52 55 50338819	Día 1	57	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001lv3g9ba05tzce	Ximena Mendoza	Lala	Jefe de Compras	ximena.mendoza+Día1_58@demo.com	+52 55 67441209	Día 1	58	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001mv3g9lmfgr7h8	Daniela Aguilar	Herdez	VP Ventas	daniela.aguilar+Día1_59@demo.com	+52 55 74190269	Día 1	59	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001nv3g9t9a417vk	Damián Guerrero	Tequila Don Julio	Gerente de Producto	damian.guerrero+Día1_60@demo.com	+52 55 68841952	Día 1	60	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001ov3g9c5zc62ni	Valentina Salinas	Modelo	Coordinador	valentina.salinas+Día1_61@demo.com	+52 55 94863191	Día 1	61	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001pv3g9zojug61n	Renata Cruz	Cementos Atlas	Jefe de Compras	renata.cruz+Día1_62@demo.com	+52 55 43669837	Día 1	62	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001qv3g9dhcg5ywh	Alejandra Beltrán	Bosch México	Gerente de Marketing	alejandra.beltran+Día1_63@demo.com	+52 55 65652115	Día 1	63	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001rv3g9r8z5frql	Víctor Sánchez	Soriana	CEO	victor.sanchez+Día1_64@demo.com	+52 55 82177514	Día 1	64	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001sv3g9t4ut5bkk	Gabriela Espinoza	Procter & Gamble	Gerente de Producto	gabriela.espinoza+Día1_65@demo.com	+52 55 17520776	Día 1	65	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001tv3g996mi1efa	Adrián Morales	Schneider Electric	Jefe de Ventas	adrian.morales+Día1_66@demo.com	+52 55 12604291	Día 1	66	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001uv3g9fo6kvnzg	Elena Beltrán	PepsiCo México	Jefe de Compras	elena.beltran+Día1_67@demo.com	+52 55 16441967	Día 1	67	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzt001vv3g9q2mpza90	Daniela Morales	Santander	VP Ventas	daniela.morales+Día1_68@demo.com	+52 55 41015828	Día 1	68	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu001wv3g99vg7nqqe	Carolina Cruz	Cementos Atlas	Gerente de Marketing	carolina.cruz+Día1_69@demo.com	+52 55 52626831	Día 1	69	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu001xv3g9ibd23aw9	Natalia Cervantes	Maseca	Director Comercial	natalia.cervantes+Día1_70@demo.com	+52 55 91670019	Día 1	70	cmp48jjlk000cv3hjw78bttij	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu001yv3g97t361lyk	Eduardo Espinoza	Alpura	Coordinador	eduardo.espinoza+Día1_71@demo.com	+52 55 46184359	Día 1	71	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu001zv3g9281leyeb	Regina Salinas	Nestlé México	Gerente Comercial	regina.salinas+Día1_72@demo.com	+52 55 25029804	Día 1	72	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0020v3g90n9ue1lu	Renata Pérez	Telcel	Gerente de Operaciones	renata.perez+Día1_73@demo.com	+52 55 69377185	Día 1	73	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0021v3g90oxz7jjf	Mónica Ramírez	Kimberly-Clark	Jefe de Ventas	monica.ramirez+Día1_74@demo.com	+52 55 27391837	Día 1	74	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0022v3g9p2vn4wwh	Federico Cordero	Whirlpool	Gerente de Producto	federico.cordero+Día1_75@demo.com	+52 55 61407406	Día 1	75	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0023v3g93mqi4hbi	Tomás Morales	Grupo Bimbo	Director General	tomas.morales+Día1_76@demo.com	+52 55 26361956	Día 1	76	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0024v3g9u00ulsfo	Ximeno Romero	Grupo Bimbo	Gerente Comercial	ximeno.romero+Día1_77@demo.com	+52 55 81013372	Día 1	77	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0025v3g976apb4hw	Camila Pérez	Soriana	Gerente de Marketing	camila.perez+Día1_78@demo.com	+52 55 61203209	Día 1	78	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0026v3g9pxeoo6rx	Alejandra Cervantes	Grupo Helvex	Coordinador Regional	alejandra.cervantes+Día1_79@demo.com	+52 55 60643489	Día 1	79	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0027v3g9hultu8s7	Javier Espinoza	Bimbo	Gerente de Operaciones	javier.espinoza+Día1_80@demo.com	+52 55 32881037	Día 1	80	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0028v3g9nq7ye8rg	Héctor Romero	Telcel	Gerente de Marketing	hector.romero+Día1_81@demo.com	+52 55 31938041	Día 1	81	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0029v3g9sgi7499s	Ximena Beltrán	Pilgrim's	Gerente de Marketing	ximena.beltran+Día1_82@demo.com	+52 55 86746257	Día 1	82	cmp48jjix000av3hjaoyfoqux	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002av3g94yn5xmup	Daniela Flores	Tequila Don Julio	Gerente de Producto	daniela.flores+Día1_83@demo.com	+52 55 31514879	Día 1	83	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002bv3g93ty8b9lz	Adrián Espinoza	OXXO	Director Comercial	adrian.espinoza+Día1_84@demo.com	+52 55 59647361	Día 1	84	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002cv3g9v6ju63tu	Mateo Guerrero	Banamex	Director General	mateo.guerrero+Día1_85@demo.com	+52 55 18038888	Día 1	85	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002dv3g99w2o9s3k	Natalia Sánchez	Bosch México	Jefe de Ventas	natalia.sanchez+Día1_86@demo.com	+52 55 30015155	Día 1	86	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002ev3g9hfv5b1rm	Javier Núñez	Unilever	Gerente de Producto	javier.nunez+Día1_87@demo.com	+52 55 48496746	Día 1	87	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002fv3g90vjldfxc	Valentina Núñez	Santander	Coordinador	valentina.nunez+Día1_88@demo.com	+52 55 78076846	Día 1	88	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002gv3g9xegfsp9l	Mariana Cruz	Bosch México	Jefe de Ventas	mariana.cruz+Día1_89@demo.com	+52 55 54928836	Día 1	89	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002hv3g9sdjrddi9	Patricio Vargas	Liverpool	Jefe de Ventas	patricio.vargas+Día1_90@demo.com	+52 55 66300749	Día 1	90	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002iv3g9bc3rpg5q	Patricio Beltrán	Walmart México	Director Comercial	patricio.beltran+Día1_91@demo.com	+52 55 24551874	Día 1	91	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002jv3g9h0fnkclw	Mateo Ramírez	OXXO	CEO	mateo.ramirez+Día1_92@demo.com	+52 55 18855292	Día 1	92	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002kv3g9rc43jbt8	Camila Jiménez	Whirlpool	Gerente de Marketing	camila.jimenez+Día1_93@demo.com	+52 55 68353824	Día 1	93	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002lv3g9728429gq	Ximeno Reyes	OXXO	Director Marketing	ximeno.reyes+Día1_94@demo.com	+52 55 37541335	Día 1	94	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002mv3g9r1u6h515	Silvia Sánchez	L'Oréal	Director Marketing	silvia.sanchez+Día1_95@demo.com	+52 55 97925081	Día 1	95	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002nv3g95sjmin71	Raúl Flores	Mabe	Gerente Comercial	raul.flores+Día1_96@demo.com	+52 55 27240726	Día 1	96	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002ov3g99f76i7dj	Gabriela Morales	GE México	Director Marketing	gabriela.morales+Día1_97@demo.com	+52 55 60144058	Día 1	97	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002pv3g9wg77wa9v	Federico López	Cemex	Subdirector	federico.lopez+Día1_98@demo.com	+52 55 20585383	Día 1	98	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002qv3g9qus42tv4	Patricio Guerrero	PepsiCo México	CEO	patricio.guerrero+Día1_99@demo.com	+52 55 32109021	Día 1	99	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002rv3g98q2zubmd	Daniela Pacheco	Coca-Cola FEMSA	Gerente de Producto	daniela.pacheco+Día1_100@demo.com	+52 55 15541352	Día 1	100	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002sv3g99153fvx5	Ximena Beltrán	Jumex	Director Marketing	ximena.beltran+Día1_101@demo.com	+52 55 35278944	Día 1	101	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002tv3g96soe3x19	Adrián Ortega	Liverpool	Jefe de Ventas	adrian.ortega+Día1_102@demo.com	+52 55 26854048	Día 1	102	cmp48jjhn0009v3hjacuuw1n5	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002uv3g96rqel4ev	Andrea Mendoza	Cemex	Gerente Comercial	andrea.mendoza+Día1_103@demo.com	+52 55 41854377	Día 1	103	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002vv3g9vridvaix	Pablo Salinas	Schneider Electric	Director de TI	pablo.salinas+Día1_104@demo.com	+52 55 32006677	Día 1	104	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002wv3g9p759btyc	Daniela Torres	Modelo	Gerente de Producto	daniela.torres+Día1_105@demo.com	+52 55 25589447	Día 1	105	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002xv3g9ogb45gb7	Sebastián Beltrán	Lala	Gerente de Marketing	sebastian.beltran+Día1_106@demo.com	+52 55 78957490	Día 1	106	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002yv3g9y4uvd6nc	Camila Núñez	Santander	Director Marketing	camila.nunez+Día1_107@demo.com	+52 55 38359909	Día 1	107	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu002zv3g9koy7afs2	Yolanda Espinoza	Santander	Director Comercial	yolanda.espinoza+Día1_108@demo.com	+52 55 75129754	Día 1	108	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0030v3g9kooy8mbe	Silvia Castro	Bimbo	Gerente Comercial	silvia.castro+Día1_109@demo.com	+52 55 63231961	Día 1	109	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0031v3g9qmatzcz5	Lucía Reyes	Schneider Electric	Director General	lucia.reyes+Día1_110@demo.com	+52 55 48854195	Día 1	110	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0032v3g94nves2fl	Federico Castro	Aeroméxico	Gerente Comercial	federico.castro+Día1_111@demo.com	+52 55 37483253	Día 1	111	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0033v3g9a6ghf55e	Mónica Castro	Colgate	Coordinador	monica.castro+Día1_112@demo.com	+52 55 68978661	Día 1	112	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0034v3g9b3zm25wg	Víctor Silva	BBVA	Gerente de Operaciones	victor.silva+Día1_113@demo.com	+52 55 59873137	Día 1	113	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0035v3g9o98if3g8	Víctor Cordero	Nestlé México	Gerente de Marketing	victor.cordero+Día1_114@demo.com	+52 55 54139132	Día 1	114	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0036v3g9cytb81ft	Diego Romero	Banamex	Director Marketing	diego.romero+Día1_115@demo.com	+52 55 11532859	Día 1	115	cmp48jjmw000dv3hjcnkqlaat	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0037v3g9gj9f93aw	Regina Romero	Telcel	Director Marketing	regina.romero+Día1_116@demo.com	+52 55 18795279	Día 1	116	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0038v3g9j7dwhfyn	Andrés Pérez	Bachoco	Jefe de Ventas	andres.perez+Día1_117@demo.com	+52 55 87905156	Día 1	117	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu0039v3g9ssblefnn	Javier Ávila	Bosch México	VP Ventas	javier.avila+Día1_118@demo.com	+52 55 88007915	Día 1	118	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003av3g9nw4y0w64	Olivia Espinoza	Santander	CEO	olivia.espinoza+Día1_119@demo.com	+52 55 86456388	Día 1	119	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003bv3g9avyxgb6v	Tomás Ruiz	Schneider Electric	CEO	tomas.ruiz+Día1_120@demo.com	+52 55 78505238	Día 1	120	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003cv3g9x0r449w5	Damián Ávila	Coca-Cola FEMSA	CEO	damian.avila+Día1_121@demo.com	+52 55 11882620	Día 1	121	cmp48jjlk000cv3hjw78bttij	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003dv3g90kcd0fs6	Damián Cervantes	Procter & Gamble	Jefe de Ventas	damian.cervantes+Día1_122@demo.com	+52 55 82052611	Día 1	122	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003ev3g9petjxqyx	Sofía Pacheco	Nestlé México	Coordinador	sofia.pacheco+Día1_123@demo.com	+52 55 70394997	Día 1	123	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003fv3g97q73s2gj	Ximeno Espinoza	Bosch México	Gerente de Marketing	ximeno.espinoza+Día1_124@demo.com	+52 55 31435650	Día 1	124	cmp48jjhn0009v3hjacuuw1n5	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003gv3g9wwm0m78m	Alejandra Pacheco	Siemens	Gerente de Operaciones	alejandra.pacheco+Día1_125@demo.com	+52 55 70259388	Día 1	125	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003hv3g90fdvy0jn	Daniela Romero	OXXO	Coordinador Regional	daniela.romero+Día1_126@demo.com	+52 55 57287723	Día 1	126	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003iv3g9vx1vfmi0	Bruno Ramírez	L'Oréal	CEO	bruno.ramirez+Día1_127@demo.com	+52 55 47932879	Día 1	127	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003jv3g9est4b8bd	Mónica Martínez	Whirlpool	Subdirector	monica.martinez+Día1_128@demo.com	+52 55 75640326	Día 1	128	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003kv3g9gn15ccr4	Diego Ortega	Cementos Atlas	Jefe de Ventas	diego.ortega+Día1_129@demo.com	+52 55 54956025	Día 1	129	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003lv3g96e83804c	Pablo López	Herdez	Director Financiero	pablo.lopez+Día1_130@demo.com	+52 55 54153835	Día 1	130	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003mv3g9kbkqdtx3	Olivia Romero	L'Oréal	Jefe de Compras	olivia.romero+Día1_131@demo.com	+52 55 74199191	Día 1	131	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003nv3g99yedicb0	Quetzal Guerrero	Unilever	Director Marketing	quetzal.guerrero+Día1_132@demo.com	+52 55 89236945	Día 1	132	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzu003ov3g98kr9mkt8	Regina Pérez	Aeroméxico	Director de TI	regina.perez+Día1_133@demo.com	+52 55 44389437	Día 1	133	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003pv3g9up1ix29x	Emilio Ruiz	BBVA	Director Comercial	emilio.ruiz+Día1_134@demo.com	+52 55 80512772	Día 1	134	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003qv3g9fb8arfbj	Silvia González	Tequila Don Julio	Director Comercial	silvia.gonzalez+Día1_135@demo.com	+52 55 80574536	Día 1	135	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003rv3g9e34pkmgc	Emilio Ruiz	BBVA	Gerente de Producto	emilio.ruiz+Día1_136@demo.com	+52 55 77675859	Día 1	136	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003sv3g9htji05ki	Pablo Morales	Mabe	Jefe de Compras	pablo.morales+Día1_137@demo.com	+52 55 51710115	Día 1	137	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003tv3g9xhdc8mcx	Wendy Pacheco	Maseca	VP Ventas	wendy.pacheco+Día1_138@demo.com	+52 55 62266502	Día 1	138	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003uv3g98q4yfdc4	Joaquín Torres	Lala	Gerente Comercial	joaquin.torres+Día1_139@demo.com	+52 55 43584598	Día 1	139	cmp48jjlk000cv3hjw78bttij	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003vv3g9kmojrho6	Lucía Hernández	Coca-Cola FEMSA	Subdirector	lucia.hernandez+Día1_140@demo.com	+52 55 94771388	Día 1	140	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003wv3g9u6ribhnh	Regina Pérez	Colgate	Director Financiero	regina.perez+Día1_141@demo.com	+52 55 39394582	Día 1	141	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003xv3g9dpzqzix6	Quetzal Vargas	Walmart México	Director de TI	quetzal.vargas+Día1_142@demo.com	+52 55 44494224	Día 1	142	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003yv3g9619mpsf2	Valentina Flores	Sigma	Gerente de Marketing	valentina.flores+Día1_143@demo.com	+52 55 32458666	Día 1	143	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv003zv3g9h5lec0qs	Yolanda Beltrán	Alpura	Gerente de Operaciones	yolanda.beltran+Día1_144@demo.com	+52 55 55407839	Día 1	144	cmp48jjhn0009v3hjacuuw1n5	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0040v3g9q2468n7c	Lucía Pérez	Kimberly-Clark	Gerente Comercial	lucia.perez+Día1_145@demo.com	+52 55 30379851	Día 1	145	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0041v3g9e4zggegw	Patricio Mendoza	Nestlé México	Director de TI	patricio.mendoza+Día1_146@demo.com	+52 55 47088385	Día 1	146	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0042v3g9num7b51t	Héctor Mendoza	Aeroméxico	Director Marketing	hector.mendoza+Día1_147@demo.com	+52 55 77171476	Día 1	147	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0043v3g94qy7afpt	Mariana Ávila	Maseca	Gerente de Marketing	mariana.avila+Día1_148@demo.com	+52 55 82463063	Día 1	148	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0044v3g9y2847kjd	Rodrigo Jiménez	L'Oréal	Director Financiero	rodrigo.jimenez+Día1_149@demo.com	+52 55 84113802	Día 1	149	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0045v3g9j3v43f3u	Natalia González	Bimbo	Jefe de Ventas	natalia.gonzalez+Día1_150@demo.com	+52 55 11846174	Día 1	150	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0046v3g91xqhnu1k	Joaquín Espinoza	Bachoco	Director de TI	joaquin.espinoza+Día1_151@demo.com	+52 55 97253549	Día 1	151	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0047v3g9y40j2571	Renata Torres	Grupo Bimbo	Coordinador	renata.torres+Día1_152@demo.com	+52 55 18843081	Día 1	152	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0048v3g9lgw2ok0b	Zacarías Pacheco	Banorte	Director Marketing	zacarias.pacheco+Día1_153@demo.com	+52 55 85676345	Día 1	153	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0049v3g9s6wcep0m	Joaquín Sánchez	Telcel	CEO	joaquin.sanchez+Día1_154@demo.com	+52 55 52882520	Día 1	154	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004av3g95ishppi2	Mariana Morales	Bachoco	Director Marketing	mariana.morales+Día1_155@demo.com	+52 55 40154572	Día 1	155	cmp48jjhn0009v3hjacuuw1n5	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004bv3g90e9spj5n	Mariana Vega	Sigma	Director Financiero	mariana.vega+Día1_156@demo.com	+52 55 64949041	Día 1	156	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004cv3g9hqj9pvs1	Maximiliano Rodríguez	BBVA	Coordinador Regional	maximiliano.rodriguez+Día1_157@demo.com	+52 55 88923151	Día 1	157	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004dv3g90yd397fr	Constanza Beltrán	Bachoco	Gerente de Marketing	constanza.beltran+Día1_158@demo.com	+52 55 12107006	Día 1	158	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004ev3g945e0gw2a	Mónica Guerrero	Coca-Cola FEMSA	Gerente de Operaciones	monica.guerrero+Día1_159@demo.com	+52 55 22850640	Día 1	159	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004fv3g9vxl7qwbj	Raúl González	Bachoco	Director Comercial	raul.gonzalez+Día1_160@demo.com	+52 55 89936640	Día 1	160	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004gv3g9vidb9f8y	Tadeo Pacheco	Bimbo	Jefe de Ventas	tadeo.pacheco+Día1_161@demo.com	+52 55 21730206	Día 1	161	cmp48jjmw000dv3hjcnkqlaat	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004hv3g98b58x3zr	Lucía Morales	Siemens	Subdirector	lucia.morales+Día1_162@demo.com	+52 55 12747834	Día 1	162	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004iv3g9md44mddz	Leonardo Silva	Grupo Helvex	Coordinador Regional	leonardo.silva+Día1_163@demo.com	+52 55 21634096	Día 1	163	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004jv3g9ou2bt3wn	Isabella Ortega	Coca-Cola FEMSA	Gerente de Producto	isabella.ortega+Día1_164@demo.com	+52 55 75405399	Día 1	164	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004kv3g9vpyo1deg	Karla López	Schneider Electric	Director Marketing	karla.lopez+Día1_165@demo.com	+52 55 17429939	Día 1	165	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004lv3g9x84t4mk8	Sofía Torres	Colgate	Director Comercial	sofia.torres+Día1_166@demo.com	+52 55 37884077	Día 1	166	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004mv3g97e4ge1pp	Yolanda Hernández	Cementos Atlas	Director Marketing	yolanda.hernandez+Día1_167@demo.com	+52 55 33969695	Día 1	167	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004nv3g9my7pjgei	Patricio Pacheco	Grupo Helvex	Director Financiero	patricio.pacheco+Día1_168@demo.com	+52 55 36759520	Día 1	168	cmp48jjhn0009v3hjacuuw1n5	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004ov3g9n7hlw1x0	Adrián Hernández	Nestlé México	Jefe de Ventas	adrian.hernandez+Día1_169@demo.com	+52 55 30599343	Día 1	169	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004pv3g9qb82ogjg	Federico Mendoza	Grupo Helvex	Director Marketing	federico.mendoza+Día1_170@demo.com	+52 55 89063699	Día 1	170	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004qv3g9xh7qwh9s	Federico Flores	GE México	Coordinador Regional	federico.flores+Día1_171@demo.com	+52 55 54195155	Día 1	171	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004rv3g9v5i32vyy	Renata Vargas	BBVA	Subdirector	renata.vargas+Día1_172@demo.com	+52 55 22692030	Día 1	172	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004sv3g9pti8phbd	Mariana Guerrero	Alpura	Director General	mariana.guerrero+Día1_173@demo.com	+52 55 74588625	Día 1	173	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004tv3g95716nfb2	Fernanda Sánchez	Jumex	Gerente de Operaciones	fernanda.sanchez+Día1_174@demo.com	+52 55 70241297	Día 1	174	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004uv3g93ni3w45v	Lucía Ramírez	Bosch México	Gerente Comercial	lucia.ramirez+Día1_175@demo.com	+52 55 12533395	Día 1	175	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004vv3g9hkukqwh8	Eduardo Mendoza	Aeroméxico	Gerente de Operaciones	eduardo.mendoza+Día1_176@demo.com	+52 55 39743605	Día 1	176	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004wv3g9d3p2fdan	Karla Jiménez	Lala	Director Comercial	karla.jimenez+Día1_177@demo.com	+52 55 96586029	Día 1	177	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004xv3g9t3vl19xv	Silvia Pacheco	GE México	Director General	silvia.pacheco+Día1_178@demo.com	+52 55 76121830	Día 1	178	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004yv3g9abhu4440	Daniel Espinoza	Bachoco	Gerente de Operaciones	daniel.espinoza+Día1_179@demo.com	+52 55 37351118	Día 1	179	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv004zv3g9qf2hzq9e	Mónica Aguilar	Unilever	VP Ventas	monica.aguilar+Día1_180@demo.com	+52 55 21743530	Día 1	180	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0050v3g971b09cys	Regina Cordero	Banamex	Gerente de Producto	regina.cordero+Día1_181@demo.com	+52 55 12050923	Día 1	181	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0051v3g9aecicuw2	Fernanda Núñez	Grupo Bimbo	Jefe de Compras	fernanda.nunez+Día1_182@demo.com	+52 55 49051592	Día 1	182	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0052v3g97f8e949l	Fernanda Morales	PepsiCo México	Coordinador Regional	fernanda.morales+Día1_183@demo.com	+52 55 14935829	Día 1	183	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0053v3g9jn2bf4y0	Isabella Sánchez	Jumex	Director de TI	isabella.sanchez+Día1_184@demo.com	+52 55 39409239	Día 1	184	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0054v3g9syh79cfm	Mónica Cruz	Nestlé México	Gerente de Operaciones	monica.cruz+Día1_185@demo.com	+52 55 47481247	Día 1	185	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0055v3g9wmv9atnr	Rodrigo Aguilar	Pilgrim's	Director Comercial	rodrigo.aguilar+Día1_186@demo.com	+52 55 83682968	Día 1	186	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0056v3g96xzygaw8	Quetzal Pacheco	Grupo Helvex	Gerente de Marketing	quetzal.pacheco+Día1_187@demo.com	+52 55 81101103	Día 1	187	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0057v3g9q74mcjxy	Regina Jiménez	Telcel	Gerente de Operaciones	regina.jimenez+Día1_188@demo.com	+52 55 17683570	Día 1	188	cmp48jjlk000cv3hjw78bttij	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0058v3g98lafebaz	Olivia Flores	Telcel	Jefe de Compras	olivia.flores+Día1_189@demo.com	+52 55 76490024	Día 1	189	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv0059v3g9llc0yocm	Natalia Silva	Coca-Cola FEMSA	Jefe de Compras	natalia.silva+Día1_190@demo.com	+52 55 60796774	Día 1	190	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005av3g91t8sdoyg	Damián Ramírez	Aeroméxico	Gerente de Marketing	damian.ramirez+Día1_191@demo.com	+52 55 51260857	Día 1	191	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005bv3g9n8lu0n7l	Lucía Ramírez	Alpura	Subdirector	lucia.ramirez+Día1_192@demo.com	+52 55 68967539	Día 1	192	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005cv3g9qh4p99v5	Daniel Romero	Kimberly-Clark	Coordinador Regional	daniel.romero+Día1_193@demo.com	+52 55 12268354	Día 1	193	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005dv3g90vxkwc17	Patricio Núñez	Jumex	Director de TI	patricio.nunez+Día1_194@demo.com	+52 55 28793261	Día 1	194	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005ev3g9q4tc9z9w	Zacarías Cordero	Maseca	Director de TI	zacarias.cordero+Día1_195@demo.com	+52 55 11993685	Día 1	195	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005fv3g9ygu1xtxb	Ximena Cervantes	Grupo Helvex	Jefe de Compras	ximena.cervantes+Día1_196@demo.com	+52 55 92787140	Día 1	196	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005gv3g91v92tleg	Wendy Sánchez	Whirlpool	Gerente Comercial	wendy.sanchez+Día1_197@demo.com	+52 55 97988744	Día 1	197	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005hv3g9dz7kf00v	Mariana Pacheco	Telcel	Subdirector	mariana.pacheco+Día1_198@demo.com	+52 55 91822343	Día 1	198	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005iv3g9vtb9mdw9	Andrés Ortega	Schneider Electric	VP Ventas	andres.ortega+Día1_199@demo.com	+52 55 91061609	Día 1	199	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005jv3g9gylutrly	Quetzal Beltrán	Walmart México	Coordinador Regional	quetzal.beltran+Día1_200@demo.com	+52 55 98104541	Día 1	200	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzv005kv3g9449pdweb	Andrés Beltrán	Mabe	Director Marketing	andres.beltran+Día1_201@demo.com	+52 55 72418809	Día 1	201	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005lv3g9rui0t1ap	Alejandra Pacheco	Tequila Don Julio	Gerente de Producto	alejandra.pacheco+Día1_202@demo.com	+52 55 27553820	Día 1	202	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005mv3g967tj6i9e	Andrea Beltrán	Colgate	Gerente de Marketing	andrea.beltran+Día1_203@demo.com	+52 55 23580917	Día 1	203	cmp48jjlk000cv3hjw78bttij	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005nv3g9qg6axqky	Patricio Cordero	Grupo Bimbo	Subdirector	patricio.cordero+Día1_204@demo.com	+52 55 57767504	Día 1	204	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005ov3g9r4rx7bfe	Úrsula Cervantes	Grupo Helvex	Subdirector	ursula.cervantes+Día1_205@demo.com	+52 55 21109884	Día 1	205	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005pv3g981hb1qv4	Isabella Beltrán	Coca-Cola FEMSA	Gerente de Operaciones	isabella.beltran+Día1_206@demo.com	+52 55 76105277	Día 1	206	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005qv3g913wms1ja	Iván Flores	Aeroméxico	Jefe de Compras	ivan.flores+Día1_207@demo.com	+52 55 79875634	Día 1	207	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005rv3g9v1sigpr2	Wendy Morales	OXXO	Director General	wendy.morales+Día1_208@demo.com	+52 55 41558453	Día 1	208	cmp48jj5u0002v3hj6fczxj4o	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005sv3g95p1vnbpk	Úrsula Martínez	Cementos Atlas	Jefe de Compras	ursula.martinez+Día1_209@demo.com	+52 55 71927398	Día 1	209	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005tv3g9emzv6naw	Zacarías Cruz	Mabe	Gerente de Marketing	zacarias.cruz+Día1_210@demo.com	+52 55 10274224	Día 1	210	cmp48jj770003v3hj03s9h7on	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005uv3g9atgjil3i	Camila Beltrán	Cemex	Director Comercial	camila.beltran+Día1_211@demo.com	+52 55 70408161	Día 1	211	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005vv3g94h58vrpm	Emilio Vargas	Bimbo	VP Ventas	emilio.vargas+Día1_212@demo.com	+52 55 78314152	Día 1	212	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005wv3g9q3e3oefd	Sebastián González	Modelo	Coordinador Regional	sebastian.gonzalez+Día1_213@demo.com	+52 55 62820240	Día 1	213	cmp48jj5u0002v3hj6fczxj4o	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005xv3g9dm5o88ps	Sebastián Castro	Coca-Cola FEMSA	Director Financiero	sebastian.castro+Día1_214@demo.com	+52 55 36320557	Día 1	214	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005yv3g9sohutm6e	Carolina Beltrán	Santander	Gerente de Marketing	carolina.beltran+Día1_215@demo.com	+52 55 52259053	Día 1	215	cmp48jjmw000dv3hjcnkqlaat	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw005zv3g95mh9vnd5	Iván Salinas	Bimbo	Subdirector	ivan.salinas+Día1_216@demo.com	+52 55 48979593	Día 1	216	cmp48jj5u0002v3hj6fczxj4o	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0060v3g9jq6kavei	Yolanda Rodríguez	Maseca	Jefe de Compras	yolanda.rodriguez+Día1_217@demo.com	+52 55 39835942	Día 1	217	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0061v3g9c9uptq8g	Luis Ortega	GE México	CEO	luis.ortega+Día1_218@demo.com	+52 55 79446555	Día 1	218	cmp48jjmw000dv3hjcnkqlaat	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0062v3g9056197x9	Inés Vargas	Herdez	Coordinador	ines.vargas+Día1_219@demo.com	+52 55 71819048	Día 1	219	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0063v3g9fnx316oe	Zacarías López	Kimberly-Clark	Director General	zacarias.lopez+Día1_220@demo.com	+52 55 31061742	Día 1	220	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0064v3g967ji8o9n	Iván Pacheco	Banorte	Gerente de Producto	ivan.pacheco+Día1_221@demo.com	+52 55 66909196	Día 1	221	cmp48jjix000av3hjaoyfoqux	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0065v3g974kx7q8v	Fernanda Salinas	Herdez	Jefe de Ventas	fernanda.salinas+Día1_222@demo.com	+52 55 90099861	Día 1	222	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0066v3g9hkqu7ffc	Sofía Pacheco	Bimbo	Coordinador Regional	sofia.pacheco+Día1_223@demo.com	+52 55 85913589	Día 1	223	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0067v3g9jr5jmybl	Luis Flores	OXXO	Director de TI	luis.flores+Día1_224@demo.com	+52 55 88252529	Día 1	224	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0068v3g963peclet	Daniel Reyes	Aeroméxico	Coordinador	daniel.reyes+Día1_225@demo.com	+52 55 48096248	Día 1	225	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0069v3g9gfwu2t2m	Andrés Ramírez	Cementos Atlas	Director Marketing	andres.ramirez+Día1_226@demo.com	+52 55 74335024	Día 1	226	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006av3g9k66273v8	Javier Sánchez	Tequila Don Julio	Subdirector	javier.sanchez+Día1_227@demo.com	+52 55 96909564	Día 1	227	cmp48jjb80006v3hjotw5somx	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006bv3g9o5c1064a	Andrea Aguilar	Liverpool	Director General	andrea.aguilar+Día1_228@demo.com	+52 55 38128033	Día 1	228	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006cv3g996mpxcqh	Pablo López	Grupo Helvex	Coordinador	pablo.lopez+Día1_229@demo.com	+52 55 49669740	Día 1	229	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006dv3g9c5xdigg2	Héctor Beltrán	Grupo Helvex	Gerente de Marketing	hector.beltran+Día1_230@demo.com	+52 55 79812721	Día 1	230	cmp48jj8i0004v3hjg5jg3k9p	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006ev3g9oydczk94	Mariana Ortega	Grupo Bimbo	Gerente Comercial	mariana.ortega+Día1_231@demo.com	+52 55 91977332	Día 1	231	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006fv3g9uid3nk0l	Leonardo Romero	Whirlpool	Director Comercial	leonardo.romero+Día1_232@demo.com	+52 55 18267167	Día 1	232	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006gv3g9ylrbu95a	Sofía Flores	OXXO	Gerente de Operaciones	sofia.flores+Día1_233@demo.com	+52 55 56701463	Día 1	233	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006hv3g9bhlvcd3v	Joaquín Ortega	Banorte	Director Marketing	joaquin.ortega+Día1_234@demo.com	+52 55 55283211	Día 1	234	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006iv3g9iopm45t3	Patricio Vargas	Kimberly-Clark	Coordinador Regional	patricio.vargas+Día1_235@demo.com	+52 55 49469330	Día 1	235	cmp48jjlk000cv3hjw78bttij	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006jv3g9pyjkjh52	Sebastián Vega	Telcel	Coordinador Regional	sebastian.vega+Día1_236@demo.com	+52 55 33941821	Día 1	236	cmp48jj5u0002v3hj6fczxj4o	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006kv3g9jvovpcro	Natalia Reyes	Modelo	Jefe de Ventas	natalia.reyes+Día1_237@demo.com	+52 55 83308347	Día 1	237	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006lv3g9zp6terus	Víctor Aguilar	Modelo	Director Financiero	victor.aguilar+Día1_238@demo.com	+52 55 34822889	Día 1	238	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006mv3g9h8rdn7fe	Valentina Vargas	Cemex	Jefe de Ventas	valentina.vargas+Día1_239@demo.com	+52 55 18887288	Día 1	239	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006nv3g9aqw2ol2p	Sofía Mendoza	Grupo Helvex	VP Ventas	sofia.mendoza+Día1_240@demo.com	+52 55 36719977	Día 1	240	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006ov3g9p820dpwn	Carolina Pacheco	Unilever	Subdirector	carolina.pacheco+Día1_241@demo.com	+52 55 37828565	Día 1	241	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006pv3g9vstj11un	Valentina Pacheco	Colgate	Coordinador Regional	valentina.pacheco+Día1_242@demo.com	+52 55 13147838	Día 1	242	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006qv3g9prhaz5ce	Patricio Ortega	Herdez	Coordinador	patricio.ortega+Día1_243@demo.com	+52 55 30297661	Día 1	243	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006rv3g953vs8ay9	Bruno López	Bimbo	Gerente de Producto	bruno.lopez+Día1_244@demo.com	+52 55 94708886	Día 1	244	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006sv3g904tfat9g	Camila Sánchez	Bimbo	VP Ventas	camila.sanchez+Día1_245@demo.com	+52 55 32440592	Día 1	245	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006tv3g9jbojyp7h	Fernanda Cruz	Sigma	Director Financiero	fernanda.cruz+Día1_246@demo.com	+52 55 79166510	Día 1	246	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006uv3g9qb0wrt8z	Luis Cervantes	Cementos Atlas	Subdirector	luis.cervantes+Día1_247@demo.com	+52 55 20954129	Día 1	247	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006vv3g90zxjcxk4	Rodrigo Cordero	Banorte	Gerente de Producto	rodrigo.cordero+Día1_248@demo.com	+52 55 48424080	Día 1	248	cmp48jj5u0002v3hj6fczxj4o	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006wv3g9ddkfhe5q	Raúl Vega	Cemex	Gerente de Producto	raul.vega+Día1_249@demo.com	+52 55 79460936	Día 1	249	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006xv3g9wmc6p1zu	Mateo Torres	Banorte	Coordinador Regional	mateo.torres+Día1_250@demo.com	+52 55 78247629	Día 1	250	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006yv3g9de1jvy71	Tomás Sánchez	Bimbo	Director Comercial	tomas.sanchez+Día1_251@demo.com	+52 55 38449028	Día 1	251	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw006zv3g9s0ldd5zt	Iván Cervantes	OXXO	Jefe de Ventas	ivan.cervantes+Día1_252@demo.com	+52 55 95640752	Día 1	252	cmp48jjga0008v3hj2c0xpcuy	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0070v3g96xnezo3d	Sebastián Romero	Liverpool	Gerente de Operaciones	sebastian.romero+Día1_253@demo.com	+52 55 20448786	Día 1	253	cmp48jjo7000ev3hjzwj116e0	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0071v3g97xwnzyrm	Úrsula Vargas	Coca-Cola FEMSA	Director Marketing	ursula.vargas+Día1_254@demo.com	+52 55 89540501	Día 1	254	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0072v3g9wlr6v8uy	Daniela Cordero	GE México	Coordinador Regional	daniela.cordero+Día1_255@demo.com	+52 55 41813964	Día 1	255	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0073v3g9bdyn6kv8	Adrián Rodríguez	PepsiCo México	Coordinador	adrian.rodriguez+Día1_256@demo.com	+52 55 23775951	Día 1	256	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0074v3g9gg1mqwrk	Karla Vargas	Bachoco	CEO	karla.vargas+Día1_257@demo.com	+52 55 61657782	Día 1	257	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0075v3g9sfhqq71p	Daniel López	Schneider Electric	Coordinador Regional	daniel.lopez+Día1_258@demo.com	+52 55 29565438	Día 1	258	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0076v3g9czqd9owc	Fernanda Castro	Sigma	Director de TI	fernanda.castro+Día1_259@demo.com	+52 55 96259521	Día 1	259	cmp48jj1u0000v3hjfqqv7nms	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0077v3g9xwubgqq0	Zacarías Torres	Mabe	Director General	zacarias.torres+Día1_260@demo.com	+52 55 32334685	Día 1	260	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0078v3g9dzqzfnl3	Mariana Rodríguez	Banamex	Jefe de Compras	mariana.rodriguez+Día1_261@demo.com	+52 55 99192235	Día 1	261	cmp48jjk8000bv3hjmhw4iosd	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw0079v3g95os38t6x	Ximeno Vega	Cemex	Gerente de Producto	ximeno.vega+Día1_262@demo.com	+52 55 63893254	Día 1	262	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw007av3g9vjcdn5m3	Mariana Pérez	Grupo Helvex	CEO	mariana.perez+Día1_263@demo.com	+52 55 22448840	Día 1	263	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw007bv3g9grcl4ny3	Constanza Romero	Soriana	CEO	constanza.romero+Día1_264@demo.com	+52 55 26843073	Día 1	264	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw007cv3g9klrvr48g	Karla Cervantes	Cementos Atlas	Gerente de Producto	karla.cervantes+Día1_265@demo.com	+52 55 20357638	Día 1	265	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzw007dv3g91vx4yu4n	Eduardo Ramírez	Colgate	Jefe de Compras	eduardo.ramirez+Día1_266@demo.com	+52 55 55687835	Día 1	266	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007ev3g9uyd7bukd	Quetzal Vega	Bosch México	CEO	quetzal.vega+Día1_267@demo.com	+52 55 88421443	Día 1	267	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007fv3g9nu2ngju0	Mariana Aguilar	Procter & Gamble	VP Ventas	mariana.aguilar+Día1_268@demo.com	+52 55 95872542	Día 1	268	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007gv3g9j4pdl6ac	Zacarías Silva	Bimbo	Director Comercial	zacarias.silva+Día1_269@demo.com	+52 55 42307864	Día 1	269	cmp48jjga0008v3hj2c0xpcuy	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007hv3g9kw6n81p2	Daniela Beltrán	Cinépolis	Subdirector	daniela.beltran+Día1_270@demo.com	+52 55 39464029	Día 1	270	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007iv3g93pg78v09	Mateo Mendoza	Herdez	Director Comercial	mateo.mendoza+Día1_271@demo.com	+52 55 35268776	Día 1	271	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007jv3g9o4iw29ed	Quetzal López	Alpura	Jefe de Compras	quetzal.lopez+Día1_272@demo.com	+52 55 23361566	Día 1	272	cmp48jj9x0005v3hjy2kw366l	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007kv3g9rbeokuqp	Pablo Ávila	Mabe	Jefe de Compras	pablo.avila+Día1_273@demo.com	+52 55 39067913	Día 1	273	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007lv3g94a9bx23f	Damián Martínez	Maseca	Coordinador Regional	damian.martinez+Día1_274@demo.com	+52 55 75191572	Día 1	274	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007mv3g9al3d7yzu	Alejandra Castro	Liverpool	Subdirector	alejandra.castro+Día1_275@demo.com	+52 55 46342858	Día 1	275	cmp48jjhn0009v3hjacuuw1n5	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007nv3g91aoeh2j1	Adrián Cervantes	Cementos Atlas	Jefe de Compras	adrian.cervantes+Día1_276@demo.com	+52 55 69532429	Día 1	276	cmp48jjck0007v3hj727m3tkr	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007ov3g9a6h26azk	Pablo Ortega	Banamex	Director Marketing	pablo.ortega+Día1_277@demo.com	+52 55 43046622	Día 1	277	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007pv3g9b794qryg	Pablo González	Nestlé México	Jefe de Compras	pablo.gonzalez+Día1_278@demo.com	+52 55 81998876	Día 1	278	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007qv3g9b5mx533i	Raúl Núñez	Colgate	Director Financiero	raul.nunez+Día1_279@demo.com	+52 55 42606691	Día 1	279	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007rv3g99cgfgd0c	Andrea Ruiz	Mabe	Coordinador Regional	andrea.ruiz+Día1_280@demo.com	+52 55 15055516	Día 1	280	cmp48jjix000av3hjaoyfoqux	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007sv3g9olvpzmrh	Mónica Núñez	GE México	Director General	monica.nunez+Día1_281@demo.com	+52 55 74437288	Día 1	281	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007tv3g9smd3uj9u	Natalia González	Tequila Don Julio	Gerente Comercial	natalia.gonzalez+Día1_282@demo.com	+52 55 63865744	Día 1	282	cmp48jjk8000bv3hjmhw4iosd	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007uv3g9dooaj85d	Karla Cordero	Grupo Helvex	CEO	karla.cordero+Día1_283@demo.com	+52 55 57345655	Día 1	283	cmp48jjhn0009v3hjacuuw1n5	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007vv3g9962hrqqs	Lucía Silva	L'Oréal	CEO	lucia.silva+Día1_284@demo.com	+52 55 83716279	Día 1	284	cmp48jjhn0009v3hjacuuw1n5	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007wv3g90yiily1v	Fernanda López	Bachoco	VP Ventas	fernanda.lopez+Día1_285@demo.com	+52 55 41878273	Día 1	285	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007xv3g9kj4219ml	Maximiliano Morales	Mabe	Coordinador Regional	maximiliano.morales+Día1_286@demo.com	+52 55 80797301	Día 1	286	cmp48jjo7000ev3hjzwj116e0	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007yv3g92t0a4wbw	Elena Jiménez	Maseca	Director Comercial	elena.jimenez+Día1_287@demo.com	+52 55 26555790	Día 1	287	cmp48jj770003v3hj03s9h7on	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx007zv3g9x3itnc63	Renata González	Walmart México	Gerente de Marketing	renata.gonzalez+Día1_288@demo.com	+52 55 72099354	Día 1	288	cmp48jj4j0001v3hjp9e9fydv	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0080v3g99pjxjqcf	Elena Cordero	Pilgrim's	Coordinador	elena.cordero+Día1_289@demo.com	+52 55 65370617	Día 1	289	cmp48jjck0007v3hj727m3tkr	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0081v3g9x2faorfd	Daniel Pacheco	Telcel	Gerente de Marketing	daniel.pacheco+Día1_290@demo.com	+52 55 11567000	Día 1	290	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0082v3g9uv8qyzun	Olivia Romero	L'Oréal	Gerente de Operaciones	olivia.romero+Día1_291@demo.com	+52 55 38147545	Día 1	291	cmp48jj8i0004v3hjg5jg3k9p	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0083v3g99tcj7soo	Isabella Ávila	Santander	Gerente de Operaciones	isabella.avila+Día1_292@demo.com	+52 55 19505867	Día 1	292	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0084v3g91h4wp6s9	Elena Pérez	Soriana	VP Ventas	elena.perez+Día1_293@demo.com	+52 55 95369026	Día 1	293	cmp48jjmw000dv3hjcnkqlaat	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0085v3g98l188nnk	Silvia Pacheco	Banamex	Jefe de Compras	silvia.pacheco+Día1_294@demo.com	+52 55 14602235	Día 1	294	cmp48jj5u0002v3hj6fczxj4o	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0086v3g9stblu5ug	Tomás Castro	Kimberly-Clark	Gerente de Marketing	tomas.castro+Día1_295@demo.com	+52 55 77157764	Día 1	295	cmp48jj4j0001v3hjp9e9fydv	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0087v3g92x7ppkx1	Camila Hernández	Pilgrim's	CEO	camila.hernandez+Día1_296@demo.com	+52 55 54814741	Día 1	296	cmp48jjmw000dv3hjcnkqlaat	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0088v3g9oa40hyvv	Quetzal Vargas	Whirlpool	Coordinador	quetzal.vargas+Día1_297@demo.com	+52 55 22530530	Día 1	297	cmp48jj9x0005v3hjy2kw366l	4		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx0089v3g95cdr22bn	Renata Núñez	Banamex	VP Ventas	renata.nunez+Día1_298@demo.com	+52 55 92025077	Día 1	298	cmp48jj1u0000v3hjfqqv7nms	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx008av3g99jhbpxgs	Mateo Espinoza	Banamex	CEO	mateo.espinoza+Día1_299@demo.com	+52 55 35375989	Día 1	299	cmp48jjlk000cv3hjw78bttij	5		\N	\N	2026-05-14 22:38:47.896	f	f
cmp62lhzx008bv3g9facsauwv	Elena Vargas	Bimbo	Jefe de Ventas	elena.vargas+Día1_300@demo.com	+52 55 11018068	Día 1	300	cmp48jjb80006v3hjotw5somx	5		\N	\N	2026-05-14 22:38:47.896	f	f
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, nombre, empresa, cargo, rating, texto, "createdAt") FROM stdin;
\.


--
-- Data for Name: StaffMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StaffMember" (id, nombre, rol, "diaAsignado", "horarioEntrada", "horarioSalida", "horaComida", seccion, "viaticoCantidad", "viaticoStatus", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, "passwordHash", nombre, rol, "ejecutivoId", "createdAt", "updatedAt") FROM stdin;
cmp48jjru000gv3hj1y4g68lj	nsanchez@generandoideas.com	$2b$10$O//pvbdh7r7cRVx5P0lzeefbPgFzSNL2jG4Xq7W.bDL4XkSRLKC.K	Noe Sanchez	ejecutivo	cmp48jj1u0000v3hjfqqv7nms	2026-05-13 15:49:42.235	2026-05-13 15:49:42.235
cmp48jjy5000iv3hjsavi1wx2	gtapia@generandoideas.com	$2b$10$UUpeX4pw9z3ojIoJz/xGOOiwhfLulJBxYj5XCbx2H1n/mA5iF4VNq	Gil Tapia	ejecutivo	cmp48jj4j0001v3hjp9e9fydv	2026-05-13 15:49:42.461	2026-05-13 15:49:42.461
cmp48jk15000kv3hjsjvicsae	molguin@generandoideas.com	$2b$10$.qUSU9jfzcNNEiGwYE6rG.fLgRfPOsWYW.wnSZ6y81AU9v3hr1FZm	Mitzy Olguin	ejecutivo	cmp48jj5u0002v3hj6fczxj4o	2026-05-13 15:49:42.569	2026-05-13 15:49:42.569
cmp48jk44000mv3hjpog29d1p	mquintanilla@generandoideas.com	$2b$10$0gLlIRPpJ2.9YzrvbSfJaeGqTIUa7QmWbbGK/zNjHVOY3rgxdop/y	Manuel Quintanilla	ejecutivo	cmp48jj770003v3hj03s9h7on	2026-05-13 15:49:42.676	2026-05-13 15:49:42.676
cmp48jk70000ov3hjf7574zyw	mperez@generandoideas.com	$2b$10$uZjnEE/gKQSkQNN1q2WVoOLXLoV1Kh1tdYoAJ8FiTBl450NGnWHUa	Monserrat Perez	ejecutivo	cmp48jj8i0004v3hjg5jg3k9p	2026-05-13 15:49:42.78	2026-05-13 15:49:42.78
cmp48jkbo000qv3hjz07preqj	knieves@generandoideas.com	$2b$10$0CEVRUWUI2vV1KoTGna65uPxv/lwcj2lU9LBxq7ViiDg0cMyRWMEK	Kathya Nieves	ejecutivo	cmp48jj9x0005v3hjy2kw366l	2026-05-13 15:49:42.949	2026-05-13 15:49:42.949
cmp48jkei000sv3hjazd601gi	eaguilar@generandoideas.com	$2b$10$o0JnAYcmOKCz/AYtrNq4O.uxXZQWoIHNcYLRUUY8mJWtqavXFxc02	Erika Aguilar	ejecutivo	cmp48jjb80006v3hjotw5somx	2026-05-13 15:49:43.051	2026-05-13 15:49:43.051
cmp48jkhe000uv3hj0un8yjcz	wgarcia@generandoideas.com	$2b$10$yOOHhxSAipl2krZz0NfCjucG/mmNVCvEDnEu3CfY8lYbJidFG5zJu	Wiliam Garcia	ejecutivo	cmp48jjck0007v3hj727m3tkr	2026-05-13 15:49:43.154	2026-05-13 15:49:43.154
cmp48jkk8000wv3hjyf8rp9ss	emorales@generandoideas.com	$2b$10$X6ePPr7f60BAFZJsZaUlZO80Yrjx2qbBHHW7SYslmd/mw3uQ7ngXW	Eduardo Morales	ejecutivo	cmp48jjga0008v3hj2c0xpcuy	2026-05-13 15:49:43.257	2026-05-13 15:49:43.257
cmp48jkpk000yv3hj6f2flwh5	aflores@generandoideas.com	$2b$10$ixvBQZ7ZLiEkUgGtUmXxOO7A1BpTMbxWebHhK2By.JIev7v1/vKFO	Ariana Flores	ejecutivo	cmp48jjhn0009v3hjacuuw1n5	2026-05-13 15:49:43.448	2026-05-13 15:49:43.448
cmp48jkso0010v3hj39qolax8	aquiroz@generandoideas.com	$2b$10$xYKQ7GlvBB3SrZy2GhtuluZGmCHnbg3VM1oFYQgFnlm/s9Ziytktq	Antonio Quiroz	ejecutivo	cmp48jjix000av3hjaoyfoqux	2026-05-13 15:49:43.561	2026-05-13 15:49:43.561
cmp48jkvk0012v3hj82ojak1c	cbernal@generandoideas.com	$2b$10$L1O4HXtHS1gjjBDM3R2MZ.gYvxIxNb.9Nw4g.45R10NBvNLCf/Vja	Carolina Bernal	ejecutivo	cmp48jjk8000bv3hjmhw4iosd	2026-05-13 15:49:43.665	2026-05-13 15:49:43.665
cmp48jkye0014v3hj1rzx04p6	gmaldonado@generandoideas.com	$2b$10$iB32YcT1fdA2NDRbQySp9uyBqzZSk7tCsg5zYnoQ2Et6ui5LO5qfu	Gaby Maldonado	ejecutivo	cmp48jjlk000cv3hjw78bttij	2026-05-13 15:49:43.767	2026-05-13 15:49:43.767
cmp48jl330016v3hj0ewd0tkn	bcedillo@generandoideas.com	$2b$10$nhRhp/L7.FAivcUKzmDvQ.KMzKJxMW.MOA9ttDYZ1jmP8FMI3g4Oi	Brian Cedillo	ejecutivo	cmp48jjmw000dv3hjcnkqlaat	2026-05-13 15:49:43.936	2026-05-13 15:49:43.936
cmp48jl680018v3hjbl6ahwgn	aespinosa@generandoideas.com	$2b$10$Si0dsdq102e3RTjmjoSPIeYTWDlDiaOFT7yEhJv6HQjxu0ewk0TmW	Andrea Espinosa	ejecutivo	cmp48jjo7000ev3hjzwj116e0	2026-05-13 15:49:44.049	2026-05-13 15:49:44.049
cmp48kka10001v3a1tnqztw8z	ivanalex.gp35@gmail.com	$2b$10$TkCjC1aE0ATgJyFZT6TXd.NFwXLdxf498WG3kqpoBoKDoTOHHNyTa	ivanalex.gp35	admin	\N	2026-05-13 15:50:29.545	2026-05-13 15:50:29.545
cmp5pyyag0001v36hhmq8izgr	admin@generandoideas.com	$2b$10$AgvBdM9RqTBLD5DATUlnHOpXGNuGXcc.R4r00e5QT/ZXZZ/QFGWVy	admin	admin	\N	2026-05-14 16:45:20.533	2026-05-14 16:45:20.533
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
858862c8-f2be-4707-b1f1-1d0bf95d5ae6	20e485785b48f877b13d136691c3da3449a03f5c133019cb76999bafb072a3c0	2026-05-13 15:49:18.490059+00	20260324035150_init	\N	\N	2026-05-13 15:49:18.229623+00	1
471faddc-bf72-4f75-bbc0-82e084e428f5	bd52d39dbca29a791907f8a1b390f738275b55f7c5ccce91dbd1aa4140b12132	2026-05-13 15:49:18.909249+00	20260324042321_add_inventario_materiales_articulo	\N	\N	2026-05-13 15:49:18.58507+00	1
7c46bf84-f484-445b-8049-9650102f2520	5d465c6383ac3333ff8a65146726857dc6ca6dd65cbf10126363bc77b272021c	2026-05-13 15:49:19.328465+00	20260506164405_add_catalogos	\N	\N	2026-05-13 15:49:19.005704+00	1
ed6399ee-c970-4959-976e-5a80c009a9bd	3f74d43878976810d7ac2e7adf50581d26b906acfd55cdc7fccbd6ab304ea94a	2026-05-13 15:49:19.752968+00	20260513070504_add_empresa_ejecutivo	\N	\N	2026-05-13 15:49:19.425124+00	1
51b8154b-6f73-4833-ae83-429788794592	8b487eaaf1cf1bc5785a929cc97d5d6ab96d16ff9758b6497c6b4ed9999279c9	2026-05-13 15:49:20.10649+00	20260513071147_add_user_auth	\N	\N	2026-05-13 15:49:19.855094+00	1
c5746414-65ae-4033-aeee-5eca0a4e176d	811c6bc706ef2d5d289fc5f549073cfb777482781058f68d8bd1032210a6b273	2026-05-13 15:49:20.53728+00	20260513074407_add_rifa_participantes	\N	\N	2026-05-13 15:49:20.278357+00	1
7f60c2a5-60a1-478f-b945-dfad99fd01c6	022610edc7087265819536ef4fc2700a6e0e567d4d3a191c341d3f8727eadfc4	2026-05-13 15:49:20.950268+00	20260513081655_rifa_confirmation_flags	\N	\N	2026-05-13 15:49:20.632681+00	1
\.


--
-- Name: CitaComercial CitaComercial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CitaComercial"
    ADD CONSTRAINT "CitaComercial_pkey" PRIMARY KEY (id);


--
-- Name: CitaGenerada CitaGenerada_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CitaGenerada"
    ADD CONSTRAINT "CitaGenerada_pkey" PRIMARY KEY (id);


--
-- Name: Cliente Cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY (id);


--
-- Name: Ejecutivo Ejecutivo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ejecutivo"
    ADD CONSTRAINT "Ejecutivo_pkey" PRIMARY KEY (id);


--
-- Name: Empresa Empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Empresa"
    ADD CONSTRAINT "Empresa_pkey" PRIMARY KEY (id);


--
-- Name: InventarioObsequio InventarioObsequio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventarioObsequio"
    ADD CONSTRAINT "InventarioObsequio_pkey" PRIMARY KEY (id);


--
-- Name: MaterialDigital MaterialDigital_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaterialDigital"
    ADD CONSTRAINT "MaterialDigital_pkey" PRIMARY KEY (id);


--
-- Name: Obsequio Obsequio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Obsequio"
    ADD CONSTRAINT "Obsequio_pkey" PRIMARY KEY (id);


--
-- Name: ParticipanteRifa ParticipanteRifa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ParticipanteRifa"
    ADD CONSTRAINT "ParticipanteRifa_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: StaffMember StaffMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StaffMember"
    ADD CONSTRAINT "StaffMember_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ParticipanteRifa_diaRifa_numeroTicket_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ParticipanteRifa_diaRifa_numeroTicket_key" ON public."ParticipanteRifa" USING btree ("diaRifa", "numeroTicket");


--
-- Name: ParticipanteRifa_reviewId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ParticipanteRifa_reviewId_key" ON public."ParticipanteRifa" USING btree ("reviewId");


--
-- Name: User_ejecutivoId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_ejecutivoId_key" ON public."User" USING btree ("ejecutivoId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: CitaComercial CitaComercial_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CitaComercial"
    ADD CONSTRAINT "CitaComercial_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CitaComercial CitaComercial_ejecutivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CitaComercial"
    ADD CONSTRAINT "CitaComercial_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES public."Ejecutivo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CitaGenerada CitaGenerada_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CitaGenerada"
    ADD CONSTRAINT "CitaGenerada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CitaGenerada CitaGenerada_ejecutivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CitaGenerada"
    ADD CONSTRAINT "CitaGenerada_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES public."Ejecutivo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cliente Cliente_empresaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES public."Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Empresa Empresa_ejecutivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Empresa"
    ADD CONSTRAINT "Empresa_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES public."Ejecutivo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Obsequio Obsequio_clienteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Obsequio"
    ADD CONSTRAINT "Obsequio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES public."Cliente"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Obsequio Obsequio_ejecutivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Obsequio"
    ADD CONSTRAINT "Obsequio_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES public."Ejecutivo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ParticipanteRifa ParticipanteRifa_ejecutivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ParticipanteRifa"
    ADD CONSTRAINT "ParticipanteRifa_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES public."Ejecutivo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ParticipanteRifa ParticipanteRifa_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ParticipanteRifa"
    ADD CONSTRAINT "ParticipanteRifa_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Review"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_ejecutivoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES public."Ejecutivo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict jUxIYm1N3yy8tGAyIjdOetTkqdztPdfsGtTgTGqQHvZeaFe4CsuGF4ZddGup4zP

