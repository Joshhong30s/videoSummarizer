'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface VoiceVisualizerProps {
  isListening: boolean;
  audioLevel: number; // 0-100
  isSpeaking: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VoiceVisualizer({
  isListening,
  audioLevel,
  isSpeaking,
  size = 'md',
  className,
}: VoiceVisualizerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const barHeights = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  // 生成音頻條的高度
  const generateBarHeights = () => {
    if (!isListening) return [2, 2, 2, 2, 2];
    
    if (!isSpeaking) {
      // 待機狀態 - 小幅波動
      return [2, 3, 2, 4, 2];
    }
    
    // 根據音量生成不同高度的條
    const baseHeight = Math.max(2, audioLevel / 25); // 2-4 的基礎高度
    const variation = audioLevel / 50; // 變化幅度
    
    return [
      Math.max(2, baseHeight + Math.random() * variation),
      Math.max(2, baseHeight + Math.random() * variation),
      Math.max(2, baseHeight + Math.random() * variation * 1.5),
      Math.max(2, baseHeight + Math.random() * variation),
      Math.max(2, baseHeight + Math.random() * variation),
    ];
  };

  const barHeightValues = generateBarHeights();
  const maxBarHeight = barHeights[size];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {/* 外圈 - 監聽狀態指示 */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full border-2',
          isListening
            ? isSpeaking
              ? 'border-green-400 bg-green-400/10'
              : 'border-blue-400 bg-blue-400/10'
            : 'border-gray-300 bg-gray-100'
        )}
        animate={{
          scale: isListening ? (isSpeaking ? [1, 1.1, 1] : [1, 1.05, 1]) : 1,
        }}
        transition={{
          duration: isSpeaking ? 0.5 : 2,
          repeat: isListening ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* 音頻波形顯示 */}
      <div className="flex items-end justify-center space-x-0.5">
        {barHeightValues.map((height, index) => (
          <motion.div
            key={index}
            className={cn(
              'w-0.5 rounded-full',
              isListening
                ? isSpeaking
                  ? 'bg-green-400'
                  : 'bg-blue-400'
                : 'bg-gray-400'
            )}
            animate={{
              height: Math.min(height * 3, maxBarHeight),
            }}
            transition={{
              duration: 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* 音量級別顯示（可選） */}
      {isListening && isSpeaking && (
        <div className="absolute -bottom-1 -right-1">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              audioLevel > 70
                ? 'bg-red-400'
                : audioLevel > 40
                ? 'bg-yellow-400'
                : 'bg-green-400'
            )}
          />
        </div>
      )}

      {/* 脈衝效果 */}
      {isListening && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full',
            isSpeaking ? 'bg-green-400/20' : 'bg-blue-400/20'
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}

// 簡化版本 - 只顯示狀態
export function SimpleVoiceIndicator({
  isListening,
  isSpeaking,
  className,
}: {
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        'w-3 h-3 rounded-full',
        isListening
          ? isSpeaking
            ? 'bg-green-400'
            : 'bg-blue-400'
          : 'bg-gray-400',
        className
      )}
      animate={{
        scale: isListening ? (isSpeaking ? [1, 1.2, 1] : [1, 1.1, 1]) : 1,
        opacity: isListening ? [0.7, 1, 0.7] : 0.5,
      }}
      transition={{
        duration: isSpeaking ? 0.5 : 1,
        repeat: isListening ? Infinity : 0,
        ease: 'easeInOut',
      }}
    />
  );
}