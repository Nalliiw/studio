# apphosting.yaml
# Este arquivo configura o seu backend "studio" no Firebase App Hosting.

runtime: nodejs20 # Ou nodejs18

env:
  # Variáveis para o Projeto Firebase Principal (Project A - onde este app frontend está hospedado)
  # Estas são usadas se o frontend interage diretamente com os serviços do Project A.
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: "SUA_API_KEY_PROJETO_A_AQUI"
  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    value: "SEU_AUTH_DOMAIN_PROJETO_A_AQUI"
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    value: "nutritrack-lite-x6ffb" # ID do seu projeto principal
  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    value: "SEU_STORAGE_BUCKET_PROJETO_A_AQUI"
  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    value: "SEU_MESSAGING_SENDER_ID_PROJETO_A_AQUI"
  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
    value: "1:235653291259:web:35955c0ef9c8311dd3645e" # App ID do seu projeto principal

  # Variáveis para o SEGUNDO Projeto Firebase (Project B - o outro projeto ao qual você quer se conectar)
  # Substitua pelos valores reais do SEU SEGUNDO PROJETO FIREBASE
  # Estas são usadas se o frontend precisa interagir com um Project B separado.
  - variable: NEXT_PUBLIC_PROJECT_B_API_KEY
    value: "API_KEY_DO_PROJETO_B_AQUI"
  - variable: NEXT_PUBLIC_PROJECT_B_AUTH_DOMAIN
    value: "AUTH_DOMAIN_DO_PROJETO_B_AQUI"
  - variable: NEXT_PUBLIC_PROJECT_B_PROJECT_ID
    value: "PROJECT_ID_DO_PROJETO_B_AQUI"
  - variable: NEXT_PUBLIC_PROJECT_B_STORAGE_BUCKET
    value: "STORAGE_BUCKET_DO_PROJETO_B_AQUI"
  - variable: NEXT_PUBLIC_PROJECT_B_MESSAGING_SENDER_ID
    value: "MESSAGING_SENDER_ID_DO_PROJETO_B_AQUI"
  - variable: NEXT_PUBLIC_PROJECT_B_APP_ID
    value: "APP_ID_DO_PROJETO_B_AQUI"

  # Variável para a URL do seu backend separado (se diferente do Project B)
  # Usada se você tem um backend customizado (ex: Cloud Run, Cloud Functions, etc.)
  - variable: NEXT_PUBLIC_BACKEND_API_URL
    value: "SUA_URL_REAL_DO_BACKEND_AQUI"

# Configurações de build para sua aplicação Next.js
# O Firebase App Hosting geralmente infere os passos de build para projetos Next.js padrão.
build:
  # Se seu package.json e next.config.js não estão na raiz, especifique workspaceDir.
  # workspaceDir: /

# Configurações de como servir sua aplicação Next.js
# Para um projeto Next.js padrão, o App Hosting geralmente consegue inferir o comando.
# serverCommand: npm run start