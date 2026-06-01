import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, RefreshCw, Key, Shield, HelpCircle, Check } from 'lucide-react';
import { DonationBox } from '../types';

interface QRCameraScannerProps {
  donationBoxes: DonationBox[];
  onScanSuccess: (box: DonationBox) => void;
  onCancel: () => void;
}

export const QRCameraScanner: React.FC<QRCameraScannerProps> = ({
  donationBoxes,
  onScanSuccess,
  onCancel
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'file' | 'manual'>('camera');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const qrReaderRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  // Parse scanned text into a matching box
  const processDecodedText = (decodedText: string): boolean => {
    let matchedBox: DonationBox | null = null;
    const cleanText = decodedText.trim();

    // Strategy 1: Try parsing as JSON (e.g. {"box_id":"BOX-001"})
    try {
      const parsed = JSON.parse(cleanText);
      const targetId = parsed.box_id || parsed.id;
      if (targetId) {
        const found = donationBoxes.find(b => b.id.toLowerCase() === String(targetId).toLowerCase());
        if (found) {
          matchedBox = found;
        }
      }
    } catch (e) {
      // Ignored, proceed to next strategies
    }

    // Strategy 2: Direct string match against ID
    if (!matchedBox) {
      const found = donationBoxes.find(b => b.id.toLowerCase() === cleanText.toLowerCase());
      if (found) matchedBox = found;
    }

    // Strategy 3: Check if the text contains BOX-XXX pattern inside it
    if (!matchedBox) {
      const boxIdRegex = /(BOX-\d+)/i;
      const match = cleanText.match(boxIdRegex);
      if (match) {
        const found = donationBoxes.find(b => b.id.toLowerCase() === match[1].toLowerCase());
        if (found) matchedBox = found;
      }
    }

    // Strategy 4: Fallback checks for donor name or exact serials
    if (!matchedBox) {
      const foundInstance = donationBoxes.find(b => 
        cleanText.toLowerCase().includes(b.id.toLowerCase()) ||
        b.id.toLowerCase().includes(cleanText.toLowerCase())
      );
      if (foundInstance) matchedBox = foundInstance;
    }

    if (matchedBox) {
      onScanSuccess(matchedBox);
      return true;
    } else {
      setScannerError(`QR recognized but didn't match any registered box. (Decoded: "${decodedText.substring(0, 40)}")`);
      return false;
    }
  };

  // Check cameras and request permission
  const initCameraScanner = async () => {
    setScannerError(null);
    setCameraPermission('checking');
    try {
      // Prompt/request permissions first
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      setCameraPermission('granted');

      if (devices.length > 0) {
        // Prefer back camera if available
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment') || 
          device.label.toLowerCase().includes('rear')
        );
        setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
      } else {
        setScannerError('No camera devices detected on your current workstation.');
      }
    } catch (err: any) {
      console.error('Camera permission request failed:', err);
      setCameraPermission('denied');
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setScannerError('Camera access was denied or your preview environment lacks frame permission permissions.');
      } else {
        setScannerError(`Hardware error: ${err.message || 'Unable to fetch video device'}`);
      }
    }
  };

  // Handle active camera scanning instantiation
  useEffect(() => {
    if (scanMode !== 'camera') {
      stopCameraScanner();
      return;
    }

    if (cameraPermission !== 'granted' || !selectedCameraId) {
      return;
    }

    const startScanner = async () => {
      try {
        if (!qrReaderRef.current) return;
        
        // Stop any old scanner first
        await stopCameraScanner();

        const html5QrCode = new Html5Qrcode('qr-camera-element');
        html5QrCodeRef.current = html5QrCode;
        isScanningRef.current = true;

        await html5QrCode.start(
          selectedCameraId,
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7; // Scan 70% width
              return { width: size, height: size };
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success
            const processed = processDecodedText(decodedText);
            if (processed) {
              stopCameraScanner();
            }
          },
          () => {
            // Fail callback runs frequently, keep it silent
          }
        );
      } catch (err: any) {
        console.error('Failed to start camera scan stream:', err);
        setScannerError(`Stream start failed: ${err.message || 'Camera is already in use'}`);
      }
    };

    startScanner();

    return () => {
      stopCameraScanner();
    };
  }, [scanMode, cameraPermission, selectedCameraId]);

  // Cleanup helper
  const stopCameraScanner = async (): Promise<void> => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false;
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.warn('Silent issue stopping qr code reader:', e);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  };

  // Trigger file-based QR scanner
  const handleFileUpload = async (file: File) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScannerError(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-dummy-element', { verbose: false });
      const decodedText = await html5QrCode.scanFile(file, true);
      processDecodedText(decodedText);
    } catch (err: any) {
      console.error('Image file QR scanning failed:', err);
      // Standard message from html5-qrcode when no QR code is found in image
      if (err.includes?.('No QR code found') || String(err).includes('QRCode')) {
        setScannerError('Could not locate any valid QR code pattern in this image. Please ensure the QR is high contrast and clear.');
      } else {
        setScannerError(`Scan failed: ${err || 'Invalid file content format'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    if (!manualCode.trim()) {
      setManualError('Please enter a box ID.');
      return;
    }

    const matched = donationBoxes.find(
      b => b.id.toLowerCase() === manualCode.trim().toLowerCase()
    );

    if (matched) {
      onScanSuccess(matched);
    } else {
      setManualError(`Box registry ID "${manualCode}" is not registered in your monthly assigned shift route.`);
    }
  };

  // Cycle camera devices
  const handleCycleCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].id);
  };

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="grid grid-cols-3 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
        <button
          type="button"
          onClick={() => { setScanMode('camera'); initCameraScanner(); }}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            scanMode === 'camera'
              ? 'bg-white dark:bg-[#070A13] text-sky-600 dark:text-sky-450 shadow-sm border border-slate-200 dark:border-slate-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-850 dark:hover:text-zinc-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live Camera</span>
        </button>
        <button
          type="button"
          onClick={() => { setScanMode('file'); setScannerError(null); }}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            scanMode === 'file'
              ? 'bg-white dark:bg-[#070A13] text-sky-600 dark:text-sky-450 shadow-sm border border-slate-200 dark:border-slate-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-850 dark:hover:text-zinc-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Sticker</span>
        </button>
        <button
          type="button"
          onClick={() => { setScanMode('manual'); setScannerError(null); }}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
            scanMode === 'manual'
              ? 'bg-white dark:bg-[#070A13] text-sky-600 dark:text-sky-450 shadow-sm border border-slate-200 dark:border-slate-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-850 dark:hover:text-zinc-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Manual Code</span>
        </button>
      </div>

      {/* Screen Workspaces */}

      {/* 1. Camera Workspace */}
      {scanMode === 'camera' && (
        <div className="space-y-4">
          {cameraPermission === 'checking' && (
            <div className="aspect-square sm:aspect-video w-full bg-zinc-950 rounded-2xl flex flex-col items-center justify-center text-center p-6 border-4 border-zinc-900">
              <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mb-3" />
              <p className="text-xs text-zinc-400 font-mono">Initializing video stream security layers...</p>
            </div>
          )}

          {cameraPermission === 'prompt' && (
            <div className="aspect-square sm:aspect-video w-full bg-zinc-950 rounded-2xl flex flex-col items-center justify-center text-center p-6 border-4 border-zinc-900 space-y-4">
              <Camera className="w-10 h-10 text-sky-400" />
              <div>
                <h4 className="text-sm font-bold text-zinc-100">Camera Permission Required</h4>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                  Please authorize camera access to enable automatic QR scanning.
                </p>
              </div>
              <button
                type="button"
                onClick={initCameraScanner}
                className="py-2 px-5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm mx-auto"
              >
                Allow Camera Access
              </button>
            </div>
          )}

          {cameraPermission === 'denied' && (
            <div className="aspect-square sm:aspect-video w-full bg-zinc-950 rounded-2xl flex flex-col items-center justify-center text-center p-6 border-4 border-rose-950 space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <div>
                <h4 className="text-sm font-bold text-rose-450">Camera Blocked or Restrained</h4>
                <p className="text-[11px] text-zinc-400 mt-1.5 max-w-sm mx-auto">
                  Please enable camera settings in your browser, or work around iframe constraints by trying 
                  the <strong>"Upload Sticker"</strong> tab or <strong>"Manual Code"</strong> tab.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScanMode('file')}
                  className="py-1.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Use File Upload
                </button>
                <button
                  type="button"
                  onClick={initCameraScanner}
                  className="py-1.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Permission
                </button>
              </div>
            </div>
          )}

          {cameraPermission === 'granted' && (
            <div className="relative aspect-square sm:aspect-video w-full bg-black rounded-2xl border-4 border-zinc-800 overflow-hidden">
              {/* Actual html5-qrcode camera capture element */}
              <div id="qr-camera-element" className="w-full h-full object-cover"></div>

              {/* Holographic scanner overlay frame */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-t-4 border-l-4 border-sky-500 rounded-tl"></div>
                  <div className="w-8 h-8 border-t-4 border-r-4 border-sky-500 rounded-tr"></div>
                </div>
                
                {/* Horizontal scanning line */}
                <div className="w-full h-[2px] bg-sky-500 shadow-[0_0_10px_#38bdf8] animate-pulse"></div>

                <div className="flex justify-between items-end">
                  <div className="w-8 h-8 border-b-4 border-l-4 border-sky-500 rounded-bl"></div>
                  <div className="w-8 h-8 border-b-4 border-r-4 border-sky-500 rounded-br"></div>
                </div>
              </div>

              {/* Bottom live label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest text-sky-400 uppercase font-black backdrop-blur-xs flex items-center gap-1.5 z-20">
                <Shield className="w-3 h-3 text-sky-500 animate-spin" /> Live QR Target Lock
              </div>
            </div>
          )}

          {/* Camera controls in success-mode */}
          {cameraPermission === 'granted' && cameras.length > 1 && (
            <div className="flex justify-end gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={handleCycleCamera}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-zinc-300 font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500" /> Switch Video Device ({cameras.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. File Upload Workspace */}
      {scanMode === 'file' && (
        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl text-center transition-all duration-200 cursor-pointer ${
              dragActive
                ? 'border-sky-550 bg-sky-50/40 dark:bg-sky-950/20'
                : 'border-slate-300 hover:border-slate-400 dark:border-zinc-800 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/40'
            }`}
            onClick={() => document.getElementById('sticker-file-input')?.click()}
          >
            <input
              id="sticker-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            
            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mb-4 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-mono">
              Upload Box QR Sticker Image
            </h4>
            
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
              Drag & drop a QR image here, or tap to choose a downloaded label screenshot. Best for testing in remote iframe runtimes.
            </p>

            <span className="text-[10px] font-bold font-mono bg-sky-100/50 dark:bg-sky-950/50 hover:bg-sky-150/50 text-sky-800 dark:text-sky-300 py-1.5 px-3.5 rounded-xl border border-sky-200/50 dark:border-sky-800/40 mt-4 inline-block">
              Select Sticker File
            </span>
          </div>

          {/* Dummy hidden reader element required under-the-hood by html5-qrcode for scanFile */}
          <div id="qr-file-dummy-element" className="hidden"></div>
        </div>
      )}

      {/* 3. Manual Box Registry ID Workspace */}
      {scanMode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="manual-box-id" className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300">
              Assigned Box ID Signature / Node Key
            </label>
            <div className="flex gap-2">
              <input
                id="manual-box-id"
                type="text"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setManualError(null);
                }}
                placeholder="e.g. BOX-001"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-850 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-bold"
              />
              <button
                type="submit"
                className="py-2.5 px-5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-mono transition uppercase cursor-pointer"
              >
                Load Node
              </button>
            </div>
            {manualError && (
              <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 mt-1 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {manualError}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200/60 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-zinc-950/30">
            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-extrabold block mb-2">
              Available Assigned Shift Codes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {donationBoxes.map(b => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => {
                    setManualCode(b.id);
                    setManualError(null);
                  }}
                  className={`text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-md border text-left transition duration-150 ${
                    manualCode.trim().toUpperCase() === b.id.toUpperCase()
                      ? 'bg-sky-100 border-sky-305 text-sky-850 dark:bg-sky-950/60 dark:border-sky-900'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {b.id} ({b.city})
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Global State Alerts */}
      {scannerError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/30 rounded-xl relative flex gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
            {scannerError}
          </div>
        </div>
      )}

      {/* Manual Helper Info box */}
      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/10 rounded-xl flex items-start gap-2.5">
        <HelpCircle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-550 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-650 dark:text-zinc-400 leading-normal">
          <p className="font-bold text-slate-900 dark:text-zinc-300 mb-0.5">Where can I get QR labels to test?</p>
          Go to the <strong className="text-sky-650 dark:text-sky-400 font-semibold">QR Code Stickers</strong> tab or <strong className="text-sky-650 dark:text-sky-450 font-semibold text-sky-500">Box Management</strong> tab inside the NGO dashboard to generate, view, and screenshot the secure labels.
        </div>
      </div>

      {/* Action Cancel Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end">
        <button
          type="button"
          onClick={() => {
            stopCameraScanner();
            onCancel();
          }}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-slate-800 font-bold rounded-xl text-xs text-slate-800 dark:text-zinc-300"
        >
          Cancel & Return
        </button>
      </div>
    </div>
  );
};
