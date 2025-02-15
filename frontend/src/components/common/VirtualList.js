import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useVirtualization } from '../../hooks/useVirtualization';

const VirtualList = ({ 
  items, 
  renderItem, 
  itemHeight = 50,
  containerHeight = 400,
  className 
}) => {
  const {
    containerProps,
    virtualItems,
    totalHeight,
  } = useVirtualization(items, itemHeight, containerHeight);

  const renderVirtualItem = useCallback((item) => {
    return (
      <div key={item.id} style={item.style}>
        {renderItem(item)}
      </div>
    );
  }, [renderItem]);

  return (
    <div {...containerProps} className={className}>
      <div style={{ height: totalHeight }}>
        {virtualItems.map(renderVirtualItem)}
      </div>
    </div>
  );
};

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  className: PropTypes.string,
};

export default React.memo(VirtualList); 