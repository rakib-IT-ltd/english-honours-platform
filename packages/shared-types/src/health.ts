/** Response shape of the API health endpoints, shared so clients stay in sync. */
export interface HealthResponse {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
}

export interface ReadinessResponse extends HealthResponse {
  checks: { database: 'up' | 'down' };
}
