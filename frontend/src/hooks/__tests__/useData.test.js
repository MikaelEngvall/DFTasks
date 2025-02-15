import { renderHook, act } from '@testing-library/react-hooks';
import { useData } from '../useData';
import DataService from '../../services/DataService';

jest.mock('../../services/DataService');

describe('useData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and cache data', async () => {
    const mockData = { id: 1, name: 'Test' };
    DataService.fetchWithCache.mockResolvedValueOnce(mockData);

    const { result, waitForNextUpdate } = renderHook(() => 
      useData('test-key', () => Promise.resolve(mockData))
    );

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  // Fler tester...
}); 