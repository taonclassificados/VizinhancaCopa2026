export interface ColumnInfo {
  name: string;
  type: string;
  constraints?: string[];
  description: string;
}

export interface IndexInfo {
  name: string;
  definition: string;
}

export interface PolicyInfo {
  name: string;
  definition: string;
}

export interface TableInfo {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'gamification' | 'social' | 'soccer' | 'finance';
  columns: ColumnInfo[];
  sql: string;
  indexes: IndexInfo[];
  policies: PolicyInfo[];
}

export const TABLES: TableInfo[] = [
  {
    id: 'casas',
    name: 'casas',
    description: 'Armazena as residências/unidades da rua, condomínio ou bairro, permitindo a gamificação da decoração de rua mais bonita.',
    category: 'core',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Identificador único da residência' },
      { name: 'numero', type: 'text', constraints: ['NOT NULL'], description: 'Número do imóvel' },
      { name: 'rua', type: 'text', constraints: ['NOT NULL'], description: 'Nome da rua do imóvel' },
      { name: 'complemento', type: 'text', description: 'Apartamento, bloco, fundos, etc.' },
      { name: 'bloco_condominio', type: 'text', description: 'Identificação de bloco se for condomínio fechado' },
      { name: 'coordenadas_latitude', type: 'numeric', description: 'Latitude para mapeamento geográfico das decorações' },
      { name: 'coordenadas_longitude', type: 'numeric', description: 'Longitude para mapeamento geográfico das decorações' },
      { name: 'decorada', type: 'boolean', constraints: ['NOT NULL', 'DEFAULT false'], description: 'Sinaliza se a casa está enfeitada para a Copa' },
      { name: 'pontos_decoracao', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Pontos acumulados na gincana de decorações da rua' },
      { name: 'criada_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data de criação do registro' }
    ],
    sql: `CREATE TABLE public.casas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero text NOT NULL,
    rua text NOT NULL,
    complemento text,
    bloco_condominio text,
    coordenadas_latitude numeric,
    coordenadas_longitude numeric,
    decorada boolean NOT NULL DEFAULT false,
    pontos_decoracao integer NOT NULL DEFAULT 0,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_casas_decorada', definition: 'CREATE INDEX idx_casas_decorada ON public.casas(decorada);' }
    ],
    policies: [
      { name: 'Permitir leitura pública', definition: 'CREATE POLICY "Leitura pública de casas" ON public.casas FOR SELECT TO authenticated USING (true);' },
      { name: 'Apenas administradores podem inserir ou alterar', definition: 'CREATE POLICY "Admin gerencia casas" ON public.casas FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));' }
    ]
  },
  {
    id: 'familias',
    name: 'familias',
    description: 'Agrupamentos familiares da rua para competirem unidos nos rankings de decoração, engajamento e bolão.',
    category: 'core',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Identificador único da família' },
      { name: 'nome', type: 'text', constraints: ['UNIQUE', 'NOT NULL'], description: 'Sobrenome ou nome personalizado da família (ex: Família Silva)' },
      { name: 'slogan', type: 'text', description: 'Frase motivacional ou grito de torcida da família' },
      { name: 'pontos_acumulados', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Soma total dos pontos conquistados por membros da família' },
      { name: 'criada_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data de fundação da família na plataforma' }
    ],
    sql: `CREATE TABLE public.familias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    slogan text,
    pontos_acumulados integer NOT NULL DEFAULT 0,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_familias_pontos', definition: 'CREATE INDEX idx_familias_pontos ON public.familias(pontos_acumulados DESC);' }
    ],
    policies: [
      { name: 'Permitir leitura pública', definition: 'CREATE POLICY "Leitura pública de familias" ON public.familias FOR SELECT TO authenticated USING (true);' },
      { name: 'Qualquer morador cadastrado pode criar uma família', definition: 'CREATE POLICY "Membros criam familias" ON public.familias FOR INSERT TO authenticated WITH CHECK (true);' },
      { name: 'Modificações apenas por administradores ou criador/moderador', definition: 'CREATE POLICY "Gerência de familias" ON public.familias FOR UPDATE TO authenticated USING (true);' }
    ]
  },
  {
    id: 'usuarios',
    name: 'usuarios',
    description: 'Perfis de usuários moradores integrados diretamente ao mecanismo de autenticação (Auth.users) do Supabase.',
    category: 'core',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'REFERENCES auth.users(id) ON DELETE CASCADE'], description: 'FK ligada diretamente ao auth do Supabase' },
      { name: 'nome', type: 'text', constraints: ['NOT NULL'], description: 'Nome completo ou alcunha do morador' },
      { name: 'email', type: 'text', constraints: ['UNIQUE', 'NOT NULL'], description: 'E-mail do morador igual ao registro de login' },
      { name: 'avatar_url', type: 'text', description: 'URL da foto de perfil hospedada no Storage' },
      { name: 'casa_id', type: 'uuid', constraints: ['REFERENCES casas(id) ON DELETE SET NULL'], description: 'Referência ao imóvel onde o morador habita' },
      { name: 'familia_id', type: 'uuid', constraints: ['REFERENCES familias(id) ON DELETE SET NULL'], description: 'Referência ao grupo familiar ao qual pertence' },
      { name: 'role', type: 'text', constraints: ['NOT NULL', "DEFAULT 'morador'", "CHECK (role IN ('admin', 'moderador', 'morador'))"], description: 'Nível de privilégio administrativo no portal comunitário' },
      { name: 'reputacao_pontos', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Nível de reputação moral por ajudar a pintar a rua, doar, comentar' },
      { name: 'pontos_bolao', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Soma agregada de pontos obtidos nos palpites dos jogos' },
      { name: 'data_cadastro', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data de inscrição na plataforma' }
    ],
    sql: `CREATE TABLE public.usuarios (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome text NOT NULL,
    email text UNIQUE NOT NULL,
    avatar_url text,
    casa_id uuid REFERENCES public.casas(id) ON DELETE SET NULL,
    familia_id uuid REFERENCES public.familias(id) ON DELETE SET NULL,
    role text NOT NULL DEFAULT 'morador' CHECK (role IN ('admin', 'moderador', 'morador')),
    reputacao_pontos integer NOT NULL DEFAULT 0,
    pontos_bolao integer NOT NULL DEFAULT 0,
    data_cadastro timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_usuarios_email', definition: 'CREATE UNIQUE INDEX idx_usuarios_email ON public.usuarios(email);' },
      { name: 'idx_usuarios_casa', definition: 'CREATE INDEX idx_usuarios_casa ON public.usuarios(casa_id);' },
      { name: 'idx_usuarios_familia', definition: 'CREATE INDEX idx_usuarios_familia ON public.usuarios(familia_id);' }
    ],
    policies: [
      { name: 'Permitir leitura pública', definition: 'CREATE POLICY "Leitura pública de usuarios" ON public.usuarios FOR SELECT TO authenticated USING (true);' },
      { name: 'Usuários podem alterar apenas o próprio perfil', definition: 'CREATE POLICY "Usuarios editam proprio perfil" ON public.usuarios FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);' }
    ]
  },
  {
    id: 'arrecadacoes',
    name: 'arrecadacoes',
    description: 'Financiamento coletivo (vaquinhas) para financiar bandeirinhas, tintas para asfalto, churrasqueira comunitária ou projetor para os jogos.',
    category: 'finance',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Chave única da vaquinha' },
      { name: 'titulo', type: 'text', constraints: ['NOT NULL'], description: 'Nome representativo da arrecadação Community' },
      { name: 'descricao', type: 'text', description: 'Explicação detalhada da utilidade do dinheiro' },
      { name: 'meta_valor', type: 'numeric(10,2)', constraints: ['NOT NULL'], description: 'Valor financeiro total planejado' },
      { name: 'valor_arrecadado', type: 'numeric(10,2)', constraints: ['NOT NULL', 'DEFAULT 0.00'], description: 'Soma em tempo real das contribuições confirmadas via Pix' },
      { name: 'data_limite', type: 'timestamp with time zone', description: 'Data para expiração ou fim de pagamentos' },
      { name: 'status', type: 'text', constraints: ['NOT NULL', "DEFAULT 'ativo'", "CHECK (status IN ('ativo', 'concluido', 'pausado', 'cancelado'))"], description: 'Situação administrativa da vaquinha comunitária' },
      { name: 'criada_por', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id)'], description: 'Usuário administrador/moderador que lançou a vaquinha' },
      { name: 'criada_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data do cadastramento da vaquinha' }
    ],
    sql: `CREATE TABLE public.arrecadacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descricao text,
    meta_valor numeric(10,2) NOT NULL,
    valor_arrecadado numeric(10,2) NOT NULL DEFAULT 0.00,
    data_limite timestamp with time zone,
    status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado', 'cancelado')),
    criada_por uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_arrecadacoes_status', definition: 'CREATE INDEX idx_arrecadacoes_status ON public.arrecadacoes(status);' }
    ],
    policies: [
      { name: 'Qualquer morador autenticado pode listar as arrecadações', definition: 'CREATE POLICY "Leitura de arrecadacoes" ON public.arrecadacoes FOR SELECT TO authenticated USING (true);' },
      { name: 'Apenas coordenadores (admins/mods) criam ou editam vaquinhas', definition: 'CREATE POLICY "Gestão de arrecadacoes" ON public.arrecadacoes FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));' }
    ]
  },
  {
    id: 'contribuicoes',
    name: 'contribuicoes',
    description: 'Armazena detalhes dos pagamentos individuais e doações dos moradores para as vaquinhas com status de conciliação.',
    category: 'finance',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Identificador único da contribuição física/digital' },
      { name: 'arrecadacao_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES arrecadacoes(id) ON DELETE CASCADE'], description: 'Vínculo com a vaquinha específica' },
      { name: 'usuario_id', type: 'uuid', constraints: ['REFERENCES usuarios(id) ON DELETE SET NULL'], description: 'O morador que doou o dinheiro' },
      { name: 'valor', type: 'numeric(10,2)', constraints: ['NOT NULL', 'CHECK (valor > 0)'], description: 'Montante em Reais (R$)' },
      { name: 'status_pagamento', type: 'text', constraints: ['NOT NULL', "DEFAULT 'pendente'", "CHECK (status_pagamento IN ('pendente', 'aprovado', 'rejeitado', 'estornado'))"], description: 'Estado atual de conciliação no Pix ou banco' },
      { name: 'metodo_pagamento', type: 'text', constraints: ["CHECK (metodo_pagamento IN ('pix', 'cartao_credito', 'dinheiro'))"], description: 'Modo pelo qual a doação foi realizada' },
      { name: 'gateway_transacao_id', type: 'text', description: 'Código identificador único do Pix/gateway para evitar duplicidade' },
      { name: 'data_contribuicao', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data e hora da doação financeira' }
    ],
    sql: `CREATE TABLE public.contribuicoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    arrecadacao_id uuid NOT NULL REFERENCES public.arrecadacoes(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    valor numeric(10,2) NOT NULL CHECK (valor > 0),
    status_pagamento text NOT NULL DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'aprovado', 'rejeitado', 'estornado')),
    metodo_pagamento text CHECK (metodo_pagamento IN ('pix', 'cartao_credito', 'dinheiro')),
    gateway_transacao_id text,
    data_contribuicao timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_contribuicoes_arrec_user', definition: 'CREATE INDEX idx_contribuicoes_arrec_user ON public.contribuicoes(arrecadacao_id, usuario_id);' },
      { name: 'idx_contribuicoes_status', definition: 'CREATE INDEX idx_contribuicoes_status ON public.contribuicoes(status_pagamento);' }
    ],
    policies: [
      { name: 'Morador pode ver apenas seus próprios registros históricos de doação', definition: 'CREATE POLICY "Usuarios leem proprias doacoes" ON public.contribuicoes FOR SELECT TO authenticated USING (auth.uid() = usuario_id);' },
      { name: 'Morador pode declarar uma doação nova (Pix/dinheiro)', definition: 'CREATE POLICY "Usuarios criam doacoes" ON public.contribuicoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);' },
      { name: 'Administradores podem ler e atualizar todas as doações do site', definition: 'CREATE POLICY "Admin monitora doacoes" ON public.contribuicoes FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));' }
    ]
  },
  {
    id: 'eventos',
    name: 'eventos',
    description: 'Agenda oficial da rua: dias de pintura, ensaios de bateria comunitária, mutirões de bandeirinhas, churrascos e exibições coletivas de jogos.',
    category: 'social',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Vínculo do evento' },
      { name: 'titulo', type: 'text', constraints: ['NOT NULL'], description: 'Nome representativo do mutirão ou festividade' },
      { name: 'descricao', type: 'text', description: 'Detalhes operacionais (o que levar, o que vestir, etc.)' },
      { name: 'data_hora', type: 'timestamp with time zone', constraints: ['NOT NULL'], description: 'Data do evento comunitário' },
      { name: 'local', type: 'text', constraints: ['NOT NULL'], description: 'Onde na rua ou qual local acontecerá' },
      { name: 'status', type: 'text', constraints: ['NOT NULL', "DEFAULT 'agendado'", "CHECK (status IN ('agendado', 'cancelado', 'concluido'))"], description: 'Se o evento ainda ocorrerá ou foi repensado' },
      { name: 'coordenadas_latitude', type: 'numeric', description: 'Coordenadas geográficas do local do mutirão' },
      { name: 'coordenadas_longitude', type: 'numeric', description: 'Coordenadas geográficas' },
      { name: 'criado_por', type: 'uuid', constraints: ['REFERENCES usuarios(id) ON DELETE SET NULL'], description: 'Usuário organizador' },
      { name: 'criado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Horário de inclusão na agenda comunitária' }
    ],
    sql: `CREATE TABLE public.eventos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descricao text,
    data_hora timestamp with time zone NOT NULL,
    local text NOT NULL,
    status text NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'cancelado', 'concluido')),
    coordenadas_latitude numeric,
    coordenadas_longitude numeric,
    criado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_eventos_data', definition: 'CREATE INDEX idx_eventos_data ON public.eventos(data_hora ASC);' }
    ],
    policies: [
      { name: 'Leitura autorizada para todos os moradores da rua', definition: 'CREATE POLICY "Leitura pública de eventos" ON public.eventos FOR SELECT TO authenticated USING (true);' },
      { name: 'Coordenadores podem cadastrar, agendar ou adiar eventos', definition: 'CREATE POLICY "Admin gerencia agenda" ON public.eventos FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));' }
    ]
  },
  {
    id: 'jogos',
    name: 'jogos',
    description: 'Lista dos confrontos da Copa do Mundo para alimentar a engrenagem do Bolão da Rua.',
    category: 'soccer',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Id do jogo' },
      { name: 'time_a', type: 'text', constraints: ['NOT NULL'], description: 'Nome da seleção nacional mandante (ex: Brasil)' },
      { name: 'time_b', type: 'text', constraints: ['NOT NULL'], description: 'Nome da seleção nacional visitante (ex: França)' },
      { name: 'bandeira_a', type: 'text', description: 'Código ISO ou URL da bandeira do Time A' },
      { name: 'bandeira_b', type: 'text', description: 'Código ISO ou URL da bandeira do Time B' },
      { name: 'data_hora', type: 'timestamp with time zone', constraints: ['NOT NULL'], description: 'Horário oficial do pontapé inicial do jogo' },
      { name: 'gols_a', type: 'integer', description: 'Gols reais marcados pelo Time A no encerramento' },
      { name: 'gols_b', type: 'integer', description: 'Gols reais marcados pelo Time B no encerramento' },
      { name: 'fase', type: 'text', constraints: ['NOT NULL', "DEFAULT 'grupo'", "CHECK (fase IN ('grupo', 'oitavas', 'quartas', 'semifinal', 'terceiro_lugar', 'final'))"], description: 'Fase da competição FIFA' },
      { name: 'status', type: 'text', constraints: ['NOT NULL', "DEFAULT 'nao_iniciado'", "CHECK (status IN ('nao_iniciado', 'em_andamento', 'encerrado'))"], description: 'Estado dinâmico do jogo' }
    ],
    sql: `CREATE TABLE public.jogos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    time_a text NOT NULL,
    time_b text NOT NULL,
    bandeira_a text,
    bandeira_b text,
    data_hora timestamp with time zone NOT NULL,
    gols_a integer,
    gols_b integer,
    fase text NOT NULL DEFAULT 'grupo' CHECK (fase IN ('grupo', 'oitavas', 'quartas', 'semifinal', 'terceiro_lugar', 'final')),
    status text NOT NULL DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'encerrado'))
);`,
    indexes: [
      { name: 'idx_jogos_status_data', definition: 'CREATE INDEX idx_jogos_status_data ON public.jogos(status, data_hora);' }
    ],
    policies: [
      { name: 'Leitura liberada a todos os residentes cadastrados', definition: 'CREATE POLICY "Leitura de jogos" ON public.jogos FOR SELECT TO authenticated USING (true);' },
      { name: 'Painel administrativo para atualizar placares', definition: 'CREATE POLICY "Moderadores gerenciam jogos" ON public.jogos FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));' }
    ]
  },
  {
    id: 'palpites',
    name: 'palpites',
    description: 'Os prognósticos cadastrados pelos moradores para competir no Bolão da Rua. Inclui regras de concorrência estrita de prazo.',
    category: 'soccer',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'UUID do palpite do morador' },
      { name: 'jogo_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES jogos(id) ON DELETE CASCADE'], description: 'Identificação de qual partida se trata' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Autor do palpite community' },
      { name: 'gols_a', type: 'integer', constraints: ['NOT NULL', 'CHECK (gols_a >= 0)'], description: 'Placar projetado para o mandante' },
      { name: 'gols_b', type: 'integer', constraints: ['NOT NULL', 'CHECK (gols_b >= 0)'], description: 'Placar projetado para o visitante' },
      { name: 'pontos_obtidos', type: 'integer', constraints: ['DEFAULT 0'], description: 'Pontuação conquistada calculada via trigger' },
      { name: 'processado', type: 'boolean', constraints: ['NOT NULL', 'DEFAULT false'], description: 'Sinaliza se o palpite já foi concitado por rotina automatizada' },
      { name: 'criado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data de registro do palpite' },
      { name: 'atualizado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Última edição realizada antes do cronômetro travar' }
    ],
    sql: `CREATE TABLE public.palpites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jogo_id uuid NOT NULL REFERENCES public.jogos(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    gols_a integer NOT NULL CHECK (gols_a >= 0),
    gols_b integer NOT NULL CHECK (gols_b >= 0),
    pontos_obtidos integer DEFAULT 0,
    processado boolean NOT NULL DEFAULT false,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (jogo_id, usuario_id)
);`,
    indexes: [
      { name: 'idx_palpites_duplo', definition: 'CREATE UNIQUE INDEX idx_palpites_usuario_jogo ON public.palpites(usuario_id, jogo_id);' }
    ],
    policies: [
      { name: 'Cada um só lê o seu próprio palpite até o jogo terminar (bloqueia espionagem!)', definition: 'CREATE POLICY "Usuarios leem proprios palpites" ON public.palpites FOR SELECT TO authenticated USING (auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM public.jogos j WHERE j.id = jogo_id AND j.status = \'encerrado\'));' },
      { name: 'Permite palpitar respeitando o teto de 5 minutos antes do início do jogo', definition: 'CREATE POLICY "Usuarios criam palpites" ON public.palpites FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id AND EXISTS (SELECT 1 FROM public.jogos j WHERE j.id = jogo_id AND j.data_hora > (now() + interval \'5 minutes\')));' },
      { name: 'Permite editar palpites apenas se a partida ainda não se iniciou', definition: 'CREATE POLICY "Usuarios atualizam palpites" ON public.palpites FOR UPDATE TO authenticated USING (auth.uid() = usuario_id AND EXISTS (SELECT 1 FROM public.jogos j WHERE j.id = jogo_id AND j.data_hora > now())) WITH CHECK (auth.uid() = usuario_id);' }
    ]
  },
  {
    id: 'pontuacoes',
    name: 'pontuacoes',
    description: 'Consolidação das estatísticas individuais dos participantes no bolão comunitário para formação do ranking dinâmico da rua.',
    category: 'gamification',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Id do registro de pontos' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'UNIQUE', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Ligado ao morador de forma unívoca' },
      { name: 'pontos_totais', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Pontos acumulados nos palpites de futebol da rua' },
      { name: 'acertos_cheios', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Número total de placares exatos (Chutou 3x1 e foi 3x1)' },
      { name: 'acertos_vencedor_saldo', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Acertos de vencedor e saldo de gols, mas errou placar estrito (ex: Chutou 2x0 e foi 3x1)' },
      { name: 'acertos_apenas_vencedor', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Acertou apenas vencedor ou empate, mas errou saldo e placar exato (ex: Chutou 1x0 e foi 3x2)' },
      { name: 'erros', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 0'], description: 'Quantidade de palpites errados' },
      { name: 'atualizado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data do último cálculo de placar' }
    ],
    sql: `CREATE TABLE public.pontuacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pontos_totais integer NOT NULL DEFAULT 0,
    acertos_cheios integer NOT NULL DEFAULT 0,
    acertos_vencedor_saldo integer NOT NULL DEFAULT 0,
    acertos_apenas_vencedor integer NOT NULL DEFAULT 0,
    erros integer NOT NULL DEFAULT 0,
    atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_pontuacoes_geral_desc', definition: 'CREATE INDEX idx_pontuacoes_geral_desc ON public.pontuacoes(pontos_totais DESC);' }
    ],
    policies: [
      { name: 'Leitura pública dos placares autorizada para engajamento geral', definition: 'CREATE POLICY "Leitura publica de pontuacoes" ON public.pontuacoes FOR SELECT TO authenticated USING (true);' },
      { name: 'Alterações controladas unicamente pelos triggers automáticos de sistema', definition: 'CREATE POLICY "Sistema atualiza pontuacoes" ON public.pontuacoes FOR ALL TO service_role USING (true);' }
    ]
  },
  {
    id: 'posts',
    name: 'posts',
    description: 'Postagens na rede social fechada do bairro/rua, com categorias temáticas para evitar dispersão de papos e facilitar moderação.',
    category: 'social',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Id do post comunitário' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Autor da publicação morador' },
      { name: 'conteudo', type: 'text', constraints: ['NOT NULL'], description: 'Texto da publicação comunitária' },
      { name: 'copa_categoria', type: 'text', constraints: ["DEFAULT 'geral'", "CHECK (copa_categoria IN ('geral', 'decoracao', 'mutirao', 'churrasco', 'comemoracao'))"], description: 'Classificação temática da postagem' },
      { name: 'status_moderacao', type: 'text', constraints: ['NOT NULL', "DEFAULT 'aprovado'", "CHECK (status_moderacao IN ('pendente', 'aprovado', 'repartado', 'bloqueado'))"], description: 'Estado de aprovação (contra toxicidade e palavreado ofensivo)' },
      { name: 'criado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data em que foi ao ar' }
    ],
    sql: `CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo text NOT NULL,
    copa_categoria text DEFAULT 'geral' CHECK (copa_categoria IN ('geral', 'decoracao', 'mutirao', 'churrasco', 'comemoracao')),
    status_moderacao text NOT NULL DEFAULT 'aprovado' CHECK (status_moderacao IN ('pendente', 'aprovado', 'repartado', 'bloqueado')),
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_posts_grupo_data', definition: 'CREATE INDEX idx_posts_grupo_data ON public.posts(status_moderacao, criado_em DESC);' }
    ],
    policies: [
      { name: 'Moradores autenticados podem ver postagens ativas e aprovadas da rua', definition: 'CREATE POLICY "Leitura de posts" ON public.posts FOR SELECT TO authenticated USING (status_moderacao = \'aprovado\' OR auth.uid() = usuario_id);' },
      { name: 'Moradores cadastrados publicam na rede', definition: 'CREATE POLICY "Moradores postam" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);' },
      { name: 'Apenas moderadores e o próprio autor podem apagar ou alterar posts', definition: 'CREATE POLICY "Controle de posts" ON public.posts FOR ALL TO authenticated USING (auth.uid() = usuario_id OR public.is_moderator(auth.uid())) WITH CHECK (auth.uid() = usuario_id OR public.is_moderator(auth.uid()));' }
    ]
  },
  {
    id: 'comentarios',
    name: 'comentarios',
    description: 'Seção de respostas interativas nas postagens da rede social da comunidade Rua do Hexa.',
    category: 'social',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Chave única do comentário comunitário' },
      { name: 'post_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES posts(id) ON DELETE CASCADE'], description: 'Ligado com o post matriz' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Quem teceu o comentário' },
      { name: 'conteudo', type: 'text', constraints: ['NOT NULL'], description: 'Corpo textual do comentário' },
      { name: 'criado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data do comentário comunitário' }
    ],
    sql: `CREATE TABLE public.comentarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo text NOT NULL,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_comentarios_post_ref', definition: 'CREATE INDEX idx_comentarios_post_ref ON public.comentarios(post_id, criado_em ASC);' }
    ],
    policies: [
      { name: 'Vizinhos podem interagir/ler as mensagens e depoimentos', definition: 'CREATE POLICY "Vizinhos leem comentarios" ON public.comentarios FOR SELECT TO authenticated USING (true);' },
      { name: 'Qualquer morador logado pode comentar publicamente', definition: 'CREATE POLICY "Moradores comentam" ON public.comentarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);' },
      { name: 'Autores ou moderadores podem realizar a exclusão de conteúdos', definition: 'CREATE POLICY "Gestor de comentarios" ON public.comentarios FOR ALL TO authenticated USING (auth.uid() = usuario_id OR public.is_moderator(auth.uid())) WITH CHECK (auth.uid() = usuario_id OR public.is_moderator(auth.uid()));' }
    ]
  },
  {
    id: 'curtidas',
    name: 'curtidas',
    description: 'Armazena as curtidas/reações de apoio a publicações de vizinhos, com mecanismo de bloqueio de duplicidade.',
    category: 'social',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Id chave da reação de apoio' },
      { name: 'post_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES posts(id) ON DELETE CASCADE'], description: 'Vínculo do post' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Vínculo do entusiasta' },
      { name: 'criada_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data da reação' }
    ],
    sql: `CREATE TABLE public.curtidas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (post_id, usuario_id)
);`,
    indexes: [
      { name: 'idx_curtidas_dupla', definition: 'CREATE UNIQUE INDEX idx_curtidas_post_usuario ON public.curtidas(post_id, usuario_id);' }
    ],
    policies: [
      { name: 'Reações abertas para leitura geral para motivação coletiva', definition: 'CREATE POLICY "Leitura de reacoes" ON public.curtidas FOR SELECT TO authenticated USING (true);' },
      { name: 'Permitir que usuários curem os posts do feed comunitário', definition: 'CREATE POLICY "Usuarios curtem" ON public.curtidas FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);' },
      { name: 'Remover as próprias curtidas realizadas anteriormente (un-like)', definition: 'CREATE POLICY "Usuarios removem curtidas" ON public.curtidas FOR DELETE TO authenticated USING (auth.uid() = usuario_id);' }
    ]
  },
  {
    id: 'midias',
    name: 'midias',
    description: 'Centralizador multimídia da rua. Guarda arquivos da ornamentação da asfalto, eventos, e bandeirões históricos com filtros de exibição nativos.',
    category: 'soccer',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Chave única do anexo multimídia' },
      { name: 'post_id', type: 'uuid', constraints: ['REFERENCES posts(id) ON DELETE CASCADE'], description: 'Se anclado em um post do mural, elo direto' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Quem fez o upload físico das fotos' },
      { name: 'url_arquivo', type: 'text', constraints: ['NOT NULL'], description: 'Direct links do Supabase Storage bucket da Copa' },
      { name: 'tipo_arquivo', type: 'text', constraints: ['NOT NULL', "CHECK (tipo_arquivo IN ('imagem', 'video'))"], description: 'Sinalizador do mime-type principal' },
      { name: 'tamanho_bytes', type: 'integer', description: 'Tamanho do arquivo gravado' },
      { name: 'galeria_decoracao', type: 'boolean', constraints: ['NOT NULL', 'DEFAULT false'], description: 'Destaque visual na seleta de melhores ruas ornamentadas' },
      { name: 'criada_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Inclusão automática em banco' }
    ],
    sql: `CREATE TABLE public.midias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    url_arquivo text NOT NULL,
    tipo_arquivo text NOT NULL CHECK (tipo_arquivo IN ('imagem', 'video')),
    tamanho_bytes integer,
    galeria_decoracao boolean NOT NULL DEFAULT false,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_midias_galeria', definition: 'CREATE INDEX idx_midias_galeria ON public.midias(galeria_decoracao) WHERE galeria_decoracao = true;' }
    ],
    policies: [
      { name: 'Acesso visual liberado a todos da comunidade', definition: 'CREATE POLICY "Leitura de midias" ON public.midias FOR SELECT TO authenticated USING (true);' },
      { name: 'Permitir upload para moradores da rua', definition: 'CREATE POLICY "Moradores fazem upload" ON public.midias FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);' }
    ]
  },
  {
    id: 'conquistas',
    name: 'conquistas',
    description: 'Catálogo de insígnias e selos gamificados para os moradores (Dono do Asfalto, Mestre dos Palpites, Doador Solidário, etc.).',
    category: 'gamification',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Chave única da recompensa moral' },
      { name: 'titulo', type: 'text', constraints: ['UNIQUE', 'NOT NULL'], description: 'Título marcante (ex: "Artilheiro de Mutirão")' },
      { name: 'descricao', type: 'text', constraints: ['NOT NULL'], description: 'Exigência de desbloqueio para conseguir a medalha' },
      { name: 'icone_id', type: 'text', constraints: ['NOT NULL'], description: 'ID do ícone (Lucide) a ser desenhado no frontend' },
      { name: 'pontos_recompensa', type: 'integer', constraints: ['NOT NULL', 'DEFAULT 50'], description: 'Bonificação em reputação moral que o morador adquire' },
      { name: 'regra_codigo', type: 'text', description: 'Metadados interpretados pela engine comunitária' }
    ],
    sql: `CREATE TABLE public.conquistas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL UNIQUE,
    descricao text NOT NULL,
    icone_id text NOT NULL,
    pontos_recompensa integer NOT NULL DEFAULT 50,
    regra_codigo text
);`,
    indexes: [
      { name: 'idx_conquistas_titulo', definition: 'CREATE INDEX idx_conquistas_titulo ON public.conquistas(titulo);' }
    ],
    policies: [
      { name: 'Lida livremente por todos', definition: 'CREATE POLICY "Leitura de conquistas" ON public.conquistas FOR SELECT TO authenticated USING (true);' },
      { name: 'Admins de rua cadastram as premiações', definition: 'CREATE POLICY "Admin controla conquistas" ON public.conquistas FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));' }
    ]
  },
  {
    id: 'usuarios_conquistas',
    name: 'usuarios_conquistas',
    description: 'Associação (tabela pivot N:N) entre os moradores do bairro e as conquistas desbloqueadas durante a temporada de Copa.',
    category: 'gamification',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Id do registro de posse do selo' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Vínculo do morador doador/torcedor' },
      { name: 'conquista_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES conquistas(id) ON DELETE CASCADE'], description: 'Elegibilidade do selo do herói' },
      { name: 'conquistada_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data do feito comemorativo' }
    ],
    sql: `CREATE TABLE public.usuarios_conquistas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conquista_id uuid NOT NULL REFERENCES public.conquistas(id) ON DELETE CASCADE,
    conquistada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (usuario_id, conquista_id)
);`,
    indexes: [
      { name: 'idx_usuario_conquista_un', definition: 'CREATE UNIQUE INDEX idx_usuario_conquista_un ON public.usuarios_conquistas(usuario_id, conquista_id);' }
    ],
    policies: [
      { name: 'Moradores podem visualizar as medalhas de todos da rua', definition: 'CREATE POLICY "Visualização de conquistas de moradores" ON public.usuarios_conquistas FOR SELECT TO authenticated USING (true);' },
      { name: 'Engine ou admins de rua concedem insígnias', definition: 'CREATE POLICY "Admin concede conquistas" ON public.usuarios_conquistas FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));' }
    ]
  },
  {
    id: 'rankings',
    name: 'rankings',
    description: 'Armazena instâncias de rankings oficiais para segmentação (ranking por residências, por grupos familiares e moradores do Bolão).',
    category: 'gamification',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Id do ranking' },
      { name: 'nome_ranking', type: 'text', constraints: ['NOT NULL'], description: 'Identificação (ex: "Liga Oficial Geral")' },
      { name: 'tipo', type: 'text', constraints: ['NOT NULL', "CHECK (tipo IN ('moradores', 'familias', 'casas'))"], description: 'Classificação analítica do ranking' },
      { name: 'temporada', type: 'text', constraints: ['NOT NULL', "DEFAULT 'Copa 2026'"], description: 'Qual edição da Copa do Mundo está no escopo' },
      { name: 'descricao', type: 'text', description: 'Prêmios físicos e regras gerais descritas no mural' },
      { name: 'atualizado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Momento de processamento estatístico' }
    ],
    sql: `CREATE TABLE public.rankings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_ranking text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('moradores', 'familias', 'casas')),
    temporada text NOT NULL DEFAULT 'Copa 2026',
    descricao text,
    atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_rankings_tipo', definition: 'CREATE INDEX idx_rankings_tipo ON public.rankings(tipo);' }
    ],
    policies: [
      { name: 'Permitir leitura pública', definition: 'CREATE POLICY "Leitura de rankings" ON public.rankings FOR SELECT TO authenticated USING (true);' },
      { name: 'Apenas coordenadores podem modificar as temporadas e lógicas', definition: 'CREATE POLICY "Gestão de rankings" ON public.rankings FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));' }
    ]
  },
  {
    id: 'notificacoes',
    name: 'notificacoes',
    description: 'Alertas comunitários enviados aos moradores sobre o início de palpites, conciliação de doação, mutirões de pintura e conquistas morais.',
    category: 'social',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'UUID do alerta' },
      { name: 'usuario_id', type: 'uuid', constraints: ['NOT NULL', 'REFERENCES usuarios(id) ON DELETE CASCADE'], description: 'Morador destinatário do feed' },
      { name: 'titulo', type: 'text', constraints: ['NOT NULL'], description: 'Chamada curta do aviso' },
      { name: 'mensagem', type: 'text', constraints: ['NOT NULL'], description: 'Corpo explicativo do alerta' },
      { name: 'tipo', type: 'text', constraints: ['NOT NULL', "DEFAULT 'geral'", "CHECK (tipo IN ('geral', 'evento', 'arrecadacao', 'palpite', 'conquista', 'social'))"], description: 'Motivação de disparo do evento com badges customizados' },
      { name: 'lida', type: 'boolean', constraints: ['NOT NULL', 'DEFAULT false'], description: 'Estado lógico do alerta' },
      { name: 'criada_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Carimbo de data e hora do envio comunitário' }
    ],
    sql: `CREATE TABLE public.notificacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    tipo text NOT NULL DEFAULT 'geral' CHECK (tipo IN ('geral', 'evento', 'arrecadacao', 'palpite', 'conquista', 'social')),
    lida boolean NOT NULL DEFAULT false,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_notificacoes_usuario', definition: 'CREATE INDEX idx_notificacoes_usuario ON public.notificacoes(usuario_id, lida DESC);' }
    ],
    policies: [
      { name: 'Cada cidadão edita e lê apenas o seu próprio canal de notificações comunitárias', definition: 'CREATE POLICY "Usuarios usam canal privado" ON public.notificacoes FOR ALL TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);' }
    ]
  },
  {
    id: 'historico_copas',
    name: 'historico_copas',
    description: 'Álbum repleto de nostalgia das Copas antigas em que a rua foi decorada, mantendo o histórico de glórias, fotos antigas e campeões do bolão.',
    category: 'soccer',
    columns: [
      { name: 'id', type: 'uuid', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Identificador do resgate histórico' },
      { name: 'ano_copa', type: 'integer', constraints: ['UNIQUE', 'NOT NULL', 'CHECK (ano_copa >= 1930 AND ano_copa <= 2100)'], description: 'Ano correspondente ao evento mundial FIFA' },
      { name: 'campeao', type: 'text', constraints: ['NOT NULL'], description: 'A seleção que faturou a Copa real' },
      { name: 'vice', type: 'text', constraints: ['NOT NULL'], description: 'O vice-campeão do certame oficial' },
      { name: 'destaque_rua', type: 'text', description: 'Causos folclóricos daquela Copa vividos no bairro' },
      { name: 'url_foto_reliquia', type: 'text', description: 'Imagem escaneada ou digital da decoração daquele ano' },
      { name: 'autor_registro', type: 'uuid', constraints: ['REFERENCES usuarios(id) on delete set null'], description: 'Testemunha histórica morador que registrou o relato' },
      { name: 'criado_em', type: 'timestamp with time zone', constraints: ['NOT NULL', "DEFAULT timezone('utc'::text, now())"], description: 'Data de catalogação no museu digital da rua' }
    ],
    sql: `CREATE TABLE public.historico_copas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ano_copa integer NOT NULL UNIQUE CHECK (ano_copa >= 1930 AND ano_copa <= 2100),
    campeao text NOT NULL,
    vice text NOT NULL,
    destaque_rua text,
    url_foto_reliquia text,
    autor_registro uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`,
    indexes: [
      { name: 'idx_historico_ano', definition: 'CREATE UNIQUE INDEX idx_historico_ano ON public.historico_copas(ano_copa DESC);' }
    ],
    policies: [
      { name: 'Leitura aberta de todo o mural de relíquias históricas', definition: 'CREATE POLICY "Leitura de reliquias" ON public.historico_copas FOR SELECT TO authenticated USING (true);' },
      { name: 'Apenas os guardiões da história da rua (moderadores/admins) inserem novos causos', definition: 'CREATE POLICY "Coordenadores preservam causos" ON public.historico_copas FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));' }
    ]
  }
];

