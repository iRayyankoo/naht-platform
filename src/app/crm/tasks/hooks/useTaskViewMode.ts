"use client";

import { useState, useRef, useCallback } from 'react';
import { updateMyTaskViewPreference } from '@/actions/userPreferences';
import { ClientTaskViewMode } from '../types';
import { toast } from 'react-hot-toast';
import { TaskViewMode } from '@prisma/client';

export type SaveViewPreferenceAction = (view: TaskViewMode) => Promise<{ success: boolean; error?: string }>;

export function useTaskViewMode(
  initialMode: ClientTaskViewMode,
  saveAction?: SaveViewPreferenceAction
) {
  const [viewMode, setViewMode] = useState<ClientTaskViewMode>(initialMode);
  
  const lastPersistedMode = useRef<ClientTaskViewMode>(initialMode);
  const requestVersion = useRef(0);
  const isUpdating = useRef(false);
  const queue = useRef<{ version: number; mode: ClientTaskViewMode }[]>([]);

  const processQueue = async () => {
    if (isUpdating.current || queue.current.length === 0) return;

    isUpdating.current = true;
    const nextItem = queue.current.shift();

    if (nextItem) {
      try {
        const action = saveAction || updateMyTaskViewPreference;
        const res = await action(nextItem.mode as TaskViewMode);
        
        if (res.success) {
          // If successful and this was the latest request, update the last persisted mode
          if (nextItem.version >= requestVersion.current - queue.current.length - 1) {
             lastPersistedMode.current = nextItem.mode;
          }
        } else {
          throw new Error(res.error || "Failed to update");
        }
      } catch (err) {
        console.error("Failed to update view mode:", err);
        // Only revert if we are not actively processing a newer request
        if (queue.current.length === 0) {
           // Revert UI to the last successfully saved mode
           setViewMode(lastPersistedMode.current);
           toast.error("فشل حفظ طريقة العرض، تمت الإعادة للقيمة السابقة.");
        }
      }
    }

    isUpdating.current = false;
    setTimeout(() => {
      processQueue();
    }, 0);
  };

  const changeViewMode = useCallback((newMode: ClientTaskViewMode) => {
    if (newMode === viewMode) return;

    setViewMode(newMode);
    requestVersion.current += 1;
    queue.current.push({ version: requestVersion.current, mode: newMode });
    processQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  return { viewMode, changeViewMode };
}
