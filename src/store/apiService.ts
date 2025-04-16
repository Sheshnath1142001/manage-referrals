
export const referralsApi = {
  getById: async (id: string) => {
    return Promise.resolve({ data: null });
  },
  update: async (id: string, data: any) => {
    return Promise.resolve({ data: null });
  },
  acceptReferral: async (id: string, data: any) => {
    return Promise.resolve({ data: null });
  },
};

export const paymentsApi = {
  getRateConfig: async () => {
    return Promise.resolve({ data: null });
  },
};

export const reportsApi = {
  deleteReport: async (id: string | number, type: string) => {
    return Promise.resolve({ data: null });
  },
};

export const messagesApi = {
  getUnreadCount: async () => {
    return Promise.resolve({ data: { count: 0 } });
  },
};
