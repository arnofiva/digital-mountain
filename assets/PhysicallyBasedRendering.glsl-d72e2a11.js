import{a as g,b as T}from"./View.glsl-725bf3cf.js";import{o as A}from"./FloatPassUniform-8a52db3d.js";import{a as i,b as m,i as b,n as C}from"./ShaderBuilder-c7fc4a30.js";import{o as M,n as y}from"./vec3-015ca254.js";import{r as u}from"./vec4-c7a19f0d.js";import{n as L}from"./vec4f64-6d0e93be.js";import{e as l}from"./Float4PassUniform-52993952.js";import{a as _}from"./RgbaFloatEncoding.glsl-31b2b966.js";import{a as v,u as f,r as x}from"./Texture2DPassUniform-1510cbb0.js";import{r as z}from"./vec3f32-01c06d8d.js";import{n as N}from"./compilerUtils-2eb56463.js";import{O as p}from"./VertexAttribute-15d1866a.js";import{u as S}from"./Texture2DDrawUniform-d1eaa0d6.js";import"./string-7a2f1d87.js";import"./Error-62cc7aff.js";import"./basicInterfaces-7449a8bf.js";import{t as R}from"./PiUtils.glsl-9dc0973a.js";var c;function $(e,t){switch(t.textureCoordinateType){case c.Default:return e.attributes.add(p.UV0,"vec2"),e.varyings.add("vuv0","vec2"),void e.vertex.code.add(i`void forwardTextureCoordinates() {
vuv0 = uv0;
}`);case c.Compressed:return e.attributes.add(p.UV0,"vec2"),e.varyings.add("vuv0","vec2"),void e.vertex.code.add(i`vec2 getUV0() {
return uv0 / 16384.0;
}
void forwardTextureCoordinates() {
vuv0 = getUV0();
}`);case c.Atlas:return e.attributes.add(p.UV0,"vec2"),e.varyings.add("vuv0","vec2"),e.attributes.add(p.UVREGION,"vec4"),e.varyings.add("vuvRegion","vec4"),void e.vertex.code.add(i`void forwardTextureCoordinates() {
vuv0 = uv0;
vuvRegion = uvRegion;
}`);default:N(t.textureCoordinateType);case c.None:return void e.vertex.code.add(i`void forwardTextureCoordinates() {}`);case c.COUNT:return}}(function(e){e[e.None=0]="None",e[e.Default=1]="Default",e[e.Atlas=2]="Atlas",e[e.Compressed=3]="Compressed",e[e.COUNT=4]="COUNT"})(c||(c={}));function V(e){e.uniforms.add(new g("mainLightDirection",(t,o)=>o.lighting.mainLight.direction))}function O(e){e.uniforms.add(new g("mainLightIntensity",(t,o)=>o.lighting.mainLight.intensity))}function D(e,t){t.useLegacyTerrainShading?e.uniforms.add(new A("lightingFixedFactor",(o,r)=>r.lighting.noonFactor*(1-r.lighting.globalFactor))):e.constants.add("lightingFixedFactor","float",0)}function re(e,t){const o=e.fragment;V(o),O(o),D(o,t),o.code.add(i`vec3 evaluateMainLighting(vec3 normal_global, float shadowing) {
float dotVal = clamp(dot(normal_global, mainLightDirection), 0.0, 1.0);
dotVal = mix(dotVal, 1.0, lightingFixedFactor);
return mainLightIntensity * ((1.0 - shadowing) * dotVal);
}`)}function I(e){e.extensions.add("GL_EXT_shader_texture_lod"),e.extensions.add("GL_OES_standard_derivatives"),e.fragment.code.add(i`#ifndef GL_EXT_shader_texture_lod
float calcMipMapLevel(const vec2 ddx, const vec2 ddy) {
float deltaMaxSqr = max(dot(ddx, ddx), dot(ddy, ddy));
return max(0.0, 0.5 * log2(deltaMaxSqr));
}
#endif
vec4 textureAtlasLookup(sampler2D texture, vec2 textureSize, vec2 textureCoordinates, vec4 atlasRegion) {
vec2 atlasScale = atlasRegion.zw - atlasRegion.xy;
vec2 uvAtlas = fract(textureCoordinates) * atlasScale + atlasRegion.xy;
float maxdUV = 0.125;
vec2 dUVdx = clamp(dFdx(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
vec2 dUVdy = clamp(dFdy(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
#ifdef GL_EXT_shader_texture_lod
return texture2DGradEXT(texture, uvAtlas, dUVdx, dUVdy);
#else
vec2 dUVdxAuto = dFdx(uvAtlas);
vec2 dUVdyAuto = dFdy(uvAtlas);
float mipMapLevel = calcMipMapLevel(dUVdx * textureSize, dUVdy * textureSize);
float autoMipMapLevel = calcMipMapLevel(dUVdxAuto * textureSize, dUVdyAuto * textureSize);
return texture2D(texture, uvAtlas, mipMapLevel - autoMipMapLevel);
#endif
}`)}function P(e,t){switch(e.include($,t),e.fragment.code.add(i`
  struct TextureLookupParameter {
    vec2 uv;
    ${t.supportsTextureAtlas?"vec2 size;":""}
  } vtc;
  `),t.textureCoordinateType){case c.Default:case c.Compressed:return void e.fragment.code.add(i`vec4 textureLookup(sampler2D texture, TextureLookupParameter params) {
return texture2D(texture, params.uv);
}`);case c.Atlas:return e.include(I),void e.fragment.code.add(i`vec4 textureLookup(sampler2D texture, TextureLookupParameter params) {
return textureAtlasLookup(texture, params.size, params.uv, vuvRegion);
}`);default:N(t.textureCoordinateType);case c.None:case c.COUNT:return}}const se=z(0,.6,.2);var d;(function(e){e[e.Disabled=0]="Disabled",e[e.Normal=1]="Normal",e[e.Schematic=2]="Schematic",e[e.Water=3]="Water",e[e.WaterOnIntegratedMesh=4]="WaterOnIntegratedMesh",e[e.Terrain=5]="Terrain",e[e.TerrainWithWater=6]="TerrainWithWater",e[e.COUNT=7]="COUNT"})(d||(d={}));function de(e,t){const o=e.fragment,r=t.hasMetallicRoughnessTexture||t.hasEmissionTexture||t.hasOcclusionTexture;if(t.pbrMode===d.Normal&&r&&e.include(P,t),t.pbrMode!==d.Schematic)if(t.pbrMode!==d.Disabled){if(t.pbrMode===d.Normal){o.code.add(i`vec3 mrr;
vec3 emission;
float occlusion;`);const n=t.supportsTextureAtlas?t.hasWebGL2Context?v.None:v.Size:v.None,a=t.pbrTextureBindType;t.hasMetallicRoughnessTexture&&(o.uniforms.add(a===m.Pass?f("texMetallicRoughness",s=>s.textureMetallicRoughness,n):S("texMetallicRoughness",s=>s.textureMetallicRoughness,n)),o.code.add(i`void applyMetallnessAndRoughness(TextureLookupParameter params) {
vec3 metallicRoughness = textureLookup(texMetallicRoughness, params).rgb;
mrr[0] *= metallicRoughness.b;
mrr[1] *= metallicRoughness.g;
}`)),t.hasEmissionTexture&&(o.uniforms.add(a===m.Pass?f("texEmission",s=>s.textureEmissive,n):S("texEmission",s=>s.textureEmissive,n)),o.code.add(i`void applyEmission(TextureLookupParameter params) {
emission *= textureLookup(texEmission, params).rgb;
}`)),t.hasOcclusionTexture?(o.uniforms.add(a===m.Pass?f("texOcclusion",s=>s.textureOcclusion,n):S("texOcclusion",s=>s.textureOcclusion,n)),o.code.add(i`void applyOcclusion(TextureLookupParameter params) {
occlusion *= textureLookup(texOcclusion, params).r;
}
float getBakedOcclusion() {
return occlusion;
}`)):o.code.add(i`float getBakedOcclusion() { return 1.0; }`),o.uniforms.add(a===m.Pass?[new g("emissionFactor",s=>s.emissiveFactor),new g("mrrFactors",s=>s.mrrFactors)]:[new T("emissionFactor",s=>s.emissiveFactor),new T("mrrFactors",s=>s.mrrFactors)]),o.code.add(i`
    void applyPBRFactors() {
      mrr = mrrFactors;
      emission = emissionFactor;
      occlusion = 1.0;
      ${r?i`vtc.uv = vuv0;`:""}
      ${t.hasMetallicRoughnessTextureTransform?i`vtc.uv = metallicRoughnessUV;`:""}
      ${t.hasMetallicRoughnessTexture?t.supportsTextureAtlas?i`
                vtc.size = ${x(t,"texMetallicRoughness")};
                applyMetallnessAndRoughness(vtc);`:i`applyMetallnessAndRoughness(vtc);`:""}
      ${t.hasEmissiveTextureTransform?i`vtc.uv = emissiveUV;`:""}
      ${t.hasEmissionTexture?t.supportsTextureAtlas?i`
                vtc.size = ${x(t,"texEmission")};
                applyEmission(vtc);`:i`applyEmission(vtc);`:""}
      ${t.hasOcclusionTextureTransform?i`vtc.uv = occlusionUV;`:""}
      ${t.hasOcclusionTexture?t.supportsTextureAtlas?i`
                vtc.size = ${x(t,"texOcclusion")};
                applyOcclusion(vtc);`:i`applyOcclusion(vtc);`:""}
    }
  `)}}else o.code.add(i`float getBakedOcclusion() { return 1.0; }`);else o.code.add(i`vec3 mrr = vec3(0.0, 0.6, 0.2);
vec3 emission = vec3(0.0);
float occlusion = 1.0;
void applyPBRFactors() {}
float getBakedOcclusion() { return 1.0; }`)}function ce(e,t){const o=e.fragment,r=t.lightingSphericalHarmonicsOrder!==void 0?t.lightingSphericalHarmonicsOrder:2;r===0?(o.uniforms.add(new g("lightingAmbientSH0",(n,a)=>M(w,a.lighting.sh.r[0],a.lighting.sh.g[0],a.lighting.sh.b[0]))),o.code.add(i`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec3 ambientLight = 0.282095 * lightingAmbientSH0;
return ambientLight * (1.0 - ambientOcclusion);
}`)):r===1?(o.uniforms.add([new l("lightingAmbientSH_R",(n,a)=>u(h,a.lighting.sh.r[0],a.lighting.sh.r[1],a.lighting.sh.r[2],a.lighting.sh.r[3])),new l("lightingAmbientSH_G",(n,a)=>u(h,a.lighting.sh.g[0],a.lighting.sh.g[1],a.lighting.sh.g[2],a.lighting.sh.g[3])),new l("lightingAmbientSH_B",(n,a)=>u(h,a.lighting.sh.b[0],a.lighting.sh.b[1],a.lighting.sh.b[2],a.lighting.sh.b[3]))]),o.code.add(i`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec4 sh0 = vec4(
0.282095,
0.488603 * normal.x,
0.488603 * normal.z,
0.488603 * normal.y
);
vec3 ambientLight = vec3(
dot(lightingAmbientSH_R, sh0),
dot(lightingAmbientSH_G, sh0),
dot(lightingAmbientSH_B, sh0)
);
return ambientLight * (1.0 - ambientOcclusion);
}`)):r===2&&(o.uniforms.add([new g("lightingAmbientSH0",(n,a)=>M(w,a.lighting.sh.r[0],a.lighting.sh.g[0],a.lighting.sh.b[0])),new l("lightingAmbientSH_R1",(n,a)=>u(h,a.lighting.sh.r[1],a.lighting.sh.r[2],a.lighting.sh.r[3],a.lighting.sh.r[4])),new l("lightingAmbientSH_G1",(n,a)=>u(h,a.lighting.sh.g[1],a.lighting.sh.g[2],a.lighting.sh.g[3],a.lighting.sh.g[4])),new l("lightingAmbientSH_B1",(n,a)=>u(h,a.lighting.sh.b[1],a.lighting.sh.b[2],a.lighting.sh.b[3],a.lighting.sh.b[4])),new l("lightingAmbientSH_R2",(n,a)=>u(h,a.lighting.sh.r[5],a.lighting.sh.r[6],a.lighting.sh.r[7],a.lighting.sh.r[8])),new l("lightingAmbientSH_G2",(n,a)=>u(h,a.lighting.sh.g[5],a.lighting.sh.g[6],a.lighting.sh.g[7],a.lighting.sh.g[8])),new l("lightingAmbientSH_B2",(n,a)=>u(h,a.lighting.sh.b[5],a.lighting.sh.b[6],a.lighting.sh.b[7],a.lighting.sh.b[8]))]),o.code.add(i`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec3 ambientLight = 0.282095 * lightingAmbientSH0;
vec4 sh1 = vec4(
0.488603 * normal.x,
0.488603 * normal.z,
0.488603 * normal.y,
1.092548 * normal.x * normal.y
);
vec4 sh2 = vec4(
1.092548 * normal.y * normal.z,
0.315392 * (3.0 * normal.z * normal.z - 1.0),
1.092548 * normal.x * normal.z,
0.546274 * (normal.x * normal.x - normal.y * normal.y)
);
ambientLight += vec3(
dot(lightingAmbientSH_R1, sh1),
dot(lightingAmbientSH_G1, sh1),
dot(lightingAmbientSH_B1, sh1)
);
ambientLight += vec3(
dot(lightingAmbientSH_R2, sh2),
dot(lightingAmbientSH_G2, sh2),
dot(lightingAmbientSH_B2, sh2)
);
return ambientLight * (1.0 - ambientOcclusion);
}`),t.pbrMode!==d.Normal&&t.pbrMode!==d.Schematic||o.code.add(i`const vec3 skyTransmittance = vec3(0.9, 0.9, 1.0);
vec3 calculateAmbientRadiance(float ambientOcclusion)
{
vec3 ambientLight = 1.2 * (0.282095 * lightingAmbientSH0) - 0.2;
return ambientLight *= (1.0 - ambientOcclusion) * skyTransmittance;
}`))}const w=y(),h=L();class le extends b{constructor(t,o){super(t,"bool",m.Pass,(r,n,a)=>r.setUniform1b(t,o(n,a)))}}let U=class extends b{constructor(t,o){super(t,"int",m.Pass,(r,n,a)=>r.setUniform1i(t,o(n,a)))}};class F extends b{constructor(t,o,r){super(t,"mat4",m.Draw,(n,a,s)=>n.setUniformMatrix4fv(t,o(a,s)),r)}}class G extends b{constructor(t,o,r){super(t,"mat4",m.Pass,(n,a,s)=>n.setUniformMatrix4fv(t,o(a,s)),r)}}let he=class extends C{constructor(){super(...arguments),this.origin=y()}};function ge(e,t){t.receiveShadows&&(e.fragment.uniforms.add(new G("shadowMapMatrix",(o,r)=>r.shadowMap.getShadowMapMatrices(o.origin),4)),H(e,t))}function ve(e,t){t.receiveShadows&&(e.fragment.uniforms.add(new F("shadowMapMatrix",(o,r)=>r.shadowMap.getShadowMapMatrices(o.origin),4)),H(e,t))}function H(e,t){const o=e.fragment;o.include(_),o.uniforms.add([...f("shadowMapTex",(r,n)=>n.shadowMap.depthTexture,t.hasWebGL2Context?v.None:v.Size),new U("numCascades",(r,n)=>n.shadowMap.numCascades),new l("cascadeDistances",(r,n)=>n.shadowMap.cascadeDistances)]),o.code.add(i`
    int chooseCascade(float depth, out mat4 mat) {
      vec4 distance = cascadeDistances;

      // choose correct cascade
      int i = depth < distance[1] ? 0 : depth < distance[2] ? 1 : depth < distance[3] ? 2 : 3;

      mat = i == 0 ? shadowMapMatrix[0] : i == 1 ? shadowMapMatrix[1] : i == 2 ? shadowMapMatrix[2] : shadowMapMatrix[3];

      return i;
    }

    vec3 lightSpacePosition(vec3 _vpos, mat4 mat) {
      vec4 lv = mat * vec4(_vpos, 1.0);
      lv.xy /= lv.w;
      return 0.5 * lv.xyz + vec3(0.5);
    }

    vec2 cascadeCoordinates(int i, vec3 lvpos) {
      return vec2(float(i - 2 * (i / 2)) * 0.5, float(i / 2) * 0.5) + 0.5 * lvpos.xy;
    }

    float readShadowMapDepth(vec2 uv, sampler2D _depthTex) {
      return rgba2float(texture2D(_depthTex, uv));
    }

    float posIsInShadow(vec2 uv, vec3 lvpos, sampler2D _depthTex) {
      return readShadowMapDepth(uv, _depthTex) < lvpos.z ? 1.0 : 0.0;
    }

    float filterShadow(vec2 uv, vec3 lvpos, float textureSize, sampler2D _depthTex) {
      float halfPixelSize = 0.5 / textureSize;

      // filter, offset by half pixels
      vec2 st = fract((vec2(halfPixelSize) + uv) * textureSize);

      float s00 = posIsInShadow(uv + vec2(-halfPixelSize, -halfPixelSize), lvpos, _depthTex);
      float s10 = posIsInShadow(uv + vec2(halfPixelSize, -halfPixelSize), lvpos, _depthTex);
      float s11 = posIsInShadow(uv + vec2(halfPixelSize, halfPixelSize), lvpos, _depthTex);
      float s01 = posIsInShadow(uv + vec2(-halfPixelSize, halfPixelSize), lvpos, _depthTex);

      return mix(mix(s00, s10, st.x), mix(s01, s11, st.x), st.y);
    }

    float readShadowMap(const in vec3 _vpos, float _linearDepth) {
      mat4 mat;
      int i = chooseCascade(_linearDepth, mat);

      if (i >= numCascades) { return 0.0; }

      vec3 lvpos = lightSpacePosition(_vpos, mat);

      // vertex completely outside? -> no shadow
      if (lvpos.z >= 1.0) { return 0.0; }
      if (lvpos.x < 0.0 || lvpos.x > 1.0 || lvpos.y < 0.0 || lvpos.y > 1.0) { return 0.0; }

      // calc coord in cascade texture
      vec2 uv = cascadeCoordinates(i, lvpos);

      vec2 textureSize = ${x(t,"shadowMapTex")};

      return filterShadow(uv, lvpos, textureSize.x, shadowMapTex);
    }
  `)}function k(e){const t=e.fragment.code;t.add(i`vec3 evaluateDiffuseIlluminationHemisphere(vec3 ambientGround, vec3 ambientSky, float NdotNG)
{
return ((1.0 - NdotNG) * ambientGround + (1.0 + NdotNG) * ambientSky) * 0.5;
}`),t.add(i`float integratedRadiance(float cosTheta2, float roughness)
{
return (cosTheta2 - 1.0) / (cosTheta2 * (1.0 - roughness * roughness) - 1.0);
}`),t.add(i`vec3 evaluateSpecularIlluminationHemisphere(vec3 ambientGround, vec3 ambientSky, float RdotNG, float roughness)
{
float cosTheta2 = 1.0 - RdotNG * RdotNG;
float intRadTheta = integratedRadiance(cosTheta2, roughness);
float ground = RdotNG < 0.0 ? 1.0 - intRadTheta : 1.0 + intRadTheta;
float sky = 2.0 - ground;
return (ground * ambientGround + sky * ambientSky) * 0.5;
}`)}function pe(e,t){const o=e.fragment.code;e.include(R),t.pbrMode!==d.Normal&&t.pbrMode!==d.Schematic&&t.pbrMode!==d.Terrain&&t.pbrMode!==d.TerrainWithWater||(o.add(i`float normalDistribution(float NdotH, float roughness)
{
float a = NdotH * roughness;
float b = roughness / (1.0 - NdotH * NdotH + a * a);
return b * b * INV_PI;
}`),o.add(i`const vec4 c0 = vec4(-1.0, -0.0275, -0.572,  0.022);
const vec4 c1 = vec4( 1.0,  0.0425,  1.040, -0.040);
const vec2 c2 = vec2(-1.04, 1.04);
vec2 prefilteredDFGAnalytical(float roughness, float NdotV) {
vec4 r = roughness * c0 + c1;
float a004 = min(r.x * r.x, exp2(-9.28 * NdotV)) * r.x + r.y;
return c2 * a004 + r.zw;
}`)),t.pbrMode!==d.Normal&&t.pbrMode!==d.Schematic||(e.include(k),o.add(i`struct PBRShadingInfo
{
float NdotL;
float NdotV;
float NdotH;
float VdotH;
float LdotH;
float NdotNG;
float RdotNG;
float NdotAmbDir;
float NdotH_Horizon;
vec3 skyRadianceToSurface;
vec3 groundRadianceToSurface;
vec3 skyIrradianceToSurface;
vec3 groundIrradianceToSurface;
float averageAmbientRadiance;
float ssao;
vec3 albedoLinear;
vec3 f0;
vec3 f90;
vec3 diffuseColor;
float metalness;
float roughness;
};`),o.add(i`vec3 evaluateEnvironmentIllumination(PBRShadingInfo inputs) {
vec3 indirectDiffuse = evaluateDiffuseIlluminationHemisphere(inputs.groundIrradianceToSurface, inputs.skyIrradianceToSurface, inputs.NdotNG);
vec3 indirectSpecular = evaluateSpecularIlluminationHemisphere(inputs.groundRadianceToSurface, inputs.skyRadianceToSurface, inputs.RdotNG, inputs.roughness);
vec3 diffuseComponent = inputs.diffuseColor * indirectDiffuse * INV_PI;
vec2 dfg = prefilteredDFGAnalytical(inputs.roughness, inputs.NdotV);
vec3 specularColor = inputs.f0 * dfg.x + inputs.f90 * dfg.y;
vec3 specularComponent = specularColor * indirectSpecular;
return (diffuseComponent + specularComponent);
}`),o.add(i`float gamutMapChanel(float x, vec2 p){
return (x < p.x) ? mix(0.0, p.y, x/p.x) : mix(p.y, 1.0, (x - p.x) / (1.0 - p.x) );
}`),o.add(i`vec3 blackLevelSoftCompression(vec3 inColor, PBRShadingInfo inputs){
vec3 outColor;
vec2 p = vec2(0.02 * (inputs.averageAmbientRadiance), 0.0075 * (inputs.averageAmbientRadiance));
outColor.x = gamutMapChanel(inColor.x, p) ;
outColor.y = gamutMapChanel(inColor.y, p) ;
outColor.z = gamutMapChanel(inColor.z, p) ;
return outColor;
}`))}function fe(e,t){const o=e.fragment.code;e.include(R),o.add(i`
  struct PBRShadingWater
  {
      float NdotL;   // cos angle between normal and light direction
      float NdotV;   // cos angle between normal and view direction
      float NdotH;   // cos angle between normal and half vector
      float VdotH;   // cos angle between view direction and half vector
      float LdotH;   // cos angle between light direction and half vector
      float VdotN;   // cos angle between view direction and normal vector
  };

  float dtrExponent = ${t.useCustomDTRExponentForWater?"2.2":"2.0"};
  `),o.add(i`vec3 fresnelReflection(float angle, vec3 f0, float f90) {
return f0 + (f90 - f0) * pow(1.0 - angle, 5.0);
}`),o.add(i`float normalDistributionWater(float NdotH, float roughness)
{
float r2 = roughness * roughness;
float NdotH2 = NdotH * NdotH;
float denom = pow((NdotH2 * (r2 - 1.0) + 1.0), dtrExponent) * PI;
return r2 / denom;
}`),o.add(i`float geometricOcclusionKelemen(float LoH)
{
return 0.25 / (LoH * LoH);
}`),o.add(i`vec3 brdfSpecularWater(in PBRShadingWater props, float roughness, vec3 F0, float F0Max)
{
vec3  F = fresnelReflection(props.VdotH, F0, F0Max);
float dSun = normalDistributionWater(props.NdotH, roughness);
float V = geometricOcclusionKelemen(props.LdotH);
float diffusionSunHaze = mix(roughness + 0.045, roughness + 0.385, 1.0 - props.VdotH);
float strengthSunHaze  = 1.2;
float dSunHaze = normalDistributionWater(props.NdotH, diffusionSunHaze)*strengthSunHaze;
return ((dSun + dSunHaze) * V) * F;
}
vec3 tonemapACES(const vec3 x) {
return (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
}`)}export{V as a,d as b,O as c,c as d,U as e,P as f,pe as g,ge as h,fe as i,se as j,ce as m,he as n,$ as o,re as r,le as s,I as t,ve as v,de as x};
