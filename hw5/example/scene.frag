#version 300 es
precision highp float;

// All uniforms (data values are sent from CPU)
const int NS = 5;
const int NL = 2;

uniform float uTime;
uniform vec3 uCursor;
uniform mat4 uMF;
uniform mat4 uMI;

uniform vec3 uSA[NS];
uniform vec3 uSD[NS];
uniform vec4 uSS[NS];
uniform mat4 uSF[NS]; // KP: STORE FORWARD MATRIX VALUES IN A UNIFORM ARRAY
uniform mat4 uSM[NS];

uniform vec3 uLG[NL];
uniform vec3 uLC[NL];

in vec3 vPos;
out vec4 fragColor;

// Focal length of the camera

float fl = 3.f;

float s = sin(.5f), c = cos(.5f);

mat4 MF = mat4(.8,.6,0,0,
                -.6,.8,0,0,
                0,0,1,0,
                0,0,0,1);

mat4 MI = mat4(.8,-.6,0,0,
                .6,.8,0,0,
                0,0,1,0,
                0,0,0,1);

float rayPlane(vec3 V, vec3 W, vec4 S) {
    return -dot(vec4(V, 1.f), S) / dot(vec4(W, 0.f), S);
}

vec4 T0 = vec4(0.f, 0.f, 0.f, -1000.f);
vec4 T1 = vec4(0.f, 0.f, 0.f, 1000.f);

void rayFace(vec3 V, vec3 W, vec4 P) {
    float t = rayPlane(V, W, P);
    if(dot(W, P.xyz) < 0.f && t > T0.w)
        T0 = vec4(P.xyz, t);
    if(dot(W, P.xyz) > 0.f && t < T1.w)
        T1 = vec4(P.xyz, t);
}

vec4 rayCube(vec3 V, vec3 W, mat4 MI) {
    T0.w = -1000.f;
    T1.w = 1000.f;
    rayFace(V, W, vec4(-1, 0, 0, -1) * MI);
    rayFace(V, W, vec4(1, 0, 0, -1) * MI);
    rayFace(V, W, vec4(0, -1, 0, -1) * MI);
    rayFace(V, W, vec4(0, 1, 0, -1) * MI);
    rayFace(V, W, vec4(0, 0, -1, -1) * MI);
    rayFace(V, W, vec4(0, 0, 1, -1) * MI);
    return T0.w < T1.w ? vec4(normalize(T0.xyz), T0.w) : vec4(0, 0, 0, -1);
}

vec4 rayTetrahedron(vec3 V, vec3 W, mat4 MI) {
    T0.w = -1000.f;
    T1.w = 1000.f;
    rayFace(V, W, vec4(1, 1, 1, -1) * MI);
    rayFace(V, W, vec4(1, -1, -1, -1) * MI);
    rayFace(V, W, vec4(-1, 1, -1, -1) * MI);
    rayFace(V, W, vec4(-1, -1, 1, -1) * MI);
    return T0.w < T1.w ? vec4(normalize(T0.xyz), T0.w) : vec4(0, 0, 0, -1);
}

vec4 rayOctahedron(vec3 V, vec3 W, mat4 MI) {
    T0.w = -1000.f;
    T1.w = 1000.f;
    rayFace(V, W, vec4(-1, -1, -1, -1) * MI);
    rayFace(V, W, vec4(1, 1, 1, -1) * MI);
    rayFace(V, W, vec4(1, -1, -1, -1) * MI);
    rayFace(V, W, vec4(-1, 1, 1, -1) * MI);
    rayFace(V, W, vec4(-1, 1, -1, -1) * MI);
    rayFace(V, W, vec4(1, -1, 1, -1) * MI);
    rayFace(V, W, vec4(-1, -1, 1, -1) * MI);
    rayFace(V, W, vec4(1, 1, -1, -1) * MI);
    return T0.w < T1.w ? vec4(normalize(T0.xyz), T0.w) : vec4(0, 0, 0, -1);
}

vec3 _s(vec3 i) {
    return cos(5.f * (i + 5.f * cos(5.f * (i.yzx + 5.f * cos(5.f * (i.zxy + 5.f * cos(5.f * i)))))));
}
float _t(vec3 i, vec3 u, vec3 a) {
    return dot(normalize(_s(i + a)), u - a);
}
float noise(vec3 p) {
    vec3 i = floor(p), u = p - i, v = 2.f * mix(u * u, u * (2.f - u) - .5f, step(.5f, u));
    return mix(mix(mix(_t(i, u, vec3(0)), _t(i, u, vec3(1, 0, 0)), v.x), mix(_t(i, u, vec3(0, 1, 0)), _t(i, u, vec3(1, 1, 0)), v.x), v.y), mix(mix(_t(i, u, vec3(0, 0, 1)), _t(i, u, vec3(1, 0, 1)), v.x), mix(_t(i, u, vec3(0, 1, 1)), _t(i, u, vec3(1)), v.x), v.y), v.z);
}

void main() {

    fragColor = vec4(0.f);

    // Define the ray from the eye to this pixel

    vec3 V = vec3(0.f);
    vec3 W = normalize(vec3(vPos.xy, -fl));

    // Find the nearest object along the ray

    float tMin = 1000.f;
    for(int i = 0; i < NS; i++) {
        vec4 T = rayTetrahedron(V, W, uSM[i]);
        if(T.w >= 0.f && T.w < tMin) {

            tMin = T.w;

            fragColor = vec4(1.f);

        // Find the point on the surface

            vec3 P = V + tMin * W;

            vec4 PF = uSF[i] * vec4(P, 1.f); // KP: COMPUTE THE POSITION WITHIN THE OBJECT

        // Find the surface normal

            vec3 N = T.xyz;

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

                for(int i = 0; i < NS; i++) if(rayTetrahedron(Vs, Ws, uSM[i]).w > 0.f)
                        cj = vec3(0.f);

                c += cj;
            }

        // Add reflection

            vec3 cr = vec3(0.f);

            vec3 Wr = W - 2.f * dot(N, W) * N;
            vec3 Vr = P + .001f * Wr;

            float tMin = 1000.f;
            for(int i = 0; i < NS; i++) {
                vec4 T = rayTetrahedron(Vr, Wr, uSM[i]);
                if(T.w >= 0.f && T.w < tMin) {
                    tMin = T.w;

                    vec3 P = Vr + tMin * Wr;
                    vec3 N = T.xyz;

                    cr = uSA[i];
                    for(int j = 0; j < NL; j++) {
                        vec3 L = uLG[j];
                        vec3 R = 2.f * dot(N, L) * N - L;
                        cr += .8f * max(0.f, dot(N, L)) * uSD[i] * uLC[j] + pow(max(0.f, dot(-Wr, R)), uSS[i].a) * uSS[i].rgb * uLC[j];
                    }
                }
            }

            c += .25f * cr;

            c *= 1.f + noise(5.f * PF.xyz); // KP: ADD NOISE TEXTURE USING THE POSITION WITHIN THE OBJECT

        // Do gamma color correction

            fragColor = vec4(sqrt(c), 1.f);
        }
    }
}