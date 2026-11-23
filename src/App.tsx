import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase/config';
import { HomeSelector } from './components/HomeSelector';
import { StudentView } from './components/StudentView';
import { TeacherLogin } from './components/TeacherLogin';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AlertTriangle } from 'lucide-react';
import './index.css';

type AppView = 'home' | 'student' | 'teacher_login' | 'teacher_dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectStudent = () => {
    setCurrentView('student');
  };

  const handleSelectTeacher = () => {
    if (user) {
      setCurrentView('teacher_dashboard');
    } else {
      setCurrentView('teacher_login');
    }
  };

  const handleTeacherLoginSuccess = () => {
    setCurrentView('teacher_dashboard');
  };

  const handleLogout = () => {
    setCurrentView('home');
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

      {currentView === 'home' && (
        <HomeSelector
          onSelectStudent={handleSelectStudent}
          onSelectTeacher={handleSelectTeacher}
        />
      )}

      {currentView === 'student' && (
        <StudentView onBackToHome={handleBackToHome} />
      )}

      {currentView === 'teacher_login' && (
        <TeacherLogin
          onBackToHome={handleBackToHome}
          onLoginSuccess={handleTeacherLoginSuccess}
        />
      )}

      {currentView === 'teacher_dashboard' && (
        <TeacherDashboard
          user={user}
          onBackToHome={handleBackToHome}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
