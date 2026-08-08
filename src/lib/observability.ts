/**
 * Módulo de Observabilidade, Tracing (OpenTelemetry / Sentry / Datadog) e Monitoramento de Desempenho
 */

interface TraceSpan {
  name: string;
  startTime: number;
  end: () => void;
}

class ObservabilityService {
  private isInitialized = false;
  private dsn: string | null = (import.meta as any).env?.VITE_SENTRY_DSN || null;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('📡 Inicializando agente de Observabilidade & Tracing (OpenTelemetry/Sentry)...');

    // Captura global de exceções não tratadas no navegador
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Captura de rejeições de Promise não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { type: 'unhandled_promise_rejection' }
      );
    });
  }

  /**
   * Captura exceção e envia para os provedores de observabilidade (Sentry, OpenTelemetry, Datadog)
   */
  public captureException(error: Error, extraData?: Record<string, any>) {
    console.error('📊 [Observability Log]:', error.message, {
      name: error.name,
      stack: error.stack,
      extraData,
      timestamp: new Date().toISOString(),
    });

    if (this.dsn && typeof window !== 'undefined') {
      // Exemplo de integração nativa Sentry / Datadog RUM
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(error, { extra: extraData });
      }
      if ((window as any).DD_RUM) {
        (window as any).DD_RUM.addError(error, extraData);
      }
    }
  }

  /**
   * Inicia rastreamento de desempenho de uma transação ou requisição API (OpenTelemetry Span)
   */
  public startSpan(name: string): TraceSpan {
    const startTime = performance.now();
    return {
      name,
      startTime,
      end: () => {
        const duration = performance.now() - startTime;
        console.log(`⏱️ [Span ${name}]: ${duration.toFixed(2)}ms`);
      },
    };
  }

  /**
   * Registra ação de usuário para analytics e auditoria de observabilidade
   */
  public trackEvent(eventName: string, properties?: Record<string, any>) {
    console.log(`🎯 [Event Tracked]: ${eventName}`, properties);
  }
}

export const observability = new ObservabilityService();
