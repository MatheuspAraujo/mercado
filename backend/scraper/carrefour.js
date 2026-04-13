// ============================================
// ARQUIVO: scraper/carrefour.js
// FUNÇÃO: Fazer scraping do site do Carrefour
// ============================================

// Importa o Playwright (automação de navegador)
const { chromium } = require('playwright');

// ============================================
// CONFIGURAÇÕES
// ============================================
const CONFIG = {
  // URL base do site
  baseUrl: 'https://mercado.carrefour.com.br',
  
  // Tempo de espera entre ações (em milissegundos)
  // Isso evita bloqueios por fazer requisições muito rápidas
  delayBetweenActions: 2000,
  
  // Tempo máximo para esperar uma página carregar
  timeout: 30000,
  
  // User-Agent para simular um navegador real
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// ============================================
// FUNÇÃO AUXILIAR: AGUARDAR
// ============================================
// Pausa a execução por X milissegundos
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// FUNÇÃO PRINCIPAL: BUSCAR PRODUTOS
// ============================================
async function searchProducts(searchTerm) {
  console.log(`[SCRAPER] Iniciando busca por: "${searchTerm}"`);
  
  // Variável para armazenar o navegador
  let browser = null;
  
  // Array para armazenar os produtos encontrados
  const products = [];
  
  try {
    // ========================================
    // 1. ABRIR O NAVEGADOR
    // ========================================
    console.log('[SCRAPER] Abrindo navegador...');
    
    browser = await chromium.launch({
      // headless: false mostra o navegador (útil para debug)
      // headless: true esconde o navegador (mais rápido)
      headless: true
    });
    
    // Cria um novo contexto com User-Agent personalizado
    const context = await browser.newContext({
      userAgent: CONFIG.userAgent,
      // Simula uma tela de desktop
      viewport: { width: 1920, height: 1080 }
    });
    
    // Abre uma nova página
    const page = await context.newPage();
    
    // Define timeout máximo
    page.setDefaultTimeout(CONFIG.timeout);
    
    // ========================================
    // 2. ACESSAR A PÁGINA DE BUSCA
    // ========================================
    // Monta a URL de busca
    const searchUrl = `${CONFIG.baseUrl}/busca/?termo=${encodeURIComponent(searchTerm)}`;
    console.log(`[SCRAPER] Acessando: ${searchUrl}`);
    
    // Navega até a URL
    await page.goto(searchUrl, {
      waitUntil: 'networkidle', // Espera a rede ficar "quieta"
      timeout: CONFIG.timeout
    });
    
    // Aguarda um pouco para garantir que tudo carregou
    await delay(CONFIG.delayBetweenActions);
    
    // ========================================
    // 3. EXTRAIR DADOS DOS PRODUTOS
    // ========================================
    console.log('[SCRAPER] Extraindo dados dos produtos...');
    
    // Executa JavaScript dentro da página para extrair os dados
    const extractedProducts = await page.evaluate(() => {
      // Array para armazenar os resultados
      const results = [];
      
      // Seletores CSS para encontrar os produtos
      // NOTA: Estes seletores podem mudar se o site atualizar
      // Se parar de funcionar, inspecione o site e atualize os seletores
      const productCards = document.querySelectorAll('[data-testid="product-card"], .product-card, article[class*="product"]');
      
      // Se não encontrar com os seletores acima, tenta alternativas
      const cards = productCards.length > 0 
        ? productCards 
        : document.querySelectorAll('[class*="ProductCard"], [class*="product-item"]');
      
      console.log(`Encontrados ${cards.length} produtos na página`);
      
      // Para cada card de produto encontrado
      cards.forEach((card, index) => {
        try {
          // Tenta extrair o nome do produto
          const nameElement = card.querySelector(
            '[data-testid="product-name"], ' +
            'h2, h3, ' +
            '[class*="name"], ' +
            '[class*="title"], ' +
            'a[class*="product"]'
          );
          
          // Tenta extrair o preço
          const priceElement = card.querySelector(
            '[data-testid="product-price"], ' +
            '[class*="price"], ' +
            '[class*="Price"], ' +
            'span[class*="value"]'
          );
          
          // Tenta extrair o link
          const linkElement = card.querySelector('a[href]');
          
          // Tenta extrair a imagem
          const imageElement = card.querySelector('img');
          
          // Se encontrou nome e preço, adiciona ao resultado
          if (nameElement && priceElement) {
            const name = nameElement.textContent.trim();
            const priceText = priceElement.textContent.trim();
            
            // Limpa o preço (remove "R$", espaços, e converte vírgula para ponto)
            const priceClean = priceText
              .replace('R$', '')
              .replace(/\s/g, '')
              .replace('.', '')  // Remove ponto de milhar
              .replace(',', '.'); // Converte vírgula decimal para ponto
            
            const price = parseFloat(priceClean);
            
            // Só adiciona se o preço for um número válido
            if (!isNaN(price) && price > 0) {
              results.push({
                name: name,
                price: price,
                url: linkElement ? linkElement.href : null,
                image_url: imageElement ? imageElement.src : null
              });
            }
          }
        } catch (error) {
          // Ignora erros em produtos individuais
          console.error(`Erro ao extrair produto ${index}:`, error);
        }
      });
      
      return results;
    });
    
    // ========================================
    // 4. PROCESSAR RESULTADOS
    // ========================================
    console.log(`[SCRAPER] Encontrados ${extractedProducts.length} produtos`);
    
    // Adiciona o nome do mercado a cada produto
    for (const product of extractedProducts) {
      products.push({
        ...product,
        market: 'Carrefour'
      });
    }
    
    // ========================================
    // 5. FECHAR O NAVEGADOR
    // ========================================
    console.log('[SCRAPER] Fechando navegador...');
    await browser.close();
    
    return products;
    
  } catch (error) {
    // ========================================
    // TRATAMENTO DE ERROS
    // ========================================
    console.error('[SCRAPER] Erro durante o scraping:', error.message);
    
    // Garante que o navegador será fechado mesmo com erro
    if (browser) {
      await browser.close();
    }
    
    // Retorna array vazio em caso de erro
    return [];
  }
}

// ============================================
// FUNÇÃO: BUSCAR OFERTAS/PROMOÇÕES
// ============================================
async function getOffers() {
  console.log('[SCRAPER] Buscando ofertas do Carrefour...');
  
  let browser = null;
  const products = [];
  
  try {
    browser = await chromium.launch({ headless: true });
    
    const context = await browser.newContext({
      userAgent: CONFIG.userAgent,
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(CONFIG.timeout);
    
    // Acessa a página de ofertas
    const offersUrl = `${CONFIG.baseUrl}/ofertas`;
    console.log(`[SCRAPER] Acessando: ${offersUrl}`);
    
    await page.goto(offersUrl, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout
    });
    
    await delay(CONFIG.delayBetweenActions);
    
    // Extrai produtos em oferta (mesma lógica do searchProducts)
    const extractedProducts = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('[data-testid="product-card"], .product-card, article[class*="product"]');
      
      cards.forEach((card) => {
        try {
          const nameElement = card.querySelector('[data-testid="product-name"], h2, h3, [class*="name"]');
          const priceElement = card.querySelector('[data-testid="product-price"], [class*="price"]');
          const linkElement = card.querySelector('a[href]');
          const imageElement = card.querySelector('img');
          
          if (nameElement && priceElement) {
            const name = nameElement.textContent.trim();
            const priceText = priceElement.textContent.trim();
            const priceClean = priceText.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.');
            const price = parseFloat(priceClean);
            
            if (!isNaN(price) && price > 0) {
              results.push({
                name: name,
                price: price,
                url: linkElement ? linkElement.href : null,
                image_url: imageElement ? imageElement.src : null
              });
            }
          }
        } catch (error) {
          // Ignora erros
        }
      });
      
      return results;
    });
    
    for (const product of extractedProducts) {
      products.push({ ...product, market: 'Carrefour' });
    }
    
    await browser.close();
    return products;
    
  } catch (error) {
    console.error('[SCRAPER] Erro ao buscar ofertas:', error.message);
    if (browser) await browser.close();
    return [];
  }
}

// ============================================
// EXPORTA AS FUNÇÕES
// ============================================
module.exports = {
  searchProducts,
  getOffers
};
