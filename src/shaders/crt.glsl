// CRT Monitor post-processing shader
// Scanlines, chromatic aberration, barrel distortion, flicker

uniform sampler2D colorTexture;
uniform float time;

in vec2 v_textureCoordinates;

// Barrel distortion
vec2 barrelDistort(vec2 uv) {
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);
    float distortion = 1.0 + r2 * 0.15 + r2 * r2 * 0.05;
    return centered * distortion + 0.5;
}

void main() {
    vec2 uv = v_textureCoordinates;

    // Apply barrel distortion
    vec2 distortedUV = barrelDistort(uv);

    // Check bounds — black outside the curved screen
    if (distortedUV.x < 0.0 || distortedUV.x > 1.0 || distortedUV.y < 0.0 || distortedUV.y > 1.0) {
        out_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Chromatic aberration — offset R and B channels
    float aberration = 0.003;
    float r = texture(colorTexture, distortedUV + vec2(aberration, 0.0)).r;
    float g = texture(colorTexture, distortedUV).g;
    float b = texture(colorTexture, distortedUV - vec2(aberration, 0.0)).b;
    vec3 color = vec3(r, g, b);

    // Scanlines
    float scanline = sin(distortedUV.y * 800.0) * 0.08;
    color -= scanline;

    // Horizontal sub-pixel pattern (RGB stripes)
    float subpixel = sin(distortedUV.x * 1200.0) * 0.03;
    color -= subpixel;

    // Flicker
    float flicker = 1.0 - sin(time * 8.0) * 0.02;
    color *= flicker;

    // Slight green tint (CRT phosphor bias)
    color *= vec3(0.95, 1.0, 0.95);

    // Vignette — darker at screen edges
    float dist = distance(distortedUV, vec2(0.5));
    float vignette = smoothstep(0.75, 0.35, dist);
    color *= vignette;

    // Slight brightness boost
    color *= 1.1;

    out_FragColor = vec4(color, 1.0);
}