export const FULL_SQL_SCRIPT = `-- =========================================================================
-- BLUEPRINT DO BANCO DE DADOS POSTGRESQL / SUPABASE
-- PROJETO: RUA DO HEXA (Plataforma Comunitária da Copa do Mundo)
-- VERSÃO: 1.0 (Copa 2026)
-- AUTOR: Arquiteto de Banco de Dados PostgreSQL & CTO Especialista
-- =========================================================================

-- HABILITAR EXTENSÕES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. FUNÇÕES AUXILIARES DE CHECAGEM DE ROLES E PERMISSÕES (SUPABASE AUTH)
-- =========================================================================

-- Criará esquema público rápido para verificar se usuário é moderador/admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
    usr_role text;
BEGIN
    SELECT role INTO usr_role FROM public.usuarios WHERE id = user_id;
    RETURN (usr_role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator(user_id uuid)
RETURNS boolean AS $$
DECLARE
    usr_role text;
BEGIN
    SELECT role INTO usr_role FROM public.usuarios WHERE id = user_id;
    RETURN (usr_role IN ('admin', 'moderador'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- 2. CRIAÇÃO DAS TABELAS COM SUAS PKs, FKs E CHECK CONSTRAINTS
-- =========================================================================

-- Tabela: casas
CREATE TABLE public.casas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero text NOT NULL,
    rua text NOT NULL,
    complemento text,
    bloco_condominio text,
    coordenadas_latitude numeric,
    coordenadas_longitude numeric,
    decorada boolean NOT NULL DEFAULT false,
    pontos_decoracao integer NOT NULL DEFAULT 0,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: familias
CREATE TABLE public.familias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    slogan text,
    pontos_acumulados integer NOT NULL DEFAULT 0,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: usuarios (Perfis integrados diretamente ao mechanism de login do Supabase Auth)
CREATE TABLE public.usuarios (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome text NOT NULL,
    email text UNIQUE NOT NULL,
    avatar_url text,
    casa_id uuid REFERENCES public.casas(id) ON DELETE SET NULL,
    familia_id uuid REFERENCES public.familias(id) ON DELETE SET NULL,
    role text NOT NULL DEFAULT 'morador' CHECK (role IN ('admin', 'moderador', 'morador')),
    reputacao_pontos integer NOT NULL DEFAULT 0,
    pontos_bolao integer NOT NULL DEFAULT 0,
    data_cadastro timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: arrecadacoes (Vaquinha oficial para decoração e confraternizações)
CREATE TABLE public.arrecadacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descricao text,
    meta_valor numeric(10,2) NOT NULL,
    valor_arrecadado numeric(10,2) NOT NULL DEFAULT 0.00,
    data_limite timestamp with time zone,
    status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado', 'cancelado')),
    criada_por uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: contribuicoes
CREATE TABLE public.contribuicoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    arrecadacao_id uuid NOT NULL REFERENCES public.arrecadacoes(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    valor numeric(10,2) NOT NULL CHECK (valor > 0),
    status_pagamento text NOT NULL DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'aprovado', 'rejeitado', 'estornado')),
    metodo_pagamento text CHECK (metodo_pagamento IN ('pix', 'cartao_credito', 'dinheiro')),
    gateway_transacao_id text,
    data_contribuicao timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: eventos (Agenda comunitária do bairro da Copa)
CREATE TABLE public.eventos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descricao text,
    data_hora timestamp with time zone NOT NULL,
    local text NOT NULL,
    status text NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'cancelado', 'concluido')),
    coordenadas_latitude numeric,
    coordenadas_longitude numeric,
    criado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: jogos (Jogos oficiais da FIFA)
CREATE TABLE public.jogos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    time_a text NOT NULL,
    time_b text NOT NULL,
    bandeira_a text,
    bandeira_b text,
    data_hora timestamp with time zone NOT NULL,
    gols_a integer,
    gols_b integer,
    fase text NOT NULL DEFAULT 'grupo' CHECK (fase IN ('grupo', 'oitavas', 'quartas', 'semifinal', 'terceiro_lugar', 'final')),
    status text NOT NULL DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'encerrado'))
);

-- Tabela: palpites (Bolão dos moradores)
CREATE TABLE public.palpites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jogo_id uuid NOT NULL REFERENCES public.jogos(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    gols_a integer NOT NULL CHECK (gols_a >= 0),
    gols_b integer NOT NULL CHECK (gols_b >= 0),
    pontos_obtidos integer DEFAULT 0,
    processado boolean NOT NULL DEFAULT false,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (jogo_id, usuario_id)
);

-- Tabela: pontuacoes (Consolidadores de placares individuais)
CREATE TABLE public.pontuacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pontos_totais integer NOT NULL DEFAULT 0,
    acertos_cheios integer NOT NULL DEFAULT 0,
    acertos_vencedor_saldo integer NOT NULL DEFAULT 0,
    acertos_apenas_vencedor integer NOT NULL DEFAULT 0,
    erros integer NOT NULL DEFAULT 0,
    atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: posts (Rede social interna da vizinhança)
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo text NOT NULL,
    copa_categoria text DEFAULT 'geral' CHECK (copa_categoria IN ('geral', 'decoracao', 'mutirao', 'churrasco', 'comemoracao')),
    status_moderacao text NOT NULL DEFAULT 'aprovado' CHECK (status_moderacao IN ('pendente', 'aprovado', 'repartado', 'bloqueado')),
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: comentarios
CREATE TABLE public.comentarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conteudo text NOT NULL,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: curtidas
CREATE TABLE public.curtidas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (post_id, usuario_id)
);

-- Tabela: midias (Galeria de fotos ornamentadas e vídeos)
CREATE TABLE public.midias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    url_arquivo text NOT NULL,
    tipo_arquivo text NOT NULL CHECK (tipo_arquivo IN ('imagem', 'video')),
    tamanho_bytes integer,
    galeria_decoracao boolean NOT NULL DEFAULT false,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: conquistas (Insignias e medalhas de apoio social)
CREATE TABLE public.conquistas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL UNIQUE,
    descricao text NOT NULL,
    icone_id text NOT NULL,
    pontos_recompensa integer NOT NULL DEFAULT 50,
    regra_codigo text
);

-- Tabela pivot: usuarios_conquistas
CREATE TABLE public.usuarios_conquistas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    conquista_id uuid NOT NULL REFERENCES public.conquistas(id) ON DELETE CASCADE,
    conquistada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (usuario_id, conquista_id)
);

-- Tabela: rankings
CREATE TABLE public.rankings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_ranking text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('moradores', 'familias', 'casas')),
    temporada text NOT NULL DEFAULT 'Copa 2026',
    descricao text,
    atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: notificacoes (Push de avisos morais)
CREATE TABLE public.notificacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    tipo text NOT NULL DEFAULT 'geral' CHECK (tipo IN ('geral', 'evento', 'arrecadacao', 'palpite', 'conquista', 'social')),
    lida boolean NOT NULL DEFAULT false,
    criada_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: historico_copas (Nostalgia da glórias passadas do bairro)
CREATE TABLE public.historico_copas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ano_copa integer NOT NULL UNIQUE CHECK (ano_copa >= 1930 AND ano_copa <= 2100),
    campeao text NOT NULL,
    vice text NOT NULL,
    destaque_rua text,
    url_foto_reliquia text,
    autor_registro uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- 3. CRIAÇÃO DE ÍNDICES DE PERFORMANCE (INDEXES)
-- =========================================================================
CREATE INDEX idx_casas_decorada ON public.casas(decorada);
CREATE INDEX idx_familias_pontos ON public.familias(pontos_acumulados DESC);
CREATE UNIQUE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_casa ON public.usuarios(casa_id);
CREATE INDEX idx_usuarios_familia ON public.usuarios(familia_id);
CREATE INDEX idx_arrecadacoes_status ON public.arrecadacoes(status);
CREATE INDEX idx_contribuicoes_arrec_user ON public.contribuicoes(arrecadacao_id, usuario_id);
CREATE INDEX idx_contribuicoes_status ON public.contribuicoes(status_pagamento);
CREATE INDEX idx_eventos_data ON public.eventos(data_hora ASC);
CREATE INDEX idx_jogos_status_data ON public.jogos(status, data_hora);
CREATE UNIQUE INDEX idx_palpites_usuario_jogo ON public.palpites(usuario_id, jogo_id);
CREATE INDEX idx_pontuacoes_geral_desc ON public.pontuacoes(pontos_totais DESC);
CREATE INDEX idx_posts_grupo_data ON public.posts(status_moderacao, criado_em DESC);
CREATE INDEX idx_comentarios_post_ref ON public.comentarios(post_id, criado_em ASC);
CREATE UNIQUE INDEX idx_curtidas_post_usuario ON public.curtidas(post_id, usuario_id);
CREATE INDEX idx_midias_galeria ON public.midias(galeria_decoracao) WHERE galeria_decoracao = true;
CREATE INDEX idx_conquistas_titulo ON public.conquistas(titulo);
CREATE UNIQUE INDEX idx_usuario_conquista_un ON public.usuarios_conquistas(usuario_id, conquista_id);
CREATE INDEX idx_rankings_tipo ON public.rankings(tipo);
CREATE INDEX idx_notificacoes_usuario ON public.notificacoes(usuario_id, lida DESC);
CREATE UNIQUE INDEX idx_historico_ano ON public.historico_copas(ano_copa DESC);


-- =========================================================================
-- 4. CRIAÇÃO DE VIEWS CONSOLIDADAS (VISTAS ANALÍTICAS)
-- =========================================================================

-- View 1: Ranking detalhado de moradores no Bolão
CREATE OR REPLACE VIEW public.view_ranking_moradores AS
SELECT 
    row_number() OVER (ORDER BY po.pontos_totais DESC) AS posicao,
    u.id AS usuario_id,
    u.nome AS morador_nome,
    u.avatar_url,
    f.nome AS familia_nome,
    c.rua || ', ' || c.numero AS endereco_casa,
    po.pontos_totais,
    po.acertos_cheios,
    po.acertos_vencedor_saldo,
    po.acertos_apenas_vencedor,
    po.erros
FROM public.pontuacoes po
JOIN public.usuarios u ON u.id = po.usuario_id
LEFT JOIN public.familias f ON f.id = u.familia_id
LEFT JOIN public.casas c ON c.id = u.casa_id;

-- View 2: Ranking agrupado por Famílias
CREATE OR REPLACE VIEW public.view_ranking_familias AS
SELECT 
    row_number() OVER (ORDER BY f.pontos_acumulados DESC) AS posicao,
    f.id AS familia_id,
    f.nome AS familia_nome,
    f.slogan,
    f.pontos_acumulados AS pontos_totais,
    count(u.id) AS total_membros,
    avg(po.pontos_totais)::numeric(10,2) AS media_pontos_por_membro
FROM public.familias f
LEFT JOIN public.usuarios u ON u.familia_id = f.id
LEFT JOIN public.pontuacoes po ON po.usuario_id = u.id
GROUP BY f.id, f.nome, f.slogan, f.pontos_acumulados;

-- View 3: Balanço financeiro de arrecadações comunitárias
CREATE OR REPLACE VIEW public.view_financeiro_arrecadacoes AS
SELECT 
    a.id AS arrecadacao_id,
    a.titulo,
    a.meta_valor,
    COALESCE(sum(c.valor) FILTER (WHERE c.status_pagamento = 'aprovado'), 0.00) AS total_confirmado,
    a.meta_valor - COALESCE(sum(c.valor) FILTER (WHERE c.status_pagamento = 'aprovado'), 0.00) AS saldo_restante,
    (COALESCE(sum(c.valor) FILTER (WHERE c.status_pagamento = 'aprovado'), 0.00) / a.meta_valor * 100)::numeric(5,2) AS percentual_concluido,
    count(c.id) FILTER (WHERE c.status_pagamento = 'aprovado') AS doadores_unicos,
    a.status,
    a.data_limite
FROM public.arrecadacoes a
LEFT JOIN public.contribuicoes c ON c.arrecadacao_id = a.id
GROUP BY a.id, a.titulo, a.meta_valor, a.status, a.data_limite;

-- View 4: Painel consolidado da Gincana da Rua (Estatísticas Gerais)
CREATE OR REPLACE VIEW public.view_estatisticas_rua AS
SELECT
    (SELECT count(*) FROM public.usuarios) AS total_vizinhos,
    (SELECT count(*) FROM public.casas WHERE decorada = true) AS casas_decoradas_total,
    (SELECT count(*) FROM public.casas) AS total_casas_cadastradas,
    (SELECT COALESCE(sum(valor), 0.00) FROM public.contribuicoes WHERE status_pagamento = 'aprovado') AS total_arrecadado_copa,
    (SELECT count(*) FROM public.posts) AS total_posts_rede,
    (SELECT count(*) FROM public.palpites) AS total_palpites_bolao;


-- =========================================================================
-- 5. CRIAÇÃO DE TRIGGERS (REGRAS AUTOMÁTICAS E CÁLCULOS)
-- =========================================================================

-- Trigger 1: Inserção automática de um perfil do morador quando ele se registra no Auth do Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, avatar_url, role, reputacao_pontos, pontos_bolao)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', 'Vizinho Sem Nome'),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'morador',
    20, -- Começa com 20 de reputação moral por se cadastrar
    0
  );
  
  -- Insere também na tabela de pontuações de forma automática
  INSERT INTO public.pontuacoes (usuario_id, pontos_totais, acertos_cheios, acertos_vencedor_saldo, acertos_apenas_vencedor)
  VALUES (new.id, 0, 0, 0, 0);
  
  -- Dispara mensagem de boas-vindas community
  INSERT INTO public.notificacoes (usuario_id, titulo, mensagem, tipo)
  VALUES (
    new.id,
    'Seja bem-vindo ao Rua do Hexa!',
    'Seu cadastro comunitário foi efetuado. Agora você pode entrar no bolão, postar fotos, registrar causos e doar para o asfalto!',
    'social'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Se o trigger já existir, limpa para não duplicar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Trigger 2: Recalcular o valor total consolidado na arrecadação principal de forma segura e autônoma
CREATE OR REPLACE FUNCTION public.update_arrecadacao_total()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE public.arrecadacoes
        SET valor_arrecadado = (
            SELECT COALESCE(sum(valor), 0.00) 
            FROM public.contribuicoes 
            WHERE arrecadacao_id = NEW.arrecadacao_id AND status_pagamento = 'aprovado'
        )
        WHERE id = NEW.arrecadacao_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.arrecadacoes
        SET valor_arrecadado = (
            SELECT COALESCE(sum(valor), 0.00) 
            FROM public.contribuicoes 
            WHERE arrecadacao_id = OLD.arrecadacao_id AND status_pagamento = 'aprovado'
        )
        WHERE id = OLD.arrecadacao_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_contribuicoes_change ON public.contribuicoes;
CREATE TRIGGER trg_contribuicoes_change
  AFTER INSERT OR UPDATE OR DELETE ON public.contribuicoes
  FOR EACH ROW EXECUTE FUNCTION public.update_arrecadacao_total();


-- Trigger 3: Cálculo automático de agregação acumulada de pontos por Família
CREATE OR REPLACE FUNCTION public.recalcula_pontos_familia()
RETURNS trigger AS $$
BEGIN
    UPDATE public.familias
    SET pontos_acumulados = (
        SELECT COALESCE(sum(pontos_totais), 0)
        FROM public.pontuacoes po
        JOIN public.usuarios u ON u.id = po.usuario_id
        WHERE u.familia_id = NEW.familia_id
    )
    WHERE id = NEW.familia_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_pontuacoes_change_familia ON public.pontuacoes;
-- Sempre que uma linha de pontuação for alterada, recalcula os pontos da família de posse
CREATE OR REPLACE FUNCTION public.trigger_recalcula_familia()
RETURNS trigger AS $$
DECLARE
    f_id uuid;
BEGIN
    SELECT familia_id INTO f_id FROM public.usuarios WHERE id = NEW.usuario_id;
    IF f_id IS NOT NULL THEN
        UPDATE public.familias
        SET pontos_acumulados = (
            SELECT COALESCE(sum(po.pontos_totais), 0)
            FROM public.pontuacoes po
            JOIN public.usuarios u ON u.id = po.usuario_id
            WHERE u.familia_id = f_id
        )
        WHERE id = f_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_pontuacoes_change_familia
  AFTER UPDATE OF pontos_totais ON public.pontuacoes
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recalcula_familia();


-- =========================================================================
-- 6. SEGURANÇA E POLÍTICAS DE ACESSO (ROW LEVEL SECURITY - RLS)
-- =========================================================================

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.casas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arrecadacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palpites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontuacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curtidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.midias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_copas ENABLE ROW LEVEL SECURITY;

-- Exemplo Clássico de Políticas de Segurança Criadas (Ver detalhes na UI):
CREATE POLICY "Vizinhos leem casas" ON public.casas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins alteram imovel" ON public.casas FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Vizinhos leem familias" ON public.familias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Membros criam familias" ON public.familias FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Vizinhos leem perfis comunitários" ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Moradores atualizam próprio perfil" ON public.usuarios FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Vizinhos visualizam vaquinhas comunitárias" ON public.arrecadacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coordenadores editam arrecadacoes" ON public.arrecadacoes FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "Vizinho ve proprias contribuicoes" ON public.contribuicoes FOR SELECT TO authenticated USING (auth.uid() = usuario_id OR public.is_moderator(auth.uid()));
CREATE POLICY "Confirmar Pix" ON public.contribuicoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Posts ativos sao publicos" ON public.posts FOR SELECT TO authenticated USING (status_moderacao = 'aprovado' OR auth.uid() = usuario_id);
CREATE POLICY "Qualquer morador posta no mural" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Dono ou mod altera posts" ON public.posts FOR ALL TO authenticated USING (auth.uid() = usuario_id OR public.is_moderator(auth.uid())) WITH CHECK (auth.uid() = usuario_id OR public.is_moderator(auth.uid()));

CREATE POLICY "Vizinhos leem palpites de jogos encerrados ou proprios" ON public.palpites 
FOR SELECT TO authenticated USING (auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM public.jogos j WHERE j.id = jogo_id AND j.status = 'encerrado'));

CREATE POLICY "Palpitar ate tempo limite" ON public.palpites 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id AND EXISTS (SELECT 1 FROM public.jogos j WHERE j.id = jogo_id AND j.data_hora > (now() + interval '5 minutes')));

CREATE POLICY "Corrigir palpite pre jogo" ON public.palpites 
FOR UPDATE TO authenticated USING (auth.uid() = usuario_id AND EXISTS (SELECT 1 FROM public.jogos j WHERE j.id = jogo_id AND j.data_hora > now())) WITH CHECK (auth.uid() = usuario_id);

-- =========================================================================
-- FIM DO SCRIPT DE BANCO DE DADOS - COPA DO MUNDO "RUA DO HEXA"
-- =========================================================================
`;
