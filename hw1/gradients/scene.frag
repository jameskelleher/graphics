#version 300 es
   precision highp float;
   precision highp int;
   in  vec3 vPos;
   out vec4 fragColor;
   uniform float uTime;
   void main() {
      float val;
      if (vPos.y < 0.) {
         val = smoothstep(-1., 1., vPos.x);
      }
      else {
         val = 0.5 + 0.5 * vPos.x;
      }
      fragColor = vec4(vec3(val), 1.);
   }
