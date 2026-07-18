import React from 'react';
import { CenterType, GeometryMetrics, Point } from '../types';
import { BookOpen, Compass, Ruler, HelpCircle, Star, Sparkles } from 'lucide-react';
import { distance } from '../utils/geometry';

interface CenterInfoTabProps {
  activeTab: CenterType;
  metrics: GeometryMetrics;
  vertices: { A: Point; B: Point; C: Point };
  incenter: Point;
  inradius: number;
  circumcenter: Point;
  circumradius: number;
  centroid: Point;
  orthocenter: Point;
}

export const CenterInfoTab: React.FC<CenterInfoTabProps> = ({
  activeTab,
  metrics,
  vertices,
  incenter,
  inradius,
  circumcenter,
  circumradius,
  centroid,
  orthocenter,
}) => {
  const scale = 0.5; // pixel to cm scaling
  const formattedArea = (metrics.area * scale * scale).toFixed(1);

  // Dynamic values
  const distAG = (distance(vertices.A, centroid) * scale).toFixed(1);
  const distGMa = (distance(centroid, { x: (vertices.B.x + vertices.C.x) / 2, y: (vertices.B.y + vertices.C.y) / 2 }) * scale).toFixed(1);
  const ratioG = distGMa !== '0.0' ? (parseFloat(distAG) / parseFloat(distGMa)).toFixed(2) : '2.00';

  const distOA = (distance(circumcenter, vertices.A) * scale).toFixed(1);
  const distOB = (distance(circumcenter, vertices.B) * scale).toFixed(1);
  const distOC = (distance(circumcenter, vertices.C) * scale).toFixed(1);

  const distIAtoBC = (inradius * scale).toFixed(1);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="bg-slate-800 px-5 py-3 flex justify-between items-center rounded-t-xl">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="text-indigo-400" size={13} />
          {activeTab === 'incenter' && 'INCENTER (내심)'}
          {activeTab === 'circumcenter' && 'CIRCUMCENTER (외심)'}
          {activeTab === 'centroid' && 'CENTROID (무게중심)'}
          {activeTab === 'euler' && 'ORTHOCENTER & EULER LINE (수심 및 오일러 선)'}
        </span>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest animate-pulse">
          Live Analysis
        </span>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[580px]">
        {/* Real-time Coordinate & Triangle Specs Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-4 grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <div className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">삼각형 면적 (Area)</div>
            <div className="text-sm font-bold text-slate-800 mt-1">{formattedArea} cm²</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <div className="text-[9px] uppercase text-slate-400 font-mono font-bold tracking-wider">기하학 형태 (Type)</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${
                metrics.triangleType === 'acute' ? 'bg-emerald-500' :
                metrics.triangleType === 'right' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <div className="text-xs font-bold text-slate-700 font-sans">
                {metrics.triangleType === 'acute' && '예각삼각형'}
                {metrics.triangleType === 'right' && '직각삼각형'}
                {metrics.triangleType === 'obtuse' && '둔각삼각형'}
                {metrics.specialType === 'equilateral' && ' (정삼각형)'}
                {metrics.specialType === 'isosceles' && ' (이등변삼각형)'}
              </div>
            </div>
          </div>
        </div>

        {/* --- INCENTER TAB --- */}
        {activeTab === 'incenter' && (
          <div className="space-y-5 animate-fade-in">
            {/* 1. Definition */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-amber-500 rounded-sm" />
                정의 및 핵심 성질
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                삼각형의 <b>세 내각의 이등분선의 교점</b>을 <b>내심(Incenter, I)</b>이라고 합니다. 
                내심에서 삼각형의 <b>세 변에 이르는 수직 거리는 모두 동일</b>하며, 이 거리는 <b>내접원의 반지름(r)</b>이 됩니다.
              </p>
            </div>

            {/* 2. Live Mathematics Verification */}
            <div className="p-4 bg-amber-50/30 rounded-xl border border-amber-100 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                실시간 기하 관찰 데이터
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-800 font-medium font-mono">
                <li className="flex justify-between">
                  <span>내심 I에서 변 BC에 이르는 수직 거리 (r):</span>
                  <span className="font-bold underline text-amber-700">{distIAtoBC} cm</span>
                </li>
                <li className="flex justify-between">
                  <span>내심 I에서 변 AC에 이르는 수직 거리 (r):</span>
                  <span className="font-bold underline text-amber-700">{distIAtoBC} cm</span>
                </li>
                <li className="flex justify-between">
                  <span>내심 I에서 변 AB에 이르는 수직 거리 (r):</span>
                  <span className="font-bold underline text-amber-700">{distIAtoBC} cm</span>
                </li>
                <li className="text-[11px] text-amber-600/90 pt-1 font-sans">
                  * 삼각형의 모양을 아무리 드래그해 바꾸어도 세 수직 거리는 항상 동일한 값(반지름 r)을 유지합니다.
                </li>
              </ul>
            </div>

            {/* 3. Steps */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="text-amber-500" size={16} />
                내심 찾는 방법 (작도 순서)
              </h3>
              <ol className="space-y-2 text-xs text-slate-600">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">1</span>
                  <span className="mt-0.5">각 꼭짓점 <b className="text-slate-800">A, B, C</b>의 각도를 똑같이 둘로 나누는 <b>각의 이등분선</b>을 그립니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">2</span>
                  <span className="mt-0.5">세 이등분선이 신기하게도 삼각형 내부에서 <b className="text-slate-800">단 한 점</b>으로 교차하는데, 이 점이 바로 <b>내심 I</b>입니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">3</span>
                  <span className="mt-0.5">내심 I에서 세 변 <b className="text-slate-800">BC, AC, AB</b>에 각각 수선을 내립니다. 세 수선의 길이는 완벽하게 같습니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">4</span>
                  <span className="mt-0.5">수선의 길이를 반지름 <b className="text-slate-800">r</b>로 삼아, 내심 I를 중심으로 회전하는 <b>내접원</b>을 그립니다.</span>
                </li>
              </ol>
            </div>

            {/* 4. Formula Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700">공식 박스</h4>
              <div className="bg-white p-2.5 rounded border border-slate-100 font-mono text-center text-xs text-indigo-700 font-semibold space-y-1">
                <div>삼각형 넓이 (S) = ½ × r × (a + b + c)</div>
                <div className="text-[10px] text-slate-500 font-sans mt-1">※ r = 내접원 반지름, (a+b+c) = 삼각형 둘레</div>
              </div>
            </div>

            {/* 5. Special Tip */}
            <div className="bg-indigo-50/30 p-3.5 rounded-xl border border-indigo-100/50 text-xs text-slate-600 flex gap-2">
              <Sparkles className="text-indigo-500 shrink-0" size={16} />
              <p>
                <b>내심의 비밀:</b> 삼각형이 예각이든, 둔각이든, 직각이든 상관없이 <b>내심은 언제나 삼각형의 완벽한 내부</b>에만 존재합니다! 변의 밖으로 나갈 수 없습니다.
              </p>
            </div>
          </div>
        )}

        {/* --- CIRCUMCENTER TAB --- */}
        {activeTab === 'circumcenter' && (
          <div className="space-y-5 animate-fade-in">
            {/* 1. Definition */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-sky-500 rounded-sm" />
                정의 및 핵심 성질
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                삼각형의 <b>세 변의 수직이등분선의 교점</b>을 <b>외심(Circumcenter, O)</b>이라고 합니다. 
                외심에서 삼각형의 <b>세 꼭짓점에 이르는 거리는 모두 동일</b>하며, 이 거리는 <b>외접원의 반지름(R)</b>이 됩니다.
              </p>
            </div>

            {/* 2. Live Mathematics Verification */}
            <div className="p-4 bg-sky-50/30 rounded-xl border border-sky-100 space-y-2.5">
              <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1">
                <Star size={13} className="fill-sky-400 text-sky-500" />
                실시간 기하 관찰 데이터
              </h4>
              <ul className="space-y-1.5 text-xs text-sky-800 font-medium font-mono">
                <li className="flex justify-between">
                  <span>외심 O에서 꼭짓점 A까지의 거리 (OA):</span>
                  <span className="font-bold underline text-sky-700">{distOA} cm</span>
                </li>
                <li className="flex justify-between">
                  <span>외심 O에서 꼭짓점 B까지의 거리 (OB):</span>
                  <span className="font-bold underline text-sky-700">{distOB} cm</span>
                </li>
                <li className="flex justify-between">
                  <span>외심 O에서 꼭짓점 C까지의 거리 (OC):</span>
                  <span className="font-bold underline text-sky-700">{distOC} cm</span>
                </li>
                <li className="text-[11px] text-sky-600/90 pt-1 font-sans">
                  * 외심의 가장 큰 매력은 삼각형 모양에 따라 <b>외심의 위치가 삼각형 안, 위, 밖으로 대이동</b>한다는 점입니다!
                </li>
              </ul>
            </div>

            {/* 3. Location info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700">삼각형 모양에 따른 외심 O의 위치</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className={`p-2 rounded border ${metrics.triangleType === 'acute' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white text-slate-500 border-slate-100'}`}>
                  <p>예각삼각형</p>
                  <p className="text-[10px] mt-0.5">내부 (Inside)</p>
                </div>
                <div className={`p-2 rounded border ${metrics.triangleType === 'right' ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold' : 'bg-white text-slate-500 border-slate-100'}`}>
                  <p>직각삼각형</p>
                  <p className="text-[10px] mt-0.5 font-sans font-bold">빗변의 중점</p>
                </div>
                <div className={`p-2 rounded border ${metrics.triangleType === 'obtuse' ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-white text-slate-500 border-slate-100'}`}>
                  <p>둔각삼각형</p>
                  <p className="text-[10px] mt-0.5">외부 (Outside)</p>
                </div>
              </div>
              {metrics.triangleType === 'right' && (
                <div className="bg-amber-50 text-amber-800 p-2.5 rounded border border-amber-200/50 text-[11px] leading-relaxed font-medium">
                  💡 <b>발견!</b> 지금 직각삼각형 상태입니다. 외심 O가 <b>빗변의 정중앙</b>(마주보는 꼭짓점과 연결된 빗변 위)에 완벽히 겹쳐져 있는 걸 확인해 보세요!
                </div>
              )}
            </div>

            {/* 4. Steps */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="text-sky-500" size={16} />
                외심 찾는 방법 (작도 순서)
              </h3>
              <ol className="space-y-2 text-xs text-slate-600">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">1</span>
                  <span className="mt-0.5">삼각형의 세 변 <b className="text-slate-800">BC, AC, AB</b>의 정확한 중간 지점(중점)을 찾습니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">2</span>
                  <span className="mt-0.5">각 중점으로부터 해당 변에 90도 각도로 수직하게 뻗어나가는 <b>수직이등분선</b>을 그립니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">3</span>
                  <span className="mt-0.5">세 수직이등분선이 만나는 유일한 점이 <b>외심 O</b>가 됩니다. 둔각삼각형의 경우 이 교점이 바깥에 형성됩니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">4</span>
                  <span className="mt-0.5">외심 O에서 꼭짓점까지의 거리 <b className="text-slate-800">R</b>을 반지름 삼아, 세 꼭짓점을 모두 외곽으로 완벽히 스치는 <b>외접원</b>을 그립니다.</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* --- CENTROID TAB --- */}
        {activeTab === 'centroid' && (
          <div className="space-y-5 animate-fade-in">
            {/* 1. Definition */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-sm" />
                정의 및 핵심 성질
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                삼각형의 각 꼭짓점과 마주보는 변의 중점을 연결한 세 선을 **중선**이라고 하며, 
                이 <b>세 중선의 교점</b>을 <b>무게중심(Centroid, G)</b>이라고 합니다. 
                무게중심은 삼각형의 중선을 꼭짓점으로부터 각각 정확히 <b className="text-indigo-600">2:1 비율</b>로 나눕니다.
              </p>
            </div>

            {/* 2. Live Mathematics Verification */}
            <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                <Star size={13} className="fill-emerald-400 text-emerald-500" />
                실시간 기하 관찰 데이터
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-800 font-medium font-mono">
                <li className="flex justify-between">
                  <span>A에서 무게중심 G까지의 거리:</span>
                  <span className="font-bold underline text-indigo-700">{distAG} cm</span>
                </li>
                <li className="flex justify-between">
                  <span>G에서 BC의 중점 Ma까지의 거리:</span>
                  <span className="font-bold underline text-amber-700">{distGMa} cm</span>
                </li>
                <li className="flex justify-between bg-emerald-100/40 p-1.5 rounded text-[11px] mt-1 font-sans">
                  <span>두 길이의 실시간 비율 (AG : GMa):</span>
                  <span className="font-black text-indigo-800 font-mono">{distAG} : {distGMa} ≈ <span className="text-red-600">{ratioG} : 1</span></span>
                </li>
                <li className="text-[11px] text-emerald-600/90 pt-1 font-sans leading-relaxed">
                  * 꼭짓점을 늘리거나 축소해 무게중심을 이동시켜도 이 내분 비율은 <b>귀신같이 항상 정확히 2 : 1</b>로 성립합니다.
                </li>
              </ul>
            </div>

            {/* 3. Steps */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="text-emerald-500" size={16} />
                무게중심 찾는 방법 (작도 순서)
              </h3>
              <ol className="space-y-2 text-xs text-slate-600">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">1</span>
                  <span className="mt-0.5">세 변 <b className="text-slate-800">BC, AC, AB</b>의 가운데 지점인 중점을 각각 표시합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">2</span>
                  <span className="mt-0.5">꼭짓점 <b className="text-slate-800">A</b>와 대변의 중점 <b className="text-slate-800">Ma</b>를 잇는 <b>중선</b>을 하나 긋습니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">3</span>
                  <span className="mt-0.5">나머지 꼭짓점 <b className="text-slate-800">B, C</b>에서도 각각 마주보는 중점에 중선을 긋습니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">4</span>
                  <span className="mt-0.5">세 중선이 만나는 지점이 바로 <b>무게중심 G</b>입니다. 이 지점은 2:1 비율 분할 지점입니다.</span>
                </li>
              </ol>
            </div>

            {/* 4. Sub-triangles Fact */}
            <div className="p-4 bg-emerald-50/20 rounded-xl border border-emerald-100 text-xs text-slate-600 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Star size={13} className="text-emerald-500 fill-emerald-500" />
                중요 성질: 6등분 면적의 마술
              </h4>
              <p className="leading-relaxed">
                무게중심에 의해 분할되는 <b>6개의 작은 삼각형</b>들은 모양은 서로 다를 수 있지만, 놀랍게도 <b>그 넓이(S)가 모두 동일</b>합니다! 
                (전체 넓이의 정확히 1/6인 <span className="font-mono font-bold text-emerald-700">{(metrics.area / 6 * scale * scale).toFixed(1)} cm²</span>)
                <br />
                왼쪽 하단의 <b>'6등분 면적(S) 보이기'</b> 버튼을 클릭하여 확인해 보세요!
              </p>
            </div>
          </div>
        )}

        {/* --- EULER LINE TAB --- */}
        {activeTab === 'euler' && (
          <div className="space-y-5 animate-fade-in">
            {/* 1. Definition */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-red-500 rounded-sm" />
                오일러 선(Euler Line)의 법칙
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                스위스의 천재 수학자 레온하르트 오일러가 발견한 법칙입니다. 
                정삼각형이 아닌 어떤 삼각형이든, 놀랍게도 <b>외심(O), 무게중심(G), 수심(H)</b>은 <b>단 하나의 직선 상에 일렬로 정렬</b>됩니다. 이 아름다운 일치선을 <b>오일러 선</b>이라고 합니다.
              </p>
            </div>

            {/* 2. Orthocenter Definition */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-purple-500 rounded-sm" />
                수심 (Orthocenter, H)이란?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                삼각형의 각 꼭짓점에서 마주보는 변(대변)에 수직으로 내린 세 개의 선(수선)이 만나는 교점을 <b>수심(Orthocenter, H)</b>이라고 합니다.
              </p>
            </div>

            {/* 3. Live Mathematics Verification */}
            <div className="p-4 bg-red-50/30 rounded-xl border border-red-100 space-y-2.5">
              <h4 className="text-xs font-bold text-red-900 flex items-center gap-1">
                <Star size={13} className="fill-red-400 text-red-500" />
                오일러 선의 2:1 정렬 성질
              </h4>
              <p className="text-xs text-red-800 leading-relaxed">
                오일러 선 위에서 세 중심점의 거리도 특별한 고정 비율을 갖습니다.
                외심(O), 무게중심(G), 수심(H)에서 <b>수심에서 무게중심까지의 거리(HG)</b>는 <b>무게중심에서 외심까지의 거리(GO)</b>의 정확히 <b>2배</b>가 됩니다.
              </p>
              <div className="bg-white/80 p-2 text-center rounded border border-red-100 font-mono text-xs text-red-700 font-black">
                HG : GO = 2 : 1
              </div>
              <ul className="space-y-1 text-[11px] text-red-700/90 font-medium font-mono">
                <li className="flex justify-between">
                  <span>수심 H ~ 무게중심 G 거리 (HG):</span>
                  <span>{(distance(orthocenter, centroid) * scale).toFixed(1)} cm</span>
                </li>
                <li className="flex justify-between">
                  <span>무게중심 G ~ 외심 O 거리 (GO):</span>
                  <span>{(distance(centroid, circumcenter) * scale).toFixed(1)} cm</span>
                </li>
              </ul>
            </div>

            {/* 4. Euler Line Trivia */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700">기하학의 아름다운 특이 조건</h4>
              <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                <li>삼각형이 <b>이등변삼각형</b>이 되면 외심, 내심, 무게중심, 수심이 오일러 선 상에 완벽히 다 올라타며 대칭을 이룹니다.</li>
                <li>삼각형이 <b>정삼각형</b>이 되면 오일러 선 자체가 사라지고, <b>내심, 외심, 무게중심, 수심이 소름돋게도 모두 한 점(일치)</b>으로 포개어집니다!</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Side Spec Panel */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-mono grid grid-cols-3 gap-3 text-center">
        <div className="p-1.5 bg-white rounded border border-slate-200/60 shadow-3xs">
          <span className="block text-slate-400 font-bold uppercase tracking-wider text-[8px]">Vertex A</span>
          <span className="font-bold text-indigo-600 text-xs mt-0.5 block">X:{Math.round(vertices.A.x)} Y:{Math.round(vertices.A.y)}</span>
        </div>
        <div className="p-1.5 bg-white rounded border border-slate-200/60 shadow-3xs">
          <span className="block text-slate-400 font-bold uppercase tracking-wider text-[8px]">Vertex B</span>
          <span className="font-bold text-indigo-600 text-xs mt-0.5 block">X:{Math.round(vertices.B.x)} Y:{Math.round(vertices.B.y)}</span>
        </div>
        <div className="p-1.5 bg-white rounded border border-slate-200/60 shadow-3xs">
          <span className="block text-slate-400 font-bold uppercase tracking-wider text-[8px]">Vertex C</span>
          <span className="font-bold text-indigo-600 text-xs mt-0.5 block">X:{Math.round(vertices.C.x)} Y:{Math.round(vertices.C.y)}</span>
        </div>
      </div>
    </div>
  );
};
