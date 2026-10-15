# Ranking Global competitivo — análise e proposta

## 1. O que existe hoje

A base já guarda atletas, OVR, peladas e suas rodadas, participantes, escalação final, placar, cronômetro e lances individuais. Há gols, assistências, desarmes, chutes no gol, faltas, defesas comuns e difíceis. Os MVPs já são calculados automaticamente e continuarão intactos.

Conferência da base atual: **1 atleta, 8 rodadas, 7 encerradas, 4 peladas encerradas e 5 lances**. Nenhuma rodada encerrada tem simultaneamente o histórico necessário de dois times e a duração mínima proposta. Portanto, o ranking começará vazio — não haverá preenchimento fictício nem qualificação retroativa por suposição.

Já existem controles de participante único por rodada, chegada única, número único de rodada por pelada, atualização atômica dos lances e bloqueio de alterações após encerramento.

**Limites importantes:** não há minutos individuais em campo, histórico completo de substituições, confirmação do placar pelos adversários, localização regional nem temporadas. Não será inventada nenhuma dessas informações.

## 2. Três métricas independentes

- **OVR:** nível técnico já armazenado no perfil; não entra na fórmula competitiva e não será alterado.
- **MVPs:** total de prêmios reais, exibido como informação; não dá bônus competitivo nem muda o cálculo atual do MVP. Empates sem vencedor continuam sem prêmio.
- **Pontuação Competitiva:** novo cálculo de leitura para ordenar o ranking, sem campo editável pelo atleta ou organizador.

## 3. Proposta de partidas válidas e qualificação

Considerar somente rodadas de **peladas encerradas**, com início e fim registrados, pelo menos **10 minutos efetivos no cronômetro**, placar não negativo coerente com os gols registrados e pelo menos um atleta real em cada time.

Uma rodada precisa ter lances registrados por pelo menos **dois atletas distintos**, para não converter encontros sem informação suficiente em resultados competitivos. Um 0×0 pode valer se houver outros lances; um jogo sem lances não vale.

Para o atleta, contar somente rodadas em que terminou confirmado no Colete ou Sem Colete. Reservas não recebem jogos, derrotas ou vitórias por associação. Quem saiu mantém suas estatísticas e seus direitos no MVP atual, mas a rodada não entra no ranking dele nesta primeira versão: não há registro confiável de tempo individual para outra regra.

**Qualificação oficial: 5 peladas válidas distintas.** Várias rodadas da mesma pelada viram uma única participação competitiva, evitando que dividir uma pelada em muitos jogos acelere artificialmente a classificação.

Mostrar “3/5 participações válidas — faltam 2” e os motivos de exclusão dos próprios jogos. Antes da qualificação, o atleta vê seu progresso, mas não recebe posição oficial.

## 4. Fórmula proposta, escala de 0 a 100

Para cada rodada válida do atleta:

```text
A = máximo(0,
    5 × gols + 3 × assistências + 2 × desarmes
    + 1 × defesas comuns + 2 × defesas difíceis
    + 0,5 × chutes no gol + 0,5 × faltas sofridas
    − 0,5 × faltas cometidas)

D = 70 × A / (A + 10)
R = 30 na vitória, 15 no empate, 0 na derrota
C = D + R
```

A contribuição individual se aproxima de 70, com ganhos decrescentes, e o resultado contribui com até 30. Assim, volume excessivo de lances não cresce ilimitadamente. Defensores e goleiros têm caminhos explícitos para pontuar; posição, OVR e MVP não dão vantagem automática.

Os pesos de ações mantêm familiaridade com as estatísticas atuais, mas esta fórmula é independente: **não reutiliza os pontos totais do MVP nem acrescenta novamente seu bônus de vitória**.

Exemplos matemáticos, não dados do ranking: 2 gols, 5 desarmes ou 5 defesas difíceis geram A=10 e D=35; 10 defesas comuns também. Se o time vence, C=65.

Calcular a média de C das rodadas válidas de cada atleta dentro de uma pelada. Depois:

```text
n = número de peladas válidas do atleta
Pontuação Competitiva = (soma das médias por pelada + 3 × 50) / (n + 3)
```

O ponto de referência 50 e o peso de 3 participações reduzem distorções de amostras pequenas. Isso não cria partidas fictícias: é uma regularização matemática apresentada na regra. Com 5 peladas de média 65, a pontuação será 59,375 (59,4 na tela).

Partidas extras não dão pontos por si mesmas: ajudam ou prejudicam conforme a qualidade dos resultados. Não aplicar penalidade por inatividade nesta etapa. A ausência de minutos individuais e diferenças entre modalidades impedem prometer igualdade perfeita de oportunidades; não haverá normalização inventada por tempo ou posição.

## 5. Desempate

