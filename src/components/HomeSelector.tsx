import { useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Heart, Sparkles, LogOut, Copy, Check } from 'lucide-react';

interface HomeSelectorProps {
  user: FirebaseUser | null;
  isTeacher: boolean;
  onSelectStudent: () => void;
  onSelectTeacher: () => void;
  onGoogleLogin: () => void;
  onLogout: () => void;
  isLoggingIn?: boolean;
}

export const HomeSelector = ({
  user,
  isTeacher,
  onSelectStudent,
  onSelectTeacher,
  onGoogleLogin,
  onLogout,
  isLoggingIn = false,
}: HomeSelectorProps) => {
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

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

      {/* 1. 비로그인 상태: 구글 로그인 버튼 표시 */}
      {!user ? (
        <div className="login-prompt-card">
          <div className="login-prompt-icon">🔐</div>
          <h2 className="login-prompt-title">시작하기 전에 로그인해 주세요</h2>
          <p className="login-prompt-desc">
            구글 계정으로 로그인하면 학생 또는 교사 권한에 맞춰<br />
            입장할 수 있는 메뉴가 나타나요.
          </p>

          <button
            type="button"
            className="google-login-btn"
            onClick={onGoogleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <span className="spinner" />
            ) : (
              <svg className="google-icon" viewBox="0 0 24 24" width="22" height="22">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoggingIn ? '로그인 진행 중...' : 'Google 계정으로 로그인'}</span>
          </button>
        </div>
      ) : (
        /* 2. 로그인 완료 상태: 사용자 정보 바 + 입장 카드 표시 */
        <div className="auth-user-section">
          {/* 사용자 정보 및 로그아웃 바 */}
          <div className="user-profile-bar">
            <div className="profile-left">
              {user.photoURL ? (
                <img src={user.photoURL} alt="프로필" className="user-avatar-img" />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.displayName ? user.displayName.slice(0, 1) : '👤'}
                </div>
              )}
              <div className="user-info-text">
                <div className="user-name-row">
                  <strong className="user-name">{user.displayName || '사용자'}</strong>
                  <span className={`role-badge ${isTeacher ? 'teacher' : 'student'}`}>
                    {isTeacher ? '🏫 선생님' : '🎈 학생'}
                  </span>
                </div>
                <span className="user-email">{user.email}</span>
              </div>
            </div>

            <div className="profile-right">
              {/* 교사 설정에 도움을 주는 UID 확인/복사 버튼 */}
              <button
                type="button"
                className="uid-copy-btn"
                onClick={handleCopyUid}
                title="내 UID 복사하기"
              >
                {copiedUid ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                <span>{copiedUid ? '복사됨!' : '내 UID 복사'}</span>
              </button>

              <button type="button" className="home-logout-btn" onClick={onLogout}>
                <LogOut size={16} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          {/* 입장 버튼 목록: 교사면 2개 모두, 학생이면 학생 입장 1개만 표시 */}
          <div className={`portal-cards ${!isTeacher ? 'single-card' : ''}`}>
            {/* 학생 입장 버튼 (항상 표시) */}
            <div className="portal-card student-card" onClick={onSelectStudent}>
              <div className="card-pill student-pill">학생 참여 🎈</div>
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

            {/* 교사 입장 버튼 (교사 UID와 일치할 때만 표시) */}
            {isTeacher && (
              <div className="portal-card teacher-card" onClick={onSelectTeacher}>
                <div className="card-pill teacher-pill">선생님 전용 🏫</div>
                <div className="portal-icon-wrapper teacher-icon-bg">
                  <span className="big-emoji">📊</span>
                </div>
                <h2 className="portal-card-title">교사 입장하기</h2>
                <p className="portal-card-desc">
                  선생님 권한으로 접속하여<br />
                  학생들의 감정 통계와 그림 갤러리를 확인해요.
                </p>
                <div className="portal-card-features">
                  <span>📈 실시간 감정 막대그래프</span>
                  <span>🖼️ 우리 반 그림 갤러리</span>
                  <span>🔒 교사 UID 인증 완료</span>
                </div>
                <button type="button" className="portal-action-btn teacher-action-btn">
                  <span>교사 모니터링 접속하기</span>
                  <span className="arrow-icon">→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="home-footer">
        <p>
          <Heart size={14} className="inline-heart" /> 우리 반 친구들의 마음을 항상 응원합니다.
        </p>
      </footer>
    </div>
  );
};
