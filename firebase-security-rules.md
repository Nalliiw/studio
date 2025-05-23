
## Regras de Segurança Sugeridas para Firebase

**Lembrete Importante:** Estas regras são sugestões e precisam ser adaptadas e testadas cuidadosamente no seu ambiente Firebase. A segurança dos seus dados é crucial!

### Regras de Segurança do Firestore

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Regras para a coleção 'companies' (clínicas)
    match /companies/{companyId} {
      // PERMISSÃO DE LEITURA:
      // Opção 1 (Mais segura, se companyId estiver no token JWT do usuário):
      // Permite leitura se o usuário estiver autenticado e seu companyId (do token)
      // corresponder ao ID do documento da empresa que está sendo lido.
      // allow read: if request.auth != null && request.auth.token.companyId == companyId;

      // Opção 2 (Mais simples para começar, se companyId não estiver no token):
      // Permite leitura se o usuário estiver autenticado. A lógica de qual empresa buscar
      // é controlada pela sua API (que usaria o companyId do perfil do usuário).
      allow read: if request.auth != null;

      // PERMISSÃO DE CRIAÇÃO:
      // Permite criação se o usuário estiver autenticado.
      // Idealmente, restrinja isso. Se o admin da clínica cria sua própria empresa:
      // allow create: if request.auth != null && request.auth.token.companyId == companyId;
      // (e o ID do documento deve ser o companyId)
      // Por enquanto, para desbloquear:
      allow create: if request.auth != null;

      // PERMISSÃO DE ATUALIZAÇÃO:
      // Opção 1 (Mais segura):
      // Permite atualização se o usuário estiver autenticado e seu companyId (do token)
      // corresponder ao ID do documento da empresa.
      // allow update: if request.auth != null && request.auth.token.companyId == companyId;

      // Opção 2 (Mais simples para começar):
      // Permite atualização se o usuário estiver autenticado.
      // A API deve validar se o usuário tem permissão para atualizar ESTA empresa.
      allow update: if request.auth != null;

      // PERMISSÃO DE EXCLUSÃO:
      // Geralmente muito restrito. Exemplo: desabilitar exclusão por enquanto.
      // allow delete: if false;
    }

    // Regras para a coleção 'teamMembers' (membros da equipe da clínica)
    match /teamMembers/{memberId} {
      // Permite leitura se o usuário estiver autenticado e o clinicId do membro
      // corresponder ao companyId (do token) do usuário.
      // Isso permite que membros da mesma clínica vejam uns aos outros.
      allow read: if request.auth != null && request.auth.token.companyId == resource.data.clinicId;

      // Permite criação se o usuário estiver autenticado e o clinicId do novo membro
      // corresponder ao companyId (do token) do usuário que está criando (admin da clínica).
      allow create: if request.auth != null && request.resource.data.clinicId == request.auth.token.companyId;

      // Permite atualização se o usuário estiver autenticado e o clinicId do membro
      // corresponder ao companyId (do token) do usuário (admin da clínica).
      // Você pode querer permitir que um membro edite seu próprio perfil também (ex: if request.auth.uid == memberId).
      allow update: if request.auth != null && request.auth.token.companyId == resource.data.clinicId;

      // Permite exclusão se o usuário estiver autenticado e o clinicId do membro
      // corresponder ao companyId (do token) do usuário (admin da clínica).
      allow delete: if request.auth != null && request.auth.token.companyId == resource.data.clinicId;
    }

    // Regras para a coleção 'flows' (fluxos de acompanhamento)
    match /flows/{flowId} {
      // Permite que o especialista (nutritionistId) que criou o fluxo o leia.
      allow read: if request.auth != null && request.auth.uid == resource.data.nutritionistId;

      // Permite que um especialista crie um fluxo se o nutritionistId do novo fluxo
      // for o UID do especialista autenticado.
      allow create: if request.auth != null && request.resource.data.nutritionistId == request.auth.uid;

      // Permite que o especialista que criou o fluxo o atualize.
      allow update: if request.auth != null && request.auth.uid == resource.data.nutritionistId;

      // Permite que o especialista que criou o fluxo o delete.
      allow delete: if request.auth != null && request.auth.uid == resource.data.nutritionistId;
    }

    // Adicione regras para outras coleções (pacientes, agendamentos, etc.) aqui.
  }
}
```

**Nota sobre `request.auth.token.companyId`:**
Esta condição assume que o `companyId` está disponível como um "Custom Claim" no token de autenticação do Firebase do usuário. Se você não configurou custom claims, você precisará:
1.  Simplificar as regras (ex: `allow read: if request.auth != null;` para a coleção `companies`) e
2.  Garantir que suas **API Routes no Next.js** façam a validação de que o usuário autenticado tem permissão para acessar/modificar os dados específicos da clínica. Por exemplo, ao buscar uma empresa, sua API deve usar o `companyId` do perfil do usuário logado (se disponível no frontend via `useAuth`) e não um `companyId` vindo diretamente do cliente sem validação.

---

### Regras de Segurança do Firebase Storage

```javascript
rules_version = '2';

// Substitua {YOUR_BUCKET_NAME} pelo nome real do seu bucket de storage
// (ex: nutritrack-lite-x6ffb.appspot.com)
service firebase.storage {
  match /b/{YOUR_BUCKET_NAME}/o {

    // Regras para logos de clínicas
    // Caminho de exemplo: clinic_logos/ID_DA_CLINICA/nome_do_arquivo.ext
    match /clinic_logos/{companyId}/{fileName} {
      // Permite que qualquer um leia os logos (logos geralmente são públicos).
      // Ajuste para 'if request.auth != null;' se precisar de autenticação para ler.
      allow read: if true;

      // Permite escrita (upload) se:
      // 1. O usuário estiver autenticado.
      // 2. O companyId no token de autenticação corresponder ao companyId no caminho do arquivo.
      // 3. O tamanho do arquivo for menor que 5MB.
      // 4. O tipo de conteúdo for uma imagem comum.
      allow write: if request.auth != null &&
                      request.auth.token.companyId == companyId &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      (request.resource.contentType.matches('image/jpeg') ||
                       request.resource.contentType.matches('image/png') ||
                       request.resource.contentType.matches('image/gif') ||
                       request.resource.contentType.matches('image/webp'));
    }

    // Regras para favicons de clínicas (se armazenados separadamente)
    // Caminho de exemplo: clinic_favicons/ID_DA_CLINICA/favicon.ico
    match /clinic_favicons/{companyId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null &&
                      request.auth.token.companyId == companyId &&
                      request.resource.size < 1 * 1024 * 1024 && // Favicons são menores
                      (request.resource.contentType.matches('image/vnd.microsoft.icon') ||
                       request.resource.contentType.matches('image/x-icon') ||
                       request.resource.contentType.matches('image/png'));
    }

    // Adicione regras para outros caminhos/tipos de arquivos conforme necessário.
  }
}
```

**Como Aplicar:**
1.  Vá para o seu projeto no **Firebase Console**.
2.  Para **Firestore**: Navegue até Firestore Database > Aba "Regras". Copie e cole as regras do Firestore, ajuste se necessário (especialmente as condições `request.auth.token.companyId`), e clique em "Publicar".
3.  Para **Storage**: Navegue até Storage > Aba "Regras". Copie e cole as regras do Storage, **substitua `{YOUR_BUCKET_NAME}` pelo nome do seu bucket**, ajuste se necessário, e clique em "Publicar".

Após publicar, teste as funcionalidades do seu aplicativo para garantir que as permissões estejam corretas.
    
    