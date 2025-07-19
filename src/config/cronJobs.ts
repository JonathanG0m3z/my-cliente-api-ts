import cron from 'node-cron';
import { logger } from '../utils/logger';

const { URL_BOTS, DEPLOY_HOOK_URL = "" } = process.env;
const MAX_CONSECUTIVE_FAILURES = 10;
const PING_TIMEOUT = 15000; // 15 segundos

let consecutiveFailures = 0;
let lastSuccessfulPing: Date | null = null;

/**
 * Ejecuta el deploy hook de Render
 */
async function executeDeployHook(): Promise<void> {
    try {
        logger.info('Ejecutando deploy hook de Render debido a fallos consecutivos');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT);
        
        const response = await fetch(DEPLOY_HOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            logger.info('Deploy hook ejecutado exitosamente');
            // Resetear contador después de ejecutar el deploy hook
            consecutiveFailures = 0;
        } else {
            logger.error(`Error en deploy hook: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                logger.error('Timeout al ejecutar deploy hook');
            } else {
                logger.error(`Error al ejecutar deploy hook: ${error.message}`);
            }
        } else {
            logger.error('Error desconocido al ejecutar deploy hook');
        }
    }
}

/**
 * Realiza ping al servicio de bots con timeout
 */
async function pingBotsService(): Promise<void> {
    if (!URL_BOTS) {
        logger.error('URL_BOTS no está configurada en las variables de entorno');
        return;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT);
        
        const request = await fetch(URL_BOTS, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (request.ok) {
            const response = await request.json();
            
            // Ping exitoso
            consecutiveFailures = 0;
            lastSuccessfulPing = new Date();
            logger.info('Ping exitoso al servicio de bots', {
                status: request.status,
                response: response,
                consecutiveFailures: 0
            });
        } else {
            // Ping falló con respuesta HTTP
            consecutiveFailures++;
            logger.warn(`Ping falló con status ${request.status}`, {
                status: request.status,
                statusText: request.statusText,
                consecutiveFailures: consecutiveFailures,
                lastSuccessfulPing: lastSuccessfulPing
            });
            
            // Verificar si necesitamos ejecutar el deploy hook
            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                await executeDeployHook();
            }
        }
    } catch (error) {
        // Error de red, timeout u otro error
        consecutiveFailures++;
        
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                logger.error('Timeout en ping al servicio de bots', {
                    timeout: `${PING_TIMEOUT}ms`,
                    consecutiveFailures: consecutiveFailures,
                    lastSuccessfulPing: lastSuccessfulPing
                });
            } else {
                logger.error(`Error en ping al servicio de bots: ${error.message}`, {
                    error: error.message,
                    consecutiveFailures: consecutiveFailures,
                    lastSuccessfulPing: lastSuccessfulPing
                });
            }
        } else {
            logger.error('Error desconocido en ping al servicio de bots', {
                consecutiveFailures: consecutiveFailures,
                lastSuccessfulPing: lastSuccessfulPing
            });
        }
        
        // Verificar si necesitamos ejecutar el deploy hook
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            await executeDeployHook();
        }
    }
}

/**
 * Inicializa los trabajos cron
 */
export function initCronJobs(): void {
    logger.info('Inicializando cronjobs');
    logger.info(`Configuración: Timeout=${PING_TIMEOUT}ms, Max fallos consecutivos=${MAX_CONSECUTIVE_FAILURES}`);
    
    // Ejecutar cada minuto (como estaba originalmente)
    cron.schedule('* * * * *', async () => {
        await pingBotsService();
    });
    
    logger.info('Cronjob de ping iniciado - ejecutándose cada minuto');
}

/**
 * Obtiene estadísticas del cronjob
 */
export function getCronJobStats() {
    return {
        consecutiveFailures,
        lastSuccessfulPing,
        maxConsecutiveFailures: MAX_CONSECUTIVE_FAILURES,
        pingTimeout: PING_TIMEOUT,
        deployHookUrl: DEPLOY_HOOK_URL
    };
}