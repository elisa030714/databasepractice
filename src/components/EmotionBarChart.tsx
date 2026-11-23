import type { EmotionType, StudentEmotionRecord } from '../types/emotion';
import { EMOTIONS } from '../types/emotion';
import { BarChart3, Users } from 'lucide-react';

interface EmotionBarChartProps {
  records: StudentEmotionRecord[];
}

export const EmotionBarChart = ({ records }: EmotionBarChartProps) => {
  const total = records.length;

  // Calculate count for each emotion
  const emotionCounts: Record<EmotionType, number> = {
    행복: 0,
    평온: 0,
    불안: 0,
    슬픔: 0,
    화남: 0,
    피곤: 0,
  };

  records.forEach((r) => {
    if (r.emotion && emotionCounts[r.emotion] !== undefined) {
      emotionCounts[r.emotion] += 1;
    }
  });

  // Find dominant emotion
  let dominantEmotion: EmotionType = '행복';
  let maxCount = -1;
  (Object.keys(emotionCounts) as EmotionType[]).forEach((type) => {
    if (emotionCounts[type] > maxCount) {
      maxCount = emotionCounts[type];
      dominantEmotion = type;
    }
  });

  return (
    <div className="chart-panel">
      <div className="panel-header">
        <div className="header-title-wrap">
          <BarChart3 className="panel-icon" size={22} />
          <h3 className="panel-title">우리 반 감정 통계</h3>
        </div>
        <div className="total-badge">
          <Users size={16} />
          <span>총 <strong>{total}</strong>명 제출</span>
        </div>
      </div>

      {total > 0 ? (
        <>
          {/* Dominant highlight banner */}
          <div
            className="dominant-banner"
            style={{
              backgroundColor: EMOTIONS[dominantEmotion].bgLight,
              borderColor: EMOTIONS[dominantEmotion].borderColor,
            }}
          >
            <span className="dominant-emoji">{EMOTIONS[dominantEmotion].emoji}</span>
            <div className="dominant-text">
              <span className="dominant-sub">지금 가장 많이 느끼는 감정은?</span>
              <strong className="dominant-main" style={{ color: EMOTIONS[dominantEmotion].textColor }}>
                &lsquo;{EMOTIONS[dominantEmotion].label}&rsquo; ({maxCount}명, {Math.round((maxCount / total) * 100)}%)
              </strong>
            </div>
          </div>

          {/* Bar Chart list */}
          <div className="bar-list">
            {(Object.keys(EMOTIONS) as EmotionType[]).map((emotionKey) => {
              const meta = EMOTIONS[emotionKey];
              const count = emotionCounts[emotionKey];
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={emotionKey} className="bar-item">
                  <div className="bar-label-row">
                    <div className="bar-emotion-info">
                      <span className="bar-emoji">{meta.emoji}</span>
                      <span className="bar-name">{meta.label}</span>
                    </div>
                    <div className="bar-value-info">
                      <strong className="bar-count">{count}명</strong>
                      <span className="bar-pct">({percentage}%)</span>
                    </div>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: meta.borderColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="empty-chart-state">
          <span className="empty-emoji">🌱</span>
          <p className="empty-text">아직 학생들이 제출한 감정 데이터가 없어요.</p>
          <span className="empty-sub">학생들이 정서를 제출하면 실시간으로 막대그래프가 나타나요!</span>
        </div>
      )}
    </div>
  );
};
