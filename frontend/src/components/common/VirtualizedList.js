import React, { useCallback, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePerformance } from '../../hooks/usePerformance';

const VirtualizedList = ({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 0.8
}) => {
  const { measureOperation } = usePerformance('VirtualizedList');
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isEndReached, setIsEndReached] = useState(false);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = useCallback(async (event) => {
    await measureOperation('scroll', async () => {
      const newScrollTop = event.target.scrollTop;
      setScrollTop(newScrollTop);

      // Kontrollera om vi nått slutet av listan
      const scrolledPercentage = (newScrollTop + containerHeight) / totalHeight;
      if (scrolledPercentage >= endReachedThreshold && !isEndReached) {
        setIsEndReached(true);
        onEndReached?.();
      } else if (scrolledPercentage < endReachedThreshold) {
        setIsEndReached(false);
      }
    });
  }, [containerHeight, totalHeight, endReachedThreshold, isEndReached, onEndReached]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.dataset.visible = 'true';
          } else {
            entry.target.dataset.visible = 'false';
          }
        });
      },
      { root: containerRef.current }
    );

    const container = containerRef.current;
    if (container) {
      Array.from(container.children).forEach(child => {
        observer.observe(child);
      });
    }

    return () => observer.disconnect();
  }, [visibleItems]);

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  overscan: PropTypes.number,
  onEndReached: PropTypes.func,
  endReachedThreshold: PropTypes.number
};

export default React.memo(VirtualizedList); 