import { Heart, Sparkles } from 'lucide-react';

interface HomeSelectorProps {
  onSelectStudent: () => void;
  onSelectTeacher: () => void;
}

export const HomeSelector = ({ onSelectStudent, onSelectTeacher }: HomeSelectorProps) => {
  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="hero-badge">
          <Sparkles size={18} className="badge-icon" />
          <span>초등학교 정서 모니터링 플랫폼</span>
        </div>
        <h1 className="hero-title">
          <span>🌈</span> 마음 톡톡! 우리 반 감정 우체통
        </h1>
        <p className="hero-subtitle">
          오늘 나의 마음 날씨를 그림으로 표현하고,<br />
          선생님과 따뜻한 마음을 나누어 보세요.
        </p>
      </div>

      <div className="portal-cards">
        {/* Student Entrance */}
        <div className="portal-card student-card" onClick={onSelectStudent}>
          <div className="card-pill student-pill">학생 전용 🎈</div>
          <div className="portal-icon-wrapper student-icon-bg">
            <span className="big-emoji">🎨</span>
          </div>
          <h2 className="portal-card-title">학생 입장하기</h2>
          <p className="portal-card-desc">
            내 이름을 적고, 오늘의 기분을 고른 후<br />
            알록달록 도화지에 그림을 그려요!
          </p>
          <div className="portal-card-features">
            <span>✨ 6가지 감정 선택</span>
            <span>🖌️ 자유로운 도화지</span>
            <span>💌 비밀 우체통 전송</span>
          </div>
          <button type="button" className="portal-action-btn student-action-btn">
            <span>학생으로 시작하기</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>

        {/* Teacher Entrance */}
        <div className="portal-card teacher-card" onClick={onSelectTeacher}>
          <div className="card-pill teacher-pill">선생님 전용 🏫</div>
          <div className="portal-icon-wrapper teacher-icon-bg">
            <span className="big-emoji">📊</span>
          </div>
          <h2 className="portal-card-title">교사 입장하기</h2>
          <p className="portal-card-desc">
            선생님 계정으로 로그인하여<br />
            학생들의 감정 통계와 그림 갤러리를 확인해요.
          </p>
          <div className="portal-card-features">
            <span>📈 실시간 감정 막대그래프</span>
            <span>🖼️ 우리 반 그림 갤러리</span>
            <span>🔒 안전한 교사 전용 인증</span>
          </div>
          <button type="button" className="portal-action-btn teacher-action-btn">
            <span>교사 모드로 접속하기</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>

      <footer className="home-footer">
        <p>
          <Heart size={14} className="inline-heart" /> 우리 반 친구들의 마음을 항상 응원합니다.
        </p>
      </footer>
    </div>
  );
};
