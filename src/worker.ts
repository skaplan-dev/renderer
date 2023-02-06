import React from 'react';
import * as RemoteUI from '@remote-ui/react';
import { createEndpoint, retain } from '@remote-ui/rpc';

type RenderCallback = (root: RemoteUI.RemoteRoot, props: any) => void;

let renderCallback: RenderCallback | undefined;

/* eslint-disable hubspot-dev/no-confusing-browser-globals */
(self as any).onRender = (callback: RenderCallback) => {
  renderCallback = callback;
};

const endpoint = createEndpoint(self as any);
endpoint.expose({ load, render });

export function load(script: string) {
  // @ts-expect-error RemoteUI not found on global
  self.RemoteUI = RemoteUI;
  self.React = React;

  importScripts(script);
}

export function render(receiver: any, props: any) {
  retain(receiver);
  retain(props);

  if (!renderCallback) {
    throw new Error('renderCallback not yet available!');
  }

  const remoteRoot = RemoteUI.createRemoteRoot(receiver, {
    components: ['div', 'button', 'Heading', 'Button', 'Card', 'App'],
  });

  renderCallback(remoteRoot, props);
}
