#version 300 es
precision highp float;

const int NS = 50;
const int NL = 2;

uniform float uTime;
uniform vec4 uS[NS];
uniform vec3 uL[NL];
uniform vec3 uC[NL];

in vec3 vPos;
out vec4 fragColor;

// focal length of the camera

float fl = 3.f;

// a function to trace a ray to a sphere

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
    for(int i = 0; i < 50; i++) {
        float t = raySphere(V, W, uS[i]);
        if(t >= 0.f && t < tMin) {
            tMin = t;
            fragColor = vec4(1.f);

            // Find the point on the sphere surface

            vec3 P = V + t * W;

            // Find the surface normal

            vec3 N = normalize(P - uS[i].xyz);

            // Do diffuse shading

            vec3 c = vec3(.2f);
            for(int j = 0; j < NL; j++) {
                c += .8f * max(0.f, dot(N, uL[j])) * uC[j];
                // Do gamma color correction
                fragColor = vec4(sqrt(c), 1.f);
            }
        }
    }
}