-- Schema SQL para o Banco de Dados Supabase Completo (Copa GenZ App)
-- Execute este comando no SQL Editor do seu painel do Supabase para criar TODAS as tabelas necessárias e habilitar as políticas de segurança (RLS) e Realtime.

-- =========================================================================
-- 1. TABELA: posts (Mural de Fotos e Publicações)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    autor TEXT,
    avatares TEXT,
    rua TEXT,
    imagem TEXT,
    legenda TEXT,
    curtidas INTEGER DEFAULT 0,
    comentarios TEXT DEFAULT '[]',
    tempo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Excluir políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Leitura irrestrita de posts" ON public.posts;
DROP POLICY IF EXISTS "Inserção irrestrita de posts" ON public.posts;
DROP POLICY IF EXISTS "Atualização irrestrita de posts" ON public.posts;

-- REGRAS: Leitura, Inserção e Edição públicas são necessárias para o feed interativo, 
-- porém sem permissão de DELETAR para resguardar a integridade do mural público.
CREATE POLICY "Leitura irrestrita de posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Inserção irrestrita de posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização irrestrita de posts" ON public.posts FOR UPDATE USING (true);


-- =========================================================================
-- 2. TABELA: profiles (Perfil dos Moradores)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    auth_uid TEXT PRIMARY KEY,
    nickname TEXT,
    rua_origem TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura irrestrita de profiles" ON public.profiles;
DROP POLICY IF EXISTS "Escrita irrestrita de profiles" ON public.profiles;
DROP POLICY IF EXISTS "Inserção irrestrita de profiles" ON public.profiles;
DROP POLICY IF EXISTS "Atualização irrestrita de profiles" ON public.profiles;

-- SEGURANÇA CORRIGIDA: Removida permissão geral "ALL". Agora os moradores podem
-- ler, criar e atualizar perfis, mas a exclusão (DELETE) está bloqueada para chaves públicas.
CREATE POLICY "Leitura irrestrita de profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Inserção irrestrita de profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização irrestrita de profiles" ON public.profiles FOR UPDATE USING (true);


