// FLIR Thermal Imaging post-processing shader
// Converts luminance to false-color "Inferno" thermal palette (computed in shader)

uniform sampler2D colorTexture;
uniform float time;

in vec2 v_textureCoordinates;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Attempt to approximate Inferno/Iron colormap via mix stops
vec3 thermalPalette(float t) {
    // 6-stop gradient: black → dark purple → red → orange → yellow → white
    vec3 c0 = vec3(0.0, 0.0, 0.02);       // near-black
    vec3 c1 = vec3(0.11, 0.05, 0.42);      // dark indigo
    vec3 c2 = vec3(0.47, 0.11, 0.53);      // purple
    vec3 c3 = vec3(0.82, 0.17, 0.27);      // red
    vec3 c4 = vec3(0.93, 0.55, 0.05);      // orange
    vec3 c5 = vec3(0.99, 0.91, 0.15);      // yellow
    vec3 c6 = vec3(1.0, 1.0, 0.98);        // white-hot

    if (t < 0.167) return mix(c0, c1, t / 0.167);
    if (t < 0.333) return mix(c1, c2, (t - 0.167) / 0.166);
    if (t < 0.5)   return mix(c2, c3, (t - 0.333) / 0.167);
    if (t < 0.667) return mix(c3, c4, (t - 0.5) / 0.167);
    if (t < 0.833) return mix(c4, c5, (t - 0.667) / 0.166);
    return mix(c5, c6, (t - 0.833) / 0.167);
}

void main() {
    vec2 uv = v_textureCoordinates;

    // Sample scene color
    vec4 color = texture(colorTexture, uv);

    // Convert to luminance (perceived brightness)
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Increase contrast for thermal effect
    lum = clamp(lum * 1.3 - 0.1, 0.0, 1.0);

    // Map luminance to thermal palette
    vec3 thermal = thermalPalette(lum);

    // Add subtle noise grain
    float noise = random(uv * 300.0 + vec2(time * 0.005)) * 0.04;
    thermal += noise;

    // Slight vignette
    float dist = distance(uv, vec2(0.5));
    float vignette = smoothstep(0.8, 0.4, dist);
    thermal *= vignette;

    out_FragColor = vec4(thermal, 1.0);
}
