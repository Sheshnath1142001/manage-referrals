import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';

interface AddComboProductDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (combo: any) => void;
  onSuccess?: () => void;
  restaurantId: number;
  inline?: boolean;
  /**
   * Default price to use when the dialog is rendered inline (inside a Deal flow).
   * When provided, price & online_price will be set to this value automatically.
   */
  defaultPrice?: string;
  /** Existing combo product to prefill (for editing) */
  comboProduct?: any;
}

interface Category {
  id: number;
  category: string;
  status: number;
  seq_no: number;
  products: Array<{
    id: number;
    name: string;
    description: string | null;
    price: string;
    status: number;
    restaurant_products: Array<{
      id: string;
      price: string | null;
      discount: string | null;
    }>;
  }>;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  /** Online price of the product (if different from base price) */
  online_price?: string;
  /** Price adjustment used in combo context */
  price_adjustment?: number;
  status: number;
  restaurant_products: Array<{
    id: string;
    price: string | null;
    online_price?: string | null;
    discount: string | null;
  }>;
}

interface AttrPair {
  attribute_id: number | null;
  value_ids: number[];
}

interface CategoryItem {
  category_ids: number[];
  description: string;
  min_quantity: number;
  max_quantity: number;
  attributes: AttrPair[];
  allowed_products: Product[];
  productOptions: Product[];
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export interface AddComboProductDialogHandle {
  submit: () => Promise<any>; // returns created combo product
  setNameDescription: (newName: string, newDesc: string) => void;
}

export const AddComboProductDialog = forwardRef<AddComboProductDialogHandle, AddComboProductDialogProps>(function AddComboProductDialog({
  open = false,
  onOpenChange = () => {},
  onCreated,
  onSuccess,
  restaurantId,
  inline = false,
  defaultPrice = '0',
  comboProduct,
}, ref) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [dealPrice, setDealPrice] = useState(defaultPrice);
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [allAttributes, setAllAttributes] = useState<any[]>([]);
  const [attributeValuesMap, setAttributeValuesMap] = useState<{[key:number]:any[]}>({});
  const [attributePriceIncluded,setAttributePriceIncluded]=useState(comboProduct?Boolean(comboProduct.attribute_value_price_included):false);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (inline || open) {
      fetchCategories();
    }
  }, [inline, open]);

  // Fetch categories when dialog opens
  const fetchCategories = async () => {
    try {
      // Get auth token from localStorage
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      const { token } = JSON.parse(adminData);

      const catUrl = `${apiBaseUrl}/categories?per_page=9999&status=1${restaurantId ? `&restaurant_id=${restaurantId}` : ''}`;
      const response = await fetch(catUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      
      toast.error('Failed to load categories');
    }
  };

  // Fetch products for a category
  const fetchProducts = async (categoryId: number) => {
    try {
      // Get auth token from localStorage
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      const { token } = JSON.parse(adminData);

      const response = await fetch(
        `${apiBaseUrl}/restaurant-products?restaurant_id=${restaurantId}&category_id=${categoryId}&status=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();

      // Normalise structure so that table can show name / price correctly
      const normalised: Product[] = (data.restaurant_products || []).map((rp: any) => {
        const prod = rp.product || rp.products || {};
        return {
          ...rp,
          // Keep original restaurant product id as id for selection purposes
          id: rp.id || rp.restaurant_product_id || prod.id,
          name: prod.name || rp.name || 'Unnamed Product',
          description: prod.description || rp.description || null,
          price: rp.price || prod.price || '0',
          online_price: rp.online_price || prod.online_price || rp.price || prod.price || '0',
          status: rp.status || prod.status || 1,
          restaurant_products: rp.restaurant_products || rp.restaurant_product || [],
        } as any;
      });

      return normalised;
    } catch (error) {
      
      toast.error('Failed to load products');
      return [];
    }
  };

  const handleAddCategory = () => {
    setSelectedCategories([
      ...selectedCategories,
      {
        category_ids: [],
        description: '',
        min_quantity: 1,
        max_quantity: 1,
        attributes: [],
        allowed_products: [],
        productOptions: []
      }
    ]);
  };

  const handleRemoveCategory = (index: number) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = async (index: number, ids: number[]) => {
    // Fetch products for each selected category via API and merge them
    let allProducts: Product[] = [];

    for (const catId of ids) {
      // Use the helper to fetch restaurant products for the category
      // eslint-disable-next-line no-await-in-loop
      const prods = await fetchProducts(catId);
      allProducts = [...allProducts, ...prods];
    }

    // Deduplicate products by id to avoid duplicates when multiple categories share products
    const uniqueProductsMap = new Map<number, Product>();
    allProducts.forEach((p) => {
      uniqueProductsMap.set(p.id, { ...p, price_adjustment: (p as any).price_adjustment || 0 });
    });

    const uniqueProducts = Array.from(uniqueProductsMap.values());

    const updated = [...selectedCategories];
    updated[index] = {
      ...updated[index],
      category_ids: ids,
      productOptions: uniqueProducts,
      // Reset allowed_products if previously empty, otherwise filter out products no longer in options
      allowed_products: updated[index].allowed_products.length
        ? updated[index].allowed_products.filter((p) => uniqueProductsMap.has(p.id))
        : [],
    } as CategoryItem;

    setSelectedCategories(updated);
  };

  // Add a new attribute row immutably so React state changes propagate correctly
  const handleAddAttribute = (categoryIndex: number) => {
    setSelectedCategories((prev) => {
      const updated = [...prev];
      const category = { ...updated[categoryIndex] };
      category.attributes = [...category.attributes, { attribute_id: null, value_ids: [] }];
      updated[categoryIndex] = category;
      return updated;
    });
  };

  // Remove attribute row immutably
  const handleRemoveAttribute = (categoryIndex: number, attrIndex: number) => {
    setSelectedCategories((prev) => {
      const updated = [...prev];
      const category = { ...updated[categoryIndex] };
      category.attributes = category.attributes.filter((_, i) => i !== attrIndex);
      updated[categoryIndex] = category;
      return updated;
    });
  };

  const handleSubmit = async () => {
    // ----- Validation -----
    if (!name.trim() && !inline) {
      toast.error('Name is required');
      return;
    }

    // Price validation (required in both inline and modal modes)
    const priceNum = parseFloat(dealPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid Price greater than 0');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Add at least one Item Category');
      return;
    }

    // Validate each category item
    for (let i = 0; i < selectedCategories.length; i++) {
      const item = selectedCategories[i];
      const label = `Item Category ${i + 1}`;

      if (!item.category_ids.length) {
        toast.error(`${label}: select at least one category`);
        return;
      }

      if (item.min_quantity <= 0 || item.max_quantity <= 0) {
        toast.error(`${label}: quantities must be greater than 0`);
        return;
      }

      if (item.min_quantity > item.max_quantity) {
        toast.error(`${label}: Min quantity cannot exceed Max quantity`);
        return;
      }

      if (!item.allowed_products.length) {
        toast.error(`${label}: select at least one allowed product`);
        return;
      }

      // Validate attribute pairs when present
      for (let j = 0; j < item.attributes.length; j++) {
        const attr = item.attributes[j];
        if (!attr.attribute_id) {
          toast.error(`${label}: attribute row ${j + 1} requires an attribute`);
          return;
        }
        if (!attr.value_ids.length) {
          toast.error(`${label}: attribute row ${j + 1} requires at least one value`);
          return;
        }
      }
    }

    // ----- End Validation -----

    setLoading(true);

    try {
      // Get auth token from localStorage
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      const { token } = JSON.parse(adminData);

      // Format the payload according to the API requirements
      const payload = {
        name: name.trim() || `Combo Product ${Date.now()}`,
        description,
        status: isActive ? 1 : 0,
        price: parseFloat(dealPrice),
        online_price: parseFloat(dealPrice),
        restaurant_id: restaurantId,
        attribute_value_price_included: attributePriceIncluded ? 1 : 0,
        items: selectedCategories.map((cat, idx) => {
          // Build forced_attribute_values array expected by API
          const fav: Array<{ attribute_value_id: number }> = [];
          (cat.attributes || []).forEach((attr) => {
            (attr.value_ids || []).forEach((vid) => {
              fav.push({ attribute_value_id: vid });
            });
          });

          // Build allowed_products array with price adjustments
          const allowed = (cat.allowed_products || []).map((p: any) => ({
            restaurant_product_id: p.id,
            price_adjustment: typeof p.price_adjustment === 'number' ? p.price_adjustment : parseFloat(p.price_adjustment || '0') || 0,
          }));

          return {
            sequence: idx + 1,
            category_ids: cat.category_ids,
            description: cat.description,
            min_quantity: cat.min_quantity,
            max_quantity: cat.max_quantity,
            forced_attribute_values: fav,
            allowed_products: allowed,
          };
        }),
      };

      const editingId = comboProduct && comboProduct.id;
      const url = editingId ? `${apiBaseUrl}/v2/products/combo-products/${editingId}` : `${apiBaseUrl}/v2/products/combo-products`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (editingId ? 'Failed to update combo product' : 'Failed to create combo product'));
      }

      const respData = await response.json();
      const createdProduct = respData?.data || respData;
      toast.success(editingId ? 'Combo product updated successfully' : 'Combo product created successfully');
      if (onCreated) { onCreated(createdProduct); } else if (onSuccess) { onSuccess(); }
      onOpenChange(false);
      return createdProduct;
    } catch (error) {
      
      toast.error(error instanceof Error ? error.message : 'Failed to create combo product');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // fetch attributes
  useEffect(()=>{
    const fetchAttrs=async()=>{
      try{
        const adminData=localStorage.getItem('Admin');
        if(!adminData)return;
        const {token}=JSON.parse(adminData);
        const resp=await fetch(`${apiBaseUrl}/v2/products/attributes?per_page=9999`,{
          headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json','Accept':'application/json'}
        });
        if(!resp.ok)throw new Error('attr fetch');
        const data=await resp.json();
        setAllAttributes(data.data||[]);
      }catch(e){}
    };
    fetchAttrs();
  },[]);
  
  const loadAttributeValues=async(attributeId:number)=>{
    if(attributeValuesMap[attributeId])return attributeValuesMap[attributeId];
    try{
      const adminData=localStorage.getItem('Admin');
      if(!adminData)return [];
      const {token}=JSON.parse(adminData);
      const resp=await fetch(`${apiBaseUrl}/v2/products/attribute-values?attribute_id=${attributeId}`,{
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json','Accept':'application/json'}
      });
      if(!resp.ok)throw new Error('vals');
      const data=await resp.json();
      setAttributeValuesMap(prev=>({...prev,[attributeId]:data}));
      return data;
    }catch(e){return []}
  };

  // Keep dealPrice in sync with defaultPrice prop (useful in inline mode when parent updates)
  useEffect(() => {
    setDealPrice(defaultPrice);
  }, [defaultPrice]);

  // Prefill state when editing an existing combo product
  useEffect(() => {
    if (comboProduct && comboProduct.id) {
      // Basic fields
      setName(comboProduct.name || '');
      setDescription(comboProduct.description || '');
      setIsActive(comboProduct.status === 1);
      setDealPrice(comboProduct.price !== undefined ? String(comboProduct.price) : defaultPrice);
      setAttributePriceIncluded(Boolean(comboProduct.attribute_value_price_included));

      // Helper maps to build categories
      const newSelectedCategories: CategoryItem[] = (comboProduct.items || []).map((itm: any) => {
        // Categories
        const catIds = (itm.categories || []).map((c: any) => c.id);

        // Attributes -> group by attribute
        const attrMap: Record<number, Set<number>> = {};
        (itm.forced_attribute_values || []).forEach((fav: any) => {
          const av = fav.attribute_value;
          if (av && av.attribute) {
            const attrId = av.attribute.id;
            const valId = av.id;
            if (!attrMap[attrId]) attrMap[attrId] = new Set();
            attrMap[attrId].add(valId);

            // collect attributes & values into local dictionaries for options
            // add attr to allAttributes if missing
            if (!allAttributes.some(a => a.id === attrId)) {
              setAllAttributes(prev => [...prev, { id: attrId, name: av.attribute.name, display_name: av.attribute.display_name || av.attribute.name }]);
            }

            // add value to map
            setAttributeValuesMap(prev => {
              const existing = prev[attrId] || [];
              if (!existing.some(v => v.id === valId)) {
                return { ...prev, [attrId]: [...existing, { id: valId, value: av.display_value || av.value, display_value: av.display_value || av.value }] };
              }
              return prev;
            });
          }
        });

        const attributes: AttrPair[] = Object.entries(attrMap).map(([attrId, valSet]) => ({
          attribute_id: Number(attrId),
          value_ids: Array.from(valSet) as number[],
        }));

        return {
          category_ids: catIds,
          description: itm.description || '',
          min_quantity: itm.min_quantity || 1,
          max_quantity: itm.max_quantity || 1,
          attributes,
          allowed_products: itm.allowed_products || [],
          // productOptions prefilled with allowed_products so they appear
          productOptions: itm.allowed_products || [],
        } as CategoryItem;
      });

      if (newSelectedCategories.length) {
        setSelectedCategories(newSelectedCategories);

        // Ensure all values for each prefilled attribute are loaded so user sees complete list
        (async () => {
          const attrIds = new Set<number>();
          newSelectedCategories.forEach(cat => {
            (cat.attributes || []).forEach(ap => {
              if (ap.attribute_id) attrIds.add(ap.attribute_id);
            });
          });

          for (const aid of attrIds) {
            // eslint-disable-next-line no-await-in-loop
            await loadAttributeValues(aid);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboProduct]);

  // Expose submit method to parent via ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      const result = await handleSubmit();
      return result;
    },
    setNameDescription: (newName: string, newDesc: string) => {
      setName(newName);
      setDescription(newDesc);
    }
  }));

  const formContent = (
    <div className="space-y-6">
      {/* Basic Information (modal only) */}
      {!inline && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Name*</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-500">
              {description.length}/200
            </div>
          </div>
        </div>
      )}

      {/* Image Upload (modal only) */}
      {!inline && (
        <div>
          <label className="block mb-1">Image</label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {image ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-h-40 mx-auto"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setImage(e.target.files[0])}
                  className="hidden"
                  id={`${inline ? 'inline-' : ''}image-upload`}
                />
                <label
                  htmlFor={`${inline ? 'inline-' : ''}image-upload`}
                  className="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  Click to upload image (Max 5MB)
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Status (modal only) */}
      {!inline && (
        <div className="flex items-center justify-between">
          <label>Active</label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      )}

      {/* Attribute value price included */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={attributePriceIncluded} onChange={(e)=>setAttributePriceIncluded(e.target.checked)} />
          <span>Include Attribute Value Price</span>
        </label>
      </div>

      {/* Item Categories */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Item Categories</h3>
          <Button onClick={handleAddCategory} type="button">
            <Plus className="h-4 w-4 mr-2" /> Add Category Item
          </Button>
        </div>

        {selectedCategories.map((categoryItem, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-4">
              <h4 className="font-medium">Category Item {index + 1}</h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveCategory(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1">Categories*</label>
                <MultiSelect
                  options={categories.map(cat=>({value:cat.id.toString(),label:cat.category}))}
                  value={categoryItem.category_ids.map(String)}
                  onChange={(vals)=>handleCategoryChange(index, vals.map(Number))}
                  placeholder="Select categories"
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <Input
                  value={categoryItem.description}
                  onChange={(e) => {
                    const updated = [...selectedCategories];
                    updated[index].description = e.target.value;
                    setSelectedCategories(updated);
                  }}
                />
              </div>

              <div>
                <label className="block mb-1">Min Quantity*</label>
                <Input
                  type="number"
                  min="1"
                  value={categoryItem.min_quantity}
                  onChange={(e) => {
                    const updated = [...selectedCategories];
                    updated[index].min_quantity = Number(e.target.value);
                    setSelectedCategories(updated);
                  }}
                />
              </div>

              <div>
                <label className="block mb-1">Max Quantity*</label>
                <Input
                  type="number"
                  min="1"
                  value={categoryItem.max_quantity}
                  onChange={(e) => {
                    const updated = [...selectedCategories];
                    updated[index].max_quantity = Number(e.target.value);
                    setSelectedCategories(updated);
                  }}
                />
              </div>
            </div>

            {/* Attributes */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium">Attributes</h5>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => handleAddAttribute(index)}
                >
                  Add Attribute
                </Button>
              </div>
              {categoryItem.attributes.length ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left w-1/3">Attribute</th>
                        <th className="px-4 py-2 text-left">Values</th>
                        <th className="px-4 py-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryItem.attributes.map((attrPair, attrIndex) => {
                        const valuesOptions = attrPair.attribute_id && attributeValuesMap[attrPair.attribute_id] ? attributeValuesMap[attrPair.attribute_id] : [];
                        return (
                          <tr key={attrIndex} className="border-t">
                            <td className="px-4 py-2">
                              <Select
                                value={attrPair.attribute_id ? attrPair.attribute_id.toString() : ''}
                                onValueChange={async (val) => {
                                  const id = Number(val);
                                  const updated = [...selectedCategories];
                                  updated[index].attributes[attrIndex].attribute_id = id;
                                  updated[index].attributes[attrIndex].value_ids = [];
                                  setSelectedCategories(updated);
                                  await loadAttributeValues(id);
                                }}
                              >
                                <SelectTrigger><SelectValue placeholder="Select attribute" /></SelectTrigger>
                                <SelectContent>
                                  {allAttributes.map(att => (
                                    <SelectItem key={`${att.id}-${attrIndex}`} value={att.id.toString()}>
                                      {att.display_name || att.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-2">
                              <MultiSelect
                                options={valuesOptions.map(v => ({ value: v.id.toString(), label: v.display_value || v.value, key: `${v.id}-${attrIndex}` }))}
                                value={attrPair.value_ids.map(String)}
                                onChange={(vals) => {
                                  const updated = [...selectedCategories];
                                  updated[index].attributes[attrIndex].value_ids = vals.map(Number);
                                  setSelectedCategories(updated);
                                }}
                                placeholder="Attribute values"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button variant="destructive" size="icon" type="button" onClick={() => {
                                const updated = [...selectedCategories];
                                updated[index].attributes.splice(attrIndex, 1);
                                setSelectedCategories(updated);
                              }}>
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>

            {/* Allowed Products */}
            <div>
              <h5 className="font-medium mb-2">Allowed Products*</h5>
              <div className="border rounded-lg p-2">
                <div className="flex items-center mb-2">
                  <Checkbox
                    checked={categoryItem.allowed_products.length === categoryItem.productOptions.length}
                    onCheckedChange={(checked) => {
                      const updated = [...selectedCategories];
                      if (checked) {
                        updated[index].allowed_products = [...updated[index].productOptions];
                      } else {
                        updated[index].allowed_products = [];
                      }
                      setSelectedCategories(updated);
                    }}
                  />
                  <span className="ml-2">Select All</span>
                </div>
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 w-16 text-left">Select</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 w-24 text-right">Price</th>
                      <th className="px-4 py-2 w-32 text-right">Price Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryItem.productOptions.map((product) => {
                      const onlinePrice = Number((product as any).online_price ?? product.price ?? (product.restaurant_products?.[0]?.price || 0));
                      return (
                        <tr key={product.id} className="border-t">
                          <td className="px-4 py-2">
                            <Checkbox
                              checked={categoryItem.allowed_products.some(p => p.id === product.id)}
                              onCheckedChange={(checked) => {
                                const updated = [...selectedCategories];
                                if (checked) {
                                  updated[index].allowed_products.push(product);
                                } else {
                                  updated[index].allowed_products = updated[index].allowed_products.filter(p => p.id !== product.id);
                                }
                                setSelectedCategories(updated);
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 truncate whitespace-nowrap">{product.name}</td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">${onlinePrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                            <Input
                              type="number"
                              step="0.01"
                              value={(product as any).price_adjustment || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = [...selectedCategories];
                                const prod = updated[index].allowed_products.find(p => p.id === product.id);
                                if (prod) (prod as any).price_adjustment = val;
                                setSelectedCategories(updated);
                              }}
                              className="w-24 text-right"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price – hidden when inline because Deal handles pricing */}
      {!inline && (
        <div>
          <label className="block mb-1">Price*</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value)}
          />
        </div>
      )}

      {/* Action Buttons */}
      {!inline && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} type="button">
            {loading ? 'Saving...' : 'Save Combo'}
          </Button>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="border rounded-lg p-4 mt-4 bg-gray-50">
        {formContent}
        {/* Combo will be saved automatically when you create the deal */}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Combo Deal</DialogTitle>
        </DialogHeader>

        {formContent}
      </DialogContent>
    </Dialog>
  );
}); 