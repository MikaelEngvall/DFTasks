import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useStore = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);

  const invalidateQueries = (queryKeys: string[]) => {
    queryKeys.forEach((key) => {
      dispatch({ type: `${key}/invalidateCache` });
    });
  };

  const resetStore = () => {
    dispatch({ type: 'RESET_STORE' });
  };

  return {
    dispatch,
    state,
    invalidateQueries,
    resetStore,
  };
}; 