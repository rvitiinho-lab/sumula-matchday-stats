# MVP automático e Melhor da Noite do Súmula FC

## Dados disponíveis
Existem gols, assistências, desarmes, chutes no gol, defesas, faltas sofridas e faltas cometidas. Os registros não distinguem defesa difícil nem tentativa de desarme de desarme bem-sucedido. Também não há minutos jogados ou cobertura completa dos lances de cada atleta.

Usar os totais individuais da súmula: eles recebem os lances e também as correções do organizador. Não misturar esses totais com a contagem dos eventos, pois isso duplicaria ações e ignoraria correções.

## Fórmula proposta
| Estatística registrada | Pontos por ação |
|---|---:|
| Gol | +5 |
| Assistência | +3 |
| Desarme | +2 |
| Defesa | +2 |
| Chute no gol | +0,5 |
| Falta sofrida | +0,5 |
| Falta cometida | −0,5 |

**Pontuação = 5 × gols + 3 × assistências + 2 × desarmes + 2 × defesas + 0,5 × chutes no gol + 0,5 × faltas sofridas − 0,5 × faltas cometidas.**

Os mesmos pesos valem para todas as posições, sem bônus por overall ou posição. Três defesas ou três desarmes valem 6 pontos e podem superar um gol de 5 pontos. Chutes e faltas têm peso pequeno; o sistema soma somente o que foi registrado, sem presumir que um gol também foi lançado como chute no gol.

Esses pesos são uma regra inicial explicável, não uma medida comprovada de equilíbrio entre posições. Sem minutos jogados e qualidade dos lances, não é possível normalizar oportunidades nem medir a dificuldade das defesas.

**Defesas difíceis:** nesta versão, todas as defesas valem 2 pontos. Não atribuir dificuldade inexistente. Valorizar defesas difíceis exigiria acrescentar seu registro durante a partida; isso fica fora desta mudança para preservar o banco atual.

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
- O organizador pode iniciar outra rodada ou **encerrar a pelada**. Revelar o Melhor da Noite somente ao encerrar a pelada e com todas as rodadas encerradas.
- Exibir classificação com total de pontos, MVPs conquistados e desempenho por rodada, além de card especial **Melhor da Noite** com estatísticas acumuladas.
- O premiado pode escrever e salvar um recado de até 120 caracteres no próprio card; incluir o recado no card baixado. Manter também o card do MVP de cada rodada.
- Preservar partidas antigas como peladas de uma rodada, sem criar rodadas ou dados fictícios.

## Detalhes técnicos e validação
- O MVP isolado não exige mudança de esquema. O pedido de reunir rodadas e salvar o recado exige um vínculo persistente entre elas, estado de encerramento da pelada e armazenamento do recado: acrescentar somente esses dados necessários, sem excluir ou sobrescrever registros históricos.
- Manter cada rodada como uma partida com seus totais já existentes, vinculada à pelada. Criar a próxima rodada com participantes e fila preservados, estatísticas próprias zeradas e autorização do organizador; não reutilizar os totais da rodada anterior.
- Proteger criação de rodadas e encerramento para o organizador, e edição do recado para o premiado autenticado. Validar essas ações no banco, não apenas nos botões.
- Calcular MVP e Melhor da Noite de forma determinística em módulo puro compartilhado e testado, separado do overall.
- Preservar presença, FIFO, sorteio, registro e desfazer lances, correções existentes, sessão e perfil.
- Testar pesos concretos, vitórias de goleiro e defensor, independência do overall, jogador substituído, empate, pontuação não positiva e dados insuficientes.
- Testar soma entre rodadas da mesma pelada, isolamento entre peladas, desempate por MVPs, encerramento e permissão/limite do recado.
- Conferir encerramento e leitura do resultado pela interface com dados reais disponíveis, sem criar estatísticas fictícias na conta do usuário.