import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase/config';
import { HomeSelector } from './components/HomeSelector';
import { StudentView } from './components/StudentView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AlertTriangle } from 'lucide-react';
import './index.css';

type AppView = 'home' | 'student' | 'teacher_dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 등록된 교사 UID 목록 파싱 (.env.local의 VITE_TEACHER_UID, 쉼표로 다중 등록 가능)
  const teacherUids = (import.meta.env.VITE_TEACHER_UID || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  // 현재 로그인한 사용자가 교사 UID와 일치하는지 확인
  const isTeacher = Boolean(user && teacherUids.includes(user.uid));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError('');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Google login error:', err);
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        // 사용자가 팝업을 직접 닫은 경우
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      setLoginError(`로그인 중 오류가 발생했습니다: ${msg}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSelectStudent = () => {
    setCurrentView('student');
  };

  const handleSelectTeacher = () => {
    if (isTeacher) {
      setCurrentView('teacher_dashboard');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="app-root">
      {/* Configuration notice if .env.local needs setup */}
      {!isFirebaseConfigured && (
        <div className="config-banner">
          <AlertTriangle size={18} className="banner-icon" />
          <span>
            Firebase 설정이 필요합니다. <code>.env.local</code> 파일에 본인의 Firebase 콘솔 설정값을 입력해주세요.
          </span>
        </div>
      )}

      {loginError && (
        <div className="config-banner" style={{ background: '#FEE2E2', borderColor: '#FCA5A5', color: '#991B1B' }}>
          <AlertTriangle size={18} className="banner-icon" />
          <span>{loginError}</span>
        </div>
      )}

      {currentView === 'home' && (
        <HomeSelector
          user={user}
          isTeacher={isTeacher}
          onSelectStudent={handleSelectStudent}
          onSelectTeacher={handleSelectTeacher}
          onGoogleLogin={handleGoogleLogin}
          onLogout={handleLogout}
          isLoggingIn={isLoggingIn}
        />
      )}

      {currentView === 'student' && (
        <StudentView onBackToHome={handleBackToHome} />
      )}

      {currentView === 'teacher_dashboard' && isTeacher && (
        <TeacherDashboard
          user={user}
          onBackToHome={handleBackToHome}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