-- =========================================================================
-- 3. TABELA: time_capsules (Cápsulas do Tempo)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.time_capsules (
    id TEXT PRIMARY KEY,
    user_auth_ref TEXT,
    msg_encrypted TEXT,
    target_year INTEGER DEFAULT 2030,
    item_tag TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura irrestrita de time_capsules" ON public.time_capsules;
DROP POLICY IF EXISTS "Inserção irrestrita de time_capsules" ON public.time_capsules;

-- SEGURANÇA GARANTIDA: Uma vez inseridas, as cápsulas do tempo NÃO podem ser alteradas ou excluídas por ninguém,
-- garantindo que a memória dos moradores fique intacta até o ano de abertura.
CREATE POLICY "Leitura irrestrita de time_capsules" ON public.time_capsules FOR SELECT USING (true);
CREATE POLICY "Inserção irrestrita de time_capsules" ON public.time_capsules FOR INSERT WITH CHECK (true);


-- =========================================================================
-- 4. TABELA: torcidometro_cliques (Cliques Digitais do Torcidômetro)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.torcidometro_cliques (
    rua TEXT PRIMARY KEY,
    valor INTEGER DEFAULT 0,
    data_registro TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.torcidometro_cliques ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura irrestrita de torcidometro" ON public.torcidometro_cliques;
DROP POLICY IF EXISTS "Escrita irrestrita de torcidometro" ON public.torcidometro_cliques;
DROP POLICY IF EXISTS "Inserção irrestrita de torcidometro" ON public.torcidometro_cliques;
DROP POLICY IF EXISTS "Atualização irrestrita de torcidometro" ON public.torcidometro_cliques;

-- SEGURANÇA CORRIGIDA: Removido "ALL". Cliques podem ser lidos, criados e atualizados,
-- mas nenhuma rua ou clique acumulado pode ser excluído por usuários.
CREATE POLICY "Leitura irrestrita de torcidometro" ON public.torcidometro_cliques FOR SELECT USING (true);
CREATE POLICY "Inserção irrestrita de torcidometro" ON public.torcidometro_cliques FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização irrestrita de torcidometro" ON public.torcidometro_cliques FOR UPDATE USING (true);


-- =========================================================================
-- 5. TABELA: concurso_candidatos (Candidatas & Votações da Gincana/Concursos)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.concurso_candidatos (
    id TEXT PRIMARY KEY,
    nome TEXT,
    rua TEXT,
    total_votos INTEGER DEFAULT 0,
    foto TEXT
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.concurso_candidatos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura irrestrita de concurso" ON public.concurso_candidatos;
DROP POLICY IF EXISTS "Escrita irrestrita de concurso" ON public.concurso_candidatos;
DROP POLICY IF EXISTS "Inserção irrestrita de concurso" ON public.concurso_candidatos;
DROP POLICY IF EXISTS "Atualização irrestrita de concurso" ON public.concurso_candidatos;

-- SEGURANÇA CORRIGIDA: Candidatos podem ser visualizados (SELECT) e atualizados (UPDATE para computar votos), 
-- mas novas inserções e exclusões diretas via cliente foram desativadas para evitar fraudes na lista oficial.
CREATE POLICY "Leitura irrestrita de concurso" ON public.concurso_candidatos FOR SELECT USING (true);
CREATE POLICY "Atualização irrestrita de concurso" ON public.concurso_candidatos FOR UPDATE USING (true);


-- =========================================================================
-- 6. TABELA: palpites (Bolão da Copa)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.palpites (
    id BIGSERIAL PRIMARY KEY,
    jogo_id TEXT,
    user_name TEXT,
    gols_a INTEGER DEFAULT 0,
    gols_b INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.palpites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura irrestrita de palpites" ON public.palpites;
DROP POLICY IF EXISTS "Escrita irrestrita de palpites" ON public.palpites;
DROP POLICY IF EXISTS "Inserção irrestrita de palpites" ON public.palpites;
DROP POLICY IF EXISTS "Atualização irrestrita de palpites" ON public.palpites;

-- SEGURANÇA CORRIGIDA: Permite adicionar novos palpites e visualizá-los. 
-- A alteração ou exclusão de palpites anteriores é bloqueada no nível do banco.
CREATE POLICY "Leitura irrestrita de palpites" ON public.palpites FOR SELECT USING (true);
CREATE POLICY "Inserção irrestrita de palpites" ON public.palpites FOR INSERT WITH CHECK (true);


-- =========================================================================
-- 7. TABELAS DE CONFIGURAÇÃO: campeonato_status & torcida_ranking
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.campeonato_status (
    id BIGSERIAL PRIMARY KEY,
    active BOOLEAN DEFAULT true,
    rodada_atual INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.torcida_ranking (
    id BIGSERIAL PRIMARY KEY,
    rua TEXT UNIQUE,
    pontos INTEGER DEFAULT 0,
    vitorias INTEGER DEFAULT 0
);

-- Ativar RLS para ambas
ALTER TABLE public.campeonato_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.torcida_ranking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura status" ON public.campeonato_status;
DROP POLICY IF EXISTS "Leitura ranking" ON public.torcida_ranking;

-- SEGURANÇA GARANTIDA: Tabelas puramente informativas e administrativas. 
-- Apenas leitura SELECT é pública. Nenhuma gravação externa é permitida!
CREATE POLICY "Leitura status" ON public.campeonato_status FOR SELECT USING (true);
CREATE POLICY "Leitura ranking" ON public.torcida_ranking FOR SELECT USING (true);


-- =========================================================================
-- 8. COMPATIBILIDADE COM ATUALIZAÇÕES EM TEMPO REAL (Realtime)
-- =========================================================================
-- Habilita atualizações em tempo real para as tabelas dinâmicas do App
-- O Supabase possui uma publicação interna chamada 'supabase_realtime' para esta finalidade

-- Comandos para registrar tabelas à publicação realtime de maneira idempotente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.torcidometro_cliques;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Captura exceções caso o Supabase já possua as tabelas registradas ou o canal esteja ocupado
        NULL;
END;
$$;
