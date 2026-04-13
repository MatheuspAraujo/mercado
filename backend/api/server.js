// ============================================
// ARQUIVO: api/server.js
// FUNÇÃO: Servidor Express com endpoints da API
// ============================================

// Importa as dependências
const express = require('express');
const cors = require('cors');

// Importa nossos módulos
const db = require('../database/db');
const carrefourScraper = require('../scraper/carrefour');

// ============================================
// CONFIGURAÇÃO DO SERVIDOR
// ============================================
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para permitir requisições de outros domínios (CORS)
app.use(cors());

// Middleware para parsear JSON no body das requisições
app.use(express.json());

// ============================================
// ROTA: PÁGINA INICIAL
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'API Comparador de Precos',
    endpoints: {
      'GET /search?q=termo': 'Busca produtos no Carrefour e salva no banco',
      'GET /products': 'Lista todos os produtos salvos',
      'GET /products?name=termo': 'Filtra produtos por nome',
      'GET /offers': 'Busca ofertas do Carrefour',
      'GET /stats': 'Estatisticas do banco de dados',
      'DELETE /products': 'Limpa todos os produtos do banco'
    }
  });
});

// ============================================
// ROTA: BUSCAR PRODUTOS (SCRAPING)
// ============================================
// GET /search?q=arroz
// Executa o scraper, salva no banco e retorna os dados
app.get('/search', async (req, res) => {
  try {
    // Pega o termo de busca da query string
    const searchTerm = req.query.q;
    
    // Valida se foi informado um termo
    if (!searchTerm) {
      return res.status(400).json({
        error: 'Parametro "q" e obrigatorio',
        exemplo: '/search?q=arroz'
      });
    }
    
    console.log(`[API] Buscando produtos: "${searchTerm}"`);
    
    // Executa o scraper do Carrefour
    const products = await carrefourScraper.searchProducts(searchTerm);
    
    if (products.length === 0) {
      return res.json({
        message: 'Nenhum produto encontrado',
        searchTerm: searchTerm,
        products: []
      });
    }
    
    // Salva os produtos no banco de dados
    const result = db.insertManyProducts(products);
    
    // Retorna os produtos encontrados
    res.json({
      message: 'Busca realizada com sucesso',
      searchTerm: searchTerm,
      totalFound: products.length,
      inserted: result.inserted,
      updated: result.updated,
      products: products
    });
    
  } catch (error) {
    console.error('[API] Erro na busca:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar produtos',
      details: error.message
    });
  }
});

// ============================================
// ROTA: LISTAR PRODUTOS DO BANCO
// ============================================
// GET /products - Lista todos
// GET /products?name=arroz - Filtra por nome
app.get('/products', (req, res) => {
  try {
    const nameFilter = req.query.name;
    
    let products;
    
    if (nameFilter) {
      // Se tem filtro, busca por nome
      console.log(`[API] Filtrando produtos por: "${nameFilter}"`);
      products = db.searchProductsByName(nameFilter);
    } else {
      // Se não tem filtro, retorna todos
      console.log('[API] Listando todos os produtos');
      products = db.getAllProducts();
    }
    
    res.json({
      total: products.length,
      products: products
    });
    
  } catch (error) {
    console.error('[API] Erro ao listar produtos:', error.message);
    res.status(500).json({
      error: 'Erro ao listar produtos',
      details: error.message
    });
  }
});

// ============================================
// ROTA: BUSCAR OFERTAS
// ============================================
// GET /offers
app.get('/offers', async (req, res) => {
  try {
    console.log('[API] Buscando ofertas...');
    
    // Executa o scraper de ofertas
    const offers = await carrefourScraper.getOffers();
    
    if (offers.length > 0) {
      // Salva as ofertas no banco
      db.insertManyProducts(offers);
    }
    
    res.json({
      message: 'Ofertas encontradas',
      total: offers.length,
      products: offers
    });
    
  } catch (error) {
    console.error('[API] Erro ao buscar ofertas:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar ofertas',
      details: error.message
    });
  }
});

// ============================================
// ROTA: ESTATÍSTICAS
// ============================================
// GET /stats
app.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter estatisticas',
      details: error.message
    });
  }
});

// ============================================
// ROTA: LIMPAR BANCO
// ============================================
// DELETE /products
app.delete('/products', (req, res) => {
  try {
    db.clearAllProducts();
    res.json({ message: 'Todos os produtos foram removidos' });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao limpar produtos',
      details: error.message
    });
  }
});

// ============================================
// INICIAR O SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`   API Comparador de Precos`);
  console.log(`   Servidor rodando em: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('Endpoints disponiveis:');
  console.log(`  GET  http://localhost:${PORT}/search?q=arroz`);
  console.log(`  GET  http://localhost:${PORT}/products`);
  console.log(`  GET  http://localhost:${PORT}/products?name=arroz`);
  console.log(`  GET  http://localhost:${PORT}/offers`);
  console.log(`  GET  http://localhost:${PORT}/stats`);
  console.log('========================================');
});
