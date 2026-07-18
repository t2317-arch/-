import React, { useRef, useState } from 'react';
import { Point, CenterType, TriangleState, GeometryMetrics } from '../types';
import {
  distance,
  projectPointToLine,
  getCentroid,
  getIncenter,
  getCircumcenter,
  getOrthocenter,
} from '../utils/geometry';
import { RefreshCw, Grid, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface GeometryCanvasProps {
  vertices: TriangleState;
  metrics: GeometryMetrics;
  activeTab: CenterType;
  onVertexChange: (vertex: 'A' | 'B' | 'C', newPoint: Point) => void;
  onReset: () => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showMeasurements: boolean;
  setShowMeasurements: (show: boolean) => void;
  showConstruction: boolean;
  setShowConstruction: (show: boolean) => void;
  showCircles: boolean;
  setShowCircles: (show: boolean) => void;
}

export const GeometryCanvas: React.FC<GeometryCanvasProps> = ({
  vertices,
  metrics,
  activeTab,
  onVertexChange,
  onReset,
  showGrid,
  setShowGrid,
  showMeasurements,
  setShowMeasurements,
  showConstruction,
  setShowConstruction,
  showCircles,
  setShowCircles,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedVertex, setDraggedVertex] = useState<'A' | 'B' | 'C' | null>(null);

  const { A, B, C } = vertices;

  // Calculate Centers
  const centroid = getCentroid(A, B, C);
  const { center: incenter, r: inradius } = getIncenter(A, B, C);
  const { center: circumcenter, R: circumradius } = getCircumcenter(A, B, C);
  const orthocenter = getOrthocenter(A, B, C);

  // Midpoints of sides (opposing vertices)
  const Ma = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 }; // Mid BC (opposite A)
  const Mb = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 }; // Mid AC (opposite B)
  const Mc = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }; // Mid AB (opposite C)

  // Incenter projections to sides (contact points of incircle)
  const Ta = projectPointToLine(incenter, B, C);
  const Tb = projectPointToLine(incenter, A, C);
  const Tc = projectPointToLine(incenter, A, B);

  // Orthocenter projections to sides (altitude feet)
  const Ha = projectPointToLine(A, B, C);
  const Hb = projectPointToLine(B, A, C);
  const Hc = projectPointToLine(C, A, B);

  // Ray intersections for Angle Bisectors on opposite sides
  // Using Angle Bisector Theorem ratio
  const Da = {
    x: (metrics.b * B.x + metrics.a * A.x) / (metrics.b + metrics.a), // Wait: Da lies on BC, so its ratio depends on sides AC (b) and AB (c)
  };
  // More precisely: Da = (c*C + b*B) / (b+c)
  const Da_correct = {
    x: (metrics.c * C.x + metrics.b * B.x) / (metrics.c + metrics.b),
    y: (metrics.c * C.y + metrics.b * B.y) / (metrics.c + metrics.b),
  };
  const Db_correct = {
    x: (metrics.c * C.x + metrics.a * A.x) / (metrics.c + metrics.a),
    y: (metrics.c * C.y + metrics.a * A.y) / (metrics.c + metrics.a),
  };
  const Dc_correct = {
    x: (metrics.b * B.x + metrics.a * A.x) / (metrics.b + metrics.a),
    y: (metrics.b * B.y + metrics.a * A.y) / (metrics.b + metrics.a),
  };

  // Pointer event handlers for dragging
  const handlePointerDown = (vertex: 'A' | 'B' | 'C', e: React.PointerEvent) => {
    e.preventDefault();
    setDraggedVertex(vertex);
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggedVertex || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 500;

    // Boundary constraints with padding
    const padding = 30;
    const constrainedX = Math.max(padding, Math.min(600 - padding, x));
    const constrainedY = Math.max(padding, Math.min(500 - padding, y));

    onVertexChange(draggedVertex, { x: constrainedX, y: constrainedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedVertex && svgRef.current) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    setDraggedVertex(null);
  };

  // Helper: Draw Right Angle box at T on line P1-P2 with perpendicular from P
  const renderRightAngle = (T: Point, P1: Point, P: Point, strokeColor = '#94a3b8') => {
    const dTP1 = distance(T, P1);
    const dTP = distance(T, P);
    if (dTP1 < 4 || dTP < 4) return null;

    // Unit vectors
    const ux = (P1.x - T.x) / dTP1;
    const uy = (P1.y - T.y) / dTP1;
    const vx = (P.x - T.x) / dTP;
    const vy = (P.y - T.y) / dTP;

    const size = 10;
    const p1 = { x: T.x + size * ux, y: T.y + size * uy };
    const p2 = { x: T.x + size * ux + size * vx, y: T.y + size * uy + size * vy };
    const p3 = { x: T.x + size * vx, y: T.y + size * vy };

    return (
      <path
        d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
        className="opacity-70"
      />
    );
  };

  // Helper: Get offset position for side length label
  const getSideLabelPos = (p1: Point, p2: Point, oppositePoint: Point) => {
    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    // Get direction perpendicular to the side, pointing outward (away from opposite vertex)
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return mid;

    // Perpendicular vector
    const px = -dy / len;
    const py = dx / len;

    // Vector from mid to oppositePoint
    const ox = oppositePoint.x - mid.x;
    const oy = oppositePoint.y - mid.y;

    // Dot product determines if (px, py) points toward or away from oppositePoint
    const dot = px * ox + py * oy;
    const sign = dot > 0 ? -1 : 1; // Reverse so it points away

    const offset = 18;
    return {
      x: mid.x + px * offset * sign,
      y: mid.y + py * offset * sign,
    };
  };

  // Helper: Get position for angle label inside the triangle
  const getAngleLabelPos = (vertex: Point, pLeft: Point, pRight: Point) => {
    // Bisector direction
    const dLeft = distance(vertex, pLeft);
    const dRight = distance(vertex, pRight);
    if (dLeft === 0 || dRight === 0) return vertex;

    const v1x = (pLeft.x - vertex.x) / dLeft;
    const v1y = (pLeft.y - vertex.y) / dLeft;
    const v2x = (pRight.x - vertex.x) / dRight;
    const v2y = (pRight.y - vertex.y) / dRight;

    // Sum of unit vectors gives bisector direction
    let bx = v1x + v2x;
    let by = v1y + v2y;
    const blen = Math.sqrt(bx * bx + by * by);

    if (blen === 0) return vertex;
    bx /= blen;
    by /= blen;

    const offset = 28;
    return {
      x: vertex.x + bx * offset,
      y: vertex.y + by * offset,
    };
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
      {/* Canvas Toolbar */}
      <div className="bg-slate-800 px-5 py-3 flex justify-between items-center rounded-t-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider font-mono">
            GEOMETRY STAGE (600 × 500)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`py-1 px-2.5 rounded-md text-[10px] uppercase font-bold font-mono tracking-wider border transition-all cursor-pointer ${
              showGrid
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            }`}
            title="격자 토글"
          >
            Grid: {showGrid ? "ON" : "OFF"}
          </button>
          <button
            onClick={onReset}
            className="py-1 px-2.5 rounded-md text-[10px] uppercase font-bold font-mono tracking-wider border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all cursor-pointer"
            title="삼각형 초기화"
          >
            Reset
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-4 select-none">
        <svg
          ref={svgRef}
          viewBox="0 0 600 500"
          className="w-full max-w-[600px] h-auto bg-white rounded-xl border border-slate-200/60 shadow-inner"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          {/* 1. Grid Background */}
          {showGrid && (
            <g>
              {/* Vertical Grid Lines */}
              {Array.from({ length: 11 }).map((_, i) => {
                const x = (i + 1) * 50;
                return (
                  <line
                    key={`v-${x}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={500}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                );
              })}
              {/* Horizontal Grid Lines */}
              {Array.from({ length: 9 }).map((_, i) => {
                const y = (i + 1) * 50;
                return (
                  <line
                    key={`h-${y}`}
                    x1={0}
                    y1={y}
                    x2={600}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                );
              })}
              {/* Subtle Coordinate Axis Dots */}
              {Array.from({ length: 11 }).map((_, i) => {
                const x = (i + 1) * 50;
                return Array.from({ length: 9 }).map((_, j) => {
                  const y = (j + 1) * 50;
                  return (
                    <circle
                      key={`dot-${x}-${y}`}
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill="#cbd5e1"
                      className="opacity-50"
                    />
                  );
                });
              })}
            </g>
          )}

          {/* 2. Construction Lines & Circles by Active Tab */}

          {/* INCENTER (내심) Construction */}
          {activeTab === 'incenter' && (
            <g>
              {/* Incircle */}
              {showCircles && (
                <circle
                  cx={incenter.x}
                  cy={incenter.y}
                  r={inradius}
                  fill="rgba(245, 158, 11, 0.03)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}

              {/* Angle Bisectors */}
              {showConstruction && (
                <g>
                  {/* Bisector lines from vertices to opposite sides */}
                  <line
                    x1={A.x}
                    y1={A.y}
                    x2={Da_correct.x}
                    y2={Da_correct.y}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="5 3"
                  />
                  <line
                    x1={B.x}
                    y1={B.y}
                    x2={Db_correct.x}
                    y2={Db_correct.y}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="5 3"
                  />
                  <line
                    x1={C.x}
                    y1={C.y}
                    x2={Dc_correct.x}
                    y2={Dc_correct.y}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="5 3"
                  />

                  {/* Perpendiculars from Incenter to sides (Inradius distances) */}
                  <line
                    x1={incenter.x}
                    y1={incenter.y}
                    x2={Ta.x}
                    y2={Ta.y}
                    stroke="#ea580c"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={incenter.x}
                    y1={incenter.y}
                    x2={Tb.x}
                    y2={Tb.y}
                    stroke="#ea580c"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={incenter.x}
                    y1={incenter.y}
                    x2={Tc.x}
                    y2={Tc.y}
                    stroke="#ea580c"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />

                  {/* Right Angle Boxes for perpendiculars */}
                  {renderRightAngle(Ta, B, incenter, '#ea580c')}
                  {renderRightAngle(Tb, A, incenter, '#ea580c')}
                  {renderRightAngle(Tc, A, incenter, '#ea580c')}

                  {/* Contact points */}
                  <circle cx={Ta.x} cy={Ta.y} r="3" fill="#ea580c" />
                  <circle cx={Tb.x} cy={Tb.y} r="3" fill="#ea580c" />
                  <circle cx={Tc.x} cy={Tc.y} r="3" fill="#ea580c" />
                </g>
              )}
            </g>
          )}

          {/* CIRCUMCENTER (외심) Construction */}
          {activeTab === 'circumcenter' && (
            <g>
              {/* Circumcircle */}
              {showCircles && (
                <circle
                  cx={circumcenter.x}
                  cy={circumcenter.y}
                  r={circumradius}
                  fill="rgba(14, 165, 233, 0.02)"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}

              {/* Perpendicular Bisectors */}
              {showConstruction && (
                <g>
                  {/* Drawing Perpendicular Bisectors extending through O and Midpoints */}
                  {/* To make it look elegant, we draw lines from O to the midpoints, and extend them outwards */}
                  {(() => {
                    const extendLine = (mid: Point, o: Point, sideP1: Point) => {
                      const dx = o.x - mid.x;
                      const dy = o.y - mid.y;
                      const d = Math.sqrt(dx * dx + dy * dy);
                      if (d === 0) {
                        // O is at the midpoint (right-angled triangle)
                        // Perpendicular direction is opposite to side direction
                        const sdx = sideP1.x - mid.x;
                        const sdy = sideP1.y - mid.y;
                        const slen = Math.sqrt(sdx * sdx + sdy * sdy);
                        const px = -sdy / slen;
                        const py = sdx / slen;
                        return {
                          x1: mid.x - px * 100,
                          y1: mid.y - py * 100,
                          x2: mid.x + px * 150,
                          y2: mid.y + py * 150,
                        };
                      }
                      // Normal case: extend line segment passing through mid and o
                      const factorNear = -80 / d; // extend past mid
                      const factorFar = (d + 80) / d; // extend past o
                      return {
                        x1: mid.x + dx * factorNear,
                        y1: mid.y + dy * factorNear,
                        x2: mid.x + dx * factorFar,
                        y2: mid.y + dy * factorFar,
                      };
                    };

                    const lA = extendLine(Ma, circumcenter, B);
                    const lB = extendLine(Mb, circumcenter, C);
                    const lC = extendLine(Mc, circumcenter, A);

                    return (
                      <>
                        <line
                          x1={lA.x1}
                          y1={lA.y1}
                          x2={lA.x2}
                          y2={lA.y2}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="5 3"
                        />
                        <line
                          x1={lB.x1}
                          y1={lB.y1}
                          x2={lB.x2}
                          y2={lB.y2}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="5 3"
                        />
                        <line
                          x1={lC.x1}
                          y1={lC.y1}
                          x2={lC.x2}
                          y2={lC.y2}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="5 3"
                        />
                      </>
                    );
                  })()}

                  {/* Midpoint markers (tick marks) to show side bisected */}
                  {/* Render tick marks on BC near Ma */}
                  {(() => {
                    const drawTicks = (mid: Point, p1: Point, count: number) => {
                      const dx = p1.x - mid.x;
                      const dy = p1.y - mid.y;
                      const len = Math.sqrt(dx * dx + dy * dy);
                      if (len === 0) return null;
                      const ux = dx / len;
                      const uy = dy / len;
                      const px = -uy * 5;
                      const py = ux * 5;

                      return Array.from({ length: count }).map((_, idx) => {
                        const shift = (idx - (count - 1) / 2) * 4;
                        const cx = mid.x + ux * shift;
                        const cy = mid.y + uy * shift;
                        return (
                          <line
                            key={`tick-${idx}`}
                            x1={cx - px}
                            y1={cy - py}
                            x2={cx + px}
                            y2={cy + py}
                            stroke="#0ea5e9"
                            strokeWidth="1.2"
                          />
                        );
                      });
                    };

                    return (
                      <g>
                        {drawTicks(Ma, B, 1)}
                        {drawTicks(Ma, C, 1)}
                        {drawTicks(Mb, A, 2)}
                        {drawTicks(Mb, C, 2)}
                        {drawTicks(Mc, A, 3)}
                        {drawTicks(Mc, B, 3)}
                      </g>
                    );
                  })()}

                  {/* Lines to Vertices (showing equal distance R) */}
                  <line
                    x1={circumcenter.x}
                    y1={circumcenter.y}
                    x2={A.x}
                    y2={A.y}
                    stroke="#0284c7"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={circumcenter.x}
                    y1={circumcenter.y}
                    x2={B.x}
                    y2={B.y}
                    stroke="#0284c7"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={circumcenter.x}
                    y1={circumcenter.y}
                    x2={C.x}
                    y2={C.y}
                    stroke="#0284c7"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />

                  {/* Midpoint labels */}
                  <circle cx={Ma.x} cy={Ma.y} r="3" fill="#38bdf8" />
                  <circle cx={Mb.x} cy={Mb.y} r="3" fill="#38bdf8" />
                  <circle cx={Mc.x} cy={Mc.y} r="3" fill="#38bdf8" />

                  {/* Right angle indicators at the midpoints */}
                  {renderRightAngle(Ma, B, circumcenter, '#0ea5e9')}
                  {renderRightAngle(Mb, C, circumcenter, '#0ea5e9')}
                  {renderRightAngle(Mc, A, circumcenter, '#0ea5e9')}
                </g>
              )}
            </g>
          )}

          {/* CENTROID (무게중심) Construction */}
          {activeTab === 'centroid' && (
            <g>
              {showConstruction && (
                <g>
                  {/* Medians divided into 2:1 ratio segments (color coded!) */}
                  {/* Vertex to Centroid (2-part, thicker) */}
                  <line
                    x1={A.x}
                    y1={A.y}
                    x2={centroid.x}
                    y2={centroid.y}
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                  />
                  <line
                    x1={B.x}
                    y1={B.y}
                    x2={centroid.x}
                    y2={centroid.y}
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                  />
                  <line
                    x1={C.x}
                    y1={C.y}
                    x2={centroid.x}
                    y2={centroid.y}
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                  />

                  {/* Centroid to Midpoint (1-part, thinner, dashed/different color) */}
                  <line
                    x1={centroid.x}
                    y1={centroid.y}
                    x2={Ma.x}
                    y2={Ma.y}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <line
                    x1={centroid.x}
                    y1={centroid.y}
                    x2={Mb.x}
                    y2={Mb.y}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <line
                    x1={centroid.x}
                    y1={centroid.y}
                    x2={Mc.x}
                    y2={Mc.y}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Midpoint circles */}
                  <circle cx={Ma.x} cy={Ma.y} r="3" fill="#10b981" />
                  <circle cx={Mb.x} cy={Mb.y} r="3" fill="#10b981" />
                  <circle cx={Mc.x} cy={Mc.y} r="3" fill="#10b981" />

                  {/* Show ratio markers "2" and "1" */}
                  {showMeasurements && (
                    <g className="text-[10px] font-bold fill-indigo-600 font-mono">
                      <text x={(A.x + centroid.x) / 2 - 8} y={(A.y + centroid.y) / 2} fill="#4f46e5">2</text>
                      <text x={(centroid.x + Ma.x) / 2 + 6} y={(centroid.y + Ma.y) / 2} fill="#d97706">1</text>
                      
                      <text x={(B.x + centroid.x) / 2} y={(B.y + centroid.y) / 2 - 6} fill="#4f46e5">2</text>
                      <text x={(centroid.x + Mb.x) / 2} y={(centroid.y + Mb.y) / 2 + 10} fill="#d97706">1</text>

                      <text x={(C.x + centroid.x) / 2 + 6} y={(C.y + centroid.y) / 2} fill="#4f46e5">2</text>
                      <text x={(centroid.x + Mc.x) / 2 - 10} y={(centroid.y + Mc.y) / 2} fill="#d97706">1</text>
                    </g>
                  )}

                  {/* Show 6 equal area triangles visually with a small area text */}
                  {showCircles && (
                    <g className="text-[9px] fill-emerald-600 font-bold opacity-80 select-none">
                      {(() => {
                        // Calculate centroid of each of the 6 sub-triangles to place labels
                        const getSubCentroid = (p1: Point, p2: Point, p3: Point) => ({
                          x: (p1.x + p2.x + p3.x) / 3,
                          y: (p1.y + p2.y + p3.y) / 3,
                        });
                        const s1 = getSubCentroid(A, Mc, centroid);
                        const s2 = getSubCentroid(Mc, B, centroid);
                        const s3 = getSubCentroid(B, Ma, centroid);
                        const s4 = getSubCentroid(Ma, C, centroid);
                        const s5 = getSubCentroid(C, Mb, centroid);
                        const s6 = getSubCentroid(Mb, A, centroid);

                        const subArea = (metrics.area / 6).toFixed(0);

                        return (
                          <>
                            <text x={s1.x - 10} y={s1.y + 3}>S</text>
                            <text x={s2.x - 10} y={s2.y + 3}>S</text>
                            <text x={s3.x - 10} y={s3.y + 3}>S</text>
                            <text x={s4.x - 10} y={s4.y + 3}>S</text>
                            <text x={s5.x - 10} y={s5.y + 3}>S</text>
                            <text x={s6.x - 10} y={s6.y + 3}>S</text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </g>
              )}
            </g>
          )}

          {/* EULER LINE & ALL CENTERS (종합 탐구) Construction */}
          {activeTab === 'euler' && (
            <g>
              {/* Altitudes (수선) lines to Orthocenter H */}
              {showConstruction && (
                <g>
                  {/* Altitudes */}
                  <line
                    x1={A.x}
                    y1={A.y}
                    x2={Ha.x}
                    y2={Ha.y}
                    stroke="#c084fc"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                  />
                  <line
                    x1={B.x}
                    y1={B.y}
                    x2={Hb.x}
                    y2={Hb.y}
                    stroke="#c084fc"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                  />
                  <line
                    x1={C.x}
                    y1={C.y}
                    x2={Hc.x}
                    y2={Hc.y}
                    stroke="#c084fc"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                  />

                  {/* Right Angle boxes for altitudes */}
                  {renderRightAngle(Ha, B, A, '#c084fc')}
                  {renderRightAngle(Hb, C, B, '#c084fc')}
                  {renderRightAngle(Hc, A, C, '#c084fc')}
                </g>
              )}

              {/* Euler Line (Dashed, goes through O, G, H) */}
              {(() => {
                const distOG = distance(circumcenter, centroid);
                if (distOG > 0.5) {
                  // Project the Euler line across the canvas
                  // Vector O -> G
                  const dx = centroid.x - circumcenter.x;
                  const dy = centroid.y - circumcenter.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const ux = dx / len;
                  const uy = dy / len;

                  // Draw a long line passing through them
                  const p1 = { x: circumcenter.x - ux * 250, y: circumcenter.y - uy * 250 };
                  const p2 = { x: orthocenter.x + ux * 250, y: orthocenter.y + uy * 250 };

                  return (
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="opacity-90"
                    />
                  );
                }
                return null;
              })()}
            </g>
          )}


          {/* 3. The Main Triangle ABC */}
          <polygon
            points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
            fill="rgba(99, 102, 241, 0.05)"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinejoin="round"
          />


          {/* 4. Measurements (Angles and Side Lengths) */}
          {showMeasurements && (
            <g>
              {/* Angles in corners */}
              {(() => {
                const posA = getAngleLabelPos(A, B, C);
                const posB = getAngleLabelPos(B, A, C);
                const posC = getAngleLabelPos(C, A, B);

                return (
                  <g className="text-[11px] font-bold font-mono fill-slate-600 select-none">
                    <rect
                      x={posA.x - 14}
                      y={posA.y - 8}
                      width="28"
                      height="15"
                      rx="3"
                      fill="rgba(255,255,255,0.85)"
                    />
                    <text x={posA.x} y={posA.y + 3} textAnchor="middle">
                      {Math.round(metrics.angleA)}°
                    </text>

                    <rect
                      x={posB.x - 14}
                      y={posB.y - 8}
                      width="28"
                      height="15"
                      rx="3"
                      fill="rgba(255,255,255,0.85)"
                    />
                    <text x={posB.x} y={posB.y + 3} textAnchor="middle">
                      {Math.round(metrics.angleB)}°
                    </text>

                    <rect
                      x={posC.x - 14}
                      y={posC.y - 8}
                      width="28"
                      height="15"
                      rx="3"
                      fill="rgba(255,255,255,0.85)"
                    />
                    <text x={posC.x} y={posC.y + 3} textAnchor="middle">
                      {Math.round(metrics.angleC)}°
                    </text>
                  </g>
                );
              })()}

              {/* Side Lengths */}
              {(() => {
                const posBC = getSideLabelPos(B, C, A); // opposite side opposing A -> length 'a'
                const posAC = getSideLabelPos(A, C, B); // opposite side opposing B -> length 'b'
                const posAB = getSideLabelPos(A, B, C); // opposite side opposing C -> length 'c'

                const scale = 0.5; // pixel to cm scaling factor for realism

                return (
                  <g className="text-[10px] font-bold font-mono fill-indigo-700 select-none">
                    {/* BC (a) */}
                    <rect
                      x={posBC.x - 22}
                      y={posBC.y - 8}
                      width="44"
                      height="15"
                      rx="4"
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text x={posBC.x} y={posBC.y + 3} textAnchor="middle">
                      {(metrics.a * scale).toFixed(1)} cm
                    </text>

                    {/* AC (b) */}
                    <rect
                      x={posAC.x - 22}
                      y={posAC.y - 8}
                      width="44"
                      height="15"
                      rx="4"
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text x={posAC.x} y={posAC.y + 3} textAnchor="middle">
                      {(metrics.b * scale).toFixed(1)} cm
                    </text>

                    {/* AB (c) */}
                    <rect
                      x={posAB.x - 22}
                      y={posAB.y - 8}
                      width="44"
                      height="15"
                      rx="4"
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text x={posAB.x} y={posAB.y + 3} textAnchor="middle">
                      {(metrics.c * scale).toFixed(1)} cm
                    </text>
                  </g>
                );
              })()}
            </g>
          )}


          {/* 5. Center Points Rendering */}

          {/* INCENTER Point & Label */}
          {(activeTab === 'incenter' || activeTab === 'euler') && (
            <g className="transition-opacity duration-300">
              <circle
                cx={incenter.x}
                cy={incenter.y}
                r="7"
                fill="#f59e0b"
                stroke="white"
                strokeWidth="2"
                className="shadow-sm cursor-help filter drop-shadow"
              />
              <circle cx={incenter.x} cy={incenter.y} r="2" fill="white" />
              <g transform={`translate(${incenter.x + 12}, ${incenter.y - 12})`}>
                <rect
                  x="-6"
                  y="-11"
                  width="44"
                  height="16"
                  rx="3"
                  fill="#f59e0b"
                  className="opacity-95"
                />
                <text
                  x="16"
                  y="1"
                  textAnchor="middle"
                  fill="white"
                  className="text-[9px] font-extrabold"
                >
                  내심 I
                </text>
              </g>
            </g>
          )}

          {/* CIRCUMCENTER Point & Label */}
          {(activeTab === 'circumcenter' || activeTab === 'euler') && (
            <g className="transition-opacity duration-300">
              <circle
                cx={circumcenter.x}
                cy={circumcenter.y}
                r="7"
                fill="#0ea5e9"
                stroke="white"
                strokeWidth="2"
                className="shadow-sm cursor-help filter drop-shadow"
              />
              <circle cx={circumcenter.x} cy={circumcenter.y} r="2" fill="white" />
              <g transform={`translate(${circumcenter.x + 12}, ${circumcenter.y + 16})`}>
                <rect
                  x="-6"
                  y="-11"
                  width="44"
                  height="16"
                  rx="3"
                  fill="#0ea5e9"
                  className="opacity-95"
                />
                <text
                  x="16"
                  y="1"
                  textAnchor="middle"
                  fill="white"
                  className="text-[9px] font-extrabold"
                >
                  외심 O
                </text>
              </g>
            </g>
          )}

          {/* CENTROID Point & Label */}
          {(activeTab === 'centroid' || activeTab === 'euler') && (
            <g className="transition-opacity duration-300">
              <circle
                cx={centroid.x}
                cy={centroid.y}
                r="7"
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
                className="shadow-sm cursor-help filter drop-shadow"
              />
              <circle cx={centroid.x} cy={centroid.y} r="2" fill="white" />
              <g transform={`translate(${centroid.x - 48}, ${centroid.y - 12})`}>
                <rect
                  x="-6"
                  y="-11"
                  width="44"
                  height="16"
                  rx="3"
                  fill="#10b981"
                  className="opacity-95"
                />
                <text
                  x="16"
                  y="1"
                  textAnchor="middle"
                  fill="white"
                  className="text-[9px] font-extrabold"
                >
                  무게 G
                </text>
              </g>
            </g>
          )}

          {/* ORTHOCENTER Point & Label (only in Euler tab) */}
          {activeTab === 'euler' && (
            <g className="transition-opacity duration-300">
              <circle
                cx={orthocenter.x}
                cy={orthocenter.y}
                r="7"
                fill="#8b5cf6"
                stroke="white"
                strokeWidth="2"
                className="shadow-sm cursor-help filter drop-shadow"
              />
              <circle cx={orthocenter.x} cy={orthocenter.y} r="2" fill="white" />
              <g transform={`translate(${orthocenter.x - 48}, ${orthocenter.y + 16})`}>
                <rect
                  x="-6"
                  y="-11"
                  width="44"
                  height="16"
                  rx="3"
                  fill="#8b5cf6"
                  className="opacity-95"
                />
                <text
                  x="16"
                  y="1"
                  textAnchor="middle"
                  fill="white"
                  className="text-[9px] font-extrabold"
                >
                  수심 H
                </text>
              </g>
            </g>
          )}


          {/* 6. Draggable Vertex Handles A, B, C */}
          {/* We place interactive nodes last so they sit on top of everything for pointer events */}
          <g>
            {/* Vertex A */}
            <g
              className="cursor-grab active:cursor-grabbing group"
              onPointerDown={(e) => handlePointerDown('A', e)}
            >
              {/* Glowing ring on hover */}
              <circle
                cx={A.x}
                cy={A.y}
                r="22"
                fill="rgba(79, 70, 229, 0.1)"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
              <circle
                cx={A.x}
                cy={A.y}
                r="11"
                fill="#4f46e5"
                stroke="white"
                strokeWidth="2.5"
                className="filter drop-shadow-md group-hover:scale-110 transition-transform duration-150"
              />
              <text
                x={A.x}
                y={A.y - 18}
                textAnchor="middle"
                fill="#312e81"
                className="text-xs font-black font-sans"
              >
                A ({Math.round(A.x)}, {Math.round(A.y)})
              </text>
              <text
                x={A.x}
                y={A.y + 4}
                textAnchor="middle"
                fill="white"
                className="text-[9px] font-extrabold select-none pointer-events-none"
              >
                A
              </text>
            </g>

            {/* Vertex B */}
            <g
              className="cursor-grab active:cursor-grabbing group"
              onPointerDown={(e) => handlePointerDown('B', e)}
            >
              <circle
                cx={B.x}
                cy={B.y}
                r="22"
                fill="rgba(79, 70, 229, 0.1)"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
              <circle
                cx={B.x}
                cy={B.y}
                r="11"
                fill="#4f46e5"
                stroke="white"
                strokeWidth="2.5"
                className="filter drop-shadow-md group-hover:scale-110 transition-transform duration-150"
              />
              <text
                x={B.x - 10}
                y={B.y + 22}
                textAnchor="middle"
                fill="#312e81"
                className="text-xs font-black font-sans"
              >
                B ({Math.round(B.x)}, {Math.round(B.y)})
              </text>
              <text
                x={B.x}
                y={B.y + 4}
                textAnchor="middle"
                fill="white"
                className="text-[9px] font-extrabold select-none pointer-events-none"
              >
                B
              </text>
            </g>

            {/* Vertex C */}
            <g
              className="cursor-grab active:cursor-grabbing group"
              onPointerDown={(e) => handlePointerDown('C', e)}
            >
              <circle
                cx={C.x}
                cy={C.y}
                r="22"
                fill="rgba(79, 70, 229, 0.1)"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
              <circle
                cx={C.x}
                cy={C.y}
                r="11"
                fill="#4f46e5"
                stroke="white"
                strokeWidth="2.5"
                className="filter drop-shadow-md group-hover:scale-110 transition-transform duration-150"
              />
              <text
                x={C.x + 10}
                y={C.y + 22}
                textAnchor="middle"
                fill="#312e81"
                className="text-xs font-black font-sans"
              >
                C ({Math.round(C.x)}, {Math.round(C.y)})
              </text>
              <text
                x={C.x}
                y={C.y + 4}
                textAnchor="middle"
                fill="white"
                className="text-[9px] font-extrabold select-none pointer-events-none"
              >
                C
              </text>
            </g>
          </g>
        </svg>

        {/* Floating Instruction Overlay */}
        <div className="absolute bottom-6 left-6 right-6 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>삼각형의 꼭짓점 <b>A, B, C</b>를 드래그하여 자유롭게 모양을 변경해 보세요!</span>
          </div>
        </div>
      </div>

      {/* Layer Visibility Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-50 border-t border-slate-100 text-xs">
        <button
          onClick={() => setShowConstruction(!showConstruction)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-all ${
            showConstruction
              ? 'bg-slate-800 border-slate-900 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {showConstruction ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>작도 보조선 {showConstruction ? '숨기기' : '보이기'}</span>
        </button>

        <button
          onClick={() => setShowCircles(!showCircles)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-all ${
            showCircles
              ? 'bg-slate-800 border-slate-900 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {showCircles ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>
            {activeTab === 'incenter' && '내접원'}
            {activeTab === 'circumcenter' && '외접원'}
            {activeTab === 'centroid' && '6등분 면적(S)'}
            {activeTab === 'euler' && '수선 작도'}
            {activeTab === 'incenter' || activeTab === 'circumcenter' || activeTab === 'centroid' || activeTab === 'euler' ? '' : '원'} {' '}
            {showCircles ? '숨기기' : '보이기'}
          </span>
        </button>

        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium transition-all ${
            showMeasurements
              ? 'bg-slate-800 border-slate-900 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {showMeasurements ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>수치 표기 {showMeasurements ? '숨기기' : '보이기'}</span>
        </button>

        <div className="flex items-center justify-center text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/50 rounded-lg px-2 text-center py-2">
          <span>
            삼각형 상태:{' '}
            <span className="text-indigo-600 font-bold">
              {metrics.triangleType === 'acute' && '예각'}
              {metrics.triangleType === 'right' && '직각'}
              {metrics.triangleType === 'obtuse' && '둔각'}
              삼각형
            </span>
            {metrics.specialType !== 'scalene' && (
              <span className="text-emerald-600 font-bold ml-1">
                ({metrics.specialType === 'equilateral' ? '정삼각형' : '이등변삼각형'})
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
