// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Visit } from './Visit';
import { initializeIcons } from '@fluentui/react/lib/Icons';

initializeIcons();

const domNode = document.getElementById('root');
if (!domNode) {
  throw new Error('Failed to find the root element');
}

createRoot(domNode).render(
  <React.StrictMode>
    <Visit />
  </React.StrictMode>
);
