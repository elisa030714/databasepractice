import type { StudentEmotionRecord, EmotionType } from '../types/emotion';
import { EMOTIONS } from '../types/emotion';
import { useState } from 'react';
import { Image, Calendar, Maximize2, Sparkles } from 'lucide-react';

interface StudentGalleryProps {
  records: StudentEmotionRecord[];
  onOpenImage: (record: StudentEmotionRecord) => void;
}

export const StudentGallery = ({ records, onOpenImage }: StudentGalleryProps) => {
  const [selectedFilter, setSelectedFilter] = useState<EmotionType | '전체'>('전체');

  const filteredRecords = selectedFilter === '전체'
    ? records
    : records.filter((r) => r.emotion === selectedFilter);

  const formatTimestamp = (createdAt: StudentEmotionRecord['createdAt']) => {
    if (!createdAt) return '방금 전';
    try {
      let date: Date;
      if (typeof createdAt === 'object' && 'toDate' in createdAt && typeof createdAt.toDate === 'function') {
        date = createdAt.toDate();
      } else if (typeof createdAt === 'object' && 'seconds' in createdAt) {
        date = new Date(createdAt.seconds * 1000);
      } else if (createdAt instanceof Date) {
        date = createdAt;
      } else {
        date = new Date(String(createdAt));
      }

      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}월 ${day}일 ${hours}:${minutes}`;
    } catch {
      return '최근';
    }
  };

  return (
    <div className="gallery-panel">
      <div className="panel-header">
        <div className="header-title-wrap">
          <Image className="panel-icon" size={22} />
          <h3 className="panel-title">학생 그림 갤러리</h3>
        </div>

        {/* Emotion Filter buttons */}
        <div className="gallery-filters">
          <button
            type="button"
            className={`filter-pill ${selectedFilter === '전체' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('전체')}
          >
            전체 ({records.length})
          </button>
          {(Object.keys(EMOTIONS) as EmotionType[]).map((type) => {
            const count = records.filter((r) => r.emotion === type).length;
            if (count === 0 && selectedFilter !== type) return null; // show active or non-zero
            return (
              <button
                key={type}
                type="button"
                className={`filter-pill ${selectedFilter === type ? 'active' : ''}`}
                onClick={() => setSelectedFilter(type)}
              >
                <span>{EMOTIONS[type].emoji}</span>
                <span>{type}</span>
                <span className="count-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="gallery-grid">
          {filteredRecords.map((record, index) => {
            const meta = EMOTIONS[record.emotion] || EMOTIONS['행복'];
            return (
              <div
                key={record.id || index}
                className="gallery-card"
                onClick={() => onOpenImage(record)}
              >
                <div className="card-image-wrap">
                  <img
                    src={record.imageUrl}
                    alt={`${record.studentName}의 그림`}
                    className="gallery-img"
                    loading="lazy"
                  />
                  <div className="card-hover-overlay">
                    <Maximize2 size={24} color="#FFFFFF" />
                    <span>크게 보기</span>
                  </div>
                </div>

                <div className="card-info">
                  <div className="card-top-row">
                    <span className="student-name">{record.studentName}</span>
                    <span
                      className="emotion-tag"
                      style={{
                        backgroundColor: meta.bgLight,
                        borderColor: meta.borderColor,
                        color: meta.textColor,
                      }}
                    >
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </span>
                  </div>

                  <div className="card-date-row">
                    <Calendar size={13} />
                    <span>{formatTimestamp(record.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-gallery-state">
          <Sparkles className="empty-gallery-icon" size={36} />
          <p className="empty-title">
            {selectedFilter === '전체'
              ? '아직 등록된 학생 그림이 없어요.'
              : `'${selectedFilter}' 감정으로 제출된 그림이 없어요.`}
          </p>
          <p className="empty-desc">학생들이 도화지에 그림을 제출하면 여기에 갤러리로 펼쳐집니다.</p>
        </div>
      )}
    </div>
  );
};
