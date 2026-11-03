import React, { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, X, Crop, RefreshCw } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  title?: string;
  aspectRatio?: number;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  title = 'Crop Image',
  aspectRatio,
  onCropComplete,
  onCancel,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<any>(null);
  const [selectedRatio, setSelectedRatio] = useState<number | undefined>(aspectRatio);

  useEffect(() => {
    if (!imageRef.current) return;

    try {
      const CropperClass: any = (window as any).Cropper || (Cropper as any);
      cropperRef.current = new CropperClass(imageRef.current, {
        aspectRatio: selectedRatio,
        viewMode: 1,
        background: false,
        autoCropArea: 0.9,
        responsive: true,
        checkOrientation: true,
        zoomable: true,
        scalable: true,
      });
    } catch (e) {
      console.warn('Cropper init exception', e);
    }

    return () => {
      try {
        cropperRef.current?.destroy();
      } catch {
        // ignore
      }
      cropperRef.current = null;
    };
  }, [imageSrc]);

  const handleRatioChange = (ratio: number | undefined) => {
    setSelectedRatio(ratio);
    if (cropperRef.current?.setAspectRatio) {
      cropperRef.current.setAspectRatio(ratio || NaN);
    }
  };

  const handleZoom = (val: number) => {
    if (cropperRef.current?.zoom) {
      cropperRef.current.zoom(val);
    }
  };

  const handleRotate = (degree: number) => {
    if (cropperRef.current?.rotate) {
      cropperRef.current.rotate(degree);
    }
  };

  const handleReset = () => {
    if (cropperRef.current?.reset) {
      cropperRef.current.reset();
    }
  };

  const handleSaveCrop = () => {
    if (!cropperRef.current) {
      // If cropper failed to mount, fallback to raw image
      onCropComplete(imageSrc);
      return;
    }

    try {
      let canvas: HTMLCanvasElement | null = null;
      if (typeof cropperRef.current.getCroppedCanvas === 'function') {
        canvas = cropperRef.current.getCroppedCanvas({
          maxWidth: 1600,
          maxHeight: 1200,
          fillColor: '#ffffff',
          imageSmoothingQuality: 'high',
        });
      } else if (typeof cropperRef.current.getCropperCanvas === 'function') {
        canvas = cropperRef.current.getCropperCanvas();
      }

      if (canvas) {
        const base64 = canvas.toDataURL('image/jpeg', 0.92);
        onCropComplete(base64);
      } else {
        onCropComplete(imageSrc);
      }
    } catch {
      onCropComplete(imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="text-xs text-slate-400">Drag bounding box to crop the exact question, diagram or option</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Canvas Area */}
        <div className="flex-1 bg-slate-950 p-4 overflow-hidden flex items-center justify-center min-h-[350px] max-h-[500px]">
          <div className="max-w-full max-h-full">
            <img
              ref={imageRef}
              src={imageSrc}
              alt="To crop"
              crossOrigin="anonymous"
              className="max-h-[450px] max-w-full block"
            />
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Zoom & Rotation */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              title="Zoom In"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              title="Zoom Out"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              title="Rotate Left 90°"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              title="Rotate Right 90°"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-1 hidden sm:inline">Ratio:</span>
            <button
              type="button"
              onClick={() => handleRatioChange(undefined)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                selectedRatio === undefined
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => handleRatioChange(16 / 9)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                selectedRatio === 16 / 9
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              16:9
            </button>
            <button
              type="button"
              onClick={() => handleRatioChange(4 / 3)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                selectedRatio === 4 / 3
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              4:3
            </button>
            <button
              type="button"
              onClick={() => handleRatioChange(1)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                selectedRatio === 1
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              1:1
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
