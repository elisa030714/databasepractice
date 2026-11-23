import { useState, useRef } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase/config';
import type { EmotionType } from '../types/emotion';
import { EMOTIONS } from '../types/emotion';
import type { DrawingCanvasHandle } from './DrawingCanvas';
import { DrawingCanvas } from './DrawingCanvas';
import { ArrowLeft, Send, Sparkles, Heart, CheckCircle2 } from 'lucide-react';

interface StudentViewProps {
  onBackToHome: () => void;
}

export const StudentView = ({ onBackToHome }: StudentViewProps) => {
  const [studentName, setStudentName] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canvasRef = useRef<DrawingCanvasHandle | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim()) {
      setErrorMessage('이름을 먼저 적어주세요! 😊');
      return;
    }

    if (!selectedEmotion) {
      setErrorMessage('오늘의 기분 카드를 하나 골라주세요! 🌈');
      return;
    }

    if (!canvasRef.current || canvasRef.current.isEmpty()) {
      setErrorMessage('도화지에 기분을 나타내는 그림을 조금이라도 그려주세요! 🎨');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Convert drawing to JPEG blob
      const jpegBlob = await canvasRef.current.getJpegBlob();

      // 2. Upload to Firebase Cloud Storage as JPG
      const sanitizedName = studentName.trim().replace(/[^a-zA-Z0-9가-힣]/g, '_');
      const filename = `drawings/${Date.now()}_${sanitizedName}.jpg`;
      const fileRef = storageRef(storage, filename);

      const uploadResult = await uploadBytes(fileRef, jpegBlob, {
        contentType: 'image/jpeg',
      });

      // 3. Get download URL
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // 4. Save to Firestore
      await addDoc(collection(db, 'emotion_records'), {
        studentName: studentName.trim(),
        emotion: selectedEmotion,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Submission failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        `저장 중 문제가 생겼어요: ${msg}. Firebase 설정을 확인해주세요.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStudentName('');
    setSelectedEmotion(null);
    canvasRef.current?.clear();
    setIsSuccess(false);
    setErrorMessage('');
  };

  if (isSuccess) {
    return (
      <div className="student-container">
        <div className="success-card">
          <div className="success-icon-wrap">
            <Sparkles className="sparkle-icon" size={48} />
            <Heart className="heart-icon" size={56} />
          </div>
          <h2 className="success-title">마음이 잘 전달되었어요! 🎉</h2>
          <p className="success-desc">
            <strong>{studentName}</strong> 친구의 소중한 감정과 그림을<br />
            선생님께서 따뜻한 마음으로 확인하실 거예요.
          </p>

          <div className="success-buttons">
            <button type="button" className="pastel-btn secondary" onClick={handleReset}>
              한 번 더 그리기 🎨
            </button>
            <button type="button" className="pastel-btn primary" onClick={onBackToHome}>
              처음 화면으로 🏠
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-container">
      {/* Top Header */}
      <div className="student-nav">
        <button type="button" className="back-btn" onClick={onBackToHome} title="처음 화면으로">
          <ArrowLeft size={20} />
          <span>처음으로</span>
        </button>
        <span className="nav-badge">학생 모드 🎈</span>
      </div>

      <header className="student-header">
        <h1 className="main-title">
          <span>🌈</span> 마음 톡톡! 오늘 나의 감정 우체통
        </h1>
        <p className="sub-title">오늘 내 마음의 날씨는 어떤가요? 자유롭게 표현해보세요!</p>
      </header>

      <form onSubmit={handleSubmit} className="student-form">
        {/* Step 1: Student Name */}
        <section className="form-card step-card">
          <div className="step-badge">1단계</div>
          <h2 className="step-title">안녕! 네 이름을 알려줘 ✨</h2>
          <div className="input-group">
            <input
              type="text"
              className="student-name-input"
              placeholder="예: 김민우, 이하나"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              maxLength={20}
              disabled={isSubmitting}
            />
          </div>
        </section>

        {/* Step 2: Emotion Selection */}
        <section className="form-card step-card">
          <div className="step-badge">2단계</div>
          <h2 className="step-title">지금 내 기분은 어떤가요? 🌤️</h2>
          <p className="step-desc">가장 마음에 와닿는 감정 카드를 꾹 눌러보세요.</p>

          <div className="emotion-grid">
            {(Object.keys(EMOTIONS) as EmotionType[]).map((emotionKey) => {
              const meta = EMOTIONS[emotionKey];
              const isSelected = selectedEmotion === emotionKey;

              return (
                <button
                  key={emotionKey}
                  type="button"
                  className={`emotion-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    backgroundColor: isSelected ? meta.bgLight : '#FFFFFF',
                    borderColor: isSelected ? meta.borderColor : '#E2E8F0',
                  }}
                  onClick={() => setSelectedEmotion(emotionKey)}
                  disabled={isSubmitting}
                >
                  <span className="emotion-emoji">{meta.emoji}</span>
                  <span className="emotion-label" style={{ color: isSelected ? meta.textColor : '#334155' }}>
                    {meta.label}
                  </span>
                  <span className="emotion-desc">{meta.description}</span>
                  {isSelected && (
                    <div className="check-badge" style={{ backgroundColor: meta.borderColor }}>
                      <CheckCircle2 size={16} color="#FFFFFF" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Drawing Canvas */}
        <section className="form-card step-card">
          <div className="step-badge">3단계</div>
          <h2 className="step-title">내 마음을 그림으로 그려봐요 🎨</h2>
          <p className="step-desc">기분 좋은 순간, 속상한 일, 지금 떠오르는 생각을 자유롭게 그려보세요.</p>
          <DrawingCanvas ref={canvasRef} disabled={isSubmitting} />
        </section>

        {/* Error message */}
        {errorMessage && (
          <div className="error-banner">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Step 4: Submit Button */}
        <div className="submit-section">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                <span>선생님께 마음을 전송하고 있어요... 💌</span>
              </>
            ) : (
              <>
                <Send size={22} />
                <span>선생님께 마음 보내기 💌</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
