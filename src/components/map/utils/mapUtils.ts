
// Helper function to check if a food truck is currently open
export const checkIsOpen = (operatingHours: any) => {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const todayHours = operatingHours[day as keyof typeof operatingHours];

  if (!todayHours || todayHours.length === 0) return false;

  return todayHours.some(({ open, close }: { open: string; close: string }) => {
    return currentTime >= open && currentTime <= close;
  });
};

// Helper function to calculate distance between two coordinates in miles
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
};
