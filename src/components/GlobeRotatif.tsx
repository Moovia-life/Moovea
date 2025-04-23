// src/components/GlobeRotatif.tsx
export default function GlobeRotatif() {
    return (
      <div className="w-24 h-24 mx-auto animate-spin-slow">
        <svg
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-moovea fill-current"
        >
          <defs>
            <linearGradient id="earthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0085a1" />
              <stop offset="100%" stopColor="#005A5A" />
            </linearGradient>
          </defs>
          <circle cx="256" cy="256" r="256" fill="url(#earthGradient)" />
          <path
            d="M160 96c32 0 32 48 64 48s32-64 64-64 32 48 64 48"
            fill="#E8F5F5"
          />
          <path
            d="M112 240c24 0 24 32 48 32s24-32 48-32 24 32 48 32 24-32 48-32 24 32 48 32"
            fill="#E8F5F5"
          />
        </svg>
      </div>
    );
  }
  