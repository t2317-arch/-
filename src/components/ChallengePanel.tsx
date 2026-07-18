import React, { useEffect } from 'react';
import { GeometryMetrics, Challenge } from '../types';
import { CheckCircle2, Award, Circle, Sparkles, Trophy } from 'lucide-react';

interface ChallengePanelProps {
  metrics: GeometryMetrics;
  challenges: Challenge[];
  onChallengeComplete: (id: string, completed: boolean) => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({
  metrics,
  challenges,
  onChallengeComplete,
}) => {
  // Check conditions in real-time
  useEffect(() => {
    // 1. Equilateral
    const isEquilateral = metrics.specialType === 'equilateral';
    onChallengeComplete('challenge-equilateral', isEquilateral);

    // 2. Right Triangle
    const isRight = metrics.triangleType === 'right';
    onChallengeComplete('challenge-right', isRight);

    // 3. Obtuse Triangle
    // Ensure it's genuinely obtuse (e.g., max angle is > 95 degrees to be safe)
    const maxAngle = Math.max(metrics.angleA, metrics.angleB, metrics.angleC);
    const isObtuse = maxAngle > 95;
    onChallengeComplete('challenge-obtuse', isObtuse);

    // 4. Isosceles
    const isIsosceles = metrics.specialType === 'isosceles' || metrics.specialType === 'equilateral';
    onChallengeComplete('challenge-isosceles', isIsosceles);
  }, [metrics, onChallengeComplete]);

  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const totalCount = challenges.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-5 py-3 flex justify-between items-center rounded-t-xl">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Trophy className="text-amber-400 animate-bounce" size={13} />
          GEOMETRY QUESTS (도형 탐구 미션)
        </span>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
          {completedCount} / {totalCount} COMPLETE
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-100 w-full">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Challenges List */}
      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          삼각형의 꼭짓점을 조심스럽게 드래그하여 아래의 기하학적 형태를 만들어 보세요! 실시간 피드백으로 미션 성공 여부가 판가름납니다.
        </p>

        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                challenge.isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/80 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        challenge.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {challenge.isCompleted ? '성공!' : '도전'}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-800">{challenge.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {challenge.description}
                  </p>
                </div>

                <div className="shrink-0 mt-0.5">
                  {challenge.isCompleted ? (
                    <div className="text-emerald-600 animate-scale-up">
                      <CheckCircle2 className="fill-emerald-100" size={20} />
                    </div>
                  ) : (
                    <div className="text-slate-300">
                      <Circle size={20} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>

              {/* Reactive Reward/Insight Box when completed */}
              {challenge.isCompleted && (
                <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-start gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg leading-relaxed animate-fade-in font-medium">
                  <Sparkles className="text-emerald-600 shrink-0 mt-0.5" size={13} />
                  <span>{challenge.successCondition}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Victory Celebration Banner */}
        {completedCount === totalCount && (
          <div className="bg-gradient-to-r from-amber-500 to-indigo-600 p-4 rounded-xl text-white text-center shadow-lg space-y-1.5 animate-bounce-short mt-4">
            <div className="flex justify-center gap-1">
              <Award className="fill-amber-300 stroke-amber-500" size={24} />
              <Award className="fill-amber-300 stroke-amber-500 scale-125" size={24} />
              <Award className="fill-amber-300 stroke-amber-500" size={24} />
            </div>
            <h3 className="text-sm font-black">🎉 축하합니다! 기하학 마스터!</h3>
            <p className="text-[11px] text-indigo-100 leading-relaxed font-semibold">
              모든 미션을 클리어했습니다. 삼각형의 내심, 외심, 무게중심의 성질을 완벽하게 마스터하셨습니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
