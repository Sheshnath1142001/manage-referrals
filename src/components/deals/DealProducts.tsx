import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { dealsApi, DealProduct as ApiDealProduct, DealComponentType } from '@/services/api/deals';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Extended DealProduct interface for component use
interface DealProduct extends Partial<ApiDealProduct> {
  id: number;
  deal_id?: number;
  product_id?: number;
  category_id?: number | null;
  component_type_id?: number;
  quantity_min?: number;
  quantity_max?: number;
  discount?: number;
  is_active?: boolean;
}

interface DealProductsProps {
  dealId?: number;
  initialProducts: DealProduct[];
  componentTypes: DealComponentType[];
  onProductsChange: (products: DealProduct[]) => void;
  disabled?: boolean;
  restaurantId: number;
}

export function DealProducts({ dealId, initialProducts, componentTypes, onProductsChange, disabled, restaurantId }: DealProductsProps) {
  const [products, setProducts] = useState<DealProduct[]>(initialProducts);
  const [productTypes, setProductTypes] = useState<{ [key: number]: string }>({});
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const debouncedCategorySearch = useDebounce(categorySearch, 400);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      // Create a map of product types
      const types: { [key: number]: string } = {};
      initialProducts.forEach(product => {
        if (product.component_type_id) {
          types[product.id] = product.component_type_id.toString();
        }
      });
      setProductTypes(types);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (!restaurantId || isNaN(Number(restaurantId))) {
      setAvailableProducts([]);
      setAvailableCategories([]);
      return;
    }
    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true);
        // Fetch categories (which includes products)
        const categoriesResponse = await dealsApi.getCategories({
          restaurant_id: restaurantId,
          per_page: 9999,
          status: 1,
          category_name: debouncedCategorySearch
        });
        // Extract categories from the response, accounting for different response structures
        const categories = categoriesResponse?.data?.categories || 
                          categoriesResponse?.categories || 
                          [];
        // Categories for dropdown
        const transformedCategories = categories.map((item: any) => ({
          id: item.id,
          name: item.category || item.name || 'Unknown Category',
          status: item.status,
          restaurant_id: item.restaurants?.id || null,
          restaurant_name: item.restaurants?.name || 'Unknown Restaurant'
        }));
        setAvailableCategories(transformedCategories);
        // Products for dropdown (flatten all products from all categories)
        const allProducts = categories.flatMap((cat: any) =>
          (cat.products || []).map((prod: any) => ({
            id: prod.id,
            name: prod.name || 'Unknown Product',
            description: prod.description || '',
            price: prod.price || '0',
            category_id: cat.id,
            category_name: cat.category || cat.name || 'Uncategorized',
            // Optionally add more fields if needed
          }))
        );
        setAvailableProducts(allProducts);
      } catch (error) {
        setAvailableProducts([]);
        setAvailableCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoriesAndProducts();
  }, [restaurantId, debouncedCategorySearch]);

  const handleAddProduct = () => {
    const newProduct: DealProduct = {
      id: Date.now(),
      deal_id: dealId,
      product_id: undefined,
      category_id: undefined,
      component_type_id: undefined,
      quantity_min: 1,
      quantity_max: 1,
      discount: 0,
      is_active: true
    };
    setProducts([...products, newProduct]);
    onProductsChange([...products, newProduct]);
  };

  const handleRemoveProduct = (productId: number) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  const handleComponentTypeChange = (productId: number, componentTypeId: string) => {
    setProductTypes(prev => ({
      ...prev,
      [productId]: componentTypeId
    }));

    // Reset product/category selection when component type changes
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          component_type_id: Number(componentTypeId),
          product_id: undefined,
          category_id: undefined
        };
      }
      return p;
    }));
  };

  const handleSelectionTypeChange = (productId: number, selectionType: 'product' | 'category') => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          product_id: selectionType === 'product' ? undefined : null,
          category_id: selectionType === 'category' ? undefined : null,
          component_type_id: p.component_type_id // Preserve the component type
        };
      }
      return p;
    }));
  };

  const handleProductChange = (productId: number, field: string, value: any) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const updatedProduct = {
          ...p,
          [field]: value
        };
        // If setting product_id, clear category_id and vice versa
        if (field === 'product_id') {
          updatedProduct.category_id = null;
        } else if (field === 'category_id') {
          updatedProduct.product_id = null;
        }
        return updatedProduct;
      }
      return p;
    });
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Products</h3>
        <Button onClick={handleAddProduct} disabled={disabled || loading} type="button">
          Add Product
        </Button>
      </div>

      {products.map((product) => (
        <Card key={product.id} className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Component Type</Label>
                <Select
                  value={productTypes[product.id] || ''}
                  onValueChange={(value) => handleComponentTypeChange(product.id, value)}
                  disabled={disabled || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component type" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {productTypes[product.id] && (
                <div>
                  <Label>Selection Type</Label>
                  <RadioGroup
                    value={product.product_id !== null ? 'product' : (product.category_id !== null ? 'category' : '')}
                    onValueChange={(value) => handleSelectionTypeChange(product.id, value as 'product' | 'category')}
                    disabled={disabled || loading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="product" id={`product-${product.id}`} />
                      <Label htmlFor={`product-${product.id}`}>Product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="category" id={`category-${product.id}`} />
                      <Label htmlFor={`category-${product.id}`}>Category</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            {productTypes[product.id] && (
              <div>
                <Label>
                  {product.product_id !== null ? 'Select Product' : 'Select Category'}
                </Label>
                <Select
                  value={product.product_id !== null && product.product_id !== undefined 
                    ? product.product_id.toString() 
                    : (product.category_id !== null && product.category_id !== undefined 
                      ? product.category_id.toString() 
                      : '')}
                  onValueChange={(value) => {
                    if (product.product_id !== null) {
                      handleProductChange(product.id, 'product_id', Number(value));
                    } else {
                      handleProductChange(product.id, 'category_id', Number(value));
                    }
                  }}
                  disabled={disabled || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${product.product_id !== null ? 'product' : 'category'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {product.product_id === null && (
                      <div className="p-2">
                        <Input
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={e => setCategorySearch(e.target.value)}
                          className="mb-2"
                          disabled={loading}
                        />
                      </div>
                    )}
                    {product.product_id !== null
                      ? (availableProducts.length === 0 ? (
                          <div className="p-2 text-muted-foreground">No products available</div>
                        ) : (
                          availableProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name}
                            </SelectItem>
                          ))
                        ))
                      : (availableCategories.length === 0 ? (
                          <div className="p-2 text-muted-foreground">No categories available</div>
                        ) : (
                          availableCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))
                        ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {productTypes[product.id] && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity_min}
                    onChange={(e) => handleProductChange(product.id, 'quantity_min', Number(e.target.value))}
                    disabled={disabled || loading}
                  />
                </div>
                <div>
                  <Label>Max Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity_max}
                    onChange={(e) => handleProductChange(product.id, 'quantity_max', Number(e.target.value))}
                    disabled={disabled || loading}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => handleRemoveProduct(product.id)}
                disabled={disabled || loading}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 