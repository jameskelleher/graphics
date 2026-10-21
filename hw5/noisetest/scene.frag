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
    // fragColor = vec4(vec3(noise(uTime + vPos * 10.)), 1.);

    // vec3 P = vec3(vPos.xy, vPos.z + uTime / 10.);
    // fragColor = vec4(vec3(noise(P * 10.)), 1.);

    float dist = distance(vec3(uCursor.xy, 0.), vPos);
    float dir = 1.;

    if (uCursor.z == 0.) {
        dir = -1.;
    }

    vec3 P = vec3(vPos.xy, vPos.z + uTime / 10. + dist * dir);

    vec3 color1 = vec3(0.85f, 0.05f, 0.05f);
    vec3 color2 = vec3(0.89f, 0.45f, 0.08f);
    vec3 color3 = vec3(0.);

    float colorRamp = clamp(pow(noise(P * 10.) + 0.6, 0.95), 0., 1.);
    vec3 mix1 = mix(color1, color2, colorRamp);//pow(noise(P * 10.), 0.95) + 0.5);
    vec3 mix2 = mix(mix1, color3, pow(dist * 1.5, 1.));
    fragColor = vec4(mix2, 1.);

    // fragColor = vec4(vec3(uCursor.x), 1.);
    // fragColor = vec4(vec3(pow(noise(P * 10.) - 0.5, 2.)), 1.);
}

