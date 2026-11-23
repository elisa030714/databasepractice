import { useEffect, useState } from 'react';
import type { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import type { StudentEmotionRecord } from '../types/emotion';
import { EmotionBarChart } from './EmotionBarChart';
import { StudentGallery } from './StudentGallery';
import { ImageModal } from './ImageModal';
import { LogOut, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

interface TeacherDashboardProps {
  user: FirebaseUser | null;
  onBackToHome: () => void;
  onLogout: () => void;
}

export const TeacherDashboard = ({ user, onBackToHome, onLogout }: TeacherDashboardProps) => {
  const [records, setRecords] = useState<StudentEmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedImageRecord, setSelectedImageRecord] = useState<StudentEmotionRecord | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setFetchError('');

    // Listen to real-time updates from Firestore
    const q = query(
      collection(db, 'emotion_records'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items: StudentEmotionRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            studentName: data.studentName || '익명 학생',
            emotion: data.emotion || '평온',
            imageUrl: data.imageUrl || '',
            createdAt: data.createdAt,
          });
        });
        setRecords(items);
        setIsLoading(false);
      },
      (error: Error) => {
        console.error('Firestore listener error:', error);
        setFetchError(
          `데이터를 불러오는 중 오류가 발생했습니다: ${error.message}. Firestore 보안 규칙(rules)을 확인해주세요.`
        );
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="teacher-container">
      {/* Teacher Top Navigation */}
      <header className="teacher-topbar">
        <div className="topbar-left">
          <button type="button" className="nav-btn" onClick={onBackToHome} title="메인 화면으로">
            <ArrowLeft size={18} />
            <span>홈으로</span>
          </button>
          <div className="teacher-title-wrap">
            <span className="teacher-role-badge">
              <ShieldCheck size={16} />
              교사 모니터링 모드
            </span>
            <span className="user-email-text">{user?.email || '선생님'}</span>
          </div>
        </div>

        <div className="topbar-right">
          <button type="button" className="logout-btn" onClick={handleSignOut} title="로그아웃">
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      {/* Main Content Area: Left Bar Chart + Right Gallery */}
      <main className="teacher-main">
        {fetchError && (
          <div className="dashboard-error-banner">
            <AlertCircle size={20} />
            <span>{fetchError}</span>
          </div>
        )}

        {isLoading ? (
          <div className="dashboard-loading">
            <div className="spinner large" />
            <p>학생들의 감정 데이터를 실시간으로 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="dashboard-split-layout">
            {/* Left Column: Emotion Bar Chart */}
            <section className="dashboard-left-col">
              <EmotionBarChart records={records} />
            </section>

            {/* Right Column: Student Drawings Gallery */}
            <section className="dashboard-right-col">
              <StudentGallery
                records={records}
                onOpenImage={(record) => setSelectedImageRecord(record)}
              />
            </section>
          </div>
        )}
      </main>

      {/* Full Image Modal */}
      <ImageModal
        record={selectedImageRecord}
        onClose={() => setSelectedImageRecord(null)}
      />
    </div>
  );
};