1. Maior Pontuação Competitiva, antes do arredondamento exibido.
2. Maior média individual D, calculada primeiro por pelada e depois entre peladas.
3. Maior proporção de vitórias, também com peso igual por pelada.
4. Persistindo igualdade, compartilhar a posição (1, 2, 2, 4). Apelido e identificador servem apenas para apresentação estável, não para conceder vantagem.

OVR, total de MVPs e quantidade bruta de jogos não desempatarão.

## 6. Integridade e limites antifraude

**Já disponível:** operações com usuário identificado; criador e mesários autorizados para lances; contador e placar atualizados juntos; chaves únicas dos participantes/rodadas; resultados encerrados protegidos.

**Necessário antes de chamar a classificação de oficial:**

- Calcular a pontuação em leitura confiável, nunca aceitar pontuação enviada pelo navegador.
- Conferir cada contador individual e o placar contra os lances persistidos; dados incoerentes ficam fora do ranking, sem corrigir silenciosamente o histórico.
- Proteger o caminho de gravação contra alterações diretas dos contadores/placar e impedir exclusão de resultados encerrados que já sustentam a classificação. A análise encontrou permissões amplas do criador durante a partida e permissão de apagar peladas; os bloqueios devem preservar as ações legítimas existentes.
- Preservar a correção legítima de placar e estatísticas pelo organizador, encaminhando-a por operação validada e rastreável; não retirar botões existentes nem simplesmente transformar correções em lances fictícios. Correções sem evidência consistente não entram no ranking. A implementação desse controle será revisada antes de qualquer restrição de gravação.
- Reutilizar o identificador do lance em tentativas repetidas da mesma operação; gravar uma vez, sem confundir dois gols legítimos no mesmo minuto. Desabilitar o envio enquanto estiver salvando.
- Validar valores não negativos, tipo de lance, time e atleta ativo, relógio e estado da rodada; encerramento e atualização permanecem atômicos.
- Deduplicar a leitura por rodada/atleta e agrupar por pelada. Nada será somado novamente a cada atualização da tela.
- Testar acesso como criador, mesário, atleta e visitante, além de duplicidade, resultados inconsistentes e partidas encerradas.

**Limitação honesta:** registros no app não comprovam que uma partida aconteceu fisicamente. Um organizador autorizado ainda pode inventar lances ou combinar resultados com outros atletas. Não há identidade esportiva verificada, confirmação adversária ou arbitragem independente. Esta etapa oferece integridade digital e regras de elegibilidade, não garantia absoluta contra fraude real. Confirmação dos adversários e contestação exigiriam uma etapa posterior, não serão implantadas escondidas.

## 7. O que será construído após aprovação

- Nova entrada **Ranking** na navegação, sem remover Início, Resultados ou Perfil.
- Lista adaptada ao celular e computador: posição, avatar, apelido/nome, pontuação, OVR e MVPs.
- Faixa fixa com a posição do próprio atleta ou progresso de qualificação, sem encobrir o menu ou a lista.
- Perfil de consulta do atleta selecionado com estatísticas reais; sem permitir editar dados de outra pessoa.
- Carregamento, vazio, erros com nova tentativa e destaque para empates.
- Tema carbono/neon existente e acesso restrito a usuários conectados, como as consultas sociais atuais.

## 8. Detalhes técnicos e testes

- Componentes em `src/components/ranking/` e hook `src/hooks/useCompetitiveRanking.ts`.
- Fórmula e seleção em módulo puro próprio, com testes; `performance.ts` e a seleção de MVP permanecem intactos.
- Consultas compartilhadas com TanStack Query e preparação no carregamento da rota autenticada `/ranking`; perfil consultável em rota autenticada própria.
- Cálculo autoritativo e agregação em função de leitura do banco sobre as tabelas existentes, disponível apenas para usuários autenticados. Não criar tabelas de ranking, copiar resultados ou armazenar uma pontuação editável.
- Uma migração aditiva, se aprovada, para a função de leitura e as proteções de integridade necessárias; preservar dados, nomes e fluxos existentes. Revisar os caminhos de escrita antes de restringi-los.
- Separar fonte dos dados, elegibilidade, cálculo e apresentação. Preparar parâmetros de escopo para amigos, região e temporada, sem inventar regiões/datas ou construir suas abas agora.
- Testes concretos: 5 peladas para qualificar; 10 minutos; 2 atletas com lances; exclusão de reservas/dados incoerentes; média por pelada; pesos e fórmula; regularização; empate; isolamento do OVR/MVP; duplicidade e permissões.
- Validar a experiência vazia com os dados atuais. Conferência de uma classificação populada exige atletas e partidas reais suficientes; não criar dados fictícios para contornar isso.

## Fora desta etapa

Pagamentos, planos, assinaturas, rankings regionais/amigos/temporadas completos, confirmação adversária e reformulação das peladas ou premiações.

**Aguardar aprovação destas regras antes de gerar código, alterar o banco ou construir as telas.**