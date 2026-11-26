import { Suspense } from 'react';
import { ReaderView } from '../../../../components/study/ReaderView';

export default function StudyReadPage() {
  return (
    <Suspense fallback={null}>
      <ReaderView />
    </Suspense>
  );
}
