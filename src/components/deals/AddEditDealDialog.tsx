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
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { DealCategories } from './DealCategories';
import { DealImageUpload } from './DealImageUpload';
import { DealProducts } from './DealProducts';
import { DealTags } from './DealTags';
import { useGetRestaurants } from '@/hooks/useGetRestaurants';
import { Checkbox } from '@/components/ui/checkbox';
import { AddComboProductDialog, AddComboProductDialogHandle } from '@/components/deals/AddComboProductDialog';

// Type for tags expected by DealTags component
interface Tag {
  id: string;
  tag: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

// Form schema with conditional validations based on deal type
const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    deal_type_id: z.number().min(1, 'Deal type is required'),
    start_date: z.date({ required_error: 'Start date is required' }),
    end_date: z.date({ required_error: 'End date is required' }),
    active_days: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    status: z.number().default(1),
    restaurant_id: z.number().min(1, 'Location is required'),
    fixed_price: z.string().optional(),
    combo_product_id: z.number().nullable().optional(),
  })
  .superRefine((values, ctx) => {
    // Ensure start date is before or equal to end date
    if (values.start_date > values.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['end_date'],
      });
    }

    // Fixed-price validation for Bundle (3) & Combo Meal (6)
    if ([3, 6].includes(values.deal_type_id)) {
      const priceNum = Number(values.fixed_price);
      if (!values.fixed_price || isNaN(priceNum) || priceNum <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Price is required and must be greater than 0',
          path: ['fixed_price'],
        });
      }
    }

    // For Combo Meal we will auto-create the combo product during submit if missing,
    // so we deliberately skip validation of combo_product_id here.
  });

interface AddEditDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: number;
  deal?: Deal;
  onSuccess: () => void;
  viewOnly?: boolean;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const DAYS_OF_WEEK = [
  { label: 'Mon', value: '1' },
  { label: 'Tue', value: '2' },
  { label: 'Wed', value: '3' },
  { label: 'Thu', value: '4' },
  { label: 'Fri', value: '5' },
  { label: 'Sat', value: '6' },
  { label: 'Sun', value: '0' },
];

