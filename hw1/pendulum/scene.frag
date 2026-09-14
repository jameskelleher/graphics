#version 300 es
   precision highp float;
   in  vec3 vPos;
   out vec4 fragColor;
   uniform float uTime;
   void main() {
      vec3 colorA = vec3(.2, .1, .05);
      vec3 colorB = vec3(.5, .7, 1.);
      vec3 lightSource = vec3(0., 1., 1.);
      float radius = .5;
      vec3 offset = vec3(.5 * cos(uTime), -.25 * cos(2. * uTime), 0.);
      // float xOff = .5 * cos(uTime);
      vec3 pos = vPos + offset;
      vec3 p = vec3(vPos.xy,sqrt(radius*radius - dot(pos,pos)) );
      fragColor = vec4(0.);
      if (p.z > 0.) {
         vec3 l = lightSource + offset;
         float diff = .5 * max(0., dot(p, l)) / radius;
         fragColor = vec4(colorA + diff * colorB, 1.);
      }
   }

   // this.fragmentShader = `#version 300 es
   // precision highp float;
   // uniform float uTime;
   // in  vec3 vPos;
   // out vec4 fragColor;
   // void main() {
   //    float radius = .3 + .2 * sin(1. * uTime);
   //    vec3 a = vec3(.2,.1,.05);
   //    vec3 pos = vPos;
   //    pos.x += .5 * sin(1. * uTime);
   //    pos.y += .5 * cos(1. * uTime);
   //    vec3 p = vec3(pos.xy,sqrt(radius*radius - dot(pos,pos)));
   //    fragColor = vec4(0.);
   //    if (p.z > 0.) {
   //       float d = .5 * max(0.,dot(p,vec3(0., 1., 1.)))/radius;
   //       fragColor = vec4(a + vec3(.5,.7,1.) * vec3(d), 1.);
   //    }
   // }`;