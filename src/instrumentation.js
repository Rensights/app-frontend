// OpenTelemetry instrumentation for Next.js
// Only runs in Node.js runtime, not Edge Runtime

export async function register() {
  // Check if we're in a Node.js environment (not Edge Runtime or browser)
  // Use indirect access to avoid Edge Runtime static analysis
  let isNodeRuntime = false;
  try {
    // Access process via globalThis using bracket notation to avoid static analysis
    const proc = globalThis['process'];
    if (proc && typeof proc === 'object' && proc.versions && typeof proc.versions === 'object' && proc.versions.node) {
      // Check for Edge Runtime using indirect access
      const edgeRuntime = globalThis['EdgeRuntime'];
      isNodeRuntime = typeof edgeRuntime === 'undefined';
    }
  } catch (e) {
    // Not in Node.js runtime
    isNodeRuntime = false;
  }

  if (!isNodeRuntime) {
    // Skip instrumentation in Edge Runtime or browser
    return;
  }

  // Node.js runtime - proceed with instrumentation
  let NodeSDK, getNodeAutoInstrumentations, OTLPTraceExporter, Resource, SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_NAMESPACE, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ NodeSDK } = require('@opentelemetry/sdk-node'));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node'));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http'));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ Resource } = require('@opentelemetry/resources'));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_NAMESPACE, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } = require('@opentelemetry/semantic-conventions'));
  } catch {
    // OpenTelemetry dependencies not installed - skip instrumentation
    console.warn('OpenTelemetry dependencies not found, skipping instrumentation');
    return;
  }

  // Only initialize if all dependencies loaded
  if (!NodeSDK || !getNodeAutoInstrumentations || !OTLPTraceExporter || !Resource) {
    return;
  }

  // Extract environment from resource attributes
  // Use safe access to avoid Edge Runtime warnings
  const procEnv = (function() {
    try {
      // Use indirect access to avoid static analysis
      const p = globalThis['process'];
      return p && p.env ? p.env : {};
    } catch {
      return {};
    }
  })();
  const envMatch = procEnv.OTEL_RESOURCE_ATTRIBUTES?.match(/deployment\.environment=([^,]+)/);
  const namespaceMatch = procEnv.OTEL_RESOURCE_ATTRIBUTES?.match(/service\.namespace=([^,]+)/);
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: procEnv.OTEL_SERVICE_NAME || 'frontend',
      [SEMRESATTRS_SERVICE_NAMESPACE]: namespaceMatch?.[1] || 'default',
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: envMatch?.[1] || 'production',
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${procEnv.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://signoz-otel-collector.platform.svc.cluster.local:4318'}/v1/traces`,
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

  console.log('[OpenTelemetry] Instrumentation started for', procEnv.OTEL_SERVICE_NAME || 'frontend');

  // Only register signal handlers in Node.js runtime
  // Use indirect access to avoid Edge Runtime static analysis warnings
  try {
    const proc = globalThis['process'];
    if (proc && typeof proc === 'object' && typeof proc.on === 'function') {
      proc.on('SIGTERM', () => {
        sdk.shutdown()
          .then(() => console.log('[OpenTelemetry] Terminated'))
          .catch((error) => console.error('[OpenTelemetry] Error terminating', error))
          .finally(() => {
            try {
              const procExit = globalThis['process'];
              if (procExit && typeof procExit === 'object' && typeof procExit.exit === 'function') {
                procExit.exit(0);
              }
            } catch {
              // Ignore if process.exit is not available
            }
          });
      });
    }
  } catch {
    // Signal handlers not available in this runtime
  }
}
