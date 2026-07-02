import { createContext, useContext } from 'react';

type NavigateFn = (href: string) => void;

export const NavigationContext = createContext<NavigateFn | null>(null);

export function useNavigate(): NavigateFn | null {
  return useContext(NavigationContext);
}
