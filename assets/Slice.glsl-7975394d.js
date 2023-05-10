import{e as n,t as H,r as _}from"./typedArrayUtil-ce39e5f4.js";import{i as L}from"./mat4-4714ff8c.js";import{e as G}from"./mat4f64-abdda1bb.js";import{f as h,O as u,u as T,e as m,n as g,o as w}from"./vec3-015ca254.js";import{a as P,b as p}from"./View.glsl-03db830e.js";import{a as r,n as x}from"./ShaderBuilder-7bfc11d2.js";class V extends x{constructor(s){super(),this.slicePlaneLocalOrigin=s}}function C(a,s){I(a,s,[new P("slicePlaneOrigin",(e,i)=>S(s,e,i)),new P("slicePlaneBasis1",(e,i)=>{var c;return f(s,e,i,(c=n(i.slicePlane))==null?void 0:c.basis1)}),new P("slicePlaneBasis2",(e,i)=>{var c;return f(s,e,i,(c=n(i.slicePlane))==null?void 0:c.basis2)})])}function N(a,s){I(a,s,[new p("slicePlaneOrigin",(e,i)=>S(s,e,i)),new p("slicePlaneBasis1",(e,i)=>{var c;return f(s,e,i,(c=n(i.slicePlane))==null?void 0:c.basis1)}),new p("slicePlaneBasis2",(e,i)=>{var c;return f(s,e,i,(c=n(i.slicePlane))==null?void 0:c.basis2)})])}function I(a,s,e){if(!s.hasSlicePlane){const l=r`#define rejectBySlice(_pos_) false
#define discardBySlice(_pos_) {}
#define highlightSlice(_color_, _pos_) (_color_)`;return s.hasSliceInVertexProgram&&a.vertex.code.add(l),void a.fragment.code.add(l)}a.extensions.add("GL_OES_standard_derivatives"),s.hasSliceInVertexProgram&&a.vertex.uniforms.add(e),a.fragment.uniforms.add(e);const i=r`struct SliceFactors {
float front;
float side0;
float side1;
float side2;
float side3;
};
SliceFactors calculateSliceFactors(vec3 pos) {
vec3 rel = pos - slicePlaneOrigin;
vec3 slicePlaneNormal = -cross(slicePlaneBasis1, slicePlaneBasis2);
float slicePlaneW = -dot(slicePlaneNormal, slicePlaneOrigin);
float basis1Len2 = dot(slicePlaneBasis1, slicePlaneBasis1);
float basis2Len2 = dot(slicePlaneBasis2, slicePlaneBasis2);
float basis1Dot = dot(slicePlaneBasis1, rel);
float basis2Dot = dot(slicePlaneBasis2, rel);
return SliceFactors(
dot(slicePlaneNormal, pos) + slicePlaneW,
-basis1Dot - basis1Len2,
basis1Dot - basis1Len2,
-basis2Dot - basis2Len2,
basis2Dot - basis2Len2
);
}
bool sliceByFactors(SliceFactors factors) {
return factors.front < 0.0
&& factors.side0 < 0.0
&& factors.side1 < 0.0
&& factors.side2 < 0.0
&& factors.side3 < 0.0;
}
bool sliceEnabled() {
return dot(slicePlaneBasis1, slicePlaneBasis1) != 0.0;
}
bool sliceByPlane(vec3 pos) {
return sliceEnabled() && sliceByFactors(calculateSliceFactors(pos));
}
#define rejectBySlice(_pos_) sliceByPlane(_pos_)
#define discardBySlice(_pos_) { if (sliceByPlane(_pos_)) discard; }`,c=r`vec4 applySliceHighlight(vec4 color, vec3 pos) {
SliceFactors factors = calculateSliceFactors(pos);
const float HIGHLIGHT_WIDTH = 1.0;
const vec4 HIGHLIGHT_COLOR = vec4(0.0, 0.0, 0.0, 0.3);
factors.front /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.front);
factors.side0 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side0);
factors.side1 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side1);
factors.side2 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side2);
factors.side3 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side3);
if (sliceByFactors(factors)) {
return color;
}
float highlightFactor = (1.0 - step(0.5, factors.front))
* (1.0 - step(0.5, factors.side0))
* (1.0 - step(0.5, factors.side1))
* (1.0 - step(0.5, factors.side2))
* (1.0 - step(0.5, factors.side3));
return mix(color, vec4(HIGHLIGHT_COLOR.rgb, color.a), highlightFactor * HIGHLIGHT_COLOR.a);
}`,o=s.hasSliceHighlight?r`
        ${c}
        #define highlightSlice(_color_, _pos_) (sliceEnabled() ? applySliceHighlight(_color_, _pos_) : (_color_))
      `:r`#define highlightSlice(_color_, _pos_) (_color_)`;s.hasSliceInVertexProgram&&a.vertex.code.add(i),a.fragment.code.add(i),a.fragment.code.add(o)}function b(a,s,e){return a.instancedDoublePrecision?w(O,e.camera.viewInverseTransposeMatrix[3],e.camera.viewInverseTransposeMatrix[7],e.camera.viewInverseTransposeMatrix[11]):s.slicePlaneLocalOrigin}function v(a,s){return _(a)?m(d,s.origin,a):s.origin}function B(a,s,e){return a.hasSliceTranslatedView?_(s)?L(D,e.camera.viewMatrix,s):e.camera.viewMatrix:null}function S(a,s,e){if(H(e.slicePlane))return h;const i=b(a,s,e),c=v(i,e.slicePlane),o=B(a,i,e);return _(o)?u(d,c,o):c}function f(a,s,e,i){if(H(i)||H(e.slicePlane))return h;const c=b(a,s,e),o=v(c,e.slicePlane),l=B(a,c,e);return _(l)?(T(t,i,o),u(d,o,l),u(t,t,l),m(t,t,d)):i}const O=g(),d=g(),t=g(),D=G();export{V as m,C as p,N as u};
