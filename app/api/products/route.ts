import { NextResponse } from "next/server"
import { searchCarrefourProducts, getCarrefourOffers } from "../supermarkets/carrefour"
// Importe outras APIs de supermercados aqui, ex:
// import { searchExtraProducts, getExtraOffers } from "../supermarkets/extra";

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

// API Route para buscar produtos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type")

    if (type === "offers") {
      // Buscar ofertas de todos os supermercados
      const carrefourOffers = await getCarrefourOffers()
      // Combine com ofertas de outros supermercados aqui
      // const extraOffers = await getExtraOffers();
      const allOffers = [...carrefourOffers /*, ...extraOffers */]

      // Ordenar ofertas por maior desconto ou menor preço
      allOffers.sort((a, b) => (b.discount || 0) - (a.discount || 0) || a.price - b.price)

      return NextResponse.json({
        success: true,
        data: allOffers,
        total: allOffers.length,
      })
    }

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter is required",
        },
        { status: 400 },
      )
    }

    // Buscar produtos de todos os supermercados
    const carrefourProducts = await searchCarrefourProducts(query)
    // Combine com produtos de outros supermercados aqui
    // const extraProducts = await searchExtraProducts(query);
    const allProducts = [...carrefourProducts /*, ...extraProducts */]

    // Ordenar por preço (mais barato primeiro)
    allProducts.sort((a, b) => a.price - b.price)

    return NextResponse.json({
      success: true,
      data: allProducts,
      total: allProducts.length,
      query: query,
    })
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// API Route para adicionar novos produtos (simulado, para demonstração)
// Em um app real, isso não seria exposto publicamente ou seria para um painel admin
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validação básica
    if (!body.name || !body.price || !body.store) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, price and store are required",
        },
        { status: 400 },
      )
    }

    // Simular adição a um "banco de dados" ou sistema interno
    const newProduct: Product = {
      id: Date.now().toString(),
      name: body.name,
      price: Number.parseFloat(body.price),
      originalPrice: body.originalPrice ? Number.parseFloat(body.originalPrice) : undefined,
      store: body.store,
      image: body.image || "/placeholder.svg?height=100&width=100",
      location: body.location || "São Paulo - SP",
      discount: body.originalPrice
        ? Math.round(
            ((Number.parseFloat(body.originalPrice) - Number.parseFloat(body.price)) /
              Number.parseFloat(body.originalPrice)) *
              100,
          )
        : undefined,
    }

    // Em um app real, salvaria no banco de dados
    // mockDatabase.push(newProduct); // Se ainda usasse um mock global

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: "Product added successfully (simulated)",
    })
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
