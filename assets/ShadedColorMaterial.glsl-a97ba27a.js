import{n as v}from"./vec4f64-6d0e93be.js";import{c as p,v as u,d as f,a as g}from"./View.glsl-03db830e.js";import{o as s}from"./FloatPassUniform-e3702139.js";import{a,o as h}from"./ShaderBuilder-7bfc11d2.js";import{h as l}from"./Matrix3PassUniform-0b3b1bba.js";import{u as w}from"./Slice.glsl-7975394d.js";import{r as S}from"./Transform.glsl-7294c426.js";import{n as C}from"./MultipassTerrainTest.glsl-43f42334.js";import{t as b}from"./AlphaCutoff-96178e0d.js";import{e as P,o as z}from"./TransparencyPassType-a6b20292.js";import{e as m}from"./Float4PassUniform-7f3c3ce8.js";import{O as c}from"./VertexAttribute-15d1866a.js";function N(o,r){if(!r.screenSizeEnabled)return;const i=o.vertex;p(i,r),i.uniforms.add(new s("perScreenPixelRatio",(e,n)=>n.camera.perScreenPixelRatio)),i.uniforms.add(new s("screenSizeScale",e=>e.screenSizeScale)),i.code.add(a`float computeRenderPixelSizeAt( vec3 pWorld ){
vec3 viewForward = - vec3(view[0][2], view[1][2], view[2][2]);
float viewDirectionDistance = abs(dot(viewForward, pWorld - cameraPosition));
return viewDirectionDistance * perScreenPixelRatio;
}
vec3 screenSizeScaling(vec3 position, vec3 anchor){
return position * screenSizeScale * computeRenderPixelSizeAt(anchor) + anchor;
}`)}function y(o){const r=new h,i=o.hasMultipassTerrain&&(o.output===l.Color||o.output===l.Alpha);r.include(S,o),r.include(N,o),r.include(w,o);const{vertex:e,fragment:n}=r;return n.include(P),u(e,o),n.uniforms.add(new m("uColor",d=>d.color)),r.attributes.add(c.POSITION,"vec3"),r.varyings.add("vWorldPosition","vec3"),i&&r.varyings.add("depth","float"),o.screenSizeEnabled&&r.attributes.add(c.OFFSET,"vec3"),o.shadingEnabled&&(f(e),r.attributes.add(c.NORMAL,"vec3"),r.varyings.add("vViewNormal","vec3")),e.code.add(a`
    void main(void) {
      vWorldPosition = ${o.screenSizeEnabled?"screenSizeScaling(offset, position)":"position"};
  `),o.shadingEnabled&&e.code.add(a`vec3 worldNormal = normal;
vViewNormal = (viewNormal * vec4(worldNormal, 1)).xyz;`),e.code.add(a`
    ${i?"depth = (view * vec4(vWorldPosition, 1.0)).z;":""}
    gl_Position = transformPosition(proj, view, vWorldPosition);
  }
  `),i&&r.include(C,o),n.code.add(a`
    void main() {
      discardBySlice(vWorldPosition);
      ${i?"terrainDepthTest(gl_FragCoord, depth);":""}
    `),o.shadingEnabled?(n.uniforms.add(new g("shadingDirection",d=>d.shadingDirection)),n.uniforms.add(new m("shadedColor",d=>F(d.shadingTint,d.color))),n.code.add(a`vec3 viewNormalNorm = normalize(vViewNormal);
float shadingFactor = 1.0 - clamp(-dot(viewNormalNorm, shadingDirection), 0.0, 1.0);
vec4 finalColor = mix(uColor, shadedColor, shadingFactor);`)):n.code.add(a`vec4 finalColor = uColor;`),n.code.add(a`
      ${o.output===l.ObjectAndLayerIdColor?a`finalColor.a = 1.0;`:""}
      if (finalColor.a < ${a.float(b)}) {
        discard;
      }
      ${o.output===l.Alpha?a`gl_FragColor = vec4(finalColor.a);`:""}

      ${o.output===l.Color?a`gl_FragColor = highlightSlice(finalColor, vWorldPosition); ${o.transparencyPassType===z.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}`:""}
    }
    `),r}function F(o,r){const i=1-o[3],e=o[3]+r[3]*i;return e===0?(t[3]=e,t):(t[0]=(o[0]*o[3]+r[0]*r[3]*i)/e,t[1]=(o[1]*o[3]+r[1]*r[3]*i)/e,t[2]=(o[2]*o[3]+r[2]*r[3]*i)/e,t[3]=r[3],t)}const t=v(),V=Object.freeze(Object.defineProperty({__proto__:null,build:y},Symbol.toStringTag,{value:"Module"}));export{y as f,V as h};
