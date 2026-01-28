import { useEffect, useRef, useCallback } from 'react';

interface UseControlsReturn {
  keysPressed: React.MutableRefObject<Set<string>>;
  typedBuffer: React.MutableRefObject<string>;
}

export function useControls(
  onKeyDown?: (key: string) => void
): UseControlsReturn {
  const keysPressed = useRef<Set<string>>(new Set());
  const typedBuffer = useRef<string>('');

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);

      // Track typed characters for easter eggs
      typedBuffer.current += e.key;
      if (typedBuffer.current.length > 20) {
        typedBuffer.current = typedBuffer.current.slice(-20);
      }

      if (onKeyDown) {
        onKeyDown(e.key);
      }

      // Prevent page scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    },
    [onKeyDown]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { keysPressed, typedBuffer };
}
