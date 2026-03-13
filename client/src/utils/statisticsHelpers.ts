// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
};

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

export const formatNumber = (value: number, decimals = 2): string => {
  return value.toFixed(decimals);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const toISOString = (
  date: Date | {toISOString: () => string} | null | undefined,
): string | undefined => {
  if (!date) return undefined;
  return date.toISOString();
};

/**
 * Generates year labels for dropdown based on grouping type.
 * Calendar year: "2024"
 * Academic year: "2024-2025"
 *
 * @param grouping - Type of year grouping
 * @param startYear - Starting year (usually oldest or current - N years)
 * @param endYear - Ending year (usually current year)
 * @returns Array of year strings
 *
 * @example
 * generateYearLabels('CALENDAR', 2020, 2024) // returns ['2024', '2023', '2022', '2021', '2020']
 * generateYearLabels('ACADEMIC', 2020, 2024) // returns ['2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021']
 */
export const generateYearLabels = (
  grouping: 'CALENDAR' | 'ACADEMIC',
  startYear: number,
  endYear: number,
): string[] => {
  const years: string[] = [];

  if (grouping === 'CALENDAR') {
    for (let year = endYear; year >= startYear; year--) {
      years.push(`${year}`);
    }
  } else {
    // For academic years, determine the current academic year properly
    // If we're before August (month < 7), the current academic year started last year
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentCalendarYear = now.getFullYear();
    const maxAcademicStartYear = currentMonth < 7 ? currentCalendarYear - 1 : currentCalendarYear;

    // Limit endYear to not exceed current academic year
    const effectiveEndYear = Math.min(endYear, maxAcademicStartYear);

    for (let year = effectiveEndYear; year >= startYear; year--) {
      years.push(`${year}-${year + 1}`);
    }
  }

  return years;
};

/**
 * Determines which year (calendar or academic) a date belongs to.
 * Academic year starts August 1st and ends July 31st.
 *
 * @param date - The date to categorize
 * @param grouping - Type of year grouping
 * @returns Year string (e.g., "2024" or "2024-2025")
 *
 * @example
 * getYearFromDate(new Date('2024-09-15'), 'CALENDAR') // returns "2024"
 * getYearFromDate(new Date('2024-09-15'), 'ACADEMIC') // returns "2024-2025"
 * getYearFromDate(new Date('2024-05-15'), 'ACADEMIC') // returns "2023-2024"
 */
export const getYearFromDate = (
  date: Date,
  grouping: 'CALENDAR' | 'ACADEMIC',
): string => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11

  if (grouping === 'CALENDAR') {
    return `${year}`;
  }

  // Academic year: August (month 7) to July (month 6)
  if (month < 7) {
    // January-July belongs to previous academic year
    return `${year - 1}-${year}`;
  }
  // August-December belongs to current academic year
  return `${year}-${year + 1}`;
};

/**
 * Truncates a task name if it exceeds the maximum length
 * @param name - Task name to truncate
 * @param maxLength - Maximum length before truncation (default 12)
 * @returns Truncated name with ellipsis or original name
 *
 * @example
 * truncateTaskName('Very Long Task Name', 10) // returns 'Very Long ...'
 * truncateTaskName('Short', 10) // returns 'Short'
 */
export const truncateTaskName = (name: string, maxLength = 12): string => {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

/**
 * Calculates date range based on grouping type and selected year.
 * Useful for converting year filters to actual start/end dates.
 *
 * @param grouping - Type of year grouping (CALENDAR, ACADEMIC, or CUSTOM)
 * @param selectedYear - Selected year string (e.g., "2024" or "2024-2025" or "All")
 * @param customStartDate - Custom start date (only used when grouping is CUSTOM)
 * @param customEndDate - Custom end date (only used when grouping is CUSTOM)
 * @returns Object with startDate and endDate (null if "All" is selected)
 *
 * @example
 * getDateRangeFromYear('CALENDAR', '2024')
 * // returns { startDate: Date('2024-01-01'), endDate: Date('2024-12-31') }
 *
 * getDateRangeFromYear('ACADEMIC', '2024-2025')
 * // returns { startDate: Date('2024-08-01'), endDate: Date('2025-07-31') }
 *
 * getDateRangeFromYear('CALENDAR', 'All')
 * // returns { startDate: null, endDate: null }
 */
export const getDateRangeFromYear = (
  grouping: 'CALENDAR' | 'ACADEMIC' | 'CUSTOM' | 'COURSE',
  selectedYear: string,
  customStartDate: Date | null = null,
  customEndDate: Date | null = null,
): {startDate: Date | null; endDate: Date | null} => {
  if (grouping === 'CUSTOM') {
    return {
      startDate: customStartDate,
      endDate: customEndDate,
    };
  }

  if (selectedYear === 'All') {
    return {
      startDate: null,
      endDate: null,
    };
  }

  if (grouping === 'CALENDAR') {
    const year = Number.parseInt(selectedYear);
    return {
      startDate: new Date(`${year}-01-01`),
      endDate: new Date(`${year}-12-31`),
    };
  }

  // Academic year format "2024-2025" (also used for COURSE grouping)
  const [startYear] = selectedYear.split('-').map(Number);
  return {
    startDate: new Date(`${startYear}-08-01`),
    endDate: new Date(`${startYear + 1}-07-31`),
  };
};
