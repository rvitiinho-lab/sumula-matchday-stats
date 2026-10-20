# Sumula Matchday Stats

Ola, Crie uma aplicação web completa em React + Tailwind CSS + TypeScript com integração ao Supabase (Auth e Database Postgres). O app se chama "Súmula FC", voltado para organização de peladas e estatísticas pós-jogo.

DESIGN & ESTÉTICA (UI/UX Inspirada no Figma):

Estilo: Dark mode esportivo limpo, moderno e de alto contraste.

Cores: Fundo grafite escuro/preto profundo (#121612), destaques em verde neon (#9FE870), cartões de estatísticas em tom creme/bege (#F5F3E7).

IMPORTANTE: O plano de fundo deve ser LISO e LIMPO, sem círculos, sem grade vetorial e sem radar.

ROTAS E COMPONENTES DE TELA:

A) TELA INICIAL / LANDING PAGE (/):

Cabeçalho Superior:

Tag verde: "A PELADA, AGORA, TEM HISTÓRIA."

Título Principal: "A SÚMULA OFICIAL DA SUA RESENHA."

Subtítulo: "Organize o jogo, registre cada lance e descubra quem realmente decidiu a partida."

Botões de Ação Principais (Estilo Pílula Arredondada):

[+] "Criar minha Pelada" [->] -> Redireciona para /match/create.

[🔗] "Inserir link ou código do racha" [->] -> Abre modal/input rápido para colar URL/código (sumulafc.app/lobby/[id] ou token) e redireciona automaticamente para /lobby/[id].

[G] "Entrar com Google" [->] -> Dispara o Supabase Auth OAuth Google.

B) TELA DE REGISTRO (/auth/register):

Formulário validado com Zod + React Hook Form.

Campos obrigatórios:

Nome Completo (min 3 letras).

Apelido / Vulgo para Súmula (2 a 20 caracteres, sem espaços/símbolos).

Endereço de E-mail.

Senha (mínimo 8 caracteres, 1 letra maiúscula, 1 número) com checklist visual de requisitos.

Botão "Concluir Cadastro de Atleta".

C) CRIAÇÃO DE PARTIDA (/match/create):

Seleção visual de modalidades por botões: x1, x2, x5, x6, x7, x11.

Lotação Máxima Expandida (2 Times Titulares + até 3 Times "Próxima"):

x1: Max 8 atletas | x2: Max 16 | x5: Max 40 | x6: Max 48 | x7: Max 56 | x11: Max 88.

D) LOBBY DA PARTIDA (/lobby/[matchId]):

Exibe lista de inscritos por ordem numérica de chegada.

Lógica Híbrida de Sorteio:

Vagas Titulares (Colete vs Sem Colete): Equilibradas automaticamente via algoritmo pela média de Overall do atleta.

Vagas de Espera (Próxima 1, Próxima 2, Próxima 3): Preenchidas sequencialmente por ordem numérica de chegada.

Botão "Sortear Times": Permite ao organizador rodar ou refazer o sorteio presencialmente na hora do jogo.

E) SÚMULA DIGITAL & RESENHA (/match/summary/[matchId]):

Placar principal destacando "Colete 5 x 3 Sem Colete".

Seção "Cards da Resenha" em tom creme (#F5F3E7) estilo FUT/FIFA Cards com badges (ex: "SÚMULA FC - CRAQUE", Overall 92, Gols e Assistências, e balão de citação do atleta).

BANCO DE DADOS POSTGRESQL (SUPABASE SQL):
Gere também a estrutura das tabelas SQL para o Supabase:sql
-- 1. Tabela de Perfis de Atletas
CREATE TABLE public.profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
nome TEXT NOT NULL,
apelido TEXT UNIQUE NOT NULL,
overall_rating INTEGER DEFAULT 70 CHECK (overall_rating BETWEEN 1 AND 99),
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Partidas
CREATE TABLE public.matches (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
creator_id UUID REFERENCES public.profiles(id),
modality VARCHAR(10) NOT NULL CHECK (modality IN ('x1','x2','x5','x6','x7','x11')),
status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'finished')),
score_team_a INTEGER DEFAULT 0,
score_team_b INTEGER DEFAULT 0,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Atletas na Partida
CREATE TABLE public.match_players (
match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
queue_position INTEGER NOT NULL,
team VARCHAR(20) CHECK (team IN ('colete', 'sem_colete', 'proxima_1', 'proxima_2', 'proxima_3', 'unassigned')),
goals INTEGER DEFAULT 0,
assists INTEGER DEFAULT 0,
PRIMARY KEY (match_id, player_id)
);

-- Trigger para criar perfil automaticamente no login/cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$ BEGIN   INSERT INTO public.profiles (id, nome, apelido, overall_rating)   VALUES (     NEW.id,     COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', 'Atleta Súmula'),     COALESCE(NEW.raw_user_meta_data->>'apelido', SPLIT_PART(NEW.email, '@', 1)),     70   );   RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0b29e819-a60d-4a17-b5a1-bed8367ac0dc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
