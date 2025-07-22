"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, TrendingDown, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  store: string
  image: string
  location: string
  discount?: number
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [offers, setOffers] = useState<Product[]>([])
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [isLoadingOffers, setIsLoadingOffers] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [offersError, setOffersError] = useState<string | null>(null)

  const fetchOffers = async () => {
    setIsLoadingOffers(true)
    setOffersError(null)
    try {
      const response = await fetch("/api/products?type=offers")
      if (!response.ok) {
        throw new Error("Falha ao buscar ofertas")
      }
      const data = await response.json()
      setOffers(data.data)
    } catch (error: any) {
      console.error("Erro ao buscar ofertas:", error)
      setOffersError(error.message || "Erro ao carregar ofertas.")
    } finally {
      setIsLoadingOffers(false)
    }
  }

  useEffect(() => {
    if (activeTab === "offers" && offers.length === 0 && !isLoadingOffers) {
      fetchOffers()
    }
  }, [activeTab, offers.length, isLoadingOffers])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setIsLoadingSearch(true)
    setSearchError(null)
    setSearchResults([]) // Clear previous results

    try {
      const response = await fetch(`/api/products?q=${encodeURIComponent(searchTerm)}`)
      if (!response.ok) {
        throw new Error("Falha ao buscar produtos")
      }
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        // Sort by price (cheapest first)
        const sorted = data.data.sort((a: Product, b: Product) => a.price - b.price)
        setSearchResults(sorted)
      } else {
        setSearchResults([])
      }
    } catch (error: any) {
      console.error("Erro ao buscar produtos:", error)
      setSearchError(error.message || "Erro ao carregar produtos.")
    } finally {
      setIsLoadingSearch(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">PreçoFácil</h1>
            </div>
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
                onClick={() => setActiveTab("offers")}
                className={`px-3 py-2 text-sm font-medium ${
                  activeTab === "offers"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Ofertas
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "search" && (
          <div>
            {/* Search Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare preços de supermercados</h2>
              <p className="text-lg text-gray-600 mb-8">Encontre os melhores preços para seus produtos favoritos</p>

              <div className="max-w-2xl mx-auto flex gap-4">
                <Input
                  type="text"
                  placeholder="Digite o produto que você procura (ex: leite, arroz, açúcar...)"
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
            </div>

            {/* Search Results */}
            {isLoadingSearch && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Buscando produtos...</p>
              </div>
            )}

            {searchError && (
              <div className="text-center py-12 text-red-600">
                <p className="text-lg">Erro: {searchError}</p>
                <p className="text-sm">Por favor, tente novamente mais tarde.</p>
              </div>
            )}

            {!isLoadingSearch && !searchError && searchResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Resultados para "{searchTerm}" ({searchResults.length} produtos encontrados)
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Ordenado por menor preço
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((product, index) => (
                    <Card key={product.id} className={`${index === 0 ? "ring-2 ring-green-500" : ""}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.store} - {product.location}
                            </div>
                          </div>
                          <img
                            src={product.image || "/placeholder.svg?height=100&width=100"}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
                              {index === 0 && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Melhor preço
                                </Badge>
                              )}
                            </div>
                            {product.originalPrice && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                                {product.discount && <Badge variant="destructive">-{product.discount}%</Badge>}
                              </div>
                            )}
                          </div>
                          <Button size="sm">Ver na loja</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!isLoadingSearch && !searchError && searchResults.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhum produto encontrado para "{searchTerm}"</p>
                  <p className="text-sm">Tente buscar por outros termos como "leite", "arroz" ou "açúcar"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "offers" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ofertas Especiais</h2>
              <p className="text-lg text-gray-600">As melhores promoções dos supermercados</p>
            </div>

            {isLoadingOffers && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Carregando ofertas...</p>
              </div>
            )}

            {offersError && (
              <div className="text-center py-12 text-red-600">
                <p className="text-lg">Erro: {offersError}</p>
                <p className="text-sm">Por favor, tente novamente mais tarde.</p>
              </div>
            )}

            {!isLoadingOffers && !offersError && offers.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {offers.map((product) => (
                  <Card key={product.id} className="border-red-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {product.store} - {product.location}
                          </div>
                        </div>
                        <img
                          src={product.image || "/placeholder.svg?height=100&width=100"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-red-600">{formatPrice(product.price)}</span>
                            <Badge variant="destructive">-{product.discount}%</Badge>
                          </div>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              De {formatPrice(product.originalPrice)}
                            </span>
                          )}
                          <div className="text-sm text-green-600 font-medium mt-1">
                            Economia de {formatPrice((product.originalPrice || 0) - product.price)}
                          </div>
                        </div>
                        <Button size="sm" variant="destructive">
                          Ver oferta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoadingOffers && !offersError && offers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma oferta encontrada no momento.</p>
                  <p className="text-sm">Volte mais tarde para conferir novas promoções!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 PreçoFácil. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Compare preços e economize nas suas compras de supermercado</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
