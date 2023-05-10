import{e as F,h as i}from"./Matrix3PassUniform-0b3b1bba.js";import{e as c}from"./mat3f64-50f3b9f6.js";import{e as w}from"./mat4f64-abdda1bb.js";import{n as d}from"./vec3f32-01c06d8d.js";import{n as s}from"./vec3-015ca254.js";import{i as h,b as p,a,n as v}from"./ShaderBuilder-7bfc11d2.js";import{O as W}from"./VertexAttribute-15d1866a.js";import{a as n,e as M,b as m}from"./View.glsl-03db830e.js";import{e as P}from"./Texture2DPassUniform-70e1e126.js";let R=class extends h{constructor(t,e){super(t,"mat3",p.Draw,(o,f,u)=>o.setUniformMatrix3fv(t,e(f,u)))}};function T(r){r.attributes.add(W.POSITION,"vec3"),r.vertex.code.add(a`vec3 positionModel() { return position; }`)}function V({code:r},t){t.doublePrecisionRequiresObfuscation?r.add(a`vec3 dpPlusFrc(vec3 a, vec3 b) {
return mix(a, a + b, vec3(notEqual(b, vec3(0))));
}
vec3 dpMinusFrc(vec3 a, vec3 b) {
return mix(vec3(0), a - b, vec3(notEqual(a, b)));
}
vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {
vec3 t1 = dpPlusFrc(hiA, hiB);
vec3 e = dpMinusFrc(t1, hiA);
vec3 t2 = dpMinusFrc(hiB, e) + dpMinusFrc(hiA, dpMinusFrc(t1, e)) + loA + loB;
return t1 + t2;
}`):r.add(a`vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {
vec3 t1 = hiA + hiB;
vec3 e = t1 - hiA;
vec3 t2 = ((hiB - e) + (hiA - (t1 - e))) + loA + loB;
return t1 + t2;
}`)}function L(r,t){r.include(T);const e=r.vertex;e.include(V,t),r.varyings.add("vPositionWorldCameraRelative","vec3"),r.varyings.add("vPosition_view","vec3"),e.uniforms.add([new n("transformWorldFromViewTH",o=>o.transformWorldFromViewTH),new n("transformWorldFromViewTL",o=>o.transformWorldFromViewTL),new F("transformViewFromCameraRelativeRS",o=>o.transformViewFromCameraRelativeRS),new M("transformProjFromView",o=>o.transformProjFromView),new R("transformWorldFromModelRS",o=>o.transformWorldFromModelRS),new m("transformWorldFromModelTH",o=>o.transformWorldFromModelTH),new m("transformWorldFromModelTL",o=>o.transformWorldFromModelTL)]),e.code.add(a`vec3 positionWorldCameraRelative() {
vec3 rotatedModelPosition = transformWorldFromModelRS * positionModel();
vec3 transform_CameraRelativeFromModel = dpAdd(
transformWorldFromModelTL,
transformWorldFromModelTH,
-transformWorldFromViewTL,
-transformWorldFromViewTH
);
return transform_CameraRelativeFromModel + rotatedModelPosition;
}`),e.code.add(a`
    void forwardPosition(float fOffset) {
      vPositionWorldCameraRelative = positionWorldCameraRelative();
      if (fOffset != 0.0) {
        vPositionWorldCameraRelative += fOffset * ${t.spherical?a`normalize(transformWorldFromViewTL + vPositionWorldCameraRelative)`:a`vec3(0.0, 0.0, 1.0)`};
      }

      vPosition_view = transformViewFromCameraRelativeRS * vPositionWorldCameraRelative;
      gl_Position = transformProjFromView * vec4(vPosition_view, 1.0);
    }
  `),r.fragment.uniforms.add(new n("transformWorldFromViewTL",o=>o.transformWorldFromViewTL)),e.code.add(a`vec3 positionWorld() {
return transformWorldFromViewTL + vPositionWorldCameraRelative;
}`),r.fragment.code.add(a`vec3 positionWorld() {
return transformWorldFromViewTL + vPositionWorldCameraRelative;
}`)}class j extends v{constructor(){super(...arguments),this.transformWorldFromViewTH=s(),this.transformWorldFromViewTL=s(),this.transformViewFromCameraRelativeRS=c(),this.transformProjFromView=w()}}class z extends v{constructor(){super(...arguments),this.transformWorldFromModelRS=c(),this.transformWorldFromModelTH=d(),this.transformWorldFromModelTL=d()}}function l(r){r.varyings.add("linearDepth","float")}function C(r){r.vertex.uniforms.add(new P("nearFar",(t,e)=>e.camera.nearFar))}function $(r){r.vertex.code.add(a`float calculateLinearDepth(vec2 nearFar,float z) {
return (-z - nearFar[0]) / (nearFar[1] - nearFar[0]);
}`)}function q(r,t){const{vertex:e}=r;switch(t.output){case i.Color:if(t.receiveShadows)return l(r),void e.code.add(a`void forwardLinearDepth() { linearDepth = gl_Position.w; }`);break;case i.Depth:case i.Shadow:case i.ShadowHighlight:case i.ShadowExcludeHighlight:return r.include(L,t),l(r),C(r),$(r),void e.code.add(a`void forwardLinearDepth() {
linearDepth = calculateLinearDepth(nearFar, vPosition_view.z);
}`)}e.code.add(a`void forwardLinearDepth() {}`)}export{L as F,z as W,T as a,V as b,j as c,q as d,C as i,$ as n,R as o,l as t};
