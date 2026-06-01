/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeImgProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeImg: React.FC<QRCodeImgProps> = ({ value, size = 180, className = '' }) => {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(
      value,
      {
        width: size,
        margin: 1,
        color: {
          dark: '#0f2916', // deep dark forest green theme to match our NGO color palette
          light: '#ffffff', // clear white
        },
      }
    )
      .then((url) => setSrc(url))
      .catch((err) => console.error('Error generating QR Code:', err));
  }, [value, size]);

  if (!src) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-emerald-50/50 animate-pulse rounded border border-emerald-100 flex items-center justify-center ${className}`}
      >
        <span className="text-[10px] text-emerald-600/60 font-mono font-medium">QR Loader...</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt="QR Code Label" 
      width={size} 
      height={size} 
      className={`block object-contain p-1 border border-emerald-100/50 shadow-sm rounded-md bg-white ${className}`}
    />
  );
};
export default QRCodeImg;
