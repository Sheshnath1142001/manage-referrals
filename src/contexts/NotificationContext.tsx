
export const useNotifications = () => {
  return {
    addNotification: (notification: { 
      title: string; 
      message: string; 
      type: string; 
    }) => {
      console.log('Notification added:', notification);
    },
  };
};
