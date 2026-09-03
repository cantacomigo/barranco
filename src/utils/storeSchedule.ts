import { StoreSettings, StoreOperatingMode } from '../types';

export interface StoreScheduleStatus {
  isOpen: boolean;
  statusText: 'Aberto' | 'Fechado';
  statusSubtext: string;
  nextOpenTimeMessage: string;
  currentTimeFormatted: string;
  currentDayName: string;
  mode: StoreOperatingMode;
}

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

/**
 * Parses a "HH:MM" or "HHh" or "HH:MMh" string into minutes from midnight (0 - 1439).
 */
function parseTimeToMinutes(timeStr?: string, defaultMinutes = 0): number {
  if (!timeStr) return defaultMinutes;
  
  const cleaned = timeStr.trim().toLowerCase().replace('h', ':');
  const parts = cleaned.split(':').map((p) => parseInt(p.trim(), 10));
  
  if (parts.length >= 1 && !isNaN(parts[0])) {
    const hours = parts[0];
    const minutes = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 0;
    return Math.min(1439, Math.max(0, hours * 60 + minutes));
  }
  
  return defaultMinutes;
}

/**
 * Extracts start and end minutes from storeSettings.
 * Defaults to 18:00 (1080 min) and 23:59 (1439 min).
 */
export function getScheduleMinutes(settings?: StoreSettings) {
  let openTimeStr = settings?.scheduleOpenTime;
  let closeTimeStr = settings?.scheduleCloseTime;

  // Fallback: try parsing from openingHours string (e.g. "18h às 23h59" or "18:00 às 23:59")
  if ((!openTimeStr || !closeTimeStr) && settings?.openingHours) {
    const match = settings.openingHours.match(/(\d{1,2}(?::\d{2}|h\d{0,2})?)\s*(?:às|as|-|até)\s*(\d{1,2}(?::\d{2}|h\d{0,2})?)/i);
    if (match) {
      if (!openTimeStr) openTimeStr = match[1];
      if (!closeTimeStr) closeTimeStr = match[2];
    }
  }

  const openMinutes = parseTimeToMinutes(openTimeStr, 18 * 60); // 18:00
  const closeMinutes = parseTimeToMinutes(closeTimeStr, 23 * 60 + 59); // 23:59

  return {
    openMinutes,
    closeMinutes,
    openTimeDisplay: openTimeStr && openTimeStr.includes(':') ? openTimeStr : '18:00',
    closeTimeDisplay: closeTimeStr && closeTimeStr.includes(':') ? closeTimeStr : '23:59'
  };
}

/**
 * Computes whether the store is currently open based on current time and store settings.
 */
export function getStoreScheduleStatus(
  settings?: StoreSettings,
  currentDate: Date = new Date()
): StoreScheduleStatus {
  const mode: StoreOperatingMode = settings?.operatingMode || 'auto';

  const currentHours = currentDate.getHours();
  const currentMinutesVal = currentDate.getMinutes();
  const currentDay = currentDate.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  const currentTotalMinutes = currentHours * 60 + currentMinutesVal;

  const currentTimeFormatted = `${String(currentHours).padStart(2, '0')}:${String(currentMinutesVal).padStart(2, '0')}`;
  const currentDayName = DAY_NAMES[currentDay];

  const { openMinutes, closeMinutes, openTimeDisplay, closeTimeDisplay } = getScheduleMinutes(settings);
  const activeDays = settings?.scheduleDays && settings.scheduleDays.length > 0
    ? settings.scheduleDays
    : [0, 1, 2, 3, 4, 5, 6]; // Default: all days active (Segunda a Domingo)

  // 1. Forced Manual Closed
  if (mode === 'always_closed' || (mode === 'manual' && settings?.isOpen === false)) {
    return {
      isOpen: false,
      statusText: 'Fechado',
      statusSubtext: `Fechado no momento (Pausado pelo restaurante)`,
      nextOpenTimeMessage: settings?.closedMessage || `Horário normal: ${openTimeDisplay} às ${closeTimeDisplay}`,
      currentTimeFormatted,
      currentDayName,
      mode
    };
  }

  // 2. Forced Manual Open
  if (mode === 'always_open' || (mode === 'manual' && settings?.isOpen === true)) {
    return {
      isOpen: true,
      statusText: 'Aberto',
      statusSubtext: 'Aberto para pedidos (Modo Manual)',
      nextOpenTimeMessage: 'Recebendo pedidos agora',
      currentTimeFormatted,
      currentDayName,
      mode
    };
  }

  // 3. Automatic mode (default)
  const isTodayActiveDay = activeDays.includes(currentDay);

  let isOpenByTime = false;

  if (openMinutes <= closeMinutes) {
    // Normal same-day schedule (e.g. 18:00 to 23:59)
    // Between 18:00 (1080) and 23:59 (1439). At 01:30 (90), isOpenByTime is FALSE!
    isOpenByTime = isTodayActiveDay && (currentTotalMinutes >= openMinutes && currentTotalMinutes <= closeMinutes);
  } else {
    // Crosses midnight (e.g. 18:00 to 02:00)
    // Open if after 18:00 today, OR if before 02:00 (which belongs to yesterday's shift)
    const yesterday = (currentDay + 6) % 7;
    const isYesterdayActive = activeDays.includes(yesterday);

    if (currentTotalMinutes >= openMinutes && isTodayActiveDay) {
      isOpenByTime = true;
    } else if (currentTotalMinutes <= closeMinutes && isYesterdayActive) {
      isOpenByTime = true;
    }
  }

  if (isOpenByTime) {
    return {
      isOpen: true,
      statusText: 'Aberto',
      statusSubtext: `Atendimento aberto • Fecha às ${closeTimeDisplay}`,
      nextOpenTimeMessage: `Entrega rápida em 30-45 min`,
      currentTimeFormatted,
      currentDayName,
      mode
    };
  } else {
    // Store is closed
    let nextMsg = `Abre às ${openTimeDisplay}`;
    if (!isTodayActiveDay) {
      nextMsg = `Fechado hoje (${currentDayName}). Retornamos no próximo dia útil às ${openTimeDisplay}`;
    } else if (currentTotalMinutes < openMinutes) {
      nextMsg = `Abre hoje às ${openTimeDisplay}`;
    } else {
      nextMsg = `Abre amanhã às ${openTimeDisplay}`;
    }

    return {
      isOpen: false,
      statusText: 'Fechado',
      statusSubtext: `Atendimento das ${openTimeDisplay} às ${closeTimeDisplay}`,
      nextOpenTimeMessage: nextMsg,
      currentTimeFormatted,
      currentDayName,
      mode
    };
  }
}
