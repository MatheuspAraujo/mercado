// ============================================
// ARQUIVO: database/db.js
// FUNÇÃO: Gerenciar o banco de dados SQLite
// ============================================

// Importa a biblioteca better-sqlite3 (mais simples que sqlite3)
const Database = require('better-sqlite3');
const path = require('path');

// Caminho do arquivo do banco de dados
const dbPath = path.join(__dirname, 'products.db');

// Cria ou abre o banco de dados
const db = new Database(dbPath);

// ============================================
// CRIAR TABELA DE PRODUTOS
// ============================================
// Esta função cria a tabela se ela não existir
function createTable() {
  // SQL para criar a tabela products
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      market TEXT NOT NULL,
      url TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Executa o SQL
  db.exec(sql);
  console.log('[DB] Tabela "products" criada/verificada com sucesso!');
}

// ============================================
// INSERIR PRODUTO (evita duplicados)
// ============================================
// Insere um produto apenas se não existir (mesmo nome + mercado)
function insertProduct(product) {
  // Primeiro, verifica se o produto já existe
  const checkSql = `
    SELECT id FROM products 
    WHERE name = ? AND market = ?
  `;
  
  const existing = db.prepare(checkSql).get(product.name, product.market);
  
  // Se já existe, atualiza o preço
  if (existing) {
    const updateSql = `
      UPDATE products 
      SET price = ?, url = ?, image_url = ?, created_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.prepare(updateSql).run(
      product.price,
      product.url,
      product.image_url,
      existing.id
    );
    console.log(`[DB] Produto atualizado: ${product.name}`);
    return existing.id;
  }
  
  // Se não existe, insere novo
  const insertSql = `
    INSERT INTO products (name, price, market, url, image_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = db.prepare(insertSql).run(
    product.name,
    product.price,
    product.market,
    product.url,
    product.image_url
  );
  
  console.log(`[DB] Produto inserido: ${product.name}`);
  return result.lastInsertRowid;
}

// ============================================
// INSERIR VÁRIOS PRODUTOS DE UMA VEZ
// ============================================
function insertManyProducts(products) {
  let inserted = 0;
  let updated = 0;
  
  for (const product of products) {
    // Verifica se já existe
    const checkSql = `SELECT id FROM products WHERE name = ? AND market = ?`;
    const existing = db.prepare(checkSql).get(product.name, product.market);
    
    if (existing) {
      updated++;
    } else {
      inserted++;
    }
    
    insertProduct(product);
  }
  
  console.log(`[DB] Total: ${inserted} inseridos, ${updated} atualizados`);
  return { inserted, updated };
}

// ============================================
// BUSCAR TODOS OS PRODUTOS
// ============================================
function getAllProducts() {
  const sql = `SELECT * FROM products ORDER BY created_at DESC`;
  return db.prepare(sql).all();
}

// ============================================
// BUSCAR PRODUTOS POR NOME
// ============================================
function searchProductsByName(searchTerm) {
  // Usa LIKE para busca parcial (ex: "arroz" encontra "Arroz Tipo 1")
  const sql = `
    SELECT * FROM products 
    WHERE name LIKE ? 
    ORDER BY price ASC
  `;
  
  // % no início e fim permite encontrar o termo em qualquer posição
  return db.prepare(sql).all(`%${searchTerm}%`);
}

// ============================================
// BUSCAR PRODUTOS POR MERCADO
// ============================================
function getProductsByMarket(market) {
  const sql = `SELECT * FROM products WHERE market = ? ORDER BY price ASC`;
  return db.prepare(sql).all(market);
}

// ============================================
// LIMPAR TODOS OS PRODUTOS
// ============================================
function clearAllProducts() {
  const sql = `DELETE FROM products`;
  db.prepare(sql).run();
  console.log('[DB] Todos os produtos foram removidos!');
}

// ============================================
// ESTATÍSTICAS DO BANCO
// ============================================
function getStats() {
  const totalSql = `SELECT COUNT(*) as total FROM products`;
  const marketsSql = `SELECT market, COUNT(*) as count FROM products GROUP BY market`;
  
  const total = db.prepare(totalSql).get();
  const byMarket = db.prepare(marketsSql).all();
  
  return {
    totalProducts: total.total,
    byMarket: byMarket
  };
}

// ============================================
// INICIALIZAÇÃO
// ============================================
// Cria a tabela ao carregar o módulo
createTable();

// ============================================
// EXPORTA AS FUNÇÕES
// ============================================
module.exports = {
  db,                    // Acesso direto ao banco (para queries avançadas)
  insertProduct,         // Inserir um produto
  insertManyProducts,    // Inserir vários produtos
  getAllProducts,        // Buscar todos
  searchProductsByName,  // Buscar por nome
  getProductsByMarket,   // Buscar por mercado
  clearAllProducts,      // Limpar tudo
  getStats              // Estatísticas
};
