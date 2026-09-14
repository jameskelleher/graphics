#version 300 es
   precision highp float;
   precision highp int;
   in  vec3 vPos;
   out vec4 fragColor;
   uniform float uTime;
   void main() {
      float scale = 4.;
      
      float x = .5 + .5 * vPos.x;
      float y = .5 + .5 * vPos.y;

      float invScale = 1. / scale;
   
      float xMult = floor(x / invScale);
      float yMult = floor(y / invScale);

      fragColor = vec4(vec3(xMult * invScale, yMult * invScale, 1.), 1.);
      // vec3 p = vec3(vPos.xy,sqrt(1. - dot(vPos,vPos)) );
      // vec3 color = vec3(1., .5, .5);
      // vec3 lightSource = vec3(cos(uTime), sin(uTime), 0.3);
      // fragColor = vec4(0.);
      // if (p.z > 0.) {
      //    float diff = .2 + .4 * max(0., dot(p, lightSource));
      //    fragColor = vec4(diff * color, 1.);
      // }
   }
