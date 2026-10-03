/**
 * QR Code Scanner Handler for "اديني واحدة ⲙⲟⲓ ⲛⲏⲓ"
 * Supports live camera stream and image file upload decoding.
 */

class QRScannerHandler {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.onScanCallback = null;
  }

  startCameraScan(elementId, onSuccess, onError) {
    this.onScanCallback = onSuccess;

    if (this.isScanning) {
      this.stopCameraScan();
    }

    try {
      this.html5QrCode = new Html5Qrcode(elementId);
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      this.html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          this.handleDecodedText(decodedText);
        },
        (errorMessage) => {
          if (onError) onError(errorMessage);
        }
      ).then(() => {
        this.isScanning = true;
      }).catch(err => {
        console.warn("Camera start failed, fallback to file upload: ", err);
        if (onError) onError(err);
      });
    } catch (e) {
      console.error("Html5Qrcode init error", e);
      if (onError) onError(e);
    }
  }

  stopCameraScan() {
    if (this.html5QrCode && this.isScanning) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode.clear();
        this.isScanning = false;
      }).catch(err => {
        console.warn("Stop scanner error", err);
        this.isScanning = false;
      });
    }
  }

  scanFile(file, onSuccess, onError) {
    if (!file) return;
    const scanner = new Html5Qrcode("qr-file-temp-reader");
    scanner.scanFile(file, true)
      .then(decodedText => {
        this.onScanCallback = onSuccess;
        this.handleDecodedText(decodedText);
        scanner.clear();
      })
      .catch(err => {
        console.error("Failed to decode file QR", err);
        if (onError) onError("لم نتمكن من قراءة كود الـ QR من هذه الصورة. تأكد من وضوح الصورة.");
        scanner.clear();
      });
  }

  handleDecodedText(decodedText) {
    try {
      window.sounds.playScanSuccess();
    } catch (e) {}

    let parsedData = null;
    try {
      parsedData = JSON.parse(decodedText);
    } catch (e) {
      // If it's a plain string or URL with query params
      if (decodedText.startsWith("MOI_NHI:")) {
        const parts = decodedText.split(":");
        parsedData = {
          name: decodeURIComponent(parts[1] || ""),
          trackId: Number(parts[2] || 1),
          durationDays: Number(parts[3] || 7),
          points: Number(parts[4] || 50),
          isSpecial: parts[5] === '1',
          intervalDays: Number(parts[6] || 0)
        };
      }
    }

    if (this.onScanCallback) {
      this.onScanCallback(parsedData, decodedText);
    }

    this.stopCameraScan();
  }
}

window.qrScanner = new QRScannerHandler();
