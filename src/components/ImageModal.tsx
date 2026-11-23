import type { StudentEmotionRecord } from '../types/emotion';
import { EMOTIONS } from '../types/emotion';
import { X, Calendar, Download, User } from 'lucide-react';

interface ImageModalProps {
  record: StudentEmotionRecord | null;
  onClose: () => void;
}

export const ImageModal = ({ record, onClose }: ImageModalProps) => {
  if (!record) return null;

  const meta = EMOTIONS[record.emotion] || EMOTIONS['행복'];

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

      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = record.imageUrl;
    a.target = '_blank';
    a.download = `${record.studentName}_${record.emotion}_그림.jpg`;
    a.click();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-info">
            <div className="modal-student-tag">
              <User size={18} />
              <strong>{record.studentName} 학생</strong>
            </div>
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

          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-image-body">
          <img
            src={record.imageUrl}
            alt={`${record.studentName}의 그림`}
            className="modal-full-img"
          />
        </div>

        <div className="modal-footer">
          <div className="modal-date">
            <Calendar size={14} />
            <span>제출 일시: {formatTimestamp(record.createdAt)}</span>
          </div>

          <button type="button" className="download-btn" onClick={handleDownload}>
            <Download size={16} />
            <span>원본 이미지 보기/다운로드</span>
          </button>
        </div>
      </div>
    </div>
  );
};
