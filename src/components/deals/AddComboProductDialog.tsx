import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface AddComboProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  restaurantId: number;
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
  status: number;
  restaurant_products: Array<{
    id: string;
    price: string | null;
    discount: string | null;
  }>;
}

interface CategoryItem {
  category_id: number;
  description: string;
  min_quantity: number;
  max_quantity: number;
  attributes: Array<{
    attribute: string;
    value: string;
  }>;
  allowed_products: Product[];
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export function AddComboProductDialog({ open, onOpenChange, onSuccess, restaurantId }: AddComboProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [dealPrice, setDealPrice] = useState('0');
  const [onlineDealPrice, setOnlineDealPrice] = useState('0');
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Fetch categories when dialog opens
  const fetchCategories = async () => {
    try {
      // Get auth token from localStorage
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      const { token } = JSON.parse(adminData);

      const response = await fetch('https://pratham-respos-testbe-v34.achyutlabs.cloud/api/categories?per_page=9999&status=1', {
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
      console.error('Error fetching categories:', error);
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
      return data.restaurant_products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      return [];
    }
  };

  const handleAddCategory = () => {
    setSelectedCategories([
      ...selectedCategories,
      {
        category_id: 0,
        description: '',
        min_quantity: 1,
        max_quantity: 1,
        attributes: [],
        allowed_products: []
      }
    ]);
  };

  const handleRemoveCategory = (index: number) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = async (index: number, categoryId: number) => {
    // Find the selected category
    const selectedCategory = categories.find(c => c.id === categoryId);
    const products = selectedCategory?.products || [];
    
    const updatedCategories = [...selectedCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      category_id: categoryId,
      allowed_products: products
    };
    setSelectedCategories(updatedCategories);
  };

  const handleAddAttribute = (categoryIndex: number) => {
    const updatedCategories = [...selectedCategories];
    updatedCategories[categoryIndex].attributes.push({ attribute: '', value: '' });
    setSelectedCategories(updatedCategories);
  };

  const handleRemoveAttribute = (categoryIndex: number, attrIndex: number) => {
    const updatedCategories = [...selectedCategories];
    updatedCategories[categoryIndex].attributes.splice(attrIndex, 1);
    setSelectedCategories(updatedCategories);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Name is required');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('At least one category is required');
      return;
    }

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
        name,
        description,
        status: isActive ? 1 : 0,
        price: parseFloat(dealPrice),
        online_price: parseFloat(onlineDealPrice),
        restaurant_id: restaurantId,
        items: selectedCategories.map((cat, index) => ({
          sequence: index + 1,
          category_id: cat.category_id,
          description: cat.description,
          min_quantity: cat.min_quantity,
          max_quantity: cat.max_quantity,
          forced_attribute_values: cat.attributes,
          allowed_products: cat.allowed_products.map(p => ({
            product_id: p.id,
            price_adjustment: 0 // You might want to add price adjustment UI
          }))
        }))
      };

      const response = await fetch('https://pratham-respos-testbe-v34.achyutlabs.cloud/api/v2/products/combo-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create combo product');
      }

      toast.success('Combo product created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating combo product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create combo product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Combo Deal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
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

          {/* Image Upload */}
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
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-blue-500 hover:text-blue-600"
                  >
                    Click to upload image (Max 5MB)
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <label>Active</label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
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
                    <Select
                      value={categoryItem.category_id.toString()}
                      onValueChange={(value) => handleCategoryChange(index, Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      onClick={() => handleAddAttribute(index)}
                    >
                      Add Attribute
                    </Button>
                  </div>
                  {categoryItem.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Attribute"
                        value={attr.attribute}
                        onChange={(e) => {
                          const updated = [...selectedCategories];
                          updated[index].attributes[attrIndex].attribute = e.target.value;
                          setSelectedCategories(updated);
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => {
                          const updated = [...selectedCategories];
                          updated[index].attributes[attrIndex].value = e.target.value;
                          setSelectedCategories(updated);
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveAttribute(index, attrIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Allowed Products */}
                <div>
                  <h5 className="font-medium mb-2">Allowed Products*</h5>
                  <div className="border rounded-lg p-2">
                    <div className="flex items-center mb-2">
                      <Checkbox
                        checked={categoryItem.allowed_products.length === (categories.find(c => c.id === categoryItem.category_id)?.products?.length || 0)}
                        onCheckedChange={(checked) => {
                          const updated = [...selectedCategories];
                          if (checked) {
                            updated[index].allowed_products = categories.find(c => c.id === categoryItem.category_id)?.products || [];
                          } else {
                            updated[index].allowed_products = [];
                          }
                          setSelectedCategories(updated);
                        }}
                      />
                      <span className="ml-2">Select All</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Price Adjustment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryItem.allowed_products.map((product) => (
                          <tr key={product.id}>
                            <td>
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
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>${parseFloat(product.price).toFixed(2)}</td>
                            <td>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                disabled={!categoryItem.allowed_products.some(p => p.id === product.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Deal Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Deal Price*</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Online Deal Price*</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={onlineDealPrice}
                onChange={(e) => setOnlineDealPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 