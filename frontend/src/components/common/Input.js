import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const Input = forwardRef(({ 
  label,
  error,
  className,
  type = 'text',
  ...props 
}, ref) => {
  const inputClasses = classNames(
    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm',
    {
      'border-gray-300 focus:ring-df-primary focus:border-df-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white': !error,
      'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600': error
    },
    className
  );

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div>
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string
};

Input.displayName = 'Input'; 