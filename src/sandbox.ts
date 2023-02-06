import {
  createEndpoint,
  Endpoint,
  fromInsideIframe,
  fromWebWorker,
  retain,
} from '@remote-ui/rpc';
import { RemoteChannel } from '@remote-ui/core';

import { createWorker } from './utils/createWorker';

interface WorkerEndpoint {
  load: (script: string) => void;
  render: (receiver: RemoteChannel) => void;
}

let workerEndpoint: Endpoint<WorkerEndpoint>;

export function start() {
  const endpoint = createEndpoint(fromInsideIframe(), { callable: [] });
  endpoint.expose({ load, render });
  window.addEventListener('message', initialize);
}

function initialize({ data }: MessageEvent) {
  if (data == null || typeof data.init !== 'string') return;
  const { worker } = createWorker({
    url: 'http://localhost:8081/bundles/worker.js',
  });
  workerEndpoint = createEndpoint<WorkerEndpoint>(
    fromWebWorker(worker as Worker)
  );
}

function load(script: string) {
  return workerEndpoint.call.load(script);
}

function render(receiver: RemoteChannel) {
  retain(receiver);
  return workerEndpoint.call.render(receiver);
}
