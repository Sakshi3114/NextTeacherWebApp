"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import CreateNotice from '@/components/common/NoticeForm';

function CreateNoticePageContent() {
  const searchParams = useSearchParams();
  const [teacherId, setTeacherId] = useState(null);
  const [teacherName, setTeacherName] = useState(null);

  useEffect(() => {
    setTeacherId(searchParams.get('_id'));
    setTeacherName(searchParams.get('name'));
  }, [searchParams]);

  if (!teacherId || !teacherName) {
    return <p>Error: Missing teacher information. Please log in again.</p>;
  }

  return <CreateNotice teacherId={teacherId} teacherName={teacherName} />;
}

export default function CreateNoticePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CreateNoticePageContent />
    </Suspense>
  );
}
