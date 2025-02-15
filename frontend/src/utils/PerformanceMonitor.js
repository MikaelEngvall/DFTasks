export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.marks = new Map();
    this.observers = new Set();
    this.initializeObservers();
  }

  initializeObservers() {
    // Övervaka långsamma renderingar
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 50ms threshold
            this.reportLongTask(entry);
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Övervaka resursladdningar
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackResourceTiming(entry);
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  startMeasurement(name) {
    this.marks.set(name, performance.now());
  }

  endMeasurement(name) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.trackMetric(name, duration);
      this.marks.delete(name);
    }
  }

  trackMetric(name, value) {
    const metrics = this.metrics.get(name) || [];
    metrics.push({
      value,
      timestamp: Date.now()
    });
    this.metrics.set(name, metrics.slice(-100)); // Behåll bara de senaste 100 mätningarna
    this.notifyObservers(name, value);
  }

  getMetrics(name) {
    return this.metrics.get(name) || [];
  }

  getAverageMetric(name) {
    const metrics = this.getMetrics(name);
    if (!metrics.length) return 0;
    
    const sum = metrics.reduce((acc, curr) => acc + curr.value, 0);
    return sum / metrics.length;
  }

  reportLongTask(entry) {
    console.warn('Long task detected:', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name
    });
    
    this.trackMetric('longTasks', entry.duration);
  }

  trackResourceTiming(entry) {
    const timing = {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize
    };

    this.trackMetric(`resource_${entry.initiatorType}`, timing);
  }

  subscribe(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  notifyObservers(name, value) {
    this.observers.forEach(callback => {
      try {
        callback(name, value);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  generateReport() {
    const report = {
      timestamp: Date.now(),
      metrics: {},
      resourceMetrics: {},
      longTasks: this.getMetrics('longTasks'),
      memory: this.getMemoryUsage(),
      navigation: this.getNavigationTiming()
    };

    // Samla alla mätvärden
    for (const [name, values] of this.metrics.entries()) {
      if (name.startsWith('resource_')) {
        report.resourceMetrics[name] = values;
      } else {
        report.metrics[name] = {
          values,
          average: this.getAverageMetric(name)
        };
      }
    }

    return report;
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  getNavigationTiming() {
    const timing = performance.getEntriesByType('navigation')[0];
    if (timing) {
      return {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domLoad: timing.domContentLoadedEventEnd - timing.loadEventStart,
        fullPageLoad: timing.loadEventEnd - timing.loadEventStart
      };
    }
    return null;
  }

  clearMetrics() {
    this.metrics.clear();
    this.marks.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

export default new PerformanceMonitor(); 