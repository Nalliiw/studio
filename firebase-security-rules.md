## Regras de Segurança Sugeridas para Firebase

**Lembrete Importante:** Estas regras são sugestões e precisam ser adaptadas e testadas cuidadosamente no seu ambiente Firebase. A segurança dos seus dados é crucial!

### Regras de Segurança do Firestore

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Regra para a coleção 'companies' (clínicas)
    match /companies/{companyId} {
      // PARA TESTE INICIAL: Permite que qualquer um leia e escreva.
      // Isso é MUITO PERMISSIVO e deve ser usado apenas para desbloquear o desenvolvimento.
      // SUBSTITUA por regras mais seguras ANTES da produção.
      // Exemplo mais seguro: allow read, write: if request.auth != null && request.auth.token.companyId == companyId;
      // (assumindo que companyId está nos custom claims do token do usuário)
      allow read, write: if true;
    }

    // Regras para a coleção 'teamMembers' (membros da equipe da clínica)
    match /teamMembers/{memberId} {
      // Permite leitura se o usuário estiver autenticado e o clinicId do membro
      // corresponder ao companyId (do token) do usuário.
      allow read: if request.auth != null && request.auth.token.companyId == resource.data.clinicId;

      // Permite criação se o usuário estiver autenticado e o clinicId do novo membro
      // corresponder ao companyId (do token) do usuário que está criando (admin da clínica).
      allow create: if request.auth != null && request.resource.data.clinicId == request.auth.token.companyId;

      // Permite atualização se o usuário estiver autenticado e o clinicId do membro
      // corresponder ao companyId (do token) do usuário (admin da clínica).
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
Esta condição assume que o `companyId` está disponível como um "Custom Claim" no token de autenticação do Firebase do usuário. Se você não configurou custom claims:
1.  Para as regras de `read` e `update` da coleção `companies` (se não usar `allow read, write: if true;` para teste), você pode começar com `allow read, write: if request.auth != null;` e garantir que suas **API Routes no Next.js** façam a validação de que o usuário autenticado tem permissão para acessar/modificar os dados específicos da clínica (usando o `user.companyId` do `useAuth`).
2.  Para `teamMembers` e `flows`, a validação na API se torna ainda mais crucial se você não usar custom claims ou não puder verificar o `uid` diretamente contra `resource.data`.

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
      allow read: if true;

      // PARA TESTE: Permite que qualquer usuário AUTENTICADO escreva na pasta de qualquer clínica.
      // IMPORTANTE: Em produção, restrinja isso para que um usuário só possa escrever
      // na pasta da sua própria clínica (ex: request.auth.token.companyId == companyId).
      // Também verifique tamanho e tipo do arquivo.
      allow write: if request.auth != null &&
                      request.resource.size < 5 * 1024 * 1024 && // Limite de 5MB
                      (request.resource.contentType.matches('image/jpeg') ||
                       request.resource.contentType.matches('image/png') ||
                       request.resource.contentType.matches('image/gif') ||
                       request.resource.contentType.matches('image/webp'));
      // Exemplo mais seguro para produção (assumindo companyId no token):
      // allow write: if request.auth != null &&
      //                 request.auth.token.companyId == companyId &&
      //                 request.resource.size < 5 * 1024 * 1024 &&
      //                 (request.resource.contentType.matches('image/jpeg') ||
      //                  request.resource.contentType.matches('image/png') ||
      //                  request.resource.contentType.matches('image/gif') ||
      //                  request.resource.contentType.matches('image/webp'));
    }

    // Regras para favicons de clínicas (se armazenados separadamente)
    // Caminho de exemplo: clinic_favicons/ID_DA_CLINICA/favicon.ico
    match /clinic_favicons/{companyId}/{fileName} {
      allow read: if true;
      // PARA TESTE: Permite que qualquer usuário AUTENTICADO escreva.
      allow write: if request.auth != null &&
                      request.resource.size < 1 * 1024 * 1024 && // Favicons são menores
                      (request.resource.contentType.matches('image/vnd.microsoft.icon') ||
                       request.resource.contentType.matches('image/x-icon') ||
                       request.resource.contentType.matches('image/png'));
      // Exemplo mais seguro para produção (assumindo companyId no token):
      // allow write: if request.auth != null &&
      //                 request.auth.token.companyId == companyId &&
      //                 request.resource.size < 1 * 1024 * 1024 && 
      //                 (request.resource.contentType.matches('image/vnd.microsoft.icon') ||
      //                  request.resource.contentType.matches('image/x-icon') ||
      //                  request.resource.contentType.matches('image/png'));
    }

    // Adicione regras para outros caminhos/tipos de arquivos conforme necessário.
  }
}
```

**Como Aplicar:**
1.  Vá para o seu projeto no **Firebase Console**.
2.  Para **Firestore**: Navegue até Firestore Database > Aba "Regras". Copie e cole as regras do Firestore, adapte se necessário, e clique em "Publicar".
3.  Para **Storage**: Navegue até Storage > Aba "Regras". Copie e cole as regras do Storage, **substitua `{YOUR_BUCKET_NAME}` pelo nome do seu bucket**, adapte se necessário, e clique em "Publicar".

Após publicar, teste as funcionalidades do seu aplicativo para garantir que as permissões estejam corretas.
    
    

