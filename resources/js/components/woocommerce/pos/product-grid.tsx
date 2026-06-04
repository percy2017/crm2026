import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { WooProduct } from '@/types';
import { ProductCard } from './product-card';

type Category = { id: number; name: string; slug: string };

type Props = {
    products: WooProduct[];
    loading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    categories: Category[];
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onAddProduct: (product: WooProduct) => void;
};

export function ProductGrid({
    products,
    loading,
    search,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    categories,
    page,
    totalPages,
    onPageChange,
    onAddProduct,
}: Props) {
    return (
        <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Buscar producto por nombre o SKU..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-44 shrink-0">
                        <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto flex-1 min-h-0 content-start">
                {loading ? (
                    <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Cargando productos...</p>
                ) : products.length === 0 ? (
                    <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Sin resultados</p>
                ) : (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} onAdd={onAddProduct} />
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        ◀
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        ▶
                    </Button>
                </div>
            )}
        </div>
    );
}
