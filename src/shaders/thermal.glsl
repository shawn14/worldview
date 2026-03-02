// FLIR Thermal Imaging post-processing shader
// Converts luminance to false-color thermal palette via LUT

uniform sampler2D colorTexture;
uniform sampler2D thermalLUT;
uniform float time;

in vec2 v_textureCoordinates;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_textureCoordinates;

    // Sample scene color
    vec4 color = texture(colorTexture, uv);

    // Convert to luminance (perceived brightness)
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Increase contrast for thermal effect
    lum = clamp(lum * 1.3 - 0.1, 0.0, 1.0);

    // Look up thermal color from LUT (256x1 gradient texture)
    vec3 thermal = texture(thermalLUT, vec2(lum, 0.5)).rgb;

    // Add subtle noise grain
    float noise = random(uv * 300.0 + vec2(time * 0.005)) * 0.04;
    thermal += noise;

    // Slight vignette
    float dist = distance(uv, vec2(0.5));
    float vignette = smoothstep(0.8, 0.4, dist);
    thermal *= vignette;

    out_FragColor = vec4(thermal, 1.0);
}
