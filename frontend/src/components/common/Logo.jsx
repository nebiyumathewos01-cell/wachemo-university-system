import { useState } from 'react';

/**
 * University Logo component
 * Uses /logo.png if available, falls back to "WU" text
 */
const Logo = ({ size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: { box: 'w-8 h-8', text: 'text-xs', img: 32 },
    md: { box: 'w-10 h-10', text: 'text-sm', img: 40 },
    lg: { box: 'w-16 h-16', text: 'text-xl', img: 64 },
    xl: { box: 'w-20 h-20', text: 'text-2xl', img: 80 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`${s.box} rounded-xl overflow-hidden flex-shrink-0 ${className}`}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="Wachemo University"
          width={s.img}
          height={s.img}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`w-full h-full bg-primary-800 flex items-center justify-center text-white font-bold ${s.text}`}>
          WU
        </div>
      )}
    </div>
  );
};

export default Logo;
