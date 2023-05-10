import{h as a}from"./Matrix3PassUniform-0b3b1bba.js";import{a as l}from"./RgbaFloatEncoding.glsl-4a25e2a7.js";import{a as e}from"./ShaderBuilder-7bfc11d2.js";function p(t,o){switch(t.fragment.include(l),o.output){case a.Shadow:case a.ShadowHighlight:case a.ShadowExcludeHighlight:t.extensions.add("GL_OES_standard_derivatives"),t.fragment.code.add(e`float _calculateFragDepth(const in float depth) {
const float SLOPE_SCALE = 2.0;
const float BIAS = 20.0 * .000015259;
float m = max(abs(dFdx(depth)), abs(dFdy(depth)));
float result = depth + SLOPE_SCALE * m + BIAS;
return clamp(result, .0, .999999);
}
void outputDepth(float _linearDepth) {
gl_FragColor = float2rgba(_calculateFragDepth(_linearDepth));
}`);break;case a.Depth:t.fragment.code.add(e`void outputDepth(float _linearDepth) {
gl_FragColor = float2rgba(_linearDepth);
}`)}}export{p as o};
