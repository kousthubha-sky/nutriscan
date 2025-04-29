import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import Quagga from 'quagga';

export function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          facingMode: "environment"
        },
      },
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "upc_reader",
          "upc_e_reader"
        ]
      }
    }, (err) => {
      if (err) {
        console.error("Failed to initialize barcode scanner:", err);
        setHasCamera(false);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      if (result.codeResult.code) {
        onDetected(result.codeResult.code);
        Quagga.stop();
        onClose();
      }
    });

    return () => {
      Quagga.stop();
    };
  }, [onDetected, onClose]);

  if (!hasCamera) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 className="text-lg font-medium mb-2">Camera Not Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please ensure you have given camera permission and your device has a camera.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scanner viewport */}
        <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
          <div ref={videoRef} className="absolute inset-0" />
          
          {/* Scanning animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-px w-full bg-primary/50 animate-scan" />
          </div>

          {/* Scanning frame */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-lg" />
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
          Position barcode within the frame
        </div>
      </div>
    </div>
  );
}