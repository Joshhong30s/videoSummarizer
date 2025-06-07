import { useCallback, useRef } from 'react';

interface LongPressOptions {
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
  onCancel?: () => void;
  disabled?: boolean;
  vibrate?: boolean;
}

export function useLongPress({
  onLongPress,
  onPress,
  delay = 500,
  onCancel,
  disabled = false,
  vibrate = true,
}: LongPressOptions) {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const target = useRef<EventTarget>();

  const start = useCallback(
    (event: React.TouchEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
      if (disabled) return;

      if (event.type === 'mousedown' && target.current) return;

      target.current = event.target;
      timeout.current = setTimeout(() => {
        if (vibrate && navigator.vibrate) {
          navigator.vibrate(50);
        }
        onLongPress();
      }, delay);
    },
    [onLongPress, delay, disabled, vibrate]
  );

  const clear = useCallback(
    (
      event: React.TouchEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
      shouldTriggerClick = true
    ) => {
      if (event.type === 'mouseup' && !target.current) return;

      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && onPress?.();
      target.current = undefined;
    },
    [onPress]
  );

  const cancel = useCallback(
    (event: React.TouchEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
      timeout.current && clearTimeout(timeout.current);
      target.current = undefined;
      onCancel?.();
    },
    [onCancel]
  );

  return {
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => start(e),
    onTouchEnd: (e: React.TouchEvent<HTMLElement>) => clear(e),
    onTouchCancel: (e: React.TouchEvent<HTMLElement>) => cancel(e),

    onMouseDown: (e: React.MouseEvent<HTMLElement>) => start(e),
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => clear(e),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => cancel(e),
  };
}
