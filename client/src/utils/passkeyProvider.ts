// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import passkeyAaguidMap from '@/constants/passkeyAaguidMap.json';

const UNKNOWN_PROVIDER = 'Unknown';

// Keep this map periodically updated from a community AAGUID source.
// https://raw.githubusercontent.com/passkeydeveloper/passkey-authenticator-aaguids/refs/heads/main/aaguid.json
export const resolvePasskeyProviderName = (aaguid: string): string => {
  const provider = (passkeyAaguidMap as Partial<Record<string, {name: string}>>)[aaguid.trim().toLowerCase()];
  return provider ? provider.name : UNKNOWN_PROVIDER;
};
