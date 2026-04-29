"use client";

import Image from "next/image";
import Link from "next/link";
import type { IProductCardProps } from "@/types/store.types";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductCard({ product, onAddToCart }: IProductCardProps) {
  return (
    <div className="group flex flex-col">
      {/* Image container */}
      <div className="relative overflow-hidden bg-[#f2f2f2] aspect-square">
        <Link href={`/store/${product.id}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Restocking badge */}
        {!product.inStock && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-white text-[10px] font-semibold uppercase tracking-widest text-[#1c1d1d] px-2 py-1 leading-none">
            Restocking Soon
          </span>
        )}

        {/* Quick add — slides up from bottom on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-200 ease-in-out group-hover:translate-y-0">
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className="w-full bg-[#1c1d1d] text-white text-[12px] font-medium uppercase tracking-widest py-3.25 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black"
          >
            {product.inStock ? "Quick Add" : "Sold Out"}
          </button>
        </div>
      </div>

      {/* Card info */}
      <div className="mt-2.5 flex flex-col gap-0.5">
        <Link
          href={`/store/${product.id}`}
          className="text-[14px] leading-snug text-[#1c1d1d] hover:underline line-clamp-2 font-normal"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[14px] text-[#1c1d1d] font-normal">
            {formatPrice(product.price)}
          </span>

          {product.rating !== undefined && (
            <span className="text-[12px] text-[#757575] flex items-center gap-1 ml-auto">
              <span className="text-[#FF5500]">★</span>
              {product.rating.toFixed(1)}
              <span className="text-[#bbb]">({product.reviewCount})</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
