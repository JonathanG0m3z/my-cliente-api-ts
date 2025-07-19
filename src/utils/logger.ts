/**
 * Sistema de logging simple con timestamps
 * Proporciona diferentes niveles de log con formato consistente
 */

export interface LogData {
    [key: string]: any;
}

class Logger {
    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private formatMessage(level: string, message: string, data?: LogData): string {
        const timestamp = this.formatTimestamp();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (data && Object.keys(data).length > 0) {
            logMessage += ` | Data: ${JSON.stringify(data)}`;
        }
        
        return logMessage;
    }

    /**
     * Log de información general
     */
    info(message: string, data?: LogData): void {
        const formattedMessage = this.formatMessage('info', message, data);
        console.log(formattedMessage);
    }

    /**
     * Log de advertencias
     */
    warn(message: string, data?: LogData): void {
        const formattedMessage = this.formatMessage('warn', message, data);
        console.warn(formattedMessage);
    }

    /**
     * Log de errores
     */
    error(message: string, data?: LogData): void {
        const formattedMessage = this.formatMessage('error', message, data);
        console.error(formattedMessage);
    }

    /**
     * Log de debug (solo en desarrollo)
     */
    debug(message: string, data?: LogData): void {
        if (process.env.NODE_ENV === 'development') {
            const formattedMessage = this.formatMessage('debug', message, data);
            console.debug(formattedMessage);
        }
    }

    /**
     * Log de eventos críticos
     */
    critical(message: string, data?: LogData): void {
        const formattedMessage = this.formatMessage('critical', message, data);
        console.error(`🚨 ${formattedMessage}`);
    }
}

// Exportar instancia singleton del logger
export const logger = new Logger();

// Exportar la clase para casos donde se necesite una instancia personalizada
export { Logger };