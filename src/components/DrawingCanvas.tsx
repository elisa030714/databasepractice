import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RotateCcw, Trash2, Eraser, Paintbrush } from 'lucide-react';

export interface DrawingCanvasHandle {
  getJpegBlob: () => Promise<Blob>;
  isEmpty: () => boolean;
  clear: () => void;
}

interface DrawingCanvasProps {
  disabled?: boolean;
}

const COLOR_PALETTE = [
  { name: '검정', hex: '#1E293B' },
  { name: '진회색', hex: '#64748B' },
  { name: '빨강', hex: '#EF4444' },
  { name: '분홍', hex: '#F472B6' },
  { name: '주황', hex: '#FB923C' },
  { name: '노랑', hex: '#FACC15' },
  { name: '연두', hex: '#A3E635' },
  { name: '초록', hex: '#22C55E' },
  { name: '하늘', hex: '#38BDF8' },
  { name: '파랑', hex: '#3B82F6' },
  { name: '보라', hex: '#A855F7' },
  { name: '갈색', hex: '#92400E' },
];

const BRUSH_SIZES = [
  { label: '얇게', size: 4 },
  { label: '보통', size: 10 },
  { label: '두껍게', size: 20 },
];

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  ({ disabled }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#1E293B');
    const [brushSize, setBrushSize] = useState(10);
    const [isEraser, setIsEraser] = useState(false);
    const [history, setHistory] = useState<ImageData[]>([]);
    const [hasDrawn, setHasDrawn] = useState(false);

    // Initialize white canvas
    const initCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Handle high DPI displays
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      const width = rect.width > 0 ? rect.width : 520;
      const height = rect.height > 0 ? rect.height : 360;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      initCanvas(ctx, width, height);

      // Save initial state
      try {
        const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialState]);
      } catch (e) {
        console.error('Canvas init error:', e);
      }
    }, []);

    const saveState = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      try {
        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory((prev) => [...prev.slice(-15), state]);
        setHasDrawn(true);
      } catch (e) {
        console.error('History save error:', e);
      }
    };

    const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setIsDrawing(true);
      const { x, y } = getCanvasCoordinates(e);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = isEraser ? '#FFFFFF' : currentColor;
      ctx.lineWidth = brushSize;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCanvasCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      saveState();
    };

    const handleClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      initCanvas(ctx, rect.width, rect.height);
      saveState();
      setHasDrawn(false);
    };

    const handleUndo = () => {
      const canvas = canvasRef.current;
      if (!canvas || history.length <= 1) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newHistory = history.slice(0, -1);
      const previousState = newHistory[newHistory.length - 1];
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      if (newHistory.length <= 1) {
        setHasDrawn(false);
      }
    };

    useImperativeHandle(ref, () => ({
      getJpegBlob: async () => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('도화지를 찾을 수 없습니다.');

        // Render onto an offscreen canvas with white background to ensure 100% clean JPEG
        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const octx = offscreen.getContext('2d');
        if (!octx) throw new Error('오프스크린 캔버스 생성 실패');

        // Solid white fill
        octx.fillStyle = '#FFFFFF';
        octx.fillRect(0, 0, offscreen.width, offscreen.height);
        // Draw the drawing on top
        octx.drawImage(canvas, 0, 0);

        return new Promise<Blob>((resolve, reject) => {
          offscreen.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('이미지 파일 변환에 실패했습니다.'));
            },
            'image/jpeg',
            0.9
          );
        });
      },
      isEmpty: () => !hasDrawn,
      clear: handleClear,
    }));

    return (
      <div className="canvas-wrapper">
        {/* Tools bar */}
        <div className="canvas-toolbar">
          {/* Colors */}
          <div className="palette-row">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`color-dot ${currentColor === c.hex && !isEraser ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => {
                  setCurrentColor(c.hex);
                  setIsEraser(false);
                }}
                title={c.name}
              />
            ))}
          </div>

          {/* Brush size & actions */}
          <div className="tools-row">
            <div className="brush-group">
              <button
                type="button"
                className={`tool-btn ${!isEraser ? 'active' : ''}`}
                onClick={() => setIsEraser(false)}
                title="붓 그리기"
              >
                <Paintbrush size={18} />
                <span>그리기</span>
              </button>

              <button
                type="button"
                className={`tool-btn ${isEraser ? 'active' : ''}`}
                onClick={() => setIsEraser(true)}
                title="지우개"
              >
                <Eraser size={18} />
                <span>지우개</span>
              </button>
            </div>

            <div className="sizes-group">
              {BRUSH_SIZES.map((b) => (
                <button
                  key={b.size}
                  type="button"
                  className={`size-btn ${brushSize === b.size ? 'active' : ''}`}
                  onClick={() => setBrushSize(b.size)}
                >
                  <span
                    className="size-dot"
                    style={{
                      width: Math.min(b.size + 4, 18),
                      height: Math.min(b.size + 4, 18),
                      backgroundColor: isEraser ? '#64748B' : currentColor,
                    }}
                  />
                  <span>{b.label}</span>
                </button>
              ))}
            </div>

            <div className="action-group">
              <button
                type="button"
                className="action-btn"
                onClick={handleUndo}
                disabled={history.length <= 1 || disabled}
                title="한 단계 뒤로"
              >
                <RotateCcw size={16} />
                <span>되돌리기</span>
              </button>
              <button
                type="button"
                className="action-btn danger"
                onClick={handleClear}
                disabled={disabled}
                title="모두 지우기"
              >
                <Trash2 size={16} />
                <span>지우기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Element */}
        <div className="canvas-frame">
          <canvas
            ref={canvasRef}
            className="drawing-board"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <p className="canvas-hint">
          {isEraser ? '🧽 지우개로 문지르면 지워져요.' : '✏️ 마우스나 손가락으로 자유롭게 마음을 그려보세요!'}
        </p>
      </div>
    );
  }
);
