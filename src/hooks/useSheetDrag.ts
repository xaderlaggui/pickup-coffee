import { useState, useRef, useEffect, useCallback } from "react";

interface UseSheetDragOptions {
  onClose: () => void;
  /** Velocity threshold (px/ms) to trigger velocity-based close */
  velocityThreshold?: number;
  /** Distance threshold (px) to trigger distance-based close */
  distanceThreshold?: number;
}

export function useSheetDrag({
  onClose,
  velocityThreshold = 0.5,
  distanceThreshold = 120,
}: UseSheetDragOptions) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startTime = useRef(0);
  const lastY = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    lastY.current = e.clientY;
    startTime.current = e.timeStamp;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientY - startY.current;
      // Only allow dragging downward; rubber-band upward with diminishing return
      if (delta < 0) {
        setDragY(delta * 0.15);
      } else {
        setDragY(delta);
      }
      lastY.current = e.clientY;
    },
    [isDragging]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      const totalDelta = e.clientY - startY.current;
      const elapsed = e.timeStamp - startTime.current;
      const velocity = elapsed > 0 ? totalDelta / elapsed : 0;

      if (
        totalDelta > distanceThreshold ||
        velocity > velocityThreshold
      ) {
        onClose();
      } else {
        setDragY(0);
      }
    },
    [isDragging, distanceThreshold, velocityThreshold, onClose]
  );

  // Reset dragY on close
  useEffect(() => {
    if (!isDragging) {
      setDragY(0);
    }
  }, [isDragging]);

  const dragStyle: React.CSSProperties = {
    transform: dragY !== 0 ? `translateY(${dragY}px)` : undefined,
    transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return { dragStyle, onPointerDown, onPointerMove, onPointerUp, isDragging };
}