export function AddEditDealDialog({ open, onOpenChange, restaurantId, deal, onSuccess, viewOnly }: AddEditDealDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dealTypes, setDealTypes] = useState<DealType[]>([]);
  const [componentTypes, setComponentTypes] = useState<DealComponentType[]>([]);
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [products, setProducts] = useState<DealProduct[]>(deal?.deal_products || []);
  const [images, setImages] = useState<DealImage[]>([]);
  const [tags, setTags] = useState<Tag[]>([]); // Use Tag type for compatibility with DealTags component
  const [rules, setRules] = useState<DealRule[]>(deal?.deal_rules || []);
  const [activeTab, setActiveTab] = useState<'basic' | 'products' | 'media'>('basic');
  const { restaurants } = useGetRestaurants();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [createdComboId, setCreatedComboId] = useState<number | null>(null);

  // Ref to interact with inline combo product builder
  const comboDialogRef = useRef<AddComboProductDialogHandle>(null);

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

  const dealTypeId = form.watch('deal_type_id');

  // Keep combo product name/description in sync with deal form while editing
  const watchedDealName = form.watch('name');
  const watchedDealDesc = form.watch('description');

  useEffect(() => {
    if (form.watch('deal_type_id') === 6 && comboDialogRef.current) {
      comboDialogRef.current.setNameDescription(watchedDealName, watchedDealDesc || '');
    }
  }, [watchedDealName, watchedDealDesc]);

  // keep restaurant_id synced with prop
  useEffect(() => {
    if (restaurantId && restaurantId > 0) {
      const current = form.getValues('restaurant_id');
      if (!current || current === 0) {
        form.setValue('restaurant_id', restaurantId);
      }
    }
  }, [restaurantId]);

  // Helper to adapt API deal_products to UI-friendly shape
  const adaptDealProducts = (apiProducts: DealProduct[]): DealProduct[] => {
    return (apiProducts || []).map((p: any) => {
      if (p.component_type_id === 7) {
        const prodIds = (p.selected_products || []).map((sp: any) => sp.product_id);
        const catIds = (p.selected_categories || []).map((sc: any) => sc.category_id);
        return {
          ...p,
          product_id: null,
          category_id: null,
          product_ids: prodIds,
          category_ids: catIds,
        } as any;
      }
      return { ...p } as any;
    });
  };

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
        let fetchedCategories: any[] = [];
        if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
          fetchedCategories = categoriesResponse.data;
        } else if (categoriesResponse?.data?.data && Array.isArray(categoriesResponse.data.data)) {
          fetchedCategories = categoriesResponse.data.data;
        }

        // Only mark categories as selected if we are editing / viewing and deal has categories.
        if (deal?.categories && deal.categories.length) {
          setCategories(deal.categories);
        } else {
          setCategories([]); // start empty, user will pick
        }

        // If we are editing or viewing and we have a deal ID, fetch the full deal details
        if (deal?.id) {
          const dealResponse = await dealsApi.getDealById(deal.id);
          const dealData = dealResponse.data;
          
          // Set all the states with the fetched data
          setProducts(adaptDealProducts(dealData.deal_products || []));
          const comboImgs = dealData.deal_type_id === 6 && dealData.combo_products?.images ? dealData.combo_products.images : [];
          setImages((dealData.images || []).concat(comboImgs));
          
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
            name: dealData.deal_type_id === 6 && dealData.combo_products?.name ? dealData.combo_products.name : dealData.name,
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
      const comboImgs2 = deal.deal_type_id === 6 && (deal as any).combo_products?.images ? (deal as any).combo_products.images : [];
      setImages((deal.images || []).concat(comboImgs2));
      
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

      // Reset everything so next open starts clean (avoids leftover edit data)
      form.reset({
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
      });
      setProducts([]);
      setImages([]);
      setTags([]);
      setCategories([]);
      setRules([]);
      setSelectedImageFile(null);
      setCreatedComboId(null);
    }
  }, [open]);

  // Reset form/state when opening in create mode
  useEffect(() => {
    if (open && !deal) {
      // Clear form values to defaults
      form.reset({
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
      });

      // Clear auxiliary states
      setProducts([]);
      setImages([]);
      setTags([]);
      setCategories([]);
      setRules([]);
      setSelectedImageFile(null);
      setCreatedComboId(null);
    }
  }, [open, deal, restaurantId]);

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
      const componentTypesMap = new Map(componentTypes.map(ct => [ct.id, ct]));
      const dealData: any = {
        ...values,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        ...(categories.length ? { category_ids } : {}),
        // Transform deal_products to match API structure shown in screenshot
        deal_products: products.map(product => {
          const componentTypeId = product.component_type_id || (product as any).deal_component_type_id;
          const compType = componentTypesMap.get(componentTypeId);
          const isMulti = compType ? /multi/i.test(compType.name) || componentTypeId === 7 : componentTypeId === 7;
          const qtyMin = product.quantity_min || 1;
          const qtyMax = product.quantity_max || 5;

          const prodAny = product as any;

          if (componentTypeId===2){
            return {
              component_type_id: componentTypeId,
              quantity_min: qtyMin,
              quantity_max: qtyMax,
              product_id: prodAny.product_id || null,
              category_id: prodAny.category_id || null,
              product_ids: prodAny.product_ids||[],
              category_ids: prodAny.category_ids||[],
              discount_percent: prodAny.discount_percent ?? null,
              discount_amount: prodAny.discount_amount ?? null,
            };
          }

          if (componentTypeId===6){
            return {
              component_type_id: componentTypeId,
              quantity_min: qtyMin,
              quantity_max: qtyMax,
              product_id: prodAny.product_id ?? null,
              category_id: prodAny.category_id ?? null,
              product_ids: prodAny.product_ids||[],
              category_ids: prodAny.category_ids||[],
              price_adjustment: prodAny.price_adjustment ?? 0,
            };
          }

          if (isMulti) {
            // For multi-selection, make sure arrays are populated
            if ((!prodAny.product_ids || prodAny.product_ids.length === 0) && prodAny.product_id) {
              prodAny.product_ids = [prodAny.product_id];
            }
            if ((!prodAny.category_ids || prodAny.category_ids.length === 0) && prodAny.category_id) {
              prodAny.category_ids = [prodAny.category_id];
            }

            return {
              component_type_id: componentTypeId,
              quantity_min: qtyMin,
              quantity_max: qtyMax,
              product_id: null,
              category_id: null,
              product_ids: prodAny.product_ids || [],
              category_ids: prodAny.category_ids || [],
            };
          } else {
            // For single-selection, ensure scalar id present
            let scalarProductId = prodAny.product_id ?? null;
            let scalarCategoryId = prodAny.category_id ?? null;

            if (!scalarProductId && !scalarCategoryId) {
              if (prodAny.product_ids && prodAny.product_ids.length > 0) {
                scalarProductId = prodAny.product_ids[0];
              } else if (prodAny.category_ids && prodAny.category_ids.length > 0) {
                scalarCategoryId = prodAny.category_ids[0];
              }
            }

            return {
              component_type_id: componentTypeId,
              quantity_min: qtyMin,
              quantity_max: qtyMax,
              product_id: scalarProductId,
              category_id: scalarCategoryId,
              product_ids: [],
              category_ids: [],
            };
          }
        }),
        deal_rules: formatted_deal_rules,
        // Send tag IDs using expected key
        ...(tags.length ? { tagged_deals: tags.map(tag => Number(tag.id)) } : {})
      };

      // Only include fixed_price for Bundle (3) and Combo Meal (6) deals
      if (shouldShowFixedPrice(values.deal_type_id)) {
        dealData.fixed_price = values.fixed_price ? values.fixed_price.toString() : '0';
      } else {
        delete dealData.fixed_price;
      }

      // Additional validations before proceeding
      // For non-combo deals, ensure at least one product is added
      if (values.deal_type_id !== 6 && products.length === 0) {
        toast.error('Please add at least one product to this deal');
        setLoading(false);
        return;
      }

      // Handle combo deal vs regular deal products
      let finalComboId: number | null = null;
      if (values.deal_type_id === 6) {
        try {
          // ensure combo dialog has latest name/description from deal form
          if (comboDialogRef.current) {
            comboDialogRef.current.setNameDescription(values.name, values.description || '');
          }
          if (comboDialogRef.current) {
            const savedCombo = await comboDialogRef.current.submit();
            if (savedCombo && savedCombo.id) {
              form.setValue('combo_product_id', savedCombo.id);
              if (savedCombo.name) form.setValue('name', savedCombo.name);
              finalComboId = savedCombo.id;
            }
          }
        } catch (err) {
          toast.error('Failed to save combo product');
          setLoading(false);
          return;
        }

        const comboIdToUse = finalComboId || values.combo_product_id || createdComboId || deal?.combo_product_id;

        if (!comboIdToUse) {
          toast.error('Please complete combo product configuration');
          setLoading(false);
          return;
        }

        dealData.combo_product_id = comboIdToUse;
        // Remove individual deal products for combo deals
        delete (dealData as any).deal_products;
      } else {
        // Ensure combo_product_id is not sent for other deal types
        delete (dealData as any).combo_product_id;
      }

      

      if (deal) {
        await dealsApi.updateDeal(deal.id, dealData);
        // If a new image file is selected, upload it as attachment
        if (selectedImageFile) {
          await uploadAttachment({
            file: selectedImageFile,
            dealTypeId: values.deal_type_id,
            dealId: deal.id,
            comboProductId: finalComboId || deal.combo_product_id || 0,
          });
        }
        toast.success('Deal updated successfully');
      } else {
        // Create the deal first
        const createdDealResponse = await dealsApi.createDeal(dealData);
        const createdDeal = createdDealResponse.data || createdDealResponse;
        toast.success('Deal created successfully');
        // If an image file is present, upload it
        if (selectedImageFile) {
          await uploadAttachment({
            file: selectedImageFile,
            dealTypeId: values.deal_type_id,
            dealId: createdDeal.id,
            comboProductId: finalComboId || values.combo_product_id || createdComboId || 0,
          });
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      
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

  // Helper to upload attachment correctly based on deal type
  async function uploadAttachment({file, dealTypeId, dealId, comboProductId}:{file:File, dealTypeId:number, dealId:number, comboProductId:number}) {
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('attachment_type', '1');
    const isCombo = dealTypeId === 6;
    formData.append('module_type', isCombo ? '8' : '9');
    formData.append('module_id', dealId.toString());

    // Retrieve auth token from localStorage (supports both plain token or stored in 'Admin')
    let authToken: string | null = localStorage.getItem('token');
    if (!authToken) {
      const adminData = localStorage.getItem('Admin');
      if (adminData) {
        try { authToken = JSON.parse(adminData).token; } catch {}
      }
    }

    await fetch(`${apiBaseUrl}/attachment`, {
      method: 'POST',
      headers: {
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        'X-Timezone': 'Asia/Calcutta',
      },
      body: formData,
    });
  }

  // Ensure images always contain a `url` key (fallback to upload_path from API)
  const transformImages = (imgs: any[] = []) =>
    imgs.map((img) => ({ ...img, url: (img as any).url || (img as any).upload_path }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{viewOnly ? 'View Deal' : (deal ? 'Edit Deal' : 'Create New Deal')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            
            toast.error('Please fix highlighted errors');
          })} className="space-y-4 sm:space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'products' | 'media')} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto sm:h-10">
                <TabsTrigger value="basic" className="text-xs sm:text-sm py-2 sm:py-1">Basic Info</TabsTrigger>
                <TabsTrigger value="products" className="text-xs sm:text-sm py-2 sm:py-1">Products</TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm py-2 sm:py-1">Media & Tags</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4" forceMount>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Deal Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} disabled={viewOnly} className="text-sm sm:text-base" />
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
                        <FormLabel className="text-sm sm:text-base">Deal Type <span className="text-red-500">*</span></FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={viewOnly}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue placeholder="Select deal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-w-[90vw] sm:max-w-none w-[90vw] sm:w-auto">
                            {dealTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()} className="text-sm sm:text-base">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="restaurant_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Location <span className="text-red-500">*</span></FormLabel>
                        <Select
                          value={(field.value ? field.value: restaurantId)?.toString()}
                          onValueChange={(value) => field.onChange(Number(value))}
                          disabled={viewOnly}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm sm:text-base">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-w-[90vw] sm:max-w-none w-[90vw] sm:w-auto">
                            {restaurants?.map((restaurant) => (
                              <SelectItem key={restaurant.id} value={restaurant.id.toString()} className="text-sm sm:text-base">
                                {restaurant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col justify-end">
                    <DealCategories
                      key={`deal-categories-${deal ? deal.id : 'new'}`}
                      dealId={deal?.id || 0}
                      restaurantId={restaurantId}
                      initialCategories={categories}
                      onCategoriesChange={handleCategoriesChange}
                      disabled={loading}
                      label="Deal Categories"
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={viewOnly} className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm sm:text-base">Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal text-sm sm:text-base h-10 sm:h-10',
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
                        <FormLabel className="text-sm sm:text-base">End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal text-sm sm:text-base h-10 sm:h-10',
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

                {/* Active Days (Optional) Section */}
                <Card className="p-3 sm:p-4 mb-4 bg-gray-50">
                  <div className="flex items-center mb-2">
                    <CalendarIcon className="mr-2 text-blue-700 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-semibold text-sm sm:text-base">Active Days (Optional)</span>
                  </div>
                  <div className="text-xs sm:text-sm mb-3 sm:mb-2">Select the days when this deal is available. Leave all unchecked if available every day.</div>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {DAYS_OF_WEEK.map((day) => {
                      const selectedDays = form.watch('active_days')?.split(',').filter(Boolean) || [];
                      const checked = selectedDays.includes(day.value);
                      return (
                        <label key={day.value} className="flex items-center gap-1 sm:gap-2 cursor-pointer">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(checked) => {
                              let newDays = selectedDays;
                              if (checked) {
                                newDays = [...selectedDays, day.value];
                              } else {
                                newDays = selectedDays.filter((d) => d !== day.value);
                              }
                              form.setValue('active_days', newDays.join(','));
                            }}
                            className={checked ? 'bg-blue-700 border-blue-700' : ''}
                            disabled={viewOnly}
                          />
                          <span className={`text-xs sm:text-sm ${checked ? 'text-blue-700 font-semibold' : ''}`}>{day.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="text-sm sm:text-base" />
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
                        <FormLabel className="text-sm sm:text-base">End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="text-sm sm:text-base" />
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
                        <FormLabel className="text-sm sm:text-base">Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            {...field} 
                            className="text-sm sm:text-base"
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm sm:text-base">Active</FormLabel>
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

              <TabsContent value="products" className="space-y-4 sm:space-y-6" forceMount>
                {form.watch('deal_type_id') === 6 ? (
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-medium">Create Combo Product</h3>
                    {!viewOnly && (
                      <AddComboProductDialog
                        ref={comboDialogRef}
                        inline
                        restaurantId={restaurantId}
                        defaultPrice={form.watch('fixed_price') || '0'}
                        comboProduct={deal?.combo_products}
                        onCreated={(combo) => {
                          form.setValue('combo_product_id', combo.id);
                          setCreatedComboId(combo.id);
                          if (combo.name) {
                            form.setValue('name', combo.name);
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <DealProducts
                    key={`deal-products-${deal ? deal.id : 'new'}`}
                    dealId={deal?.id}
                    initialProducts={products}
                    componentTypes={componentTypes}
                    onProductsChange={setProducts}
                    disabled={loading}
                    restaurantId={restaurantId}
                  />
                )}
              </TabsContent>

              <TabsContent value="media" forceMount>
                <div className="space-y-4 sm:space-y-6">
                  <DealImageUpload
                    key={`deal-image-${deal ? deal.id : 'new'}`}
                    dealId={deal?.id}
                    moduleType={dealTypeId === 6 ? 8 : 9}
                    moduleId={deal?.id || 0}
                    attachmentId={deal ? transformImages(images)[0]?.id : undefined}
                    initialImageUrl={deal ? transformImages(images)[0]?.url : undefined}
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

                  <DealTags
                    key={`deal-tags-${deal ? deal.id : 'new'}`}
                    dealId={deal?.id || 0}
                    initialTags={tags}
                    onTagsChange={handleTagsChange}
                    disabled={loading}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {!viewOnly && (
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-4">
                {activeTab === 'products' && (
                  <Button type="button" variant="outline" onClick={() => setActiveTab('basic')} className="w-full sm:w-auto">
                    Back
                  </Button>
                )}
                {activeTab === 'media' && (
                  <Button type="button" variant="outline" onClick={() => setActiveTab('products')} className="w-full sm:w-auto">
                    Back
                  </Button>
                )}
                {activeTab !== 'media' ? (
                  <Button type="button" onClick={handleNext} disabled={loading} className="w-full sm:w-auto">
                    Next
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                      {deal ? 'Update Deal' : 'Create Deal'}
                    </Button>
                  </>
                )}
              </div>
            )}
            {viewOnly && (
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
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