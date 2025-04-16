
export interface Referral {
  id: string;
  status: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  patient: {
    name: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  doctor: {
    name: string;
    providerNumber?: string;
  };
  reason: string;
  notes?: string;
  report?: any;
}
