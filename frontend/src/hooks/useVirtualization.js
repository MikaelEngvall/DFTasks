import { useState, useEffect, useCallback } from 'react';

export const useVirtualization = (items, itemHeight, containerHeight) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const bufferCount = Math.ceil(visibleCount / 2);

  const updateVisibleItems = useCallback(() => {
    if (!containerRef) return;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferCount);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferCount
    );

    const visibleData = items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));

    setVisibleItems(visibleData);
  }, [items, scrollTop, containerHeight, itemHeight, bufferCount, containerRef]);

  useEffect(() => {
    updateVisibleItems();
  }, [updateVisibleItems]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    containerProps: {
      ref: setContainerRef,
      onScroll: handleScroll,
      style: { height: containerHeight, overflow: 'auto', position: 'relative' },
    },
    virtualItems: visibleItems,
    totalHeight,
  };
}; 