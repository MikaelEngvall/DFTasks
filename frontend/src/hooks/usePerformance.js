import { useEffect, useCallback } from 'react';
import PerformanceMonitor from '../utils/PerformanceMonitor';

export const usePerformance = (componentName, options = {}) => {
  const {
    trackRender = true,
    trackEffects = false,
    reportThreshold = 16 // 1 frame @ 60fps
  } = options;

  useEffect(() => {
    if (trackRender) {
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        if (duration > reportThreshold) {
          PerformanceMonitor.trackMetric(`${componentName}_render`, duration);
        }
      };
    }
  });

  const trackEffect = useCallback((effectName, fn) => {
    if (!trackEffects) return fn;

    return async (...args) => {
      const startTime = performance.now();
      try {
        return await fn(...args);
      } finally {
        const duration = performance.now() - startTime;
        if (duration > reportThreshold) {
          PerformanceMonitor.trackMetric(
            `${componentName}_effect_${effectName}`,
            duration
          );
        }
      }
    };
  }, [componentName, trackEffects, reportThreshold]);

  const measureOperation = useCallback(async (operationName, operation) => {
    const startTime = performance.now();
    try {
      return await operation();
    } finally {
      const duration = performance.now() - startTime;
      PerformanceMonitor.trackMetric(
        `${componentName}_operation_${operationName}`,
        duration
      );
    }
  }, [componentName]);

  return {
    trackEffect,
    measureOperation,
    monitor: PerformanceMonitor
  };
}; 