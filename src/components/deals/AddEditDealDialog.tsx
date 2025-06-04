import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Deal, DealCategory, DealComponentType, DealImage, DealProduct, dealsApi, DealRule, DealTag, DealType } from '@/services/api/deals';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { DealCategories } from './DealCategories';
import { DealImageUpload } from './DealImageUpload';
import { DealProducts } from './DealProducts';
import { DealRules } from './DealRules';
import { DealTags } from './DealTags';
import { useGetRestaurants } from '@/hooks/useGetRestaurants';

// Type for tags expected by DealTags component
interface Tag {
  id: string;
  tag: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

// Form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  deal_type_id: z.number().min(1, 'Deal type is required'),
  start_date: z.date(),
  end_date: z.date(),
  active_days: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.number().default(1),
  restaurant_id: z.number(),
  fixed_price: z.string().optional(),
  combo_product_id: z.number().optional(),
});

interface AddEditDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: number;
  deal?: Deal;
  onSuccess: () => void;
  viewOnly?: boolean;
}

export function AddEditDealDialog({ open, onOpenChange, restaurantId, deal, onSuccess, viewOnly }: AddEditDealDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dealTypes, setDealTypes] = useState<DealType[]>([]);
  const [componentTypes, setComponentTypes] = useState<DealComponentType[]>([]);
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [products, setProducts] = useState<DealProduct[]>(deal?.deal_products || []);
  const [images, setImages] = useState<DealImage[]>(deal?.images || []);
  const [tags, setTags] = useState<Tag[]>([]); // Use Tag type for compatibility with DealTags component
  const [rules, setRules] = useState<DealRule[]>(deal?.deal_rules || []);
  const [activeTab, setActiveTab] = useState<'basic' | 'products' | 'media'>('basic');
  const { restaurants } = useGetRestaurants();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    deal_type_id: 0,
      start_date: new Date(),
      end_date: new Date(),
      active_days: '',
      start_time: '',
      end_time: '',
    status: 1,
    restaurant_id: restaurantId,
      fixed_price: '',
      combo_product_id: undefined,
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch deal types
        const dealTypesResponse = await dealsApi.getDealTypes();
        setDealTypes(dealTypesResponse.data || []);

        // Fetch component types
        const componentTypesResponse = await dealsApi.getDealComponentTypes();
        setComponentTypes(componentTypesResponse.data || []);

        // Fetch categories
        const categoriesResponse = await dealsApi.getDealCategories(restaurantId);
        if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else if (categoriesResponse?.data?.data && Array.isArray(categoriesResponse.data.data)) {
          setCategories(categoriesResponse.data.data);
        } else {
          setCategories([]);
        }

        // If in view mode and we have a deal ID, fetch the deal details
        if (viewOnly && deal?.id) {
          const dealResponse = await dealsApi.getDealById(deal.id);
          const dealData = dealResponse.data;
          
          // Set all the states with the fetched data
          setProducts(dealData.deal_products || []);
          setImages(dealData.images || []);
          
          // Convert dealData.tags to Tag[] format for DealTags
          setTags(dealData.tags?.map((tag: DealTag) => ({
            id: tag.id.toString(),
            tag: tag.name,
            restaurant_id: dealData.restaurant_id,
            created_at: '',
            updated_at: ''
          })) || []);
          
          setCategories(dealData.categories || []);
          setRules(dealData.deal_rules || []);

          // Update form with deal data
          form.reset({
            name: dealData.name,
            description: dealData.description || '',
            deal_type_id: dealData.deal_type_id,
            start_date: new Date(dealData.start_date),
            end_date: new Date(dealData.end_date),
            active_days: dealData.active_days || '',
            start_time: dealData.start_time || '',
            end_time: dealData.end_time || '',
            status: dealData.status,
            restaurant_id: dealData.restaurant_id,
            fixed_price: dealData.fixed_price || '',
            combo_product_id: dealData.combo_product_id,
          });
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
      }
    };

    if (open) {
      fetchInitialData();
    }
  }, [open, restaurantId, viewOnly, deal?.id]);

  // Reset form and states when deal changes
  useEffect(() => {
    if (deal) {
      form.reset({
        name: deal.name,
        description: deal.description || '',
        deal_type_id: deal.deal_type_id,
        start_date: new Date(deal.start_date),
        end_date: new Date(deal.end_date),
        active_days: deal.active_days || '',
        start_time: deal.start_time || '',
        end_time: deal.end_time || '',
        status: deal.status,
        restaurant_id: deal.restaurant_id,
        fixed_price: deal.fixed_price || '',
        combo_product_id: deal.combo_product_id,
      });

      // Set other data
      setProducts(deal.deal_products || []);
      setImages(deal.images || []);
      
      // Convert deal.tags to Tag[] format for DealTags
      setTags(deal.tags?.map((tag: DealTag) => ({
        id: tag.id.toString(),
        tag: tag.name,
        restaurant_id: deal.restaurant_id,
        created_at: '',
        updated_at: ''
      })) || []);
      
      setRules(deal.deal_rules || []);
    }
  }, [deal]);

  // Persist state when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveTab('basic');
    }
  }, [open]);

  // Handle state updates
  const handleImagesChange = (newImages: DealImage[]) => {
    setImages(newImages);
  };

  const handleCategoriesChange = (newCategories: DealCategory[]) => {
    setCategories(newCategories);
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setTags(newTags);
  };
  
  const handleRulesChange = (newRules: DealRule[]) => {
    setRules(newRules);
  };

  // Add this function after the form definition
  const shouldShowFixedPrice = (dealTypeId: number) => {
    return dealTypeId === 3 || dealTypeId === 6; // Bundle (3) or Combo Meal (6)
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Format category_ids as a simple array of IDs
      const category_ids = categories.map(cat => cat.id);

      // Format deal_rules with proper parameter structure expected by API
      const formatted_deal_rules = rules.map(rule => ({
        rule_type_id: rule.rule_type_id,
        parameter: {
          amount: rule.value, // Default to using value as amount
          min_spend: "2" // Default value, modify as needed
        },
        sequence: 1 // Default sequence
      }));

      // Convert form dates to strings for API
      const dealData: any = {
        ...values,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        category_ids: category_ids,
        // Transform deal_products to match API structure shown in screenshot
        deal_products: products.map(product => ({
          product_id: product.product_id || null,
          category_id: product.category_id || null,
          // Map component_type_id to what the API expects
          component_type_id: product.component_type_id || product.deal_component_type_id,
          quantity_min: product.quantity_min || 1,
          quantity_max: product.quantity_max || 5 // Default to 5 as per screenshot
        })),
        deal_rules: formatted_deal_rules,
        images: images,
        // Convert Tag[] to DealTag[] for API
        tags: tags.map(tag => ({ 
          id: Number(tag.id), 
          name: tag.tag 
        }))
      };

      // Only include fixed_price for Bundle (3) and Combo Meal (6) deals
      if (shouldShowFixedPrice(values.deal_type_id)) {
        dealData.fixed_price = values.fixed_price ? values.fixed_price.toString() : '0';
      } else {
        // Remove fixed_price from payload for other deal types
        delete dealData.fixed_price;
      }

      console.log("Creating deal with payload:", dealData);

      if (deal) {
        await dealsApi.updateDeal(deal.id, dealData);
        toast.success('Deal updated successfully');
      } else {
        // Create the deal first
        const createdDealResponse = await dealsApi.createDeal(dealData);
        const createdDeal = createdDealResponse.data || createdDealResponse;
        toast.success('Deal created successfully');
        // If an image file is present, upload it
        if (selectedImageFile) {
          const formData = new FormData();
          formData.append('attachment', selectedImageFile);
          formData.append('attachment_type', '1');
          formData.append('module_type', '9');
          formData.append('module_id', createdDeal.id.toString());
          // Use fetch for the custom endpoint
          await fetch('https://pratham-respos-testbe-v34.achyutlabs.cloud/api/attachment', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-Timezone': 'Asia/Calcutta',
            },
            body: formData,
          });
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error('Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  // Stepper logic for Next button
  const handleNext = async () => {
    // Validate current tab fields
    let valid = false;
    if (activeTab === 'basic') {
      valid = await form.trigger(['name', 'deal_type_id', 'start_date', 'end_date']);
      if (valid) setActiveTab('products');
    } else if (activeTab === 'products') {
      // Add any product tab validation if needed
      valid = true;
      setActiveTab('media');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{viewOnly ? 'View Deal' : (deal ? 'Edit Deal' : 'Create New Deal')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'products' | 'media')} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="media">Media & Tags</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="restaurant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={viewOnly}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {restaurants?.map((restaurant) => (
                              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                {restaurant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={viewOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deal_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Type</FormLabel>
                <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={viewOnly}
                >
                          <FormControl>
                            <SelectTrigger>
                    <SelectValue placeholder="Select deal type" />
                  </SelectTrigger>
                          </FormControl>
                  <SelectContent>
                    {dealTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                        <FormMessage />
                      </FormItem>
                    )}
              />
            </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={viewOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
              />
            </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
              />
            </div>

                {shouldShowFixedPrice(form.watch('deal_type_id')) && (
                  <FormField
                    control={form.control}
                    name="fixed_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
            </div>
                      <FormControl>
                <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <DealProducts
                  dealId={deal?.id}
                  initialProducts={products}
                  componentTypes={componentTypes}
                  onProductsChange={setProducts}
                  disabled={loading}
                  restaurantId={restaurantId}
                />
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Deal Rules</h3>
                  <DealRules
                    dealId={deal?.id || 0}
                    initialRules={rules}
                    onRulesChange={handleRulesChange}
                    disabled={loading}
                  />
                </div>
              </TabsContent>

              <TabsContent value="media">
                <div className="space-y-6">
                  <DealImageUpload
                    dealId={deal?.id}
                    initialImageUrl={images?.[0]?.url}
                    onImageUploaded={(urlOrFile) => {
                      // If a File is passed, store it in state
                      if (urlOrFile instanceof File) {
                        setSelectedImageFile(urlOrFile);
                      } else {
                        handleImagesChange([...images, { url: urlOrFile, id: 0, module_type: 'deal', module_id: deal?.id || 0 }]);
                      }
                    }}
                    onImageDeleted={() => {
                      setSelectedImageFile(null);
                      handleImagesChange([]);
                    }}
                  />

                  <DealCategories
                    dealId={deal?.id || 0}
                    restaurantId={restaurantId}
                    initialCategories={categories}
                    onCategoriesChange={handleCategoriesChange}
                    disabled={loading}
                  />

                  <DealTags
                    dealId={deal?.id || 0}
                    initialTags={tags}
                    onTagsChange={handleTagsChange}
                    disabled={loading}
                  />
                </div>
              </TabsContent>
        </Tabs>

            {!viewOnly && (
              <div className="flex justify-end gap-2">
                {activeTab === 'products' && (
                  <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
                    Back
                  </Button>
                )}
                {activeTab === 'media' && (
                  <Button type="button" variant="outline" onClick={() => setActiveTab('products')}>
                    Back
                  </Button>
                )}
                {activeTab !== 'media' ? (
                  <Button type="button" onClick={handleNext} disabled={loading}>
                    Next
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {deal ? 'Update Deal' : 'Create Deal'}
                    </Button>
                  </>
                )}
              </div>
            )}
            {viewOnly && (
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 