#version 300 es
precision highp float;

const int NC = 5;
const int NL = 2;

   // All uniforms (data values are sent from CPU)

uniform float uTime;

uniform vec4 uCG[NC];
uniform vec3 uCA[NC];
uniform vec3 uCD[NC];
uniform vec4 uCS[NC];

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

vec4 rayCube(vec3 V, vec3 W, vec4 C) {
    float r = C.w;

    vec4 Pxlo = vec4(-1.f, 0.f, 0.f, C.x - r);
    vec4 Pxhi = vec4(1.f, 0.f, 0.f, -C.x - r);
    vec4 Pylo = vec4(0.f, -1.f, 0.f, C.y - r);
    vec4 Pyhi = vec4(0.f, 1.f, 0.f, -C.y - r);
    vec4 Pzlo = vec4(0.f, 0.f, -1.f, C.z - r);
    vec4 Pzhi = vec4(0.f, 0.f, 1.f, -C.z - r);

    // vec4 Pspaces[2] = vec4[2]( Pzlo, Pzhi);
    vec4 Pspaces[6] = vec4[6](Pxlo, Pxhi, Pylo, Pyhi, Pzlo, Pzhi);

    float t0 = -10000.f;
    float t1 = 10000.f;
    vec3 N = vec3(0.f);

    for(int i = 0; i < 6; i++) {
        vec4 P = Pspaces[i];
        float VP = dot(vec4(V, 1.f), P);
        float WP = dot(W, P.xyz);
        float t = -VP / WP;

        if(WP < 0.f && t > t0) {
            t0 = t;
            N = P.xyz;
        } else if(WP > 0.f && t < t1)
            t1 = t;
    }

    if(t0 < t1)  // we hit the cube
        return vec4(N, t0);
    else         // we missed the cube
        return vec4(0.f, 0.f, 0.f, -1.f);
}

void main() {
    fragColor = vec4(0.f);

    vec3 V = vec3(0.f);
    vec3 W = normalize(vec3(vPos.xy, -fl));

    // Find the nearest cube along the ray

    float tMin = 1000.f;
    for(int i = 0; i < NC; i++) {

        vec4 ray = rayCube(V, W, uCG[i]);
        float t = ray.w;

        // float t = raySphere(V, W, uCG[i]);
        if(t >= 0.f && t < tMin) {
            tMin = t;

            fragColor = vec4(1);

            // Find the point on the sphere surface

            vec3 P = V + t * W;

            // Find the surface normal

            vec3 N = ray.xyz;

            vec3 c = uCA[i];

            for(int j = 0; j < NL; j++) {
                vec3 L = uLG[j];
                vec3 R = 2.f * dot(N, L) * N - L;

                vec3 cj = .8f * max(0.f, dot(N, L)) * uCD[i] * uLC[j] + pow(max(0.f, dot(-W, R)), uCS[i].a) * uCS[i].rgb * uLC[j];

                vec3 Ws = L;
                vec3 Vs = P + .001f * L;

                for (int i = 0; i < NC; i++)
                    if (rayCube(Vs, Ws, uCG[i]).w > 0.f)
                        cj = vec3(0.f);

                c += cj;

            }

                // Add reflection

            vec3 cr = vec3(0.f);

            vec3 Wr = W - 2.f * dot(N, W) * N;
            vec3 Vr = P + .001f * Wr;

            float tMin = 1000.f;
            for(int i = 0; i < NC; i++) {
                vec4 ray = rayCube(Vr, Wr, uCG[i]);
                float t = ray.w;
                if(t >= 0.f && t < tMin) {
                    tMin = t;

                        // If reflected ray hits a sphere, compute shading for that sphere

                    vec3 N = ray.xyz;

                    cr = uCA[i];
                    for(int j = 0; j < NL; j++) {
                        vec3 L = uLG[j];
                        vec3 R = 2.f * dot(N, L) * N - L;
                        cr += .8f * max(0.f, dot(N, L)) * uCD[i] * uLC[j] + pow(max(0.f, dot(-Wr, R)), uCS[i].a) * uCS[i].rgb * uLC[j];
                    }
                }
            }

            c += .5f * cr;

            fragColor = vec4(sqrt(c), 1.f);
        }
    }
}

void main2() {

    fragColor = vec4(0.f);

      // Define the ray from the eye to this pixel

    vec3 V = vec3(0.f);
    vec3 W = normalize(vec3(vPos.xy, -fl));

      // Find the nearest sphere along the ray

    float tMin = 1000.f;
    for(int i = 0; i < NC; i++) {
        float t = raySphere(V, W, uCG[i]);
        if(t >= 0.f && t < tMin) {

            tMin = t;

            fragColor = vec4(1.f);

            // Find the point on the sphere surface

            vec3 P = V + t * W;

	        // Find the surface normal

            vec3 N = normalize(P - uCG[i].xyz);

	        // Ambient component of lighting

            vec3 c = uCA[i];

	        // Add diffuse and specular components from every light source

            for(int j = 0; j < NL; j++) {

                vec3 L = uLG[j];
                vec3 R = 2.f * dot(N, L) * N - L;

                vec3 cj = .8f * max(0.f, dot(N, L)) * uCD[i] * uLC[j] + pow(max(0.f, dot(-W, R)), uCS[i].a) * uCS[i].rgb * uLC[j];

               // See whether this point is in shadow from this light source.

                vec3 Ws = L;
                vec3 Vs = P + .001f * L;

                for(int i = 0; i < NC; i++) if(raySphere(Vs, Ws, uCG[i]) > 0.f)
                        cj = vec3(0.f);

                c += cj;
            }

	        // Add reflection

            vec3 cr = vec3(0.f);

            vec3 Wr = W - 2.f * dot(N, W) * N;
            vec3 Vr = P + .001f * Wr;

            float tMin = 1000.f;
            for(int i = 0; i < NC; i++) {
                float t = raySphere(Vr, Wr, uCG[i]);
                if(t >= 0.f && t < tMin) {
                    tMin = t;

		            // If reflected ray hits a sphere, compute shading for that sphere.

                    vec3 P = Vr + t * Wr;
                    vec3 N = normalize(P - uCG[i].xyz);

                    cr = uCA[i];
                    for(int j = 0; j < NL; j++) {
                        vec3 L = uLG[j];
                        vec3 R = 2.f * dot(N, L) * N - L;
                        cr += .8f * max(0.f, dot(N, L)) * uCD[i] * uLC[j] + pow(max(0.f, dot(-Wr, R)), uCS[i].a) * uCS[i].rgb * uLC[j];
                    }
                }
            }

            c += .25 * cr;

            // Do gamma color correction

            fragColor = vec4(sqrt(c), 1.f);
        }
    }
}