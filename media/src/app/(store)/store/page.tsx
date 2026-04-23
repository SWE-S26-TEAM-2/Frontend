"use client";

import { useEffect, useMemo, useState } from "react";
import { storeService } from "@/services/di";
import type { IProduct } from "@/types/store.types";
import { ProductCard } from "@/components/Store/ProductCard";
import { StoreSubNav } from "@/components/Store/StoreSubNav";

const SORT_OPTIONS = [
  { label: "Featured",              value: "featured"     },
  { label: "Best selling",          value: "best-selling" },
  { label: "Alphabetically, A–Z",   value: "az"           },
  { label: "Alphabetically, Z–A",   value: "za"           },
  { label: "Price, low to high",    value: "price-asc"    },
  { label: "Price, high to low",    value: "price-desc"   },
];

function sortProducts(products: IProduct[], sort: string): IProduct[] {
  const list = [...products];
  switch (sort) {
    case "az":         return list.sort((a, b) => a.name.localeCompare(b.name));
    case "za":         return list.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":  return list.sort((a, b) => a.price - b.price);
    case "price-desc": return list.sort((a, b) => b.price - a.price);
    default:           return list;
  }
}

const CATEGORY_MAP: Record<string, string> = {
  all: "all", tees: "merch", sweatshirts: "merch", hats: "merch", essentials: "merch",
};

export default function StorePage() {
  const [products,        setProducts]        = useState<IProduct[]>([]);
  const [isLoading,       setIsLoading]       = useState(true); // true by default — no need to set in effect
  const [activeCategory,  setActiveCategory]  = useState("all");
  const [sort,            setSort]            = useState("featured");
  const [cartCount,       setCartCount]       = useState(0);

  useEffect(() => {
    storeService.getProducts().then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  const handleAddToCart = (product: IProduct) => {
    if (!product.inStock) return;
    setCartCount((c) => c + 1);
  };

  const filtered = useMemo(() => {
    const sorted = sortProducts(products, sort);
    if (activeCategory === "all") return sorted;
    return sorted.filter((p) => p.category === CATEGORY_MAP[activeCategory]);
  }, [products, sort, activeCategory]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Store-specific header — replaces the main SC header */}
      <StoreSubNav
        activeCategory={activeCategory}
        cartCount={cartCount}
        onCategoryChange={setActiveCategory}
      />

      {/* Hero banner */}
      <div
        className="relative w-full overflow-hidden flex items-end"
        style={{
          height: "clamp(260px, 38vw, 500px)",
          background: "url('/store/hero-banner.jpg') center/cover no-repeat",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.72) 100%)" }}
        />
        <div className="relative z-10 px-8 pb-10 sm:px-14">
          <p className="text-white/60 text-[11px] uppercase tracking-[0.18em] mb-1.5 font-medium">
            SoundCloud Store
          </p>
          <h1 className="text-white font-semibold leading-none tracking-tight" style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
            All Products
          </h1>
        </div>
      </div>

      {/* Collection content */}
      <div className="max-w-[1200px] mx-auto px-5 py-8">

        {/* Sort + count toolbar */}
        <div className="flex items-center justify-between mb-7 pb-5 border-b border-[#e8e8e1]">
          <p className="text-[13px] text-[#757575]">
            {isLoading
              ? <span className="inline-block w-16 h-3 bg-[#f0f0f0] rounded animate-pulse" />
              : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`
            }
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-[13px] text-[#757575] hidden sm:block">Sort by</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[13px] text-[#1c1d1d] border border-[#e8e8e1] px-3 py-1.5 bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#1c1d1d]"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%231c1d1d' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                paddingRight: "28px",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2.5">
                <div className="aspect-square w-full bg-[#f2f2f2]" />
                <div className="h-3.5 bg-[#f2f2f2] rounded-sm w-3/4" />
                <div className="h-3.5 bg-[#f2f2f2] rounded-sm w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <p className="text-[15px] text-[#1c1d1d]">No products found.</p>
            <button
              onClick={() => setActiveCategory("all")}
              className="text-[13px] underline text-[#757575] hover:text-[#1c1d1d] transition-colors"
            >
              View all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-14 mb-6">
            <button disabled className="px-3 py-1.5 text-[13px] text-[#bbb] cursor-not-allowed select-none">
              ← Previous
            </button>
            <button className="w-8 h-8 text-[13px] bg-[#1c1d1d] text-white font-semibold">
              1
            </button>
            <button className="px-3 py-1.5 text-[13px] text-[#757575] hover:text-[#1c1d1d] transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
