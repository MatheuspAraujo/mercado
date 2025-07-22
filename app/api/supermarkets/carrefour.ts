// Interface para definir a estrutura do produto
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

// Função auxiliar para calcular desconto
function calculateDiscount(originalPrice: number | undefined, currentPrice: number): number | undefined {
  if (originalPrice && originalPrice > currentPrice) {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }
  return undefined
}

// --- NOVA FUNÇÃO AUXILIAR ---
async function fetchWithRedirect(url: string, max = 3): Promise<Response> {
  let target = url
  for (let i = 0; i < max; i++) {
    const res = await fetch(target, { redirect: "manual" })
    if (res.status === 307 || res.status === 308) {
      const location = res.headers.get("location")
      if (!location) break
      // Constrói URL absoluta se necessário
      target = location.startsWith("http") ? location : new URL(location, target).href
      continue
    }
    return res
  }
  throw new Error("Too many redirects while fetching Carrefour API")
}

// Função para buscar produtos na API do Carrefour
export async function searchCarrefourProducts(query: string): Promise<Product[]> {
  const CARREFOUR_API_URL = `https://mercado.carrefour.com.br/api/catalog_system/pub/products/search/${encodeURIComponent(query)}/`
  const storeName = "Carrefour"
  const defaultLocation = "São Paulo - SP" // Pode ser dinâmico se a API do Carrefour retornar localização

  try {
    const response = await fetchWithRedirect(CARREFOUR_API_URL)
    if (!response.ok) {
      console.error(`Erro ao buscar produtos no Carrefour: ${response.status} ${response.statusText}`)
      return []
    }
    const data = await response.json()

    // Mapear a resposta da API do Carrefour para a nossa interface Product
    // Esta é uma suposição da estrutura da resposta da API do Carrefour.
    // Você precisará ajustar isso com base na resposta real da API.
    const products: Product[] = data
      .map((item: any) => {
        // Assumindo que cada item tem um productName e uma lista de items (SKUs)
        if (item.items && item.items.length > 0) {
          const firstSku = item.items[0]
          const offer = firstSku.sellers && firstSku.sellers.length > 0 ? firstSku.sellers[0].commertialOffer : null

          if (offer && offer.Price) {
            const price = offer.Price
            const originalPrice = offer.ListPrice && offer.ListPrice > price ? offer.ListPrice : undefined
            const discount = calculateDiscount(originalPrice, price)

            return {
              id: firstSku.itemId || item.productId, // Usar itemId ou productId como ID
              name: item.productName || firstSku.name,
              price: price,
              originalPrice: originalPrice,
              store: storeName,
              image:
                firstSku.images && firstSku.images.length > 0
                  ? firstSku.images[0].imageUrl
                  : "/placeholder.svg?height=100&width=100",
              location: defaultLocation,
              discount: discount,
            }
          }
        }
        return null
      })
      .filter(Boolean) // Remove itens nulos

    return products
  } catch (error) {
    console.error("Erro na requisição da API do Carrefour:", error)
    return []
  }
}

// Função para simular ofertas do Carrefour (pode ser adaptada para uma API real de ofertas)
export async function getCarrefourOffers(): Promise<Product[]> {
  // Para fins de demonstração, vamos usar alguns produtos mockados com desconto
  // Em um cenário real, você buscaria um endpoint de ofertas do Carrefour
  const mockOffers: Product[] = [
    {
      id: "carrefour-offer-1",
      name: "Leite Integral Parmalat 1L",
      price: 4.5,
      originalPrice: 5.49,
      store: "Carrefour",
      image: "/placeholder.svg?height=100&width=100",
      location: "São Paulo - SP",
      discount: 18,
    },
    {
      id: "carrefour-offer-2",
      name: "Arroz Tio João 5kg",
      price: 17.99,
      originalPrice: 22.99,
      store: "Carrefour",
      image: "/placeholder.svg?height=100&width=100",
      location: "São Paulo - SP",
      discount: 22,
    },
    {
      id: "carrefour-offer-3",
      name: "Óleo de Soja Soya 900ml",
      price: 3.99,
      originalPrice: 4.99,
      store: "Carrefour",
      image: "/placeholder.svg?height=100&width=100",
      location: "São Paulo - SP",
      discount: 20,
    },
  ]
  return mockOffers.filter((p) => p.discount && p.discount > 10) // Filtrar apenas ofertas com mais de 10% de desconto
}
