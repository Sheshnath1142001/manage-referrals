
import { toast } from "@/hooks/use-toast";

export const handleApiError = (error: any, defaultMessage: string = "An error occurred") => {
  
  
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive"
  });
  
  return errorMessage;
};
