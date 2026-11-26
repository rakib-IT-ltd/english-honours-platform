import { Suspense } from 'react';
import { ResourceView } from '../../../../components/study/ResourceView';

export default function StudyResourcePage() {
  return (
    <Suspense fallback={null}>
      <ResourceView />
    </Suspense>
  );
}
