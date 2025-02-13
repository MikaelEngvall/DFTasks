import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data anses färsk i 5 minuter
      cacheTime: 1000 * 60 * 30, // Cache behålls i 30 minuter
      retry: 3, // Försök igen 3 gånger vid fel
      refetchOnWindowFocus: true, // Uppdatera data när fönstret får fokus
    },
  },
}); 