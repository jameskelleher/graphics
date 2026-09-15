#version 300 es
precision highp float;
in vec3 vPos;
out vec4 fragColor;
uniform float uTime;
void main() {
   vec3 ambientColor = vec3(.2f, .1f, .05f);
   vec3 lightColor1 = vec3(0.84f, 0.56f, 0.03f);
   vec3 lightColor2 = vec3(0.75f, 0.08f, 0.92f);
   vec3 lightSource1 = vec3(-1.f, 1.f, 1.f);
   vec3 lightSource2 = vec3(1.f, -1.f, 1.f);
   float radius = .2f;
   fragColor = vec4(0.f);
   for(int i = 0; i < 5; i++) {
      float fi = float(i);

      float xOff = .3 * sin(11.3 * fi + .3 * uTime);
      float yOff = .3 * sin(10. * fi + .3 * uTime);
      float zOff = 0.;

      vec3 offset = vec3(xOff, yOff, zOff);

      // float xOff = .5 * cos(uTime);
      vec3 pos = vPos + offset;
      vec3 p = vec3(vPos.xy, sqrt(radius * radius - dot(pos, pos)));
      if(p.z > 0.f) {
         vec3 L1 = lightSource1 + offset;
         vec3 L2 = lightSource2 + offset;
         float D1 = .8f * max(0.f, dot(p, L1)) / radius;
         float D2 = .8f * max(0.f, dot(p, L2)) / radius;
         fragColor = vec4(ambientColor + D1 * lightColor1 + D2 * lightColor2, 1.f);
      }
   }
}
