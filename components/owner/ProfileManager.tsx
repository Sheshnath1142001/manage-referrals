"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, UploadCloud, X, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoodTruck } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  cuisine: z.array(z.string()).min(1, { message: "Select at least one cuisine type" }),
  contactPhone: z.string().min(8, { message: "Please enter a valid phone number" }),
  contactEmail: z.string().email({ message: "Please enter a valid email" }),
  contactWebsite: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  socialFacebook: z.string().optional().or(z.literal("")),
  socialInstagram: z.string().optional().or(z.literal("")),
  socialTwitter: z.string().optional().or(z.literal("")),
});

const cuisineOptions = [
  "Australian",
  "BBQ",
  "Mexican",
  "Italian",
  "Chinese",
  "Japanese",
  "Thai",
  "Indian",
  "Middle Eastern",
  "Greek",
  "Vegan",
  "Desserts",
  "Coffee",
];

interface ProfileManagerProps {
  initialData: FoodTruck;
}

const ProfileManager = ({ initialData }: ProfileManagerProps) => {
  const [imagePreview, setImagePreview] = useState(initialData.image);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      cuisine: initialData.cuisine,
      contactPhone: initialData.contact.phone,
      contactEmail: initialData.contact.email,
      contactWebsite: initialData.contact.website || "",
      socialFacebook: initialData.contact.social?.facebook || "",
      socialInstagram: initialData.contact.social?.instagram || "",
      socialTwitter: initialData.contact.social?.twitter || "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server
      // For now, we just create a local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    // In a real app, this would save to a database
    console.log("Saving profile:", values);
    alert("Profile updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Management</h2>
        <Button 
          variant="outline" 
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview Profile
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-gray-300 p-2">
                {imagePreview ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={imagePreview}
                      alt="Food Truck"
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                      onClick={() => setImagePreview("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <Camera className="mb-2 h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Upload a photo of your food truck
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="image-upload" className="w-full">
                  <div className="flex cursor-pointer items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Image
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-xs text-gray-500">
                  Recommended: 1080x1080px JPG, PNG, or WebP
                </p>
              </div>
            </div>

            <div className="md:w-2/3 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Truck Name</FormLabel>
                    <FormControl>
                      <Input placeholder="The Aussie Grill" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your food truck, specialties, and what makes you unique..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cuisine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisine Types (select all that apply)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([...field.value, value]);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Add cuisine type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cuisineOptions
                          .filter((cuisine) => !field.value.includes(cuisine))
                          .map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>
                              {cuisine}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((cuisine) => (
                        <div
                          key={cuisine}
                          className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                        >
                          {cuisine}
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-4 w-4 p-0 text-gray-500 hover:text-gray-700"
                            onClick={() => {
                              field.onChange(
                                field.value.filter((c) => c !== cuisine)
                              );
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+61 2 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourtruck.com.au" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourtruck.com.au" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Social Media (optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="socialFacebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="facebook.com/yourtruck" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialInstagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="instagram.com/yourtruck" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialTwitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="twitter.com/yourtruck" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#C55D5D] hover:bg-[#b34d4d]">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Form>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b bg-white">
              <h3 className="text-lg font-bold">Profile Preview</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="relative h-48 w-full overflow-hidden rounded-lg mb-6">
                <Image
                  src={imagePreview}
                  alt={form.getValues("name")}
                  fill
                  className="object-cover"
                />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{form.getValues("name")}</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {form.getValues("cuisine").map((cuisine) => (
                  <span
                    key={cuisine}
                    className="rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-700 mb-6">{form.getValues("description")}</p>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    {form.getValues("contactPhone")}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {form.getValues("contactEmail")}
                  </div>
                  {form.getValues("contactWebsite") && (
                    <div className="text-sm">
                      <span className="font-medium">Website:</span>{" "}
                      {form.getValues("contactWebsite")}
                    </div>
                  )}
                </div>
              </div>
              
              {(form.getValues("socialFacebook") ||
                form.getValues("socialInstagram") ||
                form.getValues("socialTwitter")) && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-2">Social Media</h3>
                  <div className="flex gap-4">
                    {form.getValues("socialFacebook") && (
                      <div className="text-sm">
                        <span className="font-medium">Facebook:</span>{" "}
                        {form.getValues("socialFacebook")}
                      </div>
                    )}
                    {form.getValues("socialInstagram") && (
                      <div className="text-sm">
                        <span className="font-medium">Instagram:</span>{" "}
                        {form.getValues("socialInstagram")}
                      </div>
                    )}
                    {form.getValues("socialTwitter") && (
                      <div className="text-sm">
                        <span className="font-medium">Twitter:</span>{" "}
                        {form.getValues("socialTwitter")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;