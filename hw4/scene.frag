#version 300 es

precision highp float;

const int NS = 5;
const int NL = 2;

const mat4 SPHERE   = mat4(1., 0., 0., 0.,  0., 1., 0., 0.,  0., 0., 1., 0.,  0., 0., 0., -1.);
const mat4 CYLINDER = mat4(1., 0., 0., 0.,  0., 0., 0., 0.,  0., 0., 1., 0.,  0., 0., 0., -1.);
const mat4 CONE     = mat4(1., 0., 0., 0.,  0., -1., 0., 0.,  0., 0., 1., 0.,  0., 0., 0., 0.);
const mat4 CYLSLAB  = mat4(0., 0., 0., 0.,  0., 1., 0., 0.,  0., 0., 0., 0.,  0., 0., 0., -.5);
const mat4 CONESLAB = mat4(0., 0., 0., 0.,  0., 1., 0., -1.,  0., 0., 0., 0.,  0., 0., 0., 0.);

uniform float uTime;
uniform vec3 uCursor;

uniform vec3 uSA[NS];
uniform vec3 uSD[NS];
uniform vec4 uSS[NS];
uniform mat4 uSM[NS];

uniform vec3 uLG[NL];
uniform vec3 uLC[NL];

in  vec3 vPos;
out vec4 fragColor;

float fl = 3.;

vec4 T0 = vec4(0.f, 0.f, 0.f, -1000.f);
vec4 T1 = vec4(0.f, 0.f, 0.f, 1000.f);

void raySurface(vec3 V, vec3 W, mat4 S) {
    S = mat4(
         S[0][0],  S[0][1] + S[1][0],  S[0][2] + S[2][0],  S[3][0] + S[0][3],
         0.,       S[1][1],            S[1][2] + S[2][1],  S[1][3] + S[3][1],
         0.,       0.,                S[2][2],           S[2][3] + S[3][2],
        0.,      0.,                0.,                S[3][3]
    );

    vec4 V4 = vec4(V, 1);
    vec4 W4 = vec4(W, 0);

    float A = dot(W4, S * W4);
    float B = dot(V4, S * W4) + dot(W4, S * V4);
    float C = dot(V4, S * V4);

    float disc = B * B - 4. * A * C;

    // solve the linear case
    if (abs(A) < 1e-6) {
        // Bt + C = 0 => t = -C/B => C = PV, B = PW
        if (abs(B) < 1e-6)
            return;

        float t = -C/B;

        vec3 N = normalize(vec3(S[0][3], S[1][3], S[2][3]));

        // entering
        if (B < -1e-6 && t > T0.w)
            T0 = vec4(N, t);
        // exiting
        if (B > 1e-6 && t < T1.w)
            T1 = vec4(N, t);

        return;
    }

    if (disc < 0.) {
        T0.w = 1000.;
        T1.w = -1000.;
        return;
    }

    float t0 = (-B - sqrt(disc)) / (2. * A);
    float t1 = (-B + sqrt(disc)) / (2. * A);

    if (t0 > t1) {
        float temp = t0;
        t0 = t1;
        t1 = temp;
    }

    vec4 P0 = vec4(V + W * t0, 1.);
    vec4 P1 = vec4(V + W * t1, 1.);

    vec3 N0 = normalize((S * P0 + P0 * S).xyz);
    vec3 N1 = normalize((S * P1 + P1 * S).xyz);

    // vec4 D = vec4(S[0][0], S[1][1], S[2][2], S[3][3]);
    // vec3 N0 = normalize((P0 * S + P0 * D).xyz);
    // vec3 N1 = normalize((P1 * S + P1 * D).xyz);

    if (t0 > T0.w)
        T0 = vec4(N0, t0);

    if (t1 < T1.w)
        T1 = vec4(N1, t1);
    
}

vec4 raySphere(vec3 V, vec3 W, mat4 MI) {
    T0.w = -1000.;
    T1.w = 1000.;
    raySurface(V, W, transpose(MI) * SPHERE * MI);
    return T0.w < T1.w ? vec4(normalize(T0.xyz), T0.w) : vec4(0., 0., 0., -1);
}

vec4 rayCylinder(vec3 V, vec3 W, mat4 MI) {
    T0.w = -1000.;
    T1.w = 1000.;
    mat4 tMI = transpose(MI);
    raySurface(V, W, tMI * CYLSLAB * MI);
    raySurface(V, W, tMI * CYLINDER * MI);
    return T0.w < T1.w ? vec4(normalize(T0.xyz), T0.w) : vec4(0., 0., 0., -1);
}

vec4 rayCone(vec3 V, vec3 W, mat4 MI) {
    T0.w = -1000.;
    T1.w = 1000.;
    mat4 tMI = transpose(MI);
    // raySurface(V, W, tMI * SLAB * MI);
    raySurface(V, W, tMI * CONESLAB * MI);
    raySurface(V, W, tMI * CONE * MI);
    return T0.w < T1.w ? vec4(normalize(T0.xyz), T0.w) : vec4(0., 0., 0., -1);

}

void main() {
    fragColor = vec4(0.);

    // Define the ray from the eye to this pixel

    vec3 V = vec3(0.);
    vec3 W = normalize(vec3(vPos.xy, -fl));

    // Fin the nearest sphere along the ray

    float tMin = 1000.;
    for (int i = 0; i < NS; i++ ) {
        vec4 T = rayCylinder(V, W, uSM[i]);
        if (T.w >= 0. && T.w < tMin) {
            tMin = T.w;
            fragColor = vec4(1.);

            // Find the point on the sphere surface

            vec3 P = V + tMin * W;

            // Find the surface normal

            vec3 N = T.xyz;

            // Ambient component of lighting

            vec3 c = uSA[i];

            // Add diffuse and specular components from every light source

            for (int j = 0; j < NL; j++) {
                vec3 L = uLG[j];
                vec3 R = 2. * dot(N,L) * N - L;

                vec3 cj = .8 * max(0., dot(N, L)) * uSD[i] * uLC[j]
                       + pow(max(0., dot(-W,R)), uSS[i].a) * uSS[i].rgb * uLC[j];

                // see whether this point is in shadow from this light source

                vec3 Ws = L;
                vec3 Vs = P + .001 * L;

                for (int i = 0; i < NS; i++) {
                    if (rayCylinder(Vs, Ws, uSM[i]).w > 0.)
                        cj = vec3(0.);
                }

                c += cj;
            }
            
            fragColor = vec4(sqrt(c), 1.);
        }
    }
}

// float a = S[0][0];
// float b = S[0][1] + S[1][0];
// float c = S[0][2] + S[2][0];
// float d = S[3][0] + S[0][3];
// float e = S[1][1];
// float f = S[1][2] + S[2][1];
// float g = S[1][3] + S[3][1];
// float h = S[2][2];
// float i = S[2][3] + S[3][2];
// float j = S[3][3];

// float A = a * W.x * W.x + b * W.x * W.y + c * W.x * W.z +
//                           e * W.y * W.y + f * W.y * W.z +
//                                           h * W.z * W.z;

// float B = a * (V.x * W.x + V.x * W.x) + b * (V.x * W.y + V.y * W.x) + c * (V.x * W.z + V.z * W.x) + d * W.x +
//                                         e * (V.y * W.y + V.y * W.y) + f * (V.y * W.z + V.z * W.y) + g * W.y +
//                                                                       h * (V.z * W.z + V.z * W.z) + i * W.z;

// float C = a * V.x * V.x + b * V.x * V.y + c * V.x * V.z + d * V.x +
//                           e * V.y * V.y + f * V.y * V.z + g * V.y +
//                                           h * V.z * V.z + i * V.z +
//                                                           j;

// vec3 N1 = normalize(vec3(
//     2. * a * P1.x + b * P1.y + c * P1.z + d,
//                2. * e * P1.y + f * P1.z + g,
//                           2. * h * P1.z + i
// ));

// float C[10] = float[10](
//     S[0][0],  S[0][1] + S[1][0],  S[0][2] + S[2][0],  S[3][0] + S[0][3],
//     S[1][1],  S[1][2] + S[2][1],  S[1][3] + S[3][1],
//     S[2][2],  S[2][3] + S[3][2],
//     S[3][3]);
