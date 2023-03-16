import{a as h,d as y,i as O}from"./ForwardLinearDepth.glsl-3606f02d.js";import{h as l}from"./Matrix3PassUniform-285be0f9.js";import{u as c}from"./Slice.glsl-e5fdd8d3.js";import{r as s}from"./Transform.glsl-e6366353.js";import{r as z}from"./vec2f64-f35767d6.js";import{e as w}from"./Texture2DPassUniform-1510cbb0.js";import{a as n,v as x,d as C,c as b}from"./View.glsl-725bf3cf.js";import{z as d,K as p,J as S,v as V}from"./VisualVariablePassParameters-ded3d86d.js";import{a as r,o as P}from"./ShaderBuilder-c7fc4a30.js";import{O as v}from"./VertexAttribute-15d1866a.js";import{o as $}from"./OutputDepth.glsl-ccbc6366.js";import{a as N}from"./OutputHighlight.glsl-569dde3f.js";import{p as A,d as _,f as R,u as D}from"./EvaluateSceneLighting.glsl-ed7fcdc2.js";import{v as f,c as M}from"./PhysicallyBasedRendering.glsl-d72e2a11.js";import{n as L}from"./MultipassTerrainTest.glsl-029ffa3f.js";import{e as T}from"./Normals.glsl-81bc0899.js";import{r as u}from"./NormalUtils.glsl-d1e61521.js";import{e as U,o as E}from"./TransparencyPassType-a1cb0602.js";import{o as g}from"./FloatPassUniform-8a52db3d.js";const m=8;function j(o,e){const t=v.FEATUREVALUE;o.attributes.add(t,"vec4");const a=o.vertex;a.code.add(r`
  bool isCapVertex() {
    return ${t}.w == 1.0;
  }
  `),a.uniforms.add(new w("size",i=>i.size)),e.vvSize?(a.uniforms.add(new n("vvSizeMinSize",i=>i.vvSizeMinSize)),a.uniforms.add(new n("vvSizeMaxSize",i=>i.vvSizeMaxSize)),a.uniforms.add(new n("vvSizeOffset",i=>i.vvSizeOffset)),a.uniforms.add(new n("vvSizeFactor",i=>i.vvSizeFactor)),a.code.add(r`
    vec2 getSize() {
      return size * clamp(vvSizeOffset + ${t}.x * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize).xz;
    }
    `)):a.code.add(r`vec2 getSize(){
return size;
}`),e.vvOpacity?(a.constants.add("vvOpacityNumber","int",m),a.uniforms.add([new d("vvOpacityValues",i=>i.vvOpacityValues,m),new d("vvOpacityOpacities",i=>i.vvOpacityOpacities,m)]),a.code.add(r`
    vec4 applyOpacity(vec4 color) {
      float value = ${t}.z;
      if (value <= vvOpacityValues[0]) {
        return vec4( color.xyz, vvOpacityOpacities[0]);
      }

      for (int i = 1; i < vvOpacityNumber; ++i) {
        if (vvOpacityValues[i] >= value) {
          float f = (value - vvOpacityValues[i-1]) / (vvOpacityValues[i] - vvOpacityValues[i-1]);
          return vec4( color.xyz, mix(vvOpacityOpacities[i-1], vvOpacityOpacities[i], f));
        }
      }

      return vec4( color.xyz, vvOpacityOpacities[vvOpacityNumber - 1]);
    }
    `)):a.code.add(r`vec4 applyOpacity(vec4 color){
return color;
}`),e.vvColor?(a.constants.add("vvColorNumber","int",p),a.uniforms.add([new d("vvColorValues",i=>i.vvColorValues,p),new S("vvColorColors",i=>i.vvColorColors,p)]),a.code.add(r`
    vec4 getColor() {
      float value = ${t}.y;
      if (value <= vvColorValues[0]) {
        return applyOpacity(vvColorColors[0]);
      }

      for (int i = 1; i < vvColorNumber; ++i) {
        if (vvColorValues[i] >= value) {
          float f = (value - vvColorValues[i-1]) / (vvColorValues[i] - vvColorValues[i-1]);
          return applyOpacity(mix(vvColorColors[i-1], vvColorColors[i], f));
        }
      }

      return applyOpacity(vvColorColors[vvColorNumber - 1]);
    }
    `)):a.code.add(r`vec4 getColor(){
return applyOpacity(vec4(1, 1, 1, 1));
}`),o.include(h),o.attributes.add(v.PROFILERIGHT,"vec4"),o.attributes.add(v.PROFILEUP,"vec4"),o.attributes.add(v.PROFILEVERTEXANDNORMAL,"vec4"),a.code.add(r`vec3 calculateVPos() {
vec2 size = getSize();
vec3 origin = position;
vec3 right = profileRight.xyz;
vec3 up = profileUp.xyz;
vec3 forward = cross(up, right);
vec2 profileVertex = profileVertexAndNormal.xy * size;
vec2 profileNormal = profileVertexAndNormal.zw;
float positionOffsetAlongProfilePlaneNormal = 0.0;
float normalOffsetAlongProfilePlaneNormal = 0.0;`),a.code.add(r`if(!isCapVertex()) {
vec2 rotationRight = vec2(profileRight.w, profileUp.w);
float maxDistance = length(rotationRight);`),a.code.add(r`rotationRight = maxDistance > 0.0 ? normalize(rotationRight) : vec2(0, 0);
float rx = dot(profileVertex, rotationRight);
if (abs(rx) > maxDistance) {
vec2 rotationUp = vec2(-rotationRight.y, rotationRight.x);
float ry = dot(profileVertex, rotationUp);
profileVertex = rotationRight * maxDistance * sign(rx) + rotationUp * ry;
}
}else{
positionOffsetAlongProfilePlaneNormal = profileRight.w * size[0];
normalOffsetAlongProfilePlaneNormal = profileUp.w;
}
vec3 offset = right * profileVertex.x + up * profileVertex.y + forward * positionOffsetAlongProfilePlaneNormal;
return origin + offset;
}`),a.code.add(r`vec3 localNormal() {
vec3 right = profileRight.xyz;
vec3 up = profileUp.xyz;
vec3 forward = cross(up, right);
vec2 profileNormal = profileVertexAndNormal.zw;
vec3 normal = right * profileNormal.x + up * profileNormal.y;
if(isCapVertex()) {
normal += forward * profileUp.w;
}
return normal;
}`)}class lo extends V{constructor(){super(...arguments),this.size=z(1,1)}}function B(o){const e=new P,{vertex:t,fragment:a}=e;switch(x(t,o),e.varyings.add("vpos","vec3"),e.include(j,o),o.output!==l.Color&&o.output!==l.Alpha||(e.include(s,o),e.include(f,o),e.include(y,o),e.varyings.add("vnormal","vec3"),e.varyings.add("vcolor","vec4"),o.hasMultipassTerrain&&e.varyings.add("depth","float"),t.code.add(r`
      void main() {
        vpos = calculateVPos();
        vnormal = normalize(localNormal());

        ${o.hasMultipassTerrain?"depth = (view * vec4(vpos, 1.0)).z;":""}
        gl_Position = transformPosition(proj, view, vpos);

        ${o.output===l.Color?"forwardLinearDepth();":""}

        vcolor = getColor();
      }
    `)),e.include(L,o),o.output){case l.Alpha:e.include(c,o),a.uniforms.add(new g("opacity",i=>i.opacity)),a.code.add(r`
      void main() {
        discardBySlice(vpos);
        ${o.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}
        float combinedOpacity = vcolor.a * opacity;
        gl_FragColor = vec4(combinedOpacity);
      }
    `);break;case l.Color:e.include(c,o),e.include(A,o),e.include(_,o),e.include(f,o),e.include(T,o),b(a,o),R(a),D(a),a.uniforms.add([t.uniforms.get("localOrigin"),new n("ambient",i=>i.ambient),new n("diffuse",i=>i.diffuse),new n("specular",i=>i.specular),new g("opacity",i=>i.opacity)]),a.include(U),M(a),a.code.add(r`
        void main() {
          discardBySlice(vpos);
          ${o.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}

          shadingParams.viewDirection = normalize(vpos - cameraPosition);
          shadingParams.normalView = vnormal;
          vec3 normal = shadingNormal(shadingParams);
          float ssao = evaluateAmbientOcclusionInverse();

          float additionalAmbientScale = additionalDirectedAmbientLight(vpos + localOrigin);
          vec3 additionalLight = ssao * mainLightIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;
          ${o.receiveShadows?"float shadow = readShadowMap(vpos, linearDepth);":o.spherical?"float shadow = lightingGlobalFactor * (1.0 - additionalAmbientScale);":"float shadow = 0.0;"}
          vec3 albedo = vcolor.rgb * max(ambient, diffuse); // combine the old material parameters into a single one
          float combinedOpacity = vcolor.a * opacity;
          albedo += 0.25 * specular; // don't completely ignore specular for now

          vec3 shadedColor = evaluateSceneLighting(normal, albedo, shadow, 1.0 - ssao, additionalLight);
          gl_FragColor = vec4(shadedColor, combinedOpacity);
          gl_FragColor = highlightSlice(gl_FragColor, vpos);
          ${o.transparencyPassType===E.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
        }
      `);break;case l.Depth:case l.Shadow:case l.ShadowHighlight:case l.ShadowExcludeHighlight:e.include(s,o),O(e),e.varyings.add("depth","float"),t.code.add(r`void main() {
vpos = calculateVPos();
gl_Position = transformPositionWithDepth(proj, view, vpos, nearFar, depth);
}`),e.include(c,o),e.include($,o),a.code.add(r`void main() {
discardBySlice(vpos);
outputDepth(depth);
}`);break;case l.Normal:e.include(s,o),e.include(u,o),C(t),e.varyings.add("vnormal","vec3"),t.code.add(r`void main(void) {
vpos = calculateVPos();
vnormal = normalize((viewNormal * vec4(localNormal(), 1.0)).xyz);
gl_Position = transformPosition(proj, view, vpos);
}`),e.include(c,o),a.code.add(r`void main() {
discardBySlice(vpos);
vec3 normal = normalize(vnormal);
if (gl_FrontFacing == false) normal = -normal;
gl_FragColor = vec4(vec3(0.5) + 0.5 * normal, 1.0);
}`);break;case l.Highlight:e.include(s,o),e.include(u,o),e.varyings.add("vnormal","vec3"),t.code.add(r`void main(void) {
vpos = calculateVPos();
gl_Position = transformPosition(proj, view, vpos);
}`),e.include(c,o),e.include(N,o),a.code.add(r`void main() {
discardBySlice(vpos);
outputHighlight();
}`)}return e}const no=Object.freeze(Object.defineProperty({__proto__:null,build:B},Symbol.toStringTag,{value:"Module"}));export{B as F,no as _,lo as p};
