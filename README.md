# VOXEL LEGENDS — protótipo jogável v0.1

MOBA voxel 3D original para PC, sem contas, multiplayer, assets pagos ou serviços externos obrigatórios. Three.js + TypeScript + Vite. Geometria e materiais são gerados por código.

## Execução

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Abra o endereço local indicado pelo Vite (normalmente http://localhost:5173).

```bash
npm test
npm run build
npm run preview
```

## Controles

- Botão direito no chão: mover. Botão direito em unidade inimiga: perseguir e atacar automaticamente.
- Q: cone flamejante na direção do cursor (90°, alcance 3,5, 90 dano bruto, 5 s de recarga).
- W: investida na direção do cursor (até 5 unidades, 70 dano bruto ao primeiro inimigo, 9 s).
- E: escudo de 150 pontos por 3 s (12 s).
- Espaço: centralizar/seguir câmera. S: parar movimento e cancelar investida. Scroll: zoom.
- Objetivo: destruir a torre vermelha. Derrota: Kael morrer. Botão de reinício ao final.

## Organização

- `main.ts`: estado da partida, passo fixo de 1/60 s, loop e orquestração.
- `renderer.ts`: cenário voxel, modelos procedurais, iluminação, efeitos e renderização Three.js.
- `camera.ts`: câmera ortográfica isométrica com seguimento suave e zoom.
- `input.ts`: controles, raycast no plano do chão e seleção de alvo.
- `data.ts`: valores estáticos de herói, habilidades, tropas, torre e mapa.
- `combat.ts`: entidades, dano, escudo, mitigação, movimento e distâncias.
- `skills.ts`: Q/W/E e recargas.
- `minions.ts`: IA das tropas.
- `towers.ts`: seleção de alvo e ataque automático da torre.
- `ui.ts`: HUD e estados de fim de jogo.
- `style.css`: identidade visual e layout.

## Regras e parâmetros assumidos na v0.1

- Mapa: 60 × 36 unidades, rota central de aproximadamente 7 unidades de largura.
- Kael: 720 HP, 65 ataque, 32 defesa, 5 un/s, alcance 1,8, intervalo 1 s.
- Tropas (ambos os times): 185 HP, 22 ataque, 8 defesa, 2,2 un/s, alcance 1,35, intervalo 1,4 s, aquisição de alvo em 5,5 unidades.
- Torre vermelha: 1.000 HP, 85 ataque, 25 defesa, alcance 8, intervalo 1,8 s.
- Dano efetivo = dano bruto × 100/(100+defesa). O escudo absorve dano mitigado antes do HP. Não há dano crítico, regeneração nem resistências separadas.
- Ondas: 3 tropas azuis e 3 vermelhas no início e a cada 15 s. Tropas atacam primeiro outras tropas, depois heróis, depois torres; empate por distância. Torre prioriza tropas, depois herói; empate por distância. Kael só ataca automaticamente o alvo selecionado com clique direito.
- Ataque básico e Q podem atingir torre. W para no primeiro inimigo atingido. Não há colisão física entre unidades, nem navegação em torno de obstáculos.

## Pendências conhecidas

- IA e pathfinding simples, sem desvio de obstáculos, sem sistema de colisão física.
- Câmera segue Kael permanentemente; espaço força recentralização.
- VFX, animação de membros e efeitos sonoros ainda básicos; sem mixagem de áudio.
- Seleção de inimigo é por proximidade do clique ao ponto projetado no chão (não por interseção precisa da malha).
- Não há aliados controláveis, habilidades R, minimapa, itens, experiência ou matchmaking; intencionalmente fora do escopo v0.1.
- Sem teste automatizado de ponta a ponta em navegador; testes unitários verificam regras de combate.

## Instalação facilitada no Windows

Extraia o ZIP para uma pasta e dê dois cliques em `INICIAR-JOGO.bat`. É necessário ter o Node.js LTS instalado e conexão com a internet na primeira execução. O script executa `npm install`, abre `http://localhost:5173` e inicia o servidor Vite. Mantenha a janela do terminal aberta enquanto joga.

Se o Node.js não estiver instalado, obtenha-o em https://nodejs.org/ e execute novamente o script.

**Validação neste ambiente:** a tentativa de `npm install` excedeu o tempo limite; por isso a instalação, compilação e execução no navegador não foram confirmadas.


## Correção v0.1.1 (14/11/2026)
- Corrigida atribuição inválida em `src/renderer.ts` que impedia a compilação do Vite.
- Ligado o evento `wheel` ao zoom da câmera.
- `INICIAR-JOGO.bat` agora roda `npm run build` antes de abrir o navegador, evitando mostrar uma tela de erro caso haja problemas.
- **Validação limitada:** `npm install` não foi possível neste ambiente por falha de DNS (`EAI_AGAIN` para registry.npmjs.org); compilação completa e teste no navegador continuam pendentes.

## Publicação no Render

Configurar como Static Site, branch `main`, comando de build `npm ci && npm run build`, diretório publicado `dist`. Node.js 22 definido em `.node-version`. Não requer banco de dados nem variáveis secretas.

Validação de publicação: instalação concluída, build TypeScript + Vite aprovado e 4 testes de combate aprovados. Execução visual no navegador ainda não verificada.
