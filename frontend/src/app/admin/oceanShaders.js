// Shaders do fundo oceânico do admin (água + céu).
// Valores de cor estão em espaço linear (o three converte para sRGB na saída).

// Ajustes rápidos de aparência
export const OCEAN_CONFIG = {
  sunDirection: [0.3, 0.1, -1.0], // posição do sol (x, altura, profundidade)
  normalStrength: 0.62,           // quanto as ondulações inclinam a superfície
  detailHeight: 0.55,             // altura das ondulações finas
};

const common = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Ondas longas (marola): usadas no relevo da malha e na normal.
  float swell(vec2 p, float t) {
    return sin(dot(p, vec2(0.082, 0.058)) + t * 0.55) * 0.34
         + sin(dot(p, vec2(-0.115, 0.083)) - t * 0.43 + 1.9) * 0.20
         + sin(dot(p, vec2(0.170, 0.131)) + t * 0.37 + 2.7) * 0.10;
  }

  // Ondulações finas com cristas afiadas e vales largos, com distorção de domínio.
  float ripples(vec2 p, float t) {
    float h = 0.0;
    float amp = 0.5;
    vec2 q = p * 0.34;
    mat2 turn = mat2(0.80, -0.60, 0.60, 0.80) * 1.9;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      vec2 warp;
      if (i < 2) {
        warp = vec2(vnoise(q + t * 0.11), vnoise(q.yx - t * 0.09 + 3.7)) - 0.5;
      } else {
        warp = vec2(sin(q.y * 1.3 + t * 0.35), sin(q.x * 1.1 - t * 0.29)) * 0.25;
      }
      vec2 u = q + warp * 1.9 + vec2(t * 0.16, -t * 0.10) * (1.0 + fi * 0.45);
      vec2 sn = sin(u);
      // |sin| suavizado: cristas afiadas, porém sem quinas na normal
      vec2 s = 1.0 - (sqrt(sn * sn + 0.06) - 0.245) / 0.785;
      float r = s.x * s.y;
      h += r * r * amp;
      q = turn * q;
      amp *= 0.46;
    }
    return h;
  }

  float surface(vec2 p, float t, float detailHeight) {
    return swell(p, t) + ripples(p, t) * detailHeight;
  }
`;

const skyFunction = /* glsl */ `
  uniform vec3 uSunDir;

  vec3 skyColor(vec3 dir) {
    float h = clamp(dir.y, 0.0, 1.0);
    vec3 horizon = vec3(0.012, 0.085, 0.130);
    vec3 mid     = vec3(0.002, 0.026, 0.060);
    vec3 zenith  = vec3(0.0005, 0.005, 0.018);
    vec3 c = mix(horizon, mid, smoothstep(0.0, 0.14, h));
    c = mix(c, zenith, smoothstep(0.06, 0.60, h));
    return c;
  }
`;

export const waterVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  ${common}
  void main() {
    vec3 p = position;
    p.y += swell(p.xz, uTime);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uNormalStrength;
  uniform float uDetailHeight;
  varying vec3 vWorld;
  ${common}
  ${skyFunction}

  void main() {
    vec2 p = vWorld.xz;
    float t = uTime;
    vec3 toCam = cameraPosition - vWorld;
    float dist = length(toCam);
    vec3 V = toCam / dist;

    // Normal a partir de diferenças finitas da superfície.
    float e = 0.12 + dist * 0.0012;
    float h0 = surface(p, t, uDetailHeight);
    float hx = surface(p + vec2(e, 0.0), t, uDetailHeight);
    float hz = surface(p + vec2(0.0, e), t, uDetailHeight);
    float fade = mix(1.0, 0.18, smoothstep(40.0, 360.0, dist));
    vec3 N = normalize(vec3(-(hx - h0) / e * uNormalStrength * fade, 1.0, -(hz - h0) / e * uNormalStrength * fade));

    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);

    // Reflexo do céu.
    vec3 R = reflect(-V, N);
    R.y = abs(R.y);
    vec3 reflection = skyColor(normalize(R));

    // Cor do corpo da água: azul profundo -> turquesa nas cristas (espalhamento).
    float crest = clamp(ripples(p, t) * 1.15, 0.0, 1.0);
    vec3 deep    = vec3(0.0005, 0.010, 0.026);
    vec3 shallow = vec3(0.005, 0.105, 0.160);
    float sunFacing = 0.55 + 0.45 * max(dot(N, normalize(uSunDir)), 0.0);
    vec3 body = mix(deep, shallow, clamp(0.12 + crest * 0.75 + swell(p, t) * 0.35, 0.0, 1.0) * sunFacing);

    vec3 color = mix(body, reflection, fresnel);

    // Espuma sutil nas cristas mais altas.
    float foamMask = smoothstep(0.58, 0.84, ripples(p * 1.0, t));
    foamMask *= 1.0 - smoothstep(60.0, 260.0, dist);
    color = mix(color, vec3(0.45, 0.70, 0.78), foamMask * 0.14);

    // Névoa do horizonte combinando com o céu.
    vec3 hazeDir = normalize(vec3(-V.x, 0.015, -V.z));
    vec3 haze = skyColor(hazeDir);
    float fog = smoothstep(70.0, 760.0, dist);
    color = mix(color, haze, fog);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const skyVertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const skyFragmentShader = /* glsl */ `
  varying vec3 vWorld;
  ${skyFunction}
  void main() {
    vec3 dir = normalize(vWorld - cameraPosition);
    vec3 color = skyColor(dir);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
