import{a as r}from"./RgbaFloatEncoding.glsl-4a25e2a7.js";import{a}from"./ShaderBuilder-7bfc11d2.js";function n(e){e.include(r),e.code.add(a`float linearDepthFromFloat(float depth, vec2 nearFar) {
return -(depth * (nearFar[1] - nearFar[0]) + nearFar[0]);
}
float linearDepthFromTexture(sampler2D depthTex, vec2 uv, vec2 nearFar) {
return linearDepthFromFloat(rgba2float(texture2D(depthTex, uv)), nearFar);
}`)}export{n as a};
