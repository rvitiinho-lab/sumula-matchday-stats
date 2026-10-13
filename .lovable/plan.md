# MVP automático e Melhor da Noite do Súmula FC

## Dados disponíveis
Existem gols, assistências, desarmes, chutes no gol, defesas, faltas sofridas e faltas cometidas. Os registros atuais não distinguem defesa difícil nem tentativa de desarme de desarme bem-sucedido. Também não há minutos jogados ou cobertura completa dos lances de cada atleta. Acrescentar o registro explícito de defesa difícil, conforme solicitado, mantendo as defesas históricas como comuns.

Usar os totais individuais da súmula: eles recebem os lances e também as correções do organizador. Não misturar esses totais com a contagem dos eventos, pois isso duplicaria ações e ignoraria correções.

## Fórmula proposta
| Estatística registrada | Pontos por ação |
|---|---:|
| Gol | +5 |
| Assistência | +3 |
| Desarme | +2 |
| Defesa comum | +1 |
| Defesa difícil | +2 |
| Vitória na rodada | +2 |
| Chute no gol | +0,5 |
| Falta sofrida | +0,5 |
| Falta cometida | −0,5 |

**Pontuação = 5 × gols + 3 × assistências + 2 × desarmes + defesas comuns + 2 × defesas difíceis + 2 × vitórias + 0,5 × chutes no gol + 0,5 × faltas sofridas − 0,5 × faltas cometidas.**

Os mesmos pesos valem para todas as posições, sem bônus por overall ou posição. Três defesas difíceis ou três desarmes valem 6 pontos e podem superar um gol de 5 pontos. Chutes e faltas têm peso pequeno; o sistema soma somente o que foi registrado, sem presumir que um gol também foi lançado como chute no gol.

Esses pesos são uma regra inicial explicável, não uma medida comprovada de equilíbrio entre posições. Sem minutos jogados e qualidade dos lances, não é possível normalizar oportunidades nem medir a dificuldade das defesas.

**Defesas difíceis:** no registro de lances, oferecer “Defesa” e “Defesa difícil”. Cada defesa pertence a uma única categoria: difícil vale 2 no total, não 1 + 2. O total de defesas mostrado nos cards reúne ambas; a justificativa separa as quantidades. Lances antigos não serão reclassificados como difíceis.

**Vitória:** atribuir uma vitória por rodada aos atletas que terminarem confirmados em campo no time vencedor, usando o placar final salvo e preservando essa escalação no encerramento. Empate não dá pontos de vitória. Atletas que saíram continuam concorrendo com suas estatísticas, mas não recebem vitória por associação presumida ao time final. O bônus de vitória sozinho não comprova desempenho suficiente para definir MVP.

## Quando haverá um MVP
- Calcular o resultado somente após a partida ser encerrada.
- Considerar também quem saiu ou foi substituído, desde que tenha estatísticas da partida; não limitar a escolha aos titulares finais.
- Como proteção conservadora contra partidas de teste ou registro insuficiente, exigir pelo menos dois atletas com alguma ação registrada e uma maior pontuação positiva e única.
- Sem esses dados, mostrar **“MVP não definido — registros insuficientes”**, mantendo as estatísticas disponíveis.
- Em empate na maior pontuação, mostrar os atletas empatados e suas pontuações, sem inventar um desempate por chegada, posição, overall ou sorteio.
- Apresentar o resultado como desempenho **registrado**, sem afirmar que lances não registrados não aconteceram.

## Mudanças nas telas
- Remover votações, notas pós-jogo e premiações separadas de Craque, Bagre e Muralha da experiência atual. Preservar os dados históricos e os valores atuais de overall; o MVP não atualiza o overall.
- Ao encerrar a partida, abrir diretamente a súmula com o MVP em destaque ou o estado sem vencedor.
- Exibir pontuação e contribuição de cada estatística para justificar a escolha.
- Criar card especial do MVP com creme, verde e tipografia esportiva das referências já usadas no app, frase de até 120 caracteres e opção de salvar. Não há acesso ao Figma ao vivo; preservar a identidade das imagens de referência existentes.
- Manter gols, assistências, desarmes e defesas nos resultados e nos cards individuais, incluindo atletas que saíram com estatísticas registradas.
- Fazer links antigos de avaliação levarem à súmula, sem quebrar URLs compartilhadas.

## Rodadas e Melhor da Noite
- Reunir somente **rodadas da mesma pelada**, conforme escolhido. Não agrupar jogos apenas por data ou organizador.
- Cada rodada tem seu placar, estatísticas e MVP. A pontuação calculada pela fórmula acima é a nota de desempenho daquele jogo, sem votação e sem conversão artificial para uma escala de 0 a 10.
- **Pontuação da noite = soma das pontuações de desempenho das rodadas encerradas.** Mostrar também quantos MVPs cada atleta conquistou.
- Quem tiver a maior soma positiva será o Melhor da Noite; se houver empate, vence quem conquistou mais MVPs. Persistindo empate, mostrar os empatados sem escolher arbitrariamente.
- MVPs funcionam como desempate, não como bônus somado: evita contar duas vezes o mesmo desempenho. Todas as rodadas válidas contam, sem descartar jogos ruins ou selecionar apenas a melhor nota.
- Exigir pelo menos dois atletas com ações registradas no conjunto da pelada. Rodadas sem vencedor ainda podem contribuir com estatísticas válidas; rodada sem ações não acrescenta pontos nem MVP.
- O organizador, que já administra a pelada no app, pode iniciar outra rodada ou **encerrar a pelada**. Não criar um novo administrador global ou ampliar permissões para outros usuários.
- Ao encerrar a pelada, finalizar também a rodada em andamento, salvar placar e estatísticas e divulgar automaticamente todos os MVPs por rodada e o Melhor da Noite. Não exigir votação, encerramento de votação ou outro botão para liberar os prêmios.
- Disponibilizar os resultados para todos que acessarem a pelada, não apenas para quem encerrou; atualizar automaticamente as telas abertas para revelar os cards assim que o encerramento for confirmado. Isso é divulgação dentro do app, sem acrescentar envio por e-mail, WhatsApp ou notificações externas.
- Exibir classificação com total de pontos, MVPs conquistados e desempenho por rodada, além de card especial **Melhor da Noite** com estatísticas acumuladas.
- O premiado pode escrever e salvar um recado de até 120 caracteres no próprio card; incluir o recado no card baixado. Manter também o card do MVP de cada rodada.
- Preservar partidas antigas como peladas de uma rodada, sem criar rodadas ou dados fictícios.

## Detalhes técnicos e validação
- Reunir rodadas, salvar o recado e registrar defesas difíceis exige dados adicionais: acrescentar somente o vínculo entre rodadas, estado de encerramento da pelada, recado e distinção das defesas, sem excluir ou sobrescrever registros históricos. Preservar a escalação de encerramento para calcular vitórias sem depender de mudanças posteriores na fila.
- Manter cada rodada como uma partida com seus totais já existentes, vinculada à pelada. Criar a próxima rodada com participantes e fila preservados, estatísticas próprias zeradas e autorização do organizador; não reutilizar os totais da rodada anterior.
- Proteger criação de rodadas e encerramento para o organizador, e edição do recado para o premiado autenticado. Validar essas ações no banco, não apenas nos botões.
- Calcular MVP e Melhor da Noite de forma determinística em módulo puro compartilhado e testado, separado do overall.
- Preservar presença, FIFO, sorteio, registro e desfazer lances, correções existentes, sessão e perfil.
- Testar pesos concretos, defesa comum = 1, defesa difícil = 2 sem dupla contagem, vitória = 2 e empate = 0; vitórias de goleiro e defensor no cálculo do MVP, independência do overall, jogador substituído, empate, pontuação não positiva e dados insuficientes.
- Testar soma entre rodadas da mesma pelada, isolamento entre peladas, desempate por MVPs, encerramento e permissão/limite do recado.
- Conferir encerramento único e divulgação automática em duas telas abertas, com leitura do resultado pela interface e dados reais disponíveis, sem criar estatísticas fictícias na conta do usuário.