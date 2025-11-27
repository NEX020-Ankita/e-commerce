'use client';

import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { BannerDisplay } from "@/components/BannerDisplay";

interface MainPageProps {
  onCategoryFilter?: (category: string | null) => void;
  cart?: {[key: number]: number};
  updateCart?: (productId: number, quantity: number) => void;
  onSearch?: (searchTerm: string) => void;
}

export default function MainPage({ onCategoryFilter, cart = {}, updateCart = () => {}, onSearch }: MainPageProps) {
  return (
    <div>
   
      <BannerDisplay />
      <CategoryNav onCategoryFilter={onCategoryFilter} />
    </div>
  );
}