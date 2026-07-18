export interface Point {
  x: number;
  y: number;
}

export type CenterType = 'incenter' | 'circumcenter' | 'centroid' | 'euler';

export interface TriangleState {
  A: Point;
  B: Point;
  C: Point;
}

export interface GeometryMetrics {
  a: number; // side BC
  b: number; // side AC
  c: number; // side AB
  angleA: number; // in degrees
  angleB: number; // in degrees
  angleC: number; // in degrees
  area: number;
  triangleType: 'acute' | 'right' | 'obtuse';
  specialType: 'equilateral' | 'isosceles' | 'scalene';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  successCondition: string;
  isCompleted: boolean;
}
