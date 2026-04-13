"use client"

// ============================================
// ARQUIVO: app/page.tsx
// FUNCAO: Frontend do comparador de precos
// ============================================

import type React from "react"
import { useState, useEffect } from "react"
import { Search, ShoppingCart, TrendingDown, MapPin, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// ============================================
// INTERFACE: Define a estrutura de um produto
// ============================================
interface Product {
  id: number
  name: string
  price: number
  market: string
  url: string | null
  image_url: string | null
  created_at: string
}

// ============================================
// CONFIGURACAO: URL do backend
// ============================================
// Mude esta URL para onde seu backend esta rodando
const API_URL = "http://localhost:3001"

export default function HomePage() {
  // Estados do componente
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalProducts: number; byMarket: { market: string; count: number }[] } | null>(null)

  // ============================================
  // FUNCAO: Buscar produtos (executa scraping)
  // ============================================
  const handleSearch = async () => {
    // Valida se tem termo de busca
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setIsLoadingSearch(true)
    setSearchError(null)
    setSearchResults([])

    try {
      // Faz requisicao para o backend
      // O backend vai executar o scraper e retornar os produtos
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        throw new Error("Falha ao buscar produtos")
      }
      
      const data = await response.json()
      
      if (data.products && data.products.length > 0) {
        // Ordena por preco (mais barato primeiro)
        const sorted = data.products.sort((a: Product, b: Product) => a.price - b.price)
        setSearchResults(sorted)
      } else {
        setSearchResults([])
      }
    } catch (error: unknown) {
      console.error("Erro ao buscar produtos:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao conectar com o servidor"
      setSearchError(errorMessage + ". Verifique se o backend esta rodando em " + API_URL)
    } finally {
      setIsLoadingSearch(false)
    }
  }

  // ============================================
  // FUNCAO: Carregar todos produtos do banco
  // ============================================
  const loadAllProducts = async () => {
    setIsLoadingProducts(true)
    
    try {
      const response = await fetch(`${API_URL}/products`)
      
      if (!response.ok) {
        throw new Error("Falha ao carregar produtos")
      }
      
      const data = await response.json()
      setAllProducts(data.products || [])
      
      // Tambem carrega as estatisticas
      const statsResponse = await fetch(`${API_URL}/stats`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // ============================================
  // EFFECT: Carrega produtos quando muda para aba "salvos"
  // ============================================
  useEffect(() => {
    if (activeTab === "saved") {
      loadAllProducts()
    }
  }, [activeTab])

  // ============================================
  // FUNCAO: Buscar ao pressionar Enter
  // ============================================
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // ============================================
  // FUNCAO: Formatar preco em Reais
  // ============================================
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ======== CABECALHO ======== */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">PrecoFacil</h1>
            </div>
            {/* Navegacao por abas */}
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("search")}
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === "search"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Buscar
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === "saved"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Produtos Salvos
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======== ABA DE BUSCA ======== */}
        {activeTab === "search" && (
          <div>
            {/* Secao de busca */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare precos de supermercados</h2>
              <p className="text-lg text-gray-600 mb-8">Busque produtos e compare precos em tempo real</p>

              {/* Campo de busca */}
              <div className="max-w-2xl mx-auto flex gap-4">
                <Input
                  type="text"
                  placeholder="Digite o produto (ex: arroz, leite, acucar...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoadingSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  {isLoadingSearch ? "Buscando..." : "Buscar"}
                </Button>
              </div>

              {/* Aviso sobre o backend */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> O backend precisa estar rodando em <code className="bg-yellow-100 px-1 rounded">{API_URL}</code>
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Siga as instrucoes abaixo para iniciar o servidor
                </p>
              </div>
            </div>

            {/* Estado de carregamento */}
            {isLoadingSearch && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Buscando produtos no Carrefour...</p>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            )}

            {/* Mensagem de erro */}
            {searchError && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
                  <p className="text-lg text-red-600 font-medium">Erro na busca</p>
                  <p className="text-sm text-red-500 mt-2">{searchError}</p>
                </div>
              </div>
            )}

            {/* Resultados da busca */}
            {!isLoadingSearch && !searchError && searchResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Resultados para &quot;{searchTerm}&quot; ({searchResults.length} produtos)
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Ordenado por menor preco
                  </div>
                </div>

                {/* Grid de produtos */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((product, index) => (
                    <Card key={product.id} className={`${index === 0 ? "ring-2 ring-green-500" : ""}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.market}
                            </div>
                          </div>
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
                              {index === 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Melhor preco
                                </Badge>
                              )}
                            </div>
                          </div>
                          {product.url && (
                            <Button size="sm" asChild>
                              <a href={product.url} target="_blank" rel="noopener noreferrer">
                                Ver na loja
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Nenhum resultado */}
            {!isLoadingSearch && !searchError && searchResults.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhum produto encontrado para &quot;{searchTerm}&quot;</p>
                  <p className="text-sm">Tente buscar por outros termos</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======== ABA DE PRODUTOS SALVOS ======== */}
        {activeTab === "saved" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Produtos Salvos</h2>
              <p className="text-lg text-gray-600">Todos os produtos salvos no banco de dados</p>
              
              {/* Botao para atualizar */}
              <Button onClick={loadAllProducts} className="mt-4" disabled={isLoadingProducts}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingProducts ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>

            {/* Estatisticas */}
            {stats && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Estatisticas do Banco</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
                    <p className="text-sm text-gray-600">Total de Produtos</p>
                  </div>
                  {stats.byMarket.map((item) => (
                    <div key={item.market} className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{item.count}</p>
                      <p className="text-sm text-gray-600">{item.market}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado de carregamento */}
            {isLoadingProducts && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Carregando produtos...</p>
              </div>
            )}

            {/* Lista de produtos */}
            {!isLoadingProducts && allProducts.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {product.market}
                          </div>
                        </div>
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
                        {product.url && (
                          <Button size="sm" asChild>
                            <a href={product.url} target="_blank" rel="noopener noreferrer">
                              Ver na loja
                            </a>
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Salvo em: {new Date(product.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Nenhum produto salvo */}
            {!isLoadingProducts && allProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhum produto salvo ainda</p>
                  <p className="text-sm">Faca uma busca para salvar produtos no banco</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======== RODAPE ======== */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>PrecoFacil - Comparador de Precos</p>
            <p className="text-sm mt-2">Compare precos e economize nas suas compras</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
