#pragma header

uniform float dim;
uniform float size;

void main(void)
{
    vec2 uv = openfl_TextureCoordv.xy;

    float directions = 8.0;
    float quality = 4.0;
    float Pi = 6.28318530718; // Pi*2

    vec4 Color = flixel_texture2D(bitmap, uv);
    float aaply = 0.0;

    for(float d = 0.0; d < Pi; d += Pi / directions) {
        for(float i = 1.0 / quality; i <= 1.0; i += 1.0 / quality) {
            vec2 offset = vec2(cos(d), sin(d)) * size * i / openfl_TextureSize.xy;
            Color += flixel_texture2D(bitmap, uv + offset);
            aaply += dim;
        }
    }

    Color /= max(aaply - (directions - 1.0), 1.0);
    vec4 bloom = (flixel_texture2D(bitmap, uv) / dim) + Color;
    gl_FragColor = bloom;
}