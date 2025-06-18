import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getUserRoles } from "@/services/api/userRoles";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";

interface StaffFormProps {
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    type: string;
    roleId: number;
    location: string;
    locationId: number;
    email: string;
    phoneNo: string;
    username: string;
    password: string;
    active: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    type: string;
    roleId: number;
    location: string;
    locationId: number;
    email: string;
    phoneNo: string;
    username: string;
    password: string;
    active: boolean;
  }>>;
  isSubmitting: boolean;
  handleReset: () => void;
  mode: 'add' | 'edit';
}

export function StaffForm({ onSubmit, formData, setFormData, isSubmitting, handleReset, mode }: StaffFormProps) {
  // Use the restaurants hook
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();

  // Fetch user roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles-data-user-roles"],
    queryFn: async () => {
      const response = await getUserRoles({ with_pre_defines: 1 });
      console.log({  response})
      
      return response;
    },
  });

  // Access user roles data safely and filter for only allowed roles
  const userRoles = useMemo(() => {
    const allRoles = rolesData?.user_roles || [];
    // Filter to only show Admin, Attendant, and Delivery Agent
    const allowedRoles = ['Admin', 'Attendant', 'Delivery Agent'];
    return allRoles.filter(role => allowedRoles.includes(role.role));
  }, [rolesData]);

  
  

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name*</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">User Type*</Label>
          {!isLoadingRoles && Boolean(userRoles.length) && <Select
            value={formData.roleId ? formData.roleId.toString() : undefined}
            onValueChange={(value) => {
              const roleId = parseInt(value);
              const selectedRole = userRoles.find(r => r.id === roleId);
              
              setFormData(prev => ({
                ...prev,
                roleId: roleId,
                type: selectedRole?.role || ""
              }));
            }}
            disabled={isLoadingRoles}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user type">
                {userRoles.find(r => r.id === formData.roleId)?.role || "Select user type"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email*</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location*</Label>
          <Select
            value={formData.locationId ? formData.locationId.toString() : undefined}
            onValueChange={(value) => {
              const selectedRestaurant = restaurants.find(r => r.id === parseInt(value));
              setFormData(prev => ({
                ...prev,
                locationId: parseInt(value),
                location: selectedRestaurant?.name || ""
              }));
            }}
            disabled={isLoadingRestaurants}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location">
                {restaurants.find(r => r.id === formData.locationId)?.name || "Select location"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNo">Phone Number*</Label>
          <Input
            id="phoneNo"
            value={formData.phoneNo}
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNo: e.target.value }))}
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* Only show username field in edit mode */}
        {mode === 'edit' && (
          <div className="space-y-2">
            <Label htmlFor="username">Username*</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
              disabled={true}
              className="bg-gray-50 cursor-not-allowed"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password{mode === 'add' ? '*' : ''}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder={mode === 'edit' ? "Leave blank to keep current" : "Enter password"}
            required={mode === 'add'}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="active">Active</Label>
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
