"use client";

import { useEffect } from "react";
import { markNoticeRead } from "@/lib/actions/notice-read-actions";

// Invisible — fires once per notice on mount. markNoticeRead is an upsert,
// so revisiting a notice never errors or double-counts.
export function NoticeReadTracker({ noticeId }) {
  useEffect(() => {
    markNoticeRead(noticeId);
  }, [noticeId]);

  return null;
}
