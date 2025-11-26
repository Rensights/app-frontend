// OpenTelemetry instrumentation for Next.js
// Only runs in Node.js runtime, not Edge Runtime

// Check if we're in a Node.js environment (not Edge Runtime or browser)
const isNodeRuntime = typeof process !== 'undefined' && 
                      process.versions && 
                      process.versions.node &&
                      typeof EdgeRuntime === 'undefined';

if (!isNodeRuntime) {
  // Skip instrumentation in Edge Runtime or browser
  module.exports = {
    register: async () => {
      // Empty function for Edge Runtime
    }
  };
} else {
  // Node.js runtime - proceed with instrumentation
  let NodeSDK, getNodeAutoInstrumentations, OTLPTraceExporter, Resource, SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_NAMESPACE, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT;

  try {
    ({ NodeSDK } = require('@opentelemetry/sdk-node'));
    ({ getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node'));
    ({ OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http'));
    ({ Resource } = require('@opentelemetry/resources'));
    ({ SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_NAMESPACE, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } = require('@opentelemetry/semantic-conventions'));
  } catch (e) {
    // OpenTelemetry dependencies not installed - skip instrumentation
    console.warn('OpenTelemetry dependencies not found, skipping instrumentation');
    module.exports = {
      register: async () => {
        // Empty function if dependencies missing
      }
    };
  }

  // Only initialize if all dependencies loaded
  if (NodeSDK && getNodeAutoInstrumentations && OTLPTraceExporter && Resource) {
    // Extract environment from resource attributes
    const envMatch = process.env.OTEL_RESOURCE_ATTRIBUTES?.match(/deployment\.environment=([^,]+)/);
    const namespaceMatch = process.env.OTEL_RESOURCE_ATTRIBUTES?.match(/service\.namespace=([^,]+)/);

    const sdk = new NodeSDK({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'frontend',
        [SEMRESATTRS_SERVICE_NAMESPACE]: namespaceMatch?.[1] || 'default',
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: envMatch?.[1] || 'production',
      }),
      traceExporter: new OTLPTraceExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://signoz-otel-collector.platform.svc.cluster.local:4318'}/v1/traces`,
        headers: {},
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-http': {
            enabled: true,
          },
        }),
      ],
    });

    sdk.start();

    console.log('[OpenTelemetry] Instrumentation started for', process.env.OTEL_SERVICE_NAME || 'frontend');

    // Only register signal handlers in Node.js runtime
    if (typeof process !== 'undefined' && process.on) {
      process.on('SIGTERM', () => {
        sdk.shutdown()
          .then(() => console.log('[OpenTelemetry] Terminated'))
          .catch((error) => console.error('[OpenTelemetry] Error terminating', error))
          .finally(() => {
            if (typeof process !== 'undefined' && process.exit) {
              process.exit(0);
            }
          });
      });
    }

    module.exports = {
      register: async () => {
        // Instrumentation already started above
      }
    };
  } else {
    module.exports = {
      register: async () => {
        // Dependencies not available
      }
    };
  }
}
