import React from "react"
/* ============================================================
   HIDDEN GLASS REFRACTION SVG FILTER
   ============================================================ */
export function GlassRefractionDefs() {
  return (
    <svg
      className="glass-refract-defs"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glass-refract" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.015 0.012"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

