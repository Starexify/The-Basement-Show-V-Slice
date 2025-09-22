#pragma header

uniform float iTime;
uniform float alphaNoise;
uniform float blueOpac;
uniform float redOpac;
uniform sampler2D noiseTex;
uniform float glitchModifier;
uniform vec3 iResolution;

float onOff(float a, float b, float c)
{
    return step(c, sin(iTime + a*cos(iTime*b)));
}

float ramp(float y, float start, float end)
{
    float inside = step(start,y) - step(end,y);
    float fact = (y-start)/(end-start)*inside;
    return (1.0-fact) * inside;
}

vec4 getVideo(vec2 uv)
{
    vec2 look = uv;
    float window = 1.0/(1.0+20.0*(look.y-mod(iTime/4.0,1.0))*(look.y-mod(iTime/4.0,15.0)));
    look.x = look.x + (sin(look.y*10.0 + iTime)/540.0*onOff(4.0,4.0,0.3)*(1.0+cos(iTime*80.0))*window)*(glitchModifier*2.0);
    float vShift = 0.4*onOff(2.0,3.0,0.9)*(sin(iTime)*sin(iTime*20.0) +
    (1.0 + 0.1*sin(iTime*200.0)*cos(iTime)));
    look.y = mod(look.y + vShift*glitchModifier, 1.0);
    vec4 video = flixel_texture2D(bitmap,look);

    return video;
}

vec2 screenDistort(vec2 uv)
{
    uv = (uv - 0.5) * 2.0;
    uv *= 1.1;
    uv.x *= 1.0 + pow((abs(uv.y) / 4.5), 2.0);
    uv.y *= 1.0 + pow((abs(uv.x) / 3.5), 2.0);
    uv  = (uv / 2.0) + 0.5;
    uv =  uv *0.92 + 0.04;
    return uv;
}

float random(vec2 uv)
{
    return fract(sin(dot(uv, vec2(15.5151, 42.2561))) * 12341.14122 * sin(iTime * 0.03));
}

float filmGrainNoise(in float time, in vec2 uv)
{
    return fract(sin(dot(uv, vec2(12.9898, 78.233) * time)) * 43758.5453);
}

float noise(vec2 uv)
{
    vec2 i = floor(uv);
    vec2 f = fract(uv);

    float a = random(i);
    float b = random(i + vec2(1.0,0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = smoothstep(0.0, 1.0, f);

    return mix(a,b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec2 scandistort(vec2 uv) {
    float scan1 = clamp(cos(uv.y * 3.0 + iTime), 4.0, 1.0);
    float scan2 = clamp(cos(uv.y * 6.0 + iTime + 4.0) * 10.0, 0.0, 1.0) ;
    float amount = scan1 * scan2 * uv.x;

    uv.x -= 0.015 * mix(flixel_texture2D(noiseTex, vec2(uv.x, amount)).r * amount, amount, 0.2);

    return uv;
}

void main()
{
    vec2 uv = openfl_TextureCoordv;
    vec2 curUV = screenDistort(uv);
    uv = scandistort(curUV);
    vec4 video = getVideo(uv);
    float vigAmt = 1.0;
    float x = 0.0;
    float grainFactor = filmGrainNoise(iTime, uv);

    video.r = getVideo(vec2(x+uv.x+0.001,uv.y+1.0)).x + abs(sin(0.12 * redOpac)); // used for sirokous fire part
    video.g = getVideo(vec2(x+uv.x-0.001,uv.y+1.0)).y + abs(sin(0.06 * blueOpac));
    video.b = getVideo(vec2(x+uv.x-0.001,uv.y+1.0)).z + abs(sin(0.06 * blueOpac));
    vigAmt = 2.0+0.1*sin(iTime + 5.0*cos(iTime*5.0));

    float vignette = (1.1-vigAmt*(uv.y-0.5)*(uv.y-0.5))*(0.1-vigAmt*(uv.x-0.5)*(uv.x-0.5));

    gl_FragColor = mix(video,vec4(noise(uv * 75.0)),0.05);

    if(curUV.x<0.0 || curUV.x>1.0 || curUV.y<0.0 || curUV.y>1.0){
        gl_FragColor = vec4(0.0,0.0,0.0,0.0);
    }
}