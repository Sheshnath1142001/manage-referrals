
type User = {
  id: number;
  role: string;
  fullName: string;
  email: string;
};

export const useAuthStore = () => {
  return {
    user: {
      id: 1,
      role: 'Pharmacist',
      fullName: 'Test User',
      email: 'test@example.com',
    } as User,
  };
};
