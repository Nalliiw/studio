## Regras de Segurança Sugeridas para Firebase (PARA TESTE INICIAL)

**Lembrete MUITO Importante:** Estas regras são **extremamente permissivas** e destinam-se **APENAS PARA DESENVOLVIMENTO E TESTE INICIAL**, especialmente se você ainda não implementou um login real com Firebase Authentication. Elas removem a maioria das verificações de autenticação. **VOCÊ PRECISA SUBSTITUÍ-LAS POR REGRAS SEGURAS ANTES DE QUALQUER AMBIENTE DE PRODUÇÃO OU ACESSO PÚBLICO!**

### Regras de Segurança do Firestore (PARA TESTE)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ATENÇÃO: REGRAS DE TESTE MUITO PERMISSIVAS
    // Permite leitura e escrita em QUALQUER coleção por QUALQUER um.
    // USE APENAS PARA DESENVOLVIMENTO LOCAL E TESTES INICIAIS.
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Nota:** Com a regra `match /{document=**} { allow read, write: if true; }`, você não precisa definir regras individuais para `companies`, `teamMembers`, `flows`, etc., para o propósito de teste inicial, pois esta regra global cobre tudo. Quando você for adicionar segurança real, você removerá esta regra global e definirá permissões granulares por coleção.

---

### Regras de Segurança do Firebase Storage (PARA TESTE)

```javascript
rules_version = '2';

// SUBSTITUA {YOUR_BUCKET_NAME} PELO NOME REAL DO SEU BUCKET
// (provavelmente nutritrack-lite-x6ffb.firebasestorage.app)
service firebase.storage {
  match /b/{YOUR_BUCKET_NAME}/o {

    // ATENÇÃO: REGRAS DE TESTE MUITO PERMISSIVAS
    // Permite leitura e escrita em QUALQUER caminho por QUALQUER um,
    // mas mantém as verificações de tamanho e tipo de conteúdo para uploads.
    // USE APENAS PARA DESENVOLVIMENTO LOCAL E TESTES INICIAIS.
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024 && // Limite de 5MB
                     (request.resource.contentType.matches('image/jpeg') ||
                      request.resource.contentType.matches('image/png') ||
                      request.resource.contentType.matches('image/gif') ||
                      request.resource.contentType.matches('image/webp') ||
                      request.resource.contentType.matches('image/vnd.microsoft.icon') || // .ico
                      request.resource.contentType.matches('image/x-icon')); // .ico
    }
  }
}
```
**Nota:** A regra de escrita no Storage acima ainda inclui verificações de tamanho e tipo de arquivo, o que é uma boa prática mesmo em teste. A leitura é totalmente pública.

---

**Como Aplicar:**
1.  Vá para o seu projeto no **Firebase Console** (`nutritrack-lite-x6ffb`).
2.  Para **Firestore**: Navegue até Firestore Database > Aba "Regras". Copie e cole as regras do Firestore acima, adapte se necessário, e clique em "Publicar".
3.  Para **Storage**: Navegue até Storage > Aba "Regras". Copie e cole as regras do Storage acima, **SUBSTITUA `{YOUR_BUCKET_NAME}` pelo nome do seu bucket (provavelmente `nutritrack-lite-x6ffb.firebasestorage.app`)**, adapte se necessário, e clique em "Publicar".

Após publicar, teste as funcionalidades do seu aplicativo. Lembre-se de proteger estas regras antes de ir para produção!
    
    
