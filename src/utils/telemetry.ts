import { spawn } from 'node:child_process';

/**
 * Report metrics in a background process so the user terminal 
 * doesn't block on network latency.
 */
export function reportMetric(command: string, status: 'SUCCESS' | 'FAILED', error?: string): void {
  const payload = JSON.stringify({ 
    command, 
    status, 
    error,
    timestamp: new Date().toISOString() 
  });
  
  const workerUrl = process.env.DLBR_TELEMETRY_URL || 'https://telemetry.dlbr.workers.dev/v1/metrics';
  
  // Use spawn with detached option to fire-and-forget
  const child = spawn(process.execPath, ['-e', `
    fetch('${workerUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '${payload.replace(/'/g, "\\'")}'
    }).catch(() => {})
  `], {
    detached: true,
    stdio: 'ignore'
  });
  
  child.unref();
}
