# iOSKey — plano de implementação

## Escopo

O iOSKey será um teclado Android funcional (IME) com identidade visual própria, inspirado na clareza e na fluidez percebidas no teclado do iOS, sem reproduzir marcas, nomes ou ativos proprietários. O APK deverá ser distribuível e acompanhado de instruções de instalação, ativação e publicação no GitHub.

## Arquitetura

- **App Expo/React Native/TypeScript:** tela de configuração com preview visual do teclado, ajuste persistente de altura, seletor de aparência, alternância de autocorreção e sugestões, além dos atalhos para abrir as configurações do Android e o seletor de teclado.
- **Módulo nativo Android via config plugin:** serviço `InputMethodService` declarado no AndroidManifest, com uma `View` customizada que desenha as teclas, trata toque, backspace, enter, espaço, sugestões e autocorreção local. O módulo nativo compartilha preferências simples por `SharedPreferences`.
- **Persistência:** `AsyncStorage` mantém a experiência do painel; `SharedPreferences` é a fonte usada pelo IME para altura, tema, autocorreção e sugestões.
- **Leveza:** sem rede no caminho de digitação, sem modelos pesados e sem imagens no teclado. Dicionário local compacto, desenho via Canvas e apenas estados necessários para a sessão.
- **Build:** o projeto mantém o starter Expo fixo. O config plugin injeta o serviço, os recursos XML, a ponte nativa e o pacote Android durante o prebuild. O Dashboard deverá gerar o APK/AAB; o repositório também terá instruções e workflow opcional do GitHub Actions.

## Estrutura principal

- `app/(tabs)/index.tsx`: painel de configuração e preview.
- `components/keyboard-preview.tsx`: preview reutilizável do layout e das teclas.
- `lib/keyboard-preferences.ts`: ponte TypeScript com fallback web/Expo e persistência.
- `plugins/with-native-keyboard.js`: config plugin que registra o IME e escreve o código Android nativo.
- `android/` gerado pelo prebuild: serviço, view, pacote nativo e recursos do IME.
- `assets/images/*`: identidade visual do launcher e splash.
- `README.md`: instalação, ativação do método de entrada, build e publicação.

## Design

### Alternativas consideradas

1. **Glass minimalista frio** (probabilidade 0,07): branco translúcido, azul-gelo e sombras muito discretas.
2. **Soft-neumorphism pastel** (probabilidade 0,06): superfícies claras, teclas elevadas e lilás suave.
3. **Noir editorial com lima elétrica** (probabilidade 0,05): base quase preta, cartões marfim e lima como sinal de ação.

### Direção escolhida: Noir editorial com lima elétrica

- **Movimento:** editorial digital contemporâneo, com contraste de estúdio e controles compactos.
- **Princípios:** leitura imediata, toque generoso, poucos elementos persistentes e feedback visual curto.
- **Cores:** fundo carvão `#111214`, superfícies `#1B1D21`, texto marfim `#F5F1E8`; lima `#D8F56A` apenas para ação, estado ativo e foco. O contraste reduz ruído e faz a configuração parecer uma central de controle leve.
- **Layout:** cabeçalho assimétrico com marca e estado no topo; cards empilhados em fluxo vertical; preview do teclado como peça principal, sem grade de dashboard.
- **Assinaturas:** ponto-lima no wordmark, pílulas de estado com contorno, teclas arredondadas em três tons para separar letras, ações e espaço.
- **Interação:** controles devem responder com mudança de opacidade/escala curta; alterações de altura atualizam o preview imediatamente e persistem ao tocar em Aplicar.
- **Animação:** 140–180 ms para pressionar botões, 220 ms para mudança de altura; sem loops decorativos e sem animação na área do IME que aumente consumo.
- **Tipografia:** sistema nativo para desempenho; títulos em peso 800, labels em 700, corpo em 400–500. Números de altura com tracking visual amplo.
- **Essência:** “um teclado limpo, configurável e econômico para quem quer digitar com mais personalidade”; direto, calmo, preciso.
- **Voz:** “Seu teclado, no seu tamanho.” e “Ative uma experiência mais limpa ao digitar.”
- **Wordmark:** `iOSKey` em caixa mista com ponto-lima antes da palavra; o ponto é o indicador de estado e não um ícone de terceiro.
- **Cor proprietária:** lima elétrica `#D8F56A`.

## Restrições e trade-offs

- O dicionário e a autocorreção iniciais são locais e compactos; isso favorece RAM e privacidade, mas não pretende substituir um dicionário online completo.
- A tela de configuração pode ser visualizada no Expo Web, porém o comportamento de IME precisa de APK instalado e ativado no Android.
- O APK não deve ser declarado pronto antes de um build real no Dashboard; o código e o fluxo de build ficarão prontos para essa etapa.
