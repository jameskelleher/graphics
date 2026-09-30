#version 300 es
precision highp float;

const int NS = 5;
const int NL = 2;

   // All uniforms (data values are sent from CPU)

uniform float uTime;

uniform vec4 uSG[NS];
uniform vec3 uSA[NS];
uniform vec3 uSD[NS];
uniform vec4 uSS[NS];

uniform vec3 uLG[NL];
uniform vec3 uLC[NL];

in vec3 vPos;
out vec4 fragColor;

   // Focal length of the camera

float fl = 3.f;

   // A function to trace a ray to a sphere

float raySphere(vec3 V, vec3 W, vec4 S) {
    V -= S.xyz;
    float r = S.w;
    float VW = dot(V, W);
    float VV = dot(V, V);
    float d = VW * VW - (VV - r * r);
    if(d < 0.f)
        return -1.f;
    return -VW - sqrt(d);
}

void main() {

    fragColor = vec4(0.f);

      // Define the ray from the eye to this pixel

    vec3 V = vec3(0.f);
    vec3 W = normalize(vec3(vPos.xy, -fl));

      // Find the nearest sphere along the ray

    float tMin = 1000.f;
    for(int i = 0; i < NS; i++) {
        float t = raySphere(V, W, uSG[i]);
        if(t >= 0.f && t < tMin) {

            tMin = t;

            fragColor = vec4(1.f);

            // Find the point on the sphere surface

            vec3 P = V + t * W;

	        // Find the surface normal

            vec3 N = normalize(P - uSG[i].xyz);

	        // Ambient component of lighting

            vec3 c = uSA[i];

	        // Add diffuse and specular components from every light source

            for(int j = 0; j < NL; j++) {

                vec3 L = uLG[j];
                vec3 R = 2.f * dot(N, L) * N - L;

                vec3 cj = .8f * max(0.f, dot(N, L)) * uSD[i] * uLC[j] + pow(max(0.f, dot(-W, R)), uSS[i].a) * uSS[i].rgb * uLC[j];

               // See whether this point is in shadow from this light source.

                vec3 Ws = L;
                vec3 Vs = P + .001f * L;

                for(int i = 0; i < NS; i++) if(raySphere(Vs, Ws, uSG[i]) > 0.f)
                        cj = vec3(0.f);

                c += cj;
            }

	        // Add reflection

            vec3 cr = vec3(0.f);

            vec3 Wr = W - 2.f * dot(N, W) * N;
            vec3 Vr = P + .001f * Wr;

            float tMin = 1000.f;
            for(int i = 0; i < NS; i++) {
                float t = raySphere(Vr, Wr, uSG[i]);
                if(t >= 0.f && t < tMin) {
                    tMin = t;

		            // If reflected ray hits a sphere, compute shading for that sphere.

                    vec3 P = Vr + t * Wr;
                    vec3 N = normalize(P - uSG[i].xyz);

                    cr = uSA[i];
                    for(int j = 0; j < NL; j++) {
                        vec3 L = uLG[j];
                        vec3 R = 2.f * dot(N, L) * N - L;
                        cr += .8f * max(0.f, dot(N, L)) * uSD[i] * uLC[j] + pow(max(0.f, dot(-Wr, R)), uSS[i].a) * uSS[i].rgb * uLC[j];
                    }
                }
            }

            c += .25f * cr;

            // Do gamma color correction

            fragColor = vec4(sqrt(c), 1.f);
        }
    }
}