// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {ServiceSourceOption} from '@/common/types';

export const setServiceToken = (serviceId: string, token: string): void =>
  localStorage.setItem(serviceId, token);

export const resetServiceToken = (serviceId: string): void =>
  localStorage.removeItem(serviceId);

export const resetAllServiceToken = (
  options: ServiceSourceOption[]
): void => {
  options.forEach(service => resetServiceToken(service.id));
};

/**
 * Gets the service token for the given service ID from localStorage.
 * @param serviceId
 * @returns service token if it exists, otherwise null
 */
export const getServiceToken = (serviceId: string): string | null =>
  localStorage.getItem(serviceId);
