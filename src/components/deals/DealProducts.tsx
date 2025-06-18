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
import { MultiSelect } from '@/components/ui/multi-select';
import type { Option as MultiSelectOption } from '@/components/ui/multi-select';

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
  discount_percent?: number;
  discount_amount?: number;
  is_active?: boolean;
  product_ids?: number[];
  category_ids?: number[];
  selection_type?: 'product' | 'category';
  price_adjustment?: number;
}

interface DealProductsProps {
  dealId?: number;
  initialProducts: DealProduct[];
  componentTypes: DealComponentType[];
  onProductsChange: (products: DealProduct[]) => void;
  disabled?: boolean;
  restaurantId: number;
  onValidationChange?: (isValid: boolean) => void;
}

export function DealProducts({ dealId, initialProducts, componentTypes, onProductsChange, disabled, restaurantId }: DealProductsProps) {
  const [products, setProducts] = useState<DealProduct[]>(initialProducts);
  const [productTypes, setProductTypes] = useState<{ [key: number]: string }>({});
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const debouncedCategorySearch = useDebounce(categorySearch, 400);
  const [discountTypes,setDiscountTypes]=useState<Record<number,'percent'|'amount'>>({});

  useEffect(() => {
    if (initialProducts) {
      // Normalise price_adjustment
      const normed = initialProducts.map(p=>{
        if(p.component_type_id===6){
          const pa = (p as any).price_adjustment ?? (p as any).discount_amount;
          return { ...p, price_adjustment: pa!==undefined && pa!==null ? Number(pa) : 0 };
        }
        return p;
      });
      
      // If no products exist (new deal), create a default one
      if (normed.length === 0) {
        const defaultProduct: DealProduct = {
          id: Date.now(),
          deal_id: dealId,
          product_id: undefined,
          category_id: undefined,
          product_ids: [],
          category_ids: [],
          component_type_id: undefined,
          quantity_min: 1,
          quantity_max: 1,
          discount: 0,
          is_active: true,
          selection_type: undefined,
        };
        setProducts([defaultProduct]);
        onProductsChange([defaultProduct]);
      } else {
        setProducts(normed);
      }

      // 1. Sync component type dropdowns
      const types: { [key: number]: string } = {};
      normed.forEach(product => {
        if (product.component_type_id) {
          types[product.id] = product.component_type_id.toString();
        }
      });
      setProductTypes(types);

      // 2. Initialise discountTypes ONLY for items that don't have an entry yet
      setDiscountTypes(prev => {
        const updated = { ...prev } as Record<number, 'percent' | 'amount'>;
        normed.forEach(product => {
          if (product.component_type_id === 2 && !(product.id in updated)) {
            if (product.discount_amount != null) {
              updated[product.id] = 'amount';
            } else if (product.discount_percent != null) {
              updated[product.id] = 'percent';
            } else {
              updated[product.id] = 'percent'; // sensible default
            }
          }
        });
        return updated;
      });
    }
  }, [initialProducts]);

  // Add default product if none exist (for new deals)
  useEffect(() => {
    if (products.length === 0 && !loading) {
      const defaultProduct: DealProduct = {
        id: Date.now(),
        deal_id: dealId,
        product_id: undefined,
        category_id: undefined,
        product_ids: [],
        category_ids: [],
        component_type_id: undefined,
        quantity_min: 1,
        quantity_max: 1,
        discount: 0,
        is_active: true,
        selection_type: undefined,
      };
      setProducts([defaultProduct]);
      onProductsChange([defaultProduct]);
    }
  }, [products.length, loading, dealId, onProductsChange]);

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
      product_ids: [],
      category_ids: [],
      component_type_id: undefined,
      quantity_min: 1,
      quantity_max: 1,
      discount: 0,
      is_active: true,
      selection_type: undefined,
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
      [productId]: componentTypeId,
    }));

    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        // if selecting Discounted Item initialise discount values
        const newComponentId=Number(componentTypeId);
        return {
          ...p,
          component_type_id: Number(componentTypeId),
          product_id: undefined,
          category_id: undefined,
          product_ids: [],
          category_ids: [],
          discount_percent: newComponentId===2 ? 10 : undefined,
          discount_amount: newComponentId===2 ? undefined : undefined,
          price_adjustment: newComponentId===6 ? 0 : undefined,
          selection_type: undefined,
        };
      }
      return p;
    });

    if(Number(componentTypeId)===2){
      setDiscountTypes(prev=>({...prev,[productId]:'percent'}));
    }

    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  const handleSelectionTypeChange = (productId: number, selectionType: 'product' | 'category') => {
    const updatedList = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          product_id: selectionType === 'product' ? undefined : null,
          category_id: selectionType === 'category' ? undefined : null,
          product_ids: selectionType === 'product' ? [] : [],
          category_ids: selectionType === 'category' ? [] : [],
          component_type_id: p.component_type_id, // Preserve the component type
          selection_type: selectionType,
        };
      }
      return p;
    });
    setProducts(updatedList);
    onProductsChange(updatedList);
  };

  const handleProductChange = (productId: number, field: string, value: any) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const updatedProduct = {
          ...p,
          [field]: value
        };
        // Maintain mutual exclusivity between product and category selections for single-select fallbacks
        if (field === 'product_id') {
          updatedProduct.category_id = null;
          updatedProduct.category_ids = [];
        } else if (field === 'category_id') {
          updatedProduct.product_id = null;
          updatedProduct.product_ids = [];
        }
        return updatedProduct;
      }
      return p;
    });
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  // Helper to update multi-select arrays (product_ids / category_ids)
  const handleMultiSelectChange = (
    productId: number,
    field: 'product_ids' | 'category_ids',
    values: string[]
  ) => {
    const numericValues = values.map(Number);
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, [field]: numericValues } : p
    );
    setProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  // Determine if selected component type supports multiple selections
  const isMultiSelectionType = (typeId?: number) => {
    if (!typeId) return false;
    const comp = componentTypes.find(ct => ct.id === typeId);
    if (!comp) return false;
    return /multi/i.test(comp.name);
  };

  const getSelectionType = (p: DealProduct): 'product' | 'category' | '' => {
    if (p.selection_type) return p.selection_type;
    if (p.product_id !== null && p.product_id !== undefined) return 'product';
    if (p.category_id !== null && p.category_id !== undefined) return 'category';
    if (p.product_ids && p.product_ids.length > 0) return 'product';
    if (p.category_ids && p.category_ids.length > 0) return 'category';
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h3 className="text-lg font-medium">Products</h3>
        <Button onClick={handleAddProduct} disabled={disabled || loading} type="button" className="w-full sm:w-auto">
          Add Product
        </Button>
      </div>

      {products.map((product) => (
        <Card key={product.id} className="p-3 sm:p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1 text-sm sm:text-base">
                  Component Type
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={productTypes[product.id] || ''}
                  onValueChange={(value) => handleComponentTypeChange(product.id, value)}
                  disabled={disabled || loading}
                >
                  <SelectTrigger className={`text-sm sm:text-base ${!productTypes[product.id] ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select component type (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!productTypes[product.id] && (
                  <p className="text-sm text-red-500 mt-1">Component Type is required</p>
                )}
              </div>

              {productTypes[product.id] && (
                <div>
                  <Label className="text-sm sm:text-base">Selection Type</Label>
                  <RadioGroup
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mt-2"
                    value={getSelectionType(product)}
                    onValueChange={(value) => handleSelectionTypeChange(product.id, value as 'product' | 'category')}
                    disabled={disabled || loading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="product" id={`product-${product.id}`} />
                      <Label htmlFor={`product-${product.id}`} className="text-sm sm:text-base">Product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="category" id={`category-${product.id}`} />
                      <Label htmlFor={`category-${product.id}`} className="text-sm sm:text-base">Category</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            {productTypes[product.id] && (
              <div>
                <Label className="text-sm sm:text-base">
                  {(() => {
                    const isProductMode = product.product_id !== null || (product.product_ids && product.product_ids.length > 0);
                    return isProductMode ? (isMultiSelectionType(product.component_type_id) ? 'Select Products' : 'Select Product') : (isMultiSelectionType(product.component_type_id) ? 'Select Categories' : 'Select Category');
                  })()}
                </Label>
                {isMultiSelectionType(product.component_type_id) ? (
                  /* multi select */
                  <MultiSelect
                    options={(() => {
                      const isProductMode = product.product_id !== null || (product.product_ids && product.product_ids.length > 0);
                      const arr = isProductMode ? availableProducts : availableCategories;
                      return arr.map((item: any) => ({ value: item.id.toString(), label: item.name })) as MultiSelectOption[];
                    })()}
                    value={(() => {
                      const isProductMode = product.product_id !== null || (product.product_ids && product.product_ids.length > 0);
                      return isProductMode
                        ? (product.product_ids || []).map(id => id.toString())
                        : (product.category_ids || []).map(id => id.toString());
                    })()}
                    onChange={(vals) => {
                      const isProductMode = product.product_id !== null || (product.product_ids && product.product_ids.length > 0);
                      if (isProductMode) {
                        handleMultiSelectChange(product.id, 'product_ids', vals);
                      } else {
                        handleMultiSelectChange(product.id, 'category_ids', vals);
                      }
                    }}
                    placeholder={(() => {
                      const isProductMode = product.product_id !== null || (product.product_ids && product.product_ids.length > 0);
                      return `Select ${isProductMode ? 'products' : 'categories'}`;
                    })()}
                    disabled={disabled || loading}
                    searchable
                  />
                ) : (
                  /* single select */
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
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder={`Select ${product.product_id !== null ? 'product' : 'category'}`} />
                    </SelectTrigger>
                    <SelectContent className="max-w-[90vw] sm:max-w-none w-[90vw] sm:w-auto">
                      {product.product_id === null && (
                        <div className="p-2">
                          <Input
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={e => setCategorySearch(e.target.value)}
                            className="mb-2 text-sm sm:text-base"
                            disabled={loading}
                          />
                        </div>
                      )}
                      {product.product_id !== null
                        ? (availableProducts.length === 0 ? (
                            <div className="p-2 text-muted-foreground text-sm sm:text-base">No products available</div>
                          ) : (
                            availableProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()} className="text-sm sm:text-base">
                                {p.name}
                              </SelectItem>
                            ))
                          ))
                        : (availableCategories.length === 0 ? (
                            <div className="p-2 text-muted-foreground text-sm sm:text-base">No categories available</div>
                          ) : (
                            availableCategories.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()} className="text-sm sm:text-base">
                                {c.name}
                              </SelectItem>
                            ))
                          ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {productTypes[product.id] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm sm:text-base">Min Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity_min}
                    onChange={(e) => handleProductChange(product.id, 'quantity_min', Number(e.target.value))}
                    disabled={disabled || loading}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label className="text-sm sm:text-base">Max Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity_max}
                    onChange={(e) => handleProductChange(product.id, 'quantity_max', Number(e.target.value))}
                    disabled={disabled || loading}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
            )}

            {/* Discount fields for Discounted Item */}
            {product.component_type_id===2 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <Label className="text-sm sm:text-base">Discount Type</Label>
                  {(()=>{const currentType = discountTypes[product.id] ?? 'percent'; return (
                  <RadioGroup
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
                    value={currentType}
                    onValueChange={(val:any)=>{
                      const v = val as 'percent' | 'amount'

                      // 1. Update which radio is selected
                      setDiscountTypes(prev => ({ ...prev, [product.id]: v }))

                      // 2. Atomically update the corresponding discount fields for the current product.
                      //    Doing this in a single state update prevents the second field update from
                      //    overriding the first one (which happened when calling handleProductChange twice).
                      setProducts(prevProducts => {
                        const updated = prevProducts.map(p => {
                          if (p.id !== product.id) return p
                          // Clear both discount fields, then keep only the relevant one undefined (blank)
                          return v === 'percent'
                            ? { ...p, discount_percent: undefined, discount_amount: undefined }
                            : { ...p, discount_amount: undefined, discount_percent: undefined }
                        })

                        // Notify parent about the change so form state stays in sync
                        onProductsChange(updated)
                        return updated
                      })
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="percent" id={`pct-${product.id}`}/>
                      <Label htmlFor={`pct-${product.id}`} className="text-sm sm:text-base">Percent (%)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="amount" id={`amt-${product.id}`}/>
                      <Label htmlFor={`amt-${product.id}`} className="text-sm sm:text-base">Amount ($)</Label>
                    </div>
                  </RadioGroup>
                  )})()}
                </div>

                { (discountTypes[product.id]||'percent')==='percent' ? (
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={product.discount_percent ?? ''}
                    onChange={e=>{
                      const val=Number(e.target.value);
                      if(val<1||val>100){toast.error('Percent must be 1-100');return;}
                      handleProductChange(product.id,'discount_percent',val);
                    }}
                    placeholder="Percentage"
                    className="text-sm sm:text-base"
                  />
                ):(
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={product.discount_amount ?? ''}
                    onChange={e=>{
                      const val=parseFloat(e.target.value);
                      if(val<=0){toast.error('Amount must be > 0');return;}
                      handleProductChange(product.id,'discount_amount',val);
                    }}
                    placeholder="Amount"
                    className="text-sm sm:text-base"
                  />
                ) }
              </div>
            )}

            {/* Price adjustment for Price Adjusted Item */}
            {product.component_type_id===6 && (
              <div>
                <Label className="text-sm sm:text-base">Price Adjustment ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={product.price_adjustment ?? 0}
                  onChange={e=>{
                    const val=parseFloat(e.target.value);
                    handleProductChange(product.id,'price_adjustment',isNaN(val)?0:val);
                  }}
                  disabled={disabled||loading}
                  className="text-sm sm:text-base"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => handleRemoveProduct(product.id)}
                disabled={disabled || loading}
                className="w-full sm:w-auto"
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