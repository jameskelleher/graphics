#version 300 es
   precision highp float;
   precision highp int;
   in  vec3 vPos;
   out vec4 fragColor;
   uniform float uTime;
   void main() {
      float scale = 5.;
      float speed = - uTime / 2.0;

      vec3 colorA = vec3(0.64f, 0.03f, 0.03f);
      vec3 colorB = vec3(0.13f, 0.11f, 0.74f);
      
      float val = max(abs(vPos.x), abs(vPos.y));
      val = mod(val + speed, 1.0);

      float invScale = 1. / scale;

      float mult = floor(val / invScale);

      vec3 colorMix = mix(colorA, colorB, invScale * mult);
      fragColor = vec4(colorMix, 1.);
   }
