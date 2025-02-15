import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const Card = ({ 
  children, 
  className,
  title,
  footer,
  isLoading,
  ...props 
}) => {
  const cardClasses = classNames(
    'bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden',
    className
  );

  if (isLoading) {
    return (
      <div className={cardClasses} {...props}>
        <div className="p-4 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {title && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.node,
  footer: PropTypes.node,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}; 