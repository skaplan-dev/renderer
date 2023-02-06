/**
 * Adapted from HubSpot/shared-worker-versioning:
 * https://git.hubteam.com/HubSpot/shared-worker-versioning/blob/57e61b29a3a3a29537d4d43509bfc1f1cff89bdb/shared-worker-versioning/static/js/lib/utils/createWorker.ts#L27-L50
 */

type WorkerArgs = { url: string };

export function createWorkerFallback(options: WorkerArgs) {
  let worker = null;
  try {
    let blob;
    try {
      blob = new Blob([`importScripts('${options.url}');`], {
        type: 'application/javascript',
      });
    } catch (error) {
      // @ts-expect-error any
      return { error, worker: null };
    }
    const url = window.URL || window.webkitURL;
    const blobUrl = url.createObjectURL(blob);
    worker = new Worker(blobUrl, {
      credentials: 'include',
    });
  } catch (error) {
    return { error, worker: null };
  }
      // @ts-expect-error any

  return { worker, error: null };
}

export function createWorker({ url }: WorkerArgs) {
  if (!url.startsWith('http'))
    throw new Error('Supplied worker url must be absolute');

  let result: { worker: Worker | null; error: any } = {
    worker: null,
    error: null,
  };

  try {
    result.worker = new Worker(url, {
      credentials: 'include',
    });
    result.worker.onerror = function (event) {
      event.preventDefault();
      result = createWorkerFallback({ url });
    };
  } catch (e) {
    result = createWorkerFallback({ url });
  }

  return result;
}
