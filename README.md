# iOSKey

Teclado Android leve, configurável e inspirado na clareza do teclado do iOS. O iOSKey usa uma identidade visual própria, autocorreção local e sugestões sem depender de rede durante a digitação.

## O que já está incluído

- Método de entrada Android (`InputMethodService`) com letras, espaço, apagar, enter e pontuação.
- Preview do teclado no painel do app.
- Ajuste persistente de altura entre 220 e 360 dp.
- Atalhos para ativar o iOSKey e escolher o teclado ativo.
- Autocorreção local compacta e barra de sugestões.
- Configurações locais para autocorreção, sugestões e tema.
- Config plugin Expo que injeta o serviço nativo durante o prebuild.

## Como usar no Android

1. Instale o APK no dispositivo.
2. Abra o iOSKey e toque em **Ativar teclado**.
3. Na tela do Android, habilite **iOSKey**.
4. Volte ao app e toque em **Escolher teclado** para selecioná-lo.
5. Ajuste a altura, autocorreção e sugestões no painel. Toque em **Aplicar preferências**.

O Android exibe um aviso de segurança para métodos de entrada de terceiros. O iOSKey não envia o texto digitado para a internet; a autocorreção inicial é local.

## Build do APK

O starter Mobile usa Expo e o build nativo deve ser iniciado pelo Dashboard/fluxo de build do projeto, não pelo servidor Metro. Antes do build, confirme que o prebuild aplica `plugins/with-native-keyboard.js`.

O artefato distribuível esperado é um APK de teste/instalação direta. Para publicação em loja, gere um AAB assinado conforme as credenciais do projeto.

## GitHub

O projeto pode ser conectado ao GitHub pelo conector do Manus. Depois de conectar um repositório, publique o código-fonte, `README.md` e o APK gerado em uma Release. O APK não é produzido pelo Preview Web; ele só pode ser anexado após o resultado real do build nativo.

## Limites atuais

O dicionário local inicial é deliberadamente pequeno para manter baixo consumo de RAM. Ele pode ser expandido em versões futuras ou substituído por um modelo local opcional, sem colocar rede no caminho crítico da digitação.
