export const ANGLES = [
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom",
  "diagonal_1",
  "diagonal_2",
] as const;

export type Angle = (typeof ANGLES)[number];

export const ANGLE_LABELS: Record<Angle, string> = {
  front: "Front",
  back: "Back",
  left: "Left side",
  right: "Right side",
  top: "Top",
  bottom: "Bottom",
  diagonal_1: "Diagonal view 1",
  diagonal_2: "Diagonal view 2",
};
