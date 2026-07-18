import { useState, useCallback } from 'react';
import { Point, CenterType, TriangleState, Challenge } from './types';
import { getMetrics, getIncenter, getCircumcenter, getCentroid, getOrthocenter } from './utils/geometry';
import { GeometryCanvas } from './components/GeometryCanvas';
import { CenterInfoTab } from './components/CenterInfoTab';
import { ChallengePanel } from './components/ChallengePanel';
import { Compass, Trophy, HelpCircle, Sparkles, BookOpen, Layers, Milestone } from 'lucide-react';

const INITIAL_VERTICES: TriangleState = {
  A: { x: 300, y: 120 },
  B: { x: 160, y: 380 },
  C: { x: 440, y: 350 },
};

export default function App() {
  const [vertices, setVertices] = useState<TriangleState>(INITIAL_VERTICES);
  const [activeTab, setActiveTab] = useState<CenterType>('incenter');

  // Visualization option toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);
  const [showConstruction, setShowConstruction] = useState<boolean>(true);
  const [showCircles, setShowCircles] = useState<boolean>(true);

  // Handle vertex change from canvas dragging
  const handleVertexChange = useCallback((vertex: 'A' | 'B' | 'C', newPoint: Point) => {
    setVertices((prev) => ({
      ...prev,
      [vertex]: newPoint,
    }));
  }, []);

  // Preset triangles loader
  const loadPreset = (type: 'equilateral' | 'right' | 'obtuse' | 'isosceles') => {
    switch (type) {
      case 'equilateral':
        setVertices({
          A: { x: 300, y: 113.4 },
          B: { x: 140, y: 390.6 },
          C: { x: 460, y: 390.6 },
        });
        break;
      case 'right':
        setVertices({
          A: { x: 160, y: 110 },
          B: { x: 160, y: 380 },
          C: { x: 440, y: 380 },
        });
        break;
      case 'obtuse':
        setVertices({
          A: { x: 300, y: 240 },
          B: { x: 120, y: 380 },
          C: { x: 480, y: 380 },
        });
        break;
      case 'isosceles':
        setVertices({
          A: { x: 300, y: 100 },
          B: { x: 180, y: 380 },
          C: { x: 420, y: 380 },
        });
        break;
    }
  };

  const handleReset = () => {
    setVertices(INITIAL_VERTICES);
  };

  // Compute metrics & centers for active values
  const metrics = getMetrics(vertices.A, vertices.B, vertices.C);
  const centroid = getCentroid(vertices.A, vertices.B, vertices.C);
  const { center: incenter, r: inradius } = getIncenter(vertices.A, vertices.B, vertices.C);
  const { center: circumcenter, R: circumradius } = getCircumcenter(vertices.A, vertices.B, vertices.C);
  const orthocenter = getOrthocenter(vertices.A, vertices.B, vertices.C);

  // Compute challenge completion status dynamically from current metrics
  const isRight = metrics.triangleType === 'right';
  const isEquilateral = metrics.specialType === 'equilateral';
  const maxAngle = Math.max(metrics.angleA, metrics.angleB, metrics.angleC);
  const isObtuse = maxAngle > 95;
  const isIsosceles = metrics.specialType === 'isosceles' || metrics.specialType === 'equilateral';

  const challenges: Challenge[] = [
    {
      id: 'challenge-right',
      title: '직각삼각형의 비밀 풀기',
      description: '한 각을 약 90도 근처로 드래그하여 직각삼각형을 만들고 외심 O의 위치 변화를 살펴보세요.',
      successCondition: '성공! 직각삼각형이 완성되었습니다. 이때 외심 O가 대변(빗변)의 한가운데(중점)에 정확하게 올라타는 것을 보셨나요? 이는 고등학교 기하와 원의 성질에서 가장 핵심이 되는 법칙이랍니다!',
      isCompleted: isRight,
    },
    {
      id: 'challenge-equilateral',
      title: '완벽한 대칭 (정삼각형)',
      description: '세 변의 길이가 모두 동일한 완벽한 정삼각형을 조절하여 만들어 보세요.',
      successCondition: '성공! 대칭적인 정삼각형이 되었습니다. 이제 내심(I), 외심(O), 무게중심(G), 수심(H)이 거짓말처럼 완벽하게 한 곳으로 합쳐져 한 점이 되는 놀라운 상태를 감상해 보세요!',
      isCompleted: isEquilateral,
    },
    {
      id: 'challenge-obtuse',
      title: '외심 탈출! (둔각삼각형 만들기)',
      description: '한 각도가 90도를 훌쩍 넘는 둔각삼각형을 만들어 외심 O의 위치를 살펴보세요.',
      successCondition: '성공! 한 내각이 90도를 넘어 둔각삼각형이 되었습니다. 수직이등분선들이 삼각형 외부에서 교차하여 외심 O가 삼각형 바깥(외부)으로 탈출하는 흥미로운 형태를 확인해 보세요!',
      isCompleted: isObtuse,
    },
    {
      id: 'challenge-isosceles',
      title: '일렬종대 중심 (이등변삼각형)',
      description: '좌우 대칭 형태의 이등변삼각형 모양을 이뤄 보세요.',
      successCondition: '성공! 이등변삼각형이 완성되었습니다. 꼭짓점 A에서 수직으로 내린 대칭축(오일러 선) 위에 모든 중심점들(I, O, G, H)이 자석처럼 세로로 가지런히 정렬되는 신비로운 현상입니다!',
      isCompleted: isIsosceles,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-100 select-none">
      <div className="max-w-7xl mx-auto bg-[#f8fafc] border-[12px] border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-[calc(100vh-3rem)] shadow-xl relative">
        
        {/* Dynamic Header */}
        <header className="bg-white border-b-2 border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              Δ
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-800 uppercase flex items-center gap-2">
                Triangulate Lab
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  v1.2 Live
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                삼각형의 모양에 따른 오심(내심, 외심, 무게중심, 수심)과 오일러 선의 실시간 기하 실험실
              </p>
            </div>
          </div>

          {/* Quick Info Specs */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-4">
              <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">삼각형 상태</span>
              <span className="font-extrabold text-indigo-700">
                {metrics.triangleType === 'acute' && 'ACUTE (예각삼각형)'}
                {metrics.triangleType === 'right' && 'RIGHT (직각삼각형)'}
                {metrics.triangleType === 'obtuse' && 'OBTUSE (둔각삼각형)'}
                {metrics.specialType === 'equilateral' && ' / EQUILATERAL (정삼각형)'}
                {metrics.specialType === 'isosceles' && ' / ISOSCELES (이등변삼각형)'}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">Viewport</span>
              <span className="text-sm font-semibold text-slate-700">1024 x 768</span>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 p-6 flex flex-col gap-6">
          {/* Presets and Concept Tabs bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
            {/* Tabs for choosing center focus */}
            <div className="flex flex-wrap p-1 bg-slate-100 rounded-lg gap-1">
              <button
                onClick={() => {
                  setActiveTab('incenter');
                  setShowCircles(true);
                }}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'incenter'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Layers size={14} />
                <span>내심 (Incenter)</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('circumcenter');
                  setShowCircles(true);
                }}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'circumcenter'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Layers size={14} />
                <span>외심 (Circumcenter)</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('centroid');
                  setShowCircles(false); // S is default off
                }}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'centroid'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Layers size={14} />
                <span>무게중심 (Centroid)</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('euler');
                  setShowCircles(true);
                }}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'euler'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Milestone size={14} />
                <span>오일러 선 & 수심</span>
              </button>
            </div>

            {/* Quick Shape Presets to load triangles */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider font-mono">
                Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => loadPreset('right')}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs cursor-pointer transition-colors"
                >
                  📐 직각삼각형
                </button>
                <button
                  onClick={() => loadPreset('equilateral')}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs cursor-pointer transition-colors"
                >
                  🔺 정삼각형
                </button>
                <button
                  onClick={() => loadPreset('obtuse')}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs cursor-pointer transition-colors"
                >
                  🪐 둔각삼각형
                </button>
                <button
                  onClick={() => loadPreset('isosceles')}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs cursor-pointer transition-colors"
                >
                  ⚖️ 이등변삼각형
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: SVG Canvas Sandbox (Column Span 7) */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
              <GeometryCanvas
                vertices={vertices}
                metrics={metrics}
                activeTab={activeTab}
                onVertexChange={handleVertexChange}
                onReset={handleReset}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                showMeasurements={showMeasurements}
                setShowMeasurements={setShowMeasurements}
                showConstruction={showConstruction}
                setShowConstruction={setShowConstruction}
                showCircles={showCircles}
                setShowCircles={setShowCircles}
              />
            </div>

            {/* Right: Informational Explanations and Steps (Column Span 5) */}
            <div className="lg:col-span-5 flex flex-col h-full gap-6">
              <CenterInfoTab
                activeTab={activeTab}
                metrics={metrics}
                vertices={vertices}
                incenter={incenter}
                inradius={inradius}
                circumcenter={circumcenter}
                circumradius={circumradius}
                centroid={centroid}
                orthocenter={orthocenter}
              />

              <ChallengePanel
                challenges={challenges}
              />
            </div>
          </div>
        </main>

        {/* Footer copyright and licensing info */}
        <footer className="mt-auto h-10 bg-slate-900 flex items-center px-6 justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800">
          <div>
            SYSTEM: <span className="text-emerald-400 font-semibold">STABLE</span> | ENGINE: <span className="text-indigo-400 font-semibold">GEOMETRY_PRO_V2</span>
          </div>
          <div className="hidden sm:block">
            © 2026 AI Studio Geometry Lab — 대화형 기하 학습 교실
          </div>
          <div>
            {activeTab === 'euler' ? (
              <span>O-G-H Alignment: <span className="text-rose-400 font-semibold">180.0°</span></span>
            ) : (
              <span>ACTIVE_TAB: <span className="text-amber-400 font-semibold uppercase">{activeTab}</span></span>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
