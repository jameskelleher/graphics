#version 300 es
   precision highp float;
   uniform float uTime;
   in  vec3 vPos;
   out vec4 fragColor;
   void main() {
      fragColor = vec4(0.);
      vec3 ambientColor = vec3(.2,.1,.05);
      vec3 lightColor = vec3(.2,.5,1.);
      float zMax = -1000.;
      // vec3 L1 = normalize(vec3(sin(2. * uTime), 1., 0.));
      // vec3 L2 = normalize(vec3(-1.,-.1,0.));
      vec3 L1 = vec3(1., 1., .5);
      vec3 L2 = vec3( -1., 1., 0.);

      vec3 LColor1 = vec3(.8, 0., 0.);
      // vec3 LColor2 = vec3(0., 0., .8);

      for (int i = 0 ; i < 50 ; i++) {
         float fi = float(i);
         // vec3 color = vec3(.5 + .5 * sin(fi),
         //                   .5 + .5 * sin(4.*fi),
         //                   .5 + .5 * sin(5.*fi));
         vec3 color = vec3(.2, .2, .2);
         float vx = vPos.x;
         float vy = vPos.y;
         float vz = vPos.z;

         // vx += .2 * sin(5. * vy + 3. * uTime);
         // vy += .2 * sin(5. * vx + 1. * uTime);


         float x = 8. * vx + 4. * sin(11.8 * fi + 100.3 + .3 * uTime);
         float y = 8. * vy + 4. * sin(10.3 * fi + 200.6 + .3 * uTime);
         float z = 8. * vy + 4. * cos(10.3 * fi + 200.6 + .3 * uTime);
         float rr = 1. - x*x - y*y;
         z += rr / (8.*8.);

         vec3 offset = vec3(x - vx, y - vy, z - vz);
         // vec3 offset = vec3(1., 0., 1.);

         if (rr > 0. && z > zMax) {
            zMax = z;
            float z = sqrt(rr);
            // float D1 = dot(vec3(x,y,z),L1 + offset);
            // float D2 = dot(vec3(x,y,z),L2 + offset);
            float D1 = dot(vPos,L1);
            // float D1 = dot(normalize(vec3(x, y, z)),L1);
            float D2 = dot(vPos,L2 + offset);
	    D1 = 1. * max(0., D1 * abs(D1));
	    D2 = .5 * max(0., D2 * abs(D2));
            vec3 diffuse = D1 * LColor1; // + D2 * LColor2 ;
            fragColor = vec4(sqrt(color * (ambientColor + diffuse)), 1.);
            // fragColor = vec4(vec3(diffuse), 1.);
         }
      }
   }