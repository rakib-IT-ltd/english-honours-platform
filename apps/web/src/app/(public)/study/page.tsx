import { Suspense } from 'react';
import { StudyCentre } from '../../../components/study/StudyCentre';

export default function StudyPage() {
  return (
    <Suspense fallback={null}>
      <StudyCentre />
    </Suspense>
  );
}
