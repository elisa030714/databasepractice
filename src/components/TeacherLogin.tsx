import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { ArrowLeft, Lock, Mail, LogIn, AlertCircle } from 'lucide-react';

interface TeacherLoginProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

export const TeacherLogin = ({ onBackToHome, onLoginSuccess }: TeacherLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess();
    } catch (err: unknown) {
      console.error('Teacher login failed:', err);
      const code = (err as { code?: string })?.code || '';
      
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('올바른 이메일 형식을 입력해주세요.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage('로그인 시도가 너무 많았습니다. 잠시 후 다시 시도해주세요.');
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(`로그인 실패: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-nav">
        <button type="button" className="back-btn" onClick={onBackToHome}>
          <ArrowLeft size={20} />
          <span>처음으로</span>
        </button>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-badge-icon">
            <Lock size={30} />
          </div>
          <h2 className="login-title">선생님 로그인</h2>
          <p className="login-subtitle">
            Firebase Authentication에 등록된<br />
            교사 계정의 이메일과 비밀번호로 로그인해주세요.
          </p>
        </div>

        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-field">
            <label htmlFor="teacher-email">교사 이메일</label>
            <div className="field-input-wrap">
              <Mail size={18} className="field-icon" />
              <input
                id="teacher-email"
                type="email"
                placeholder="teacher@school.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="teacher-password">비밀번호</label>
            <div className="field-input-wrap">
              <Lock size={18} className="field-icon" />
              <input
                id="teacher-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>로그인 중...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>교사 모드 입장하기</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
