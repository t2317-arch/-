import { Point, GeometryMetrics } from '../types';

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// Project point P onto the line passing through P1 and P2
export function projectPointToLine(p: Point, p1: Point, p2: Point): Point {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { ...p1 };
  
  const t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq;
  return {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };
}

export function calculateArea(A: Point, B: Point, C: Point): number {
  return 0.5 * Math.abs(A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
}

export function getMetrics(A: Point, B: Point, C: Point): GeometryMetrics {
  const a = distance(B, C); // opposite to A
  const b = distance(A, C); // opposite to B
  const c = distance(A, B); // opposite to C

  // Angles in degrees
  const radA = Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c))));
  const radB = Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c))));
  const radC = Math.acos(Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b))));

  const angleA = (radA * 180) / Math.PI;
  const angleB = (radB * 180) / Math.PI;
  const angleC = (radC * 180) / Math.PI;

  const area = calculateArea(A, B, C);

  // Classification
  let triangleType: 'acute' | 'right' | 'obtuse' = 'acute';
  const tol = 1.0; // 1 degree tolerance for right triangle detection
  if (Math.abs(angleA - 90) < tol || Math.abs(angleB - 90) < tol || Math.abs(angleC - 90) < tol) {
    triangleType = 'right';
  } else if (angleA > 90 || angleB > 90 || angleC > 90) {
    triangleType = 'obtuse';
  }

  // Special classification
  let specialType: 'equilateral' | 'isosceles' | 'scalene' = 'scalene';
  const sideTol = 0.05; // 5% tolerance
  const diffAB = Math.abs(c - b) / Math.max(c, b);
  const diffBC = Math.abs(a - c) / Math.max(a, c);
  const diffCA = Math.abs(b - a) / Math.max(b, a);

  if (diffAB < sideTol && diffBC < sideTol && diffCA < sideTol) {
    specialType = 'equilateral';
  } else if (diffAB < sideTol || diffBC < sideTol || diffCA < sideTol) {
    specialType = 'isosceles';
  }

  return {
    a,
    b,
    c,
    angleA,
    angleB,
    angleC,
    area,
    triangleType,
    specialType,
  };
}

// 1. Centroid (무게중심)
export function getCentroid(A: Point, B: Point, C: Point): Point {
  return {
    x: (A.x + B.x + C.x) / 3,
    y: (A.y + B.y + C.y) / 3,
  };
}

// 2. Incenter (내심)
export function getIncenter(A: Point, B: Point, C: Point): { center: Point; r: number } {
  const a = distance(B, C);
  const b = distance(A, C);
  const c = distance(A, B);
  const perimeter = a + b + c;

  if (perimeter === 0) return { center: { ...A }, r: 0 };

  const center = {
    x: (a * A.x + b * B.x + c * C.x) / perimeter,
    y: (a * A.y + b * B.y + c * C.y) / perimeter,
  };

  const area = calculateArea(A, B, C);
  const r = (2 * area) / perimeter;

  return { center, r };
}

// 3. Circumcenter (외심)
export function getCircumcenter(A: Point, B: Point, C: Point): { center: Point; R: number } {
  const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  
  if (Math.abs(D) < 0.001) {
    // Collinear case fallback: midpoint of longest segment
    const dAB = distance(A, B);
    const dBC = distance(B, C);
    const dCA = distance(C, A);
    const maxDist = Math.max(dAB, dBC, dCA);
    if (maxDist === dAB) return { center: { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }, R: dAB / 2 };
    if (maxDist === dBC) return { center: { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 }, R: dBC / 2 };
    return { center: { x: (C.x + A.x) / 2, y: (C.y + A.y) / 2 }, R: dCA / 2 };
  }

  const sqA = A.x * A.x + A.y * A.y;
  const sqB = B.x * B.x + B.y * B.y;
  const sqC = C.x * C.x + C.y * C.y;

  const ux = (sqA * (B.y - C.y) + sqB * (C.y - A.y) + sqC * (A.y - B.y)) / D;
  const uy = (sqA * (C.x - B.x) + sqB * (A.x - C.x) + sqC * (B.x - A.x)) / D;

  const center = { x: ux, y: uy };
  const R = distance(center, A);

  return { center, R };
}

// 4. Orthocenter (수심)
export function getOrthocenter(A: Point, B: Point, C: Point): Point {
  const G = getCentroid(A, B, C);
  const O = getCircumcenter(A, B, C).center;

  // H = 3G - 2O
  return {
    x: 3 * G.x - 2 * O.x,
    y: 3 * G.y - 2 * O.y,
  };
}
