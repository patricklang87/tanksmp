/**
 * The player sees a turret angle from 0 to 180 degrees (0 = pointing left, 90 = straight up,
 * 180 = pointing right). The server and the canvas use the convention -180..0 (-180 = left,
 * -90 = up, 0 = right), so the two are always exactly 180 degrees apart.
 */
const ANGLE_OFFSET_DEGREES = 180;

export const MIN_DISPLAYED_TURRET_ANGLE = 0;
export const MAX_DISPLAYED_TURRET_ANGLE = 180;

export const toServerTurretAngle = (displayedAngle: number): number =>
  displayedAngle - ANGLE_OFFSET_DEGREES;

export const toDisplayedTurretAngle = (serverAngle: number): number =>
  serverAngle + ANGLE_OFFSET_DEGREES;
