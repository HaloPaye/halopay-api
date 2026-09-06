export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp: string;
}

export function formatProblemDetails(
  err: Error & { status?: number; statusCode?: number },
  instanceUri?: string,
  isProduction: boolean = false
): ProblemDetails {
  const status = err.status || err.statusCode || 500;
  const title = status >= 500 ? 'Internal Server Error' : 'Request Error';
  const detail = isProduction && status >= 500 ? 'An unexpected server error occurred.' : err.message;

  return {
    type: 'https://halopay.io/errors/' + status,
    title,
    status,
    detail,
    instance: instanceUri,
    timestamp: new Date().toISOString(),
  };
}
