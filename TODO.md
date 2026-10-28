# iOSKey — entregas

## Teclado Android funcional como método de entrada

- [ ] O APK deve declarar um serviço Android `InputMethodService` com fluxo de ativação e seleção nas configurações do sistema.
- [ ] O teclado deve inserir letras, espaço, apagar, quebra de linha e pontuação no campo de texto ativo.
- [ ] O painel deve oferecer atalhos para abrir as configurações de métodos de entrada e o seletor de teclado.

## Interface customizada inspirada no iOS

- [ ] O layout de digitação deve ter interface totalmente customizada, estética minimalista inspirada na experiência do iOS e componentes visuais originais.
- [ ] A tela de configuração deve incluir um preview coerente com o teclado real e identidade visual própria.
- [ ] Toques devem ter feedback visual rápido, com teclas grandes o suficiente para uso com uma mão.

## Personalização persistente

- [ ] O usuário deve editar a altura do teclado por meio de uma configuração simples e persistente.
- [ ] O preview deve refletir a altura escolhida e o IME deve ler a mesma preferência no Android.
- [ ] O usuário deve conseguir alternar autocorreção, sugestões e aparência sem rede.

## Autocorreção e sugestões

- [ ] O teclado deve oferecer autocorreção local durante a digitação, começando por um dicionário compacto em português e inglês.
- [ ] Deve existir uma barra de sugestões relevantes ao texto digitado.
- [ ] Ao tocar em uma sugestão, a palavra atual deve ser substituída no campo de texto.

## Leveza e distribuição

- [ ] A arquitetura deve evitar chamadas de rede no caminho de digitação, bibliotecas pesadas e imagens no IME.
- [ ] O projeto deve conter documentação de instalação, ativação, build e publicação.
- [ ] O projeto deve estar preparado para gerar APK/AAB no Dashboard e para receber o artefato na página/repositório do GitHub do usuário.
