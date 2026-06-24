// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

export const setServiceToken = (serviceId: string, token: string): void =>
  localStorage.setItem(serviceId, token);

export const resetServiceToken = (serviceId: string): void => localStorage.removeItem(serviceId);

export const resetAllServiceToken = (): void => {
  SERVICE_SOURCE_OPTIONS.forEach(service => resetServiceToken(service.id));
};

/**
 * Gets the service token for the given service ID from localStorage.
 * @param serviceId
 * @returns service token if it exists, otherwise null
 */
export const getServiceToken = (serviceId: string): string | null => localStorage.getItem(serviceId);

export type ServiceSourceOption = {
  id: string;
  label: string;
  tokenLink: string;
};
export const SERVICE_SOURCE_OPTIONS: ServiceSourceOption[] = [
  {id: 'mycourses', label: 'MyCourses', tokenLink: `https://mycourses.aalto.fi/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=${(Math.random() * 10000).toFixed(0)}&urlscheme=${encodeURIComponent(OSSI_PROTOCOL)}`},
  {id: 'aplus', label: 'A+', tokenLink: 'https://plus.cs.aalto.fi/accounts/accounts/'},
];
