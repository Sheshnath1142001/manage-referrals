import { useEffect, useState } from 'react';
import { api } from '@/services/api/client';

export interface StaffMember {
  id: string;
  name: string;
  email?: string;
  role_id?: number;
  roles?: { id: number; role: string };
  employee_outlet_id?: number;
  restaurants_users_employee_outlet_idTorestaurants?: { id: number; name: string };
  restaurant_id?: number;
  restaurants_users_restaurant_idTorestaurants?: { id: number; name: string };
  username?: string;
  phone_no?: string;
  status?: number;
}

export function useStaffMembers() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get('/users')
      .then((res) => {
        setStaff(res.users || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to fetch staff members'));
      })
      .finally(() => setLoading(false));
  }, []);

  return { staff, loading, error };
} 