// Night Vision (NVG) post-processing shader
// Green phosphor screen with noise grain, bloom, and vignette

uniform sampler2D colorTexture;
uniform float time;

in vec2 v_textureCoordinates;

// Simple pseudo-random noise
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_textureCoordinates;

    // Sample the scene
    vec4 color = texture(colorTexture, uv);

    // Convert to luminance
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Simple box-blur bloom (3x3 kernel)
    vec2 texelSize = vec2(1.0) / vec2(textureSize(colorTexture, 0));
    float bloom = 0.0;
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec4 s = texture(colorTexture, uv + vec2(float(x), float(y)) * texelSize * 2.0);
            bloom += dot(s.rgb, vec3(0.299, 0.587, 0.114));
        }
    }
    bloom /= 9.0;

    // Blend bloom with original luminance
    lum = mix(lum, bloom, 0.3);

    // Apply green phosphor color ramp
    vec3 nvgColor = vec3(lum * 0.1, lum * 1.0, lum * 0.15);

    // Boost contrast
    nvgColor = pow(nvgColor, vec3(0.85));

    // Add noise grain (animated via czm_frameNumber)
    float noise = random(uv * 500.0 + vec2(time * 0.01)) * 0.08;
    nvgColor += vec3(noise * 0.1, noise, noise * 0.15);

    // Vignette (darken edges)
    float dist = distance(uv, vec2(0.5));
    float vignette = smoothstep(0.7, 0.3, dist);
    nvgColor *= vignette;

    out_FragColor = vec4(nvgColor, 1.0);
}
