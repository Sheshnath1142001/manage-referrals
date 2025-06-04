import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface EditComboProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSuccess: () => void;
  restaurantId: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const EditComboProductDialog: React.FC<EditComboProductDialogProps> = ({ open, onOpenChange, product, onSuccess, restaurantId }) => {
  // State for form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [price, setPrice] = useState("");
  const [onlinePrice, setOnlinePrice] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [itemCategories, setItemCategories] = useState<any[]>([]); // [{category_id, min_quantity, max_quantity, description, ...}]
  const [attributes, setAttributes] = useState<any[]>([]); // [{attribute, value}]
  const [allowedProducts, setAllowedProducts] = useState<any[]>([]); // [{id, name, price, ...}]
  const [selectedAllowedProducts, setSelectedAllowedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on open
  useEffect(() => {
    if (!open) return;
    fetch(`${apiBaseUrl}/categories?per_page=9999&status=1`)
      .then(res => res.json())
      .then(json => setCategories(json.categories || []));
  }, [open]);

  // Populate form fields from product
  useEffect(() => {
    if (!product) return;
    setName(product.name || "");
    setDescription(product.description || "");
    setStatus(product.status === 1);
    setPrice(product.price ? String(product.price) : "");
    setOnlinePrice(product.online_price ? String(product.online_price) : "");
    setItemCategories(product.items || []);
    // TODO: set attributes and allowed products from product.items
  }, [product]);

  // Fetch allowed products when itemCategories change
  useEffect(() => {
    if (!open || !restaurantId || itemCategories.length === 0) return;
    // For each item category, fetch products
    Promise.all(
      itemCategories.map((item: any) =>
        fetch(`${apiBaseUrl}/restaurant-products?restaurant_id=${restaurantId}&per_page=9999&status=1&category_ids[]=${item.categories?.[0]?.id || item.category_ids?.[0] || item.category_id}`)
          .then(res => res.json())
          .then(json => ({ categoryId: item.categories?.[0]?.id || item.category_ids?.[0] || item.category_id, products: json.restaurant_products || [] }))
      )
    ).then(results => {
      setAllowedProducts(results);
      // TODO: set selectedAllowedProducts from product.items.allowed_products
    });
  }, [open, restaurantId, itemCategories]);

  // Helper to update itemCategories
  const updateItemCategory = (idx: number, changes: any) => {
    setItemCategories((prev: any[]) => prev.map((cat, i) => i === idx ? { ...cat, ...changes } : cat));
  };

  // Add new item category
  const handleAddCategory = () => {
    setItemCategories([
      ...itemCategories,
      {
        categories: [],
        description: "",
        min_quantity: 1,
        max_quantity: 1,
        forced_attribute_values: [],
        allowed_products: [],
      },
    ]);
    setSelectedAllowedProducts([...selectedAllowedProducts, []]);
  };

  // Remove item category
  const handleRemoveCategory = (idx: number) => {
    setItemCategories(itemCategories.filter((_, i) => i !== idx));
    setSelectedAllowedProducts(selectedAllowedProducts.filter((_, i) => i !== idx));
  };

  // Add attribute to item category
  const handleAddAttribute = (catIdx: number) => {
    updateItemCategory(catIdx, {
      forced_attribute_values: [
        ...(itemCategories[catIdx].forced_attribute_values || []),
        { attribute: "", value: "" },
      ],
    });
  };

  // Remove attribute from item category
  const handleRemoveAttribute = (catIdx: number, attrIdx: number) => {
    updateItemCategory(catIdx, {
      forced_attribute_values: itemCategories[catIdx].forced_attribute_values.filter((_: any, i: number) => i !== attrIdx),
    });
  };

  // Update attribute value
  const handleAttributeChange = (catIdx: number, attrIdx: number, field: string, value: string) => {
    const attrs = [...(itemCategories[catIdx].forced_attribute_values || [])];
    attrs[attrIdx] = { ...attrs[attrIdx], [field]: value };
    updateItemCategory(catIdx, { forced_attribute_values: attrs });
  };

  // Allowed products selection logic
  const handleSelectAllowedProduct = (catIdx: number, prod: any, checked: boolean) => {
    const selected = selectedAllowedProducts[catIdx] || [];
    if (checked) {
      setSelectedAllowedProducts(selectedAllowedProducts.map((arr, i) => i === catIdx ? [...selected, prod] : arr));
    } else {
      setSelectedAllowedProducts(selectedAllowedProducts.map((arr, i) => i === catIdx ? selected.filter((p: any) => p.id !== prod.id) : arr));
    }
  };

  const handleSelectAllAllowedProducts = (catIdx: number, checked: boolean) => {
    const all = allowedProducts[catIdx]?.products || [];
    setSelectedAllowedProducts(selectedAllowedProducts.map((arr, i) => i === catIdx ? (checked ? all : []) : arr));
  };

  const handleAllowedProductPriceAdjustment = (catIdx: number, prodId: string, value: string) => {
    setSelectedAllowedProducts(selectedAllowedProducts.map((arr, i) =>
      i === catIdx
        ? arr.map((p: any) => p.id === prodId ? { ...p, price_adjustment: value } : p)
        : arr
    ));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Build payload as per your API
    const payload = {
      name,
      description,
      status: status ? 1 : 0,
      price: Number(price),
      online_price: Number(onlinePrice),
      restaurant_id: restaurantId,
      items: itemCategories.map((item: any, idx: number) => ({
        category_ids: [item.categories?.[0]?.id || item.category_ids?.[0] || item.category_id],
        min_quantity: item.min_quantity,
        max_quantity: item.max_quantity,
        sequence: idx + 1,
        description: item.description,
        forced_attribute_values: item.forced_attribute_values || [],
        allowed_products: (selectedAllowedProducts[idx] || []).map((prod: any) => ({
          restaurant_product_id: prod.id,
          price_adjustment: prod.price_adjustment || 0
        }))
      })),
    };
    try {
      await fetch(`${apiBaseUrl}/v2/products/combo-products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      toast.success("Combo product updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update combo product");
    } finally {
      setLoading(false);
    }
  };

  // UI: Basic info, item categories, attributes, allowed products
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Combo Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Name*</label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1">Active</label>
              <Switch checked={status} onCheckedChange={setStatus} />
            </div>
            <div>
              <label className="block mb-1">Deal Price*</label>
              <Input value={price} onChange={e => setPrice(e.target.value)} required type="number" />
            </div>
            <div>
              <label className="block mb-1">Online Deal Price*</label>
              <Input value={onlinePrice} onChange={e => setOnlinePrice(e.target.value)} required type="number" />
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Item Categories</h3>
            <Button type="button" onClick={handleAddCategory} className="mb-4">+ Add Category Item</Button>
            {itemCategories.map((cat, idx) => (
              <div key={idx} className="border rounded p-4 mb-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 mb-2">
                  <div>
                    <label className="block mb-1">Categories*</label>
                    <Select
                      value={cat.categories?.[0]?.id?.toString() || ""}
                      onValueChange={val => updateItemCategory(idx, { categories: [{ id: Number(val), name: categories.find(c => c.id === Number(val))?.category }] })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1">Description</label>
                    <Input value={cat.description || ""} onChange={e => updateItemCategory(idx, { description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block mb-1">Min Quantity*</label>
                    <Input type="number" value={cat.min_quantity || 1} onChange={e => updateItemCategory(idx, { min_quantity: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block mb-1">Max Quantity*</label>
                    <Input type="number" value={cat.max_quantity || 1} onChange={e => updateItemCategory(idx, { max_quantity: Number(e.target.value) })} />
                  </div>
                </div>
                <Button type="button" variant="destructive" onClick={() => handleRemoveCategory(idx)} className="mb-2">Remove Category</Button>
                <div className="mt-4">
                  <h4 className="font-semibold text-blue-700 mb-2">Attributes</h4>
                  <Button type="button" onClick={() => handleAddAttribute(idx)} className="mb-2">+ Add Attribute</Button>
                  {(cat.forced_attribute_values || []).length === 0 && <div className="text-gray-500">No attributes selected for this category.</div>}
                  {(cat.forced_attribute_values || []).map((attr: any, attrIdx: number) => (
                    <div key={attrIdx} className="flex gap-2 mb-2">
                      <Input placeholder="Attribute" value={attr.attribute} onChange={e => handleAttributeChange(idx, attrIdx, "attribute", e.target.value)} />
                      <Input placeholder="Value" value={attr.value} onChange={e => handleAttributeChange(idx, attrIdx, "value", e.target.value)} />
                      <Button type="button" variant="destructive" onClick={() => handleRemoveAttribute(idx, attrIdx)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-blue-700 mb-2">Allowed Products*</h4>
                  <div className="border rounded bg-white p-2">
                    <div className="flex items-center mb-2">
                      <Checkbox checked={(selectedAllowedProducts[idx] || []).length === (allowedProducts[idx]?.products?.length || 0)} onCheckedChange={checked => handleSelectAllAllowedProducts(idx, !!checked)} />
                      <span className="ml-2">Select All</span>
                      <span className="ml-auto text-sm text-blue-700">Selected: {(selectedAllowedProducts[idx] || []).length} products</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr>
                            <th>Select</th>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Price Adjustment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(allowedProducts[idx]?.products || []).map((prod: any) => {
                            const checked = (selectedAllowedProducts[idx] || []).some((p: any) => p.id === prod.id);
                            const priceAdj = (selectedAllowedProducts[idx] || []).find((p: any) => p.id === prod.id)?.price_adjustment || "0";
                            return (
                              <tr key={prod.id}>
                                <td><Checkbox checked={checked} onCheckedChange={val => handleSelectAllowedProduct(idx, prod, !!val)} /></td>
                                <td>{prod.id}</td>
                                <td>{prod.products?.name || prod.name}</td>
                                <td>${prod.price || prod.products?.price || "0.00"}</td>
                                <td><Input type="number" value={priceAdj} onChange={e => handleAllowedProductPriceAdjustment(idx, prod.id, e.target.value)} disabled={!checked} /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" loading={loading}>Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 