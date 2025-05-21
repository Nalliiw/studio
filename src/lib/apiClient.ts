// src/lib/apiClient.ts

// Esta verificação ajuda no desenvolvimento, mas em produção,
// a variável DEVE estar configurada no ambiente de hospedagem.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!BACKEND_URL && process.env.NODE_ENV === 'development') {
  console.warn(
    'AVISO DE DESENVOLVIMENTO: A variável de ambiente NEXT_PUBLIC_BACKEND_API_URL não está definida. ' +
    'As chamadas à API podem falhar ou usar um fallback, se implementado. ' +
    'Defina-a no seu arquivo .env.local para desenvolvimento local (ex: NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001) ' +
    'e no apphosting.yaml (ou configurações de ambiente da sua hospedagem) para produção.'
  );
} else if (!BACKEND_URL && process.env.NODE_ENV === 'production') {
  // Em produção, isso é um problema crítico.
  console.error(
    'ERRO CRÍTICO: NEXT_PUBLIC_BACKEND_API_URL não está definida em produção. As chamadas à API irão falhar.'
  );
}

interface ApiClientOptions extends RequestInit {
  // Você pode adicionar opções personalizadas aqui se necessário
  // por exemplo, para tipos de autenticação específicos.
}

/**
 * Cliente HTTP genérico para fazer requisições à API backend.
 * @param endpoint O caminho do endpoint da API (ex: '/users', '/products/1').
 * @param options Opções da requisição `fetch`, como method, headers, body.
 * @returns Uma Promise que resolve com os dados da resposta em JSON.
 * @throws Um erro se a requisição falhar ou a resposta não for OK.
 */
async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  if (!BACKEND_URL) {
    const errorMessage = 'A URL da API backend (NEXT_PUBLIC_BACKEND_API_URL) não está configurada.';
    console.error(errorMessage + ` Tentativa de chamada para: ${endpoint}`);
    // Em um app real, você pode querer lançar o erro ou ter um mecanismo de fallback.
    // Por enquanto, vamos lançar para que o problema seja evidente.
    throw new Error(errorMessage);
  }

  const url = `${BACKEND_URL}${endpoint}`; // Garante que não haja barras duplas se o endpoint já começar com /

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    // Adicione quaisquer outros cabeçalhos padrão aqui, como tokens de Autorização.
    // Ex: 'Authorization': `Bearer ${getToken()}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        // Se não for JSON, tente ler como texto.
        errorData = { message: await response.text(), status: response.status };
      }
      console.error('Erro na API:', response.status, response.statusText, errorData);
      // Lança um erro com a mensagem do backend, se disponível, ou uma mensagem padrão.
      throw new Error(errorData?.message || `Erro HTTP: ${response.status} ${response.statusText}`);
    }

    // Trata casos onde a resposta pode estar vazia (ex: 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T; // Ou um valor apropriado como null ou {}
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`Falha na chamada API para ${url}:`, error);
    // Re-lança o erro para que possa ser tratado pelo código que chamou a função.
    // Se for um erro de rede (fetch falhou), error.message pode ser útil.
    // Se for um erro lançado por `throw new Error` acima, ele será propagado.
    throw error;
  }
}

// Funções de exemplo para uso (opcional, mas boa prática para tipagem e reutilização)

interface ExampleData {
  id: string;
  name: string;
  value: number;
}

/**
 * Exemplo: Busca dados de um endpoint específico.
 */
export const getExampleDataById = (id: string): Promise<ExampleData> => {
  return apiClient<ExampleData>(`/example/${id}`, { method: 'GET' });
};

/**
 * Exemplo: Envia dados para um endpoint.
 */
export const createExampleData = (data: Omit<ExampleData, 'id'>): Promise<ExampleData> => {
  return apiClient<ExampleData>('/example', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export default apiClient;
