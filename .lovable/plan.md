# MVP automático do Súmula FC

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

## Detalhes técnicos e validação
- Nenhuma alteração de esquema ou exclusão de dados no banco. Calcular o MVP de forma determinística a partir dos totais persistidos, em módulo puro compartilhado e testado.
- Preservar presença, FIFO, sorteio, registro e desfazer lances, correções existentes, sessão e perfil.
- Testar pesos concretos, vitórias de goleiro e defensor, independência do overall, jogador substituído, empate, pontuação não positiva e dados insuficientes.
- Conferir encerramento e leitura do resultado pela interface com dados reais disponíveis, sem criar estatísticas fictícias na conta do usuário.