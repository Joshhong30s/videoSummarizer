'use client';

import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { transitions } from '@/lib/design-system/animations';

interface RefreshControlProps {
  onRefresh: () => Promise<void>;
  pullDistance?: number;
  resistance?: number;
  children: React.ReactNode;
}

export function RefreshControl({
  onRefresh,
  pullDistance = 100,
  resistance = 0.5,
  children,
}: RefreshControlProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const y = useMotionValue(0);
  const controls = useAnimation();

  const indicatorY = useTransform(
    y,
    [0, pullDistance],
    [0, pullDistance * resistance]
  );
  const indicatorRotate = useTransform(y, [0, pullDistance], [0, 180]);
  const indicatorOpacity = useTransform(y, [0, pullDistance * 0.3], [0, 1]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled || refreshing) return;

    const element = e.currentTarget;
    if (element.scrollTop > 0) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled || refreshing) return;

    const touch = e.touches[0];
    const deltaY = Math.max(
      0,
      touch.clientY - e.currentTarget.getBoundingClientRect().top
    );
    y.set(deltaY * resistance);
  };

  const handleTouchEnd = async () => {
    if (!enabled || refreshing) return;

    if (y.get() >= pullDistance * resistance) {
      setRefreshing(true);

      await controls.start({
        y: pullDistance * resistance,
        transition: transitions.spring,
      });

      try {
        await onRefresh();
      } finally {
        setRefreshing(false);

        await controls.start({
          y: 0,
          transition: transitions.spring,
        });
      }
    } else {
      controls.start({
        y: 0,
        transition: transitions.spring,
      });
    }

    y.set(0);
  };

  useEffect(() => {
    return () => {
      y.set(0);
      setRefreshing(false);
      setEnabled(true);
    };
  }, [y]);

  return (
    <motion.div
      className="relative w-full min-h-[200px] overflow-auto touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      animate={controls}
      style={{ y }}
    >
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-12 flex flex-col items-center justify-center text-gray-500"
        style={{
          y: indicatorY,
          opacity: indicatorOpacity,
        }}
      >
        <motion.div style={{ rotate: indicatorRotate }} className="mb-2">
          <ArrowDown className="w-6 h-6" />
        </motion.div>
        <span className="text-sm">{refreshing ? '刷新中...' : '下拉刷新'}</span>
      </motion.div>

      {children}
    </motion.div>
  );
}
