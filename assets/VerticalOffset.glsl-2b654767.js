import{r as i}from"./vec4-c7a19f0d.js";import{n as o}from"./vec4f64-6d0e93be.js";import{e as t}from"./Float4PassUniform-52993952.js";import{a as r}from"./ShaderBuilder-c7fc4a30.js";import{c as p}from"./View.glsl-725bf3cf.js";function m(e){e.vertex.code.add(r`float screenSizePerspectiveMinSize(float size, vec4 factor) {
float nonZeroSize = 1.0 - step(size, 0.0);
return (
factor.z * (
1.0 +
nonZeroSize *
2.0 * factor.w / (
size + (1.0 - nonZeroSize)
)
)
);
}`),e.vertex.code.add(r`float screenSizePerspectiveViewAngleDependentFactor(float absCosAngle) {
return absCosAngle * absCosAngle * absCosAngle;
}`),e.vertex.code.add(r`vec4 screenSizePerspectiveScaleFactor(float absCosAngle, float distanceToCamera, vec4 params) {
return vec4(
min(params.x / (distanceToCamera - params.y), 1.0),
screenSizePerspectiveViewAngleDependentFactor(absCosAngle),
params.z,
params.w
);
}`),e.vertex.code.add(r`float applyScreenSizePerspectiveScaleFactorFloat(float size, vec4 factor) {
return max(mix(size * factor.x, size, factor.y), screenSizePerspectiveMinSize(size, factor));
}`),e.vertex.code.add(r`float screenSizePerspectiveScaleFloat(float size, float absCosAngle, float distanceToCamera, vec4 params) {
return applyScreenSizePerspectiveScaleFactorFloat(
size,
screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params)
);
}`),e.vertex.code.add(r`vec2 applyScreenSizePerspectiveScaleFactorVec2(vec2 size, vec4 factor) {
return mix(size * clamp(factor.x, screenSizePerspectiveMinSize(size.y, factor) / max(1e-5, size.y), 1.0), size, factor.y);
}`),e.vertex.code.add(r`vec2 screenSizePerspectiveScaleVec2(vec2 size, float absCosAngle, float distanceToCamera, vec4 params) {
return applyScreenSizePerspectiveScaleFactorVec2(size, screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params));
}`)}function C(e){e.uniforms.add(new t("screenSizePerspective",a=>s(a.screenSizePerspective)))}function z(e){e.uniforms.add(new t("screenSizePerspectiveAlignment",a=>s(a.screenSizePerspectiveAlignment||a.screenSizePerspective)))}function s(e){return i(S,e.parameters.divisor,e.parameters.offset,e.parameters.minPixelSize,e.paddingPixelsOverride)}const S=o();function F(e,a){const c=e.vertex;a.hasVerticalOffset?(g(c),a.hasScreenSizePerspective&&(e.include(m),z(c),p(e.vertex,a)),c.code.add(r`
      vec3 calculateVerticalOffset(vec3 worldPos, vec3 localOrigin) {
        float viewDistance = length((view * vec4(worldPos, 1.0)).xyz);
        ${a.spherical?r`vec3 worldNormal = normalize(worldPos + localOrigin);`:r`vec3 worldNormal = vec3(0.0, 0.0, 1.0);`}
        ${a.hasScreenSizePerspective?r`
            float cosAngle = dot(worldNormal, normalize(worldPos - cameraPosition));
            float verticalOffsetScreenHeight = screenSizePerspectiveScaleFloat(verticalOffset.x, abs(cosAngle), viewDistance, screenSizePerspectiveAlignment);`:r`
            float verticalOffsetScreenHeight = verticalOffset.x;`}
        // Screen sized offset in world space, used for example for line callouts
        float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * viewDistance, verticalOffset.z, verticalOffset.w);
        return worldNormal * worldOffset;
      }

      vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) {
        return worldPos + calculateVerticalOffset(worldPos, localOrigin);
      }
    `)):c.code.add(r`vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) { return worldPos; }`)}const P=o();function g(e){e.uniforms.add(new t("verticalOffset",(a,c)=>{const{minWorldLength:n,maxWorldLength:l,screenLength:f}=a.verticalOffset,v=Math.tan(.5*c.camera.fovY)/(.5*c.camera.fullViewport[3]),d=c.camera.pixelRatio||1;return i(P,f*d,v,n,l)}))}export{F as a,m as c,g as f,z as i,C as t};
