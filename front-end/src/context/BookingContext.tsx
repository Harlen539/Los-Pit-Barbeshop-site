import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CustomerData { name: string; phone: string; email: string; notes: string }
export interface BookingState {
  serviceIds: string[];
  professionalId: string;
  date: string;
  startAt: string;
  customer: CustomerData;
}
const initialState: BookingState = { serviceIds: [], professionalId: '', date: '', startAt: '', customer: { name: '', phone: '', email: '', notes: '' } };
const storageKey = 'los-pit-booking';

interface BookingContextValue {
  booking: BookingState;
  update: (patch: Partial<BookingState>) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(() => {
    try { return { ...initialState, ...JSON.parse(sessionStorage.getItem(storageKey) || '{}') as Partial<BookingState> }; }
    catch { return initialState; }
  });
  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify(booking)); }, [booking]);
  const update = useCallback((patch: Partial<BookingState>) => setBooking((current) => ({ ...current, ...patch })), []);
  const reset = useCallback(() => { setBooking(initialState); sessionStorage.removeItem(storageKey); }, []);
  return <BookingContext.Provider value={useMemo(() => ({ booking, update, reset }), [booking, update, reset])}>{children}</BookingContext.Provider>;
}

export const useBooking = () => {
  const value = useContext(BookingContext);
  if (!value) throw new Error('useBooking precisa estar dentro de BookingProvider');
  return value;
};
