import{d as E}from"./ForwardLinearDepth.glsl-a0929473.js";import{h as d}from"./Matrix3PassUniform-0b3b1bba.js";import{u as m}from"./Slice.glsl-7975394d.js";import{r as M}from"./Transform.glsl-7294c426.js";import{a as A}from"./OutputHighlight.glsl-08aacdf4.js";import{s as w,a as S,c as _,i as z,r as H,m as O,b,v as L}from"./PhysicallyBasedRendering.glsl-32dfb9c7.js";import{n as j}from"./MultipassTerrainTest.glsl-43f42334.js";import{r as y}from"./NormalUtils.glsl-f259fe4a.js";import{a as r,i as $,b as G,o as k}from"./ShaderBuilder-7bfc11d2.js";import{e as N}from"./mat4f64-abdda1bb.js";import{a as V}from"./ReadLinearDepth.glsl-53a01bc1.js";import{e as R,f as p}from"./Texture2DPassUniform-70e1e126.js";import{o as n}from"./FloatPassUniform-e3702139.js";import{e as s,a as F,v as U,c as Z}from"./View.glsl-03db830e.js";import{a as W}from"./mathUtils-5b623c84.js";import{r as u}from"./typedArrayUtil-ce39e5f4.js";import{s as B}from"./Ellipsoid-89682c5e.js";import{n as T}from"./vec3-015ca254.js";import{r as Q}from"./vec2-8acac370.js";import{n as K}from"./vec2f64-f35767d6.js";import{r as X}from"./vec4-c7a19f0d.js";import{n as q}from"./vec4f64-6d0e93be.js";import{e as P}from"./Float4PassUniform-7f3c3ce8.js";import{t as f}from"./AlphaCutoff-96178e0d.js";import{e as J,o as Y}from"./TransparencyPassType-a6b20292.js";import{O as D}from"./VertexAttribute-15d1866a.js";function ee(e){e.fragment.code.add(r`const float GAMMA = 2.2;
const float INV_GAMMA = 0.4545454545;
vec4 delinearizeGamma(vec4 color) {
return vec4(pow(color.rgb, vec3(INV_GAMMA)), color.w);
}
vec3 linearizeGamma(vec3 color) {
return pow(color, vec3(GAMMA));
}`)}var v,h;function Oe(e){return u(e)&&u(e.cubeMap)}function be(e){return u(e)&&!e.running}(function(e){e[e.RENDERING=0]="RENDERING",e[e.FINISHED_RENDERING=1]="FINISHED_RENDERING",e[e.FADING_TEXTURE_CHANNELS=2]="FADING_TEXTURE_CHANNELS",e[e.SWITCH_CHANNELS=3]="SWITCH_CHANNELS",e[e.FINISHED=4]="FINISHED"})(v||(v={})),function(e){e[e.RG=0]="RG",e[e.BA=1]="BA"}(h||(h={}));let Le=class{constructor(){this.readChannels=h.RG,this.renderingStage=v.FINISHED,this.startTime=0,this.startTimeHeightFade=0,this.cameraPositionLastFrame=T(),this.isCameraPositionFinal=!0,this.parallax=new I,this.parallaxNew=new I,this.crossFade={enabled:!1,factor:1,distanceThresholdFactor:.3},this.fadeInOut={stage:l.FINISHED,factor:1,distanceThresholdFactor:.6},this.fadeIn={stage:C.FINISHED,factor:1,distanceThresholdFactor:2},this.fadeInOutHeight={stage:g.FINISHED,factor:-1}}get isFading(){return this.fadeInOut.stage===l.FADE_OUT||this.fadeInOut.stage===l.FADE_IN||this.fadeIn.stage===C.FADE_IN||this.fadeInOutHeight.stage!==g.FINISHED||this.renderingStage===v.FADING_TEXTURE_CHANNELS}};var C,l,g;(function(e){e[e.FINISHED=0]="FINISHED",e[e.CHANGE_ANCHOR=1]="CHANGE_ANCHOR",e[e.FADE_IN=2]="FADE_IN"})(C||(C={})),function(e){e[e.FINISHED=0]="FINISHED",e[e.FADE_OUT=1]="FADE_OUT",e[e.SWITCH=2]="SWITCH",e[e.FADE_IN=3]="FADE_IN"}(l||(l={})),function(e){e[e.FINISHED=0]="FINISHED",e[e.HEIGHT_FADE=1]="HEIGHT_FADE"}(g||(g={}));let I=class{constructor(){this.anchorPointClouds=T(),this.cloudsHeight=1e5,this.radiusCurvatureCorrectionFactor=0,this.transform=N()}};class oe extends ${constructor(o,a){super(o,"samplerCube",G.Pass,(t,i,c)=>t.bindTexture(o,a(i,c)))}}function te(e){const o=e.fragment;o.uniforms.add([new s("rotationMatrixClouds",(a,t)=>t.cloudsFade.parallax.transform),new s("rotationMatrixCloudsCrossFade",(a,t)=>t.cloudsFade.parallaxNew.transform),new F("anchorPosition",(a,t)=>t.cloudsFade.parallax.anchorPointClouds),new F("anchorPositionCrossFade",(a,t)=>t.cloudsFade.parallaxNew.anchorPointClouds),new n("cloudsHeight",(a,t)=>t.cloudsFade.parallax.cloudsHeight),new n("radiusCurvatureCorrectionFactor",(a,t)=>t.cloudsFade.parallax.radiusCurvatureCorrectionFactor),new n("totalFadeInOut",(a,t)=>t.cloudsFade.fadeInOut.stage===l.FINISHED?t.cloudsFade.fadeInOutHeight.factor+1-t.cloudsFade.fadeIn.factor:t.cloudsFade.fadeInOutHeight.factor+1-t.cloudsFade.fadeInOut.factor),new n("crossFadeAnchorFactor",(a,t)=>W(t.cloudsFade.crossFade.factor,0,1)),new oe("cubeMap",(a,t)=>u(t.cloudsFade.data)&&u(t.cloudsFade.data.cubeMap)?t.cloudsFade.data.cubeMap.colorTexture:null),new w("crossFade",(a,t)=>t.cloudsFade.crossFade.enabled),new w("readChannelsRG",(a,t)=>t.cloudsFade.readChannels===h.RG),new w("fadeTextureChannels",(a,t)=>t.cloudsFade.renderingStage===v.FADING_TEXTURE_CHANNELS)]),o.constants.add("planetRadius","float",B.radius),o.code.add(r`vec3 intersectWithCloudLayer(vec3 dir, vec3 cameraPosition, vec3 spherePos)
{
float radiusClouds = planetRadius + cloudsHeight;
float B = 2.0 * dot(cameraPosition, dir);
float C = dot(cameraPosition, cameraPosition) - radiusClouds * radiusClouds;
float det = B * B - 4.0 * C;
float pointIntDist = max(0.0, 0.5 *(-B + sqrt(det)));
vec3 intersectionPont = cameraPosition + dir * pointIntDist;
intersectionPont =  intersectionPont - spherePos;
return intersectionPont;
}`),o.code.add(r`vec3 correctForPlanetCurvature(vec3 dir)
{
dir.z = dir.z*(1.-radiusCurvatureCorrectionFactor) + radiusCurvatureCorrectionFactor;
return dir;
}`),o.code.add(r`vec3 rotateDirectionToAnchorPoint(mat4 rotMat, vec3 inVec)
{
return (rotMat * vec4(inVec, 0.0)).xyz;
}`),S(o),_(o),o.code.add(r`const float SUNSET_TRANSITION_FACTOR = 0.3;
const vec3 RIM_COLOR = vec3(0.28, 0.175, 0.035);
const float RIM_SCATTERING_FACTOR = 140.0;
const float BACKLIGHT_FACTOR = 0.2;
const float BACKLIGHT_SCATTERING_FACTOR = 10.0;
const float BACKLIGHT_TRANSITION_FACTOR = 0.3;
vec3 calculateCloudColor(vec3 cameraPosition, vec3 worldSpaceRay, vec4 clouds)
{
float upDotLight = dot(normalize(cameraPosition), normalize(mainLightDirection));
float dirDotLight = max(dot(normalize(-worldSpaceRay), normalize(mainLightDirection)), 0.0);
float sunsetTransition = clamp(pow(max(upDotLight, 0.0), SUNSET_TRANSITION_FACTOR), 0.0, 1.0);
vec3 ambientLight = calculateAmbientIrradiance(normalize(cameraPosition),  0.0);
vec3 mainLight = evaluateMainLighting(normalize(cameraPosition),  0.0);
vec3 combinedLight = clamp((mainLightIntensity + ambientLight )/PI, vec3(0.0), vec3(1.0));
vec3 baseCloudColor = pow(combinedLight * pow(clouds.xyz, vec3(GAMMA)), vec3(INV_GAMMA));
float scatteringMod = max(clouds.a < 0.5 ? clouds.a / 0.5 : - clouds.a / 0.5 + 2.0, 0.0);
float rimLightIntensity = 0.5 + 0.5 *pow(max(upDotLight, 0.0), 0.35);
vec3 directSunScattering = RIM_COLOR * rimLightIntensity * (pow(dirDotLight, RIM_SCATTERING_FACTOR)) * scatteringMod;
float additionalLight = BACKLIGHT_FACTOR * pow(dirDotLight, BACKLIGHT_SCATTERING_FACTOR) * (1. - pow(sunsetTransition, BACKLIGHT_TRANSITION_FACTOR)) ;
return vec3(baseCloudColor * (1. + additionalLight) + directSunScattering);
}`),o.code.add(r`vec4 getCloudData(vec3 rayDir, bool readOtherChannel)
{
vec4 cloudData = textureCube(cubeMap, rayDir);
float mu = dot(rayDir, vec3(0, 0, 1));
bool readChannels = readChannelsRG ^^ readOtherChannel;
if (readChannels) {
cloudData = vec4(vec3(cloudData.r), cloudData.g);
} else {
cloudData = vec4(vec3(cloudData.b), cloudData.a);
}
if (length(cloudData) == 0.0) {
return vec4(cloudData.rgb, 1.0);
}
return cloudData;
}`),o.code.add(r`vec4 renderCloudsNoFade(vec3 worldRay, vec3 cameraPosition)
{
vec3 intersectionPoint = intersectWithCloudLayer(normalize(worldRay), cameraPosition, anchorPosition);
vec3 worldRayRotated = rotateDirectionToAnchorPoint(rotationMatrixClouds, normalize(intersectionPoint));
vec3 worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
vec4 cloudData = getCloudData(worldRayRotatedCorrected, false);
float totalTransmittance = clamp(cloudData.a * (1.0 - totalFadeInOut) + totalFadeInOut, 0.0 , 1.0);
if (length(cloudData.rgb) == 0.0) {
totalTransmittance = 1.0;
}
return vec4(calculateCloudColor(cameraPosition, normalize(-worldRay), cloudData), totalTransmittance);
}`),o.code.add(r`vec4 renderCloudsCrossFade(vec3 worldRay, vec3 cameraPosition)
{
vec3 intersectionPoint = intersectWithCloudLayer(normalize(worldRay), cameraPosition, anchorPosition);
vec3 worldRayRotated = rotateDirectionToAnchorPoint(rotationMatrixClouds, normalize(intersectionPoint));
vec3 worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
vec4 cloudData = getCloudData(worldRayRotatedCorrected, false);
vec4 cloudColor = vec4(calculateCloudColor(cameraPosition, normalize(-worldRay), cloudData), cloudData.a);
intersectionPoint = intersectWithCloudLayer(normalize(worldRay), cameraPosition, anchorPositionCrossFade);
worldRayRotated = rotateDirectionToAnchorPoint(rotationMatrixCloudsCrossFade, normalize(intersectionPoint));
worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
cloudData = getCloudData(worldRayRotatedCorrected, fadeTextureChannels);
vec4 cloudColorCrossFade = vec4(calculateCloudColor(cameraPosition, normalize(-worldRay), cloudData), cloudData.a);
cloudColor = mix(cloudColor, cloudColorCrossFade, crossFadeAnchorFactor);
float totalTransmittance = clamp(cloudColor.a * (1.0 - totalFadeInOut) + totalFadeInOut, 0.0 , 1.0);
if (length(cloudColor.rgb) == 0.0) {
totalTransmittance = 1.0;
}
return vec4(cloudColor.rgb, totalTransmittance);
}`),o.code.add(r`vec4 renderClouds(vec3 worldRay, vec3 cameraPosition)
{
return crossFade ? renderCloudsCrossFade(worldRay, cameraPosition) : renderCloudsNoFade(worldRay, cameraPosition);
}`)}function ae(e,o){const a=e.fragment;a.include(V),a.uniforms.add(new R("nearFar",(t,i)=>i.camera.nearFar)),a.uniforms.add(new p("depthMap",(t,i)=>i.linearDepthTexture)),a.uniforms.add(new s("proj",(t,i)=>i.ssr.camera.projectionMatrix)),a.uniforms.add(new n("invResolutionHeight",(t,i)=>1/i.ssr.camera.height)),a.uniforms.add(new s("reprojectionMatrix",(t,i)=>i.ssr.reprojectionMatrix)),a.code.add(r`
  vec2 reprojectionCoordinate(vec3 projectionCoordinate)
  {
    vec4 zw = proj * vec4(0.0, 0.0, -projectionCoordinate.z, 1.0);
    vec4 reprojectedCoord = reprojectionMatrix * vec4(zw.w * (projectionCoordinate.xy * 2.0 - 1.0), zw.z, zw.w);
    reprojectedCoord.xy /= reprojectedCoord.w;
    return reprojectedCoord.xy * 0.5 + 0.5;
  }

  const int maxSteps = ${o.highStepCount?"150":"75"};

  vec4 applyProjectionMat(mat4 projectionMat, vec3 x)
  {
    vec4 projectedCoord =  projectionMat * vec4(x, 1.0);
    projectedCoord.xy /= projectedCoord.w;
    projectedCoord.xy = projectedCoord.xy*0.5 + 0.5;
    return projectedCoord;
  }

  vec3 screenSpaceIntersection(vec3 dir, vec3 startPosition, vec3 viewDir, vec3 normal)
  {
    vec3 viewPos = startPosition;
    vec3 viewPosEnd = startPosition;

    // Project the start position to the screen
    vec4 projectedCoordStart = applyProjectionMat(proj, viewPos);
    vec3  Q0 = viewPos / projectedCoordStart.w; // homogeneous camera space
    float k0 = 1.0/ projectedCoordStart.w;

    // advance the position in the direction of the reflection
    viewPos += dir;

    vec4 projectedCoordVanishingPoint = applyProjectionMat(proj, dir);

    // Project the advanced position to the screen
    vec4 projectedCoordEnd = applyProjectionMat(proj, viewPos);
    vec3  Q1 = viewPos / projectedCoordEnd.w; // homogeneous camera space
    float k1 = 1.0/ projectedCoordEnd.w;

    // calculate the reflection direction in the screen space
    vec2 projectedCoordDir = (projectedCoordEnd.xy - projectedCoordStart.xy);
    vec2 projectedCoordDistVanishingPoint = (projectedCoordVanishingPoint.xy - projectedCoordStart.xy);

    float yMod = min(abs(projectedCoordDistVanishingPoint.y), 1.0);

    float projectedCoordDirLength = length(projectedCoordDir);
    float maxSt = float(maxSteps);

    // normalize the projection direction depending on maximum steps
    // this determines how blocky the reflection looks
    vec2 dP = yMod * (projectedCoordDir)/(maxSt * projectedCoordDirLength);

    // Normalize the homogeneous camera space coordinates
    vec3  dQ = yMod * (Q1 - Q0)/(maxSt * projectedCoordDirLength);
    float dk = yMod * (k1 - k0)/(maxSt * projectedCoordDirLength);

    // initialize the variables for ray marching
    vec2 P = projectedCoordStart.xy;
    vec3 Q = Q0;
    float k = k0;
    float rayStartZ = -startPosition.z; // estimated ray start depth value
    float rayEndZ = -startPosition.z;   // estimated ray end depth value
    float prevEstimateZ = -startPosition.z;
    float rayDiffZ = 0.0;
    float dDepth;
    float depth;
    float rayDiffZOld = 0.0;

    // early outs
    if (dot(normal, dir) < 0.0 || dot(-viewDir, normal) < 0.0)
      return vec3(P, 0.0);

    for(int i = 0; i < maxSteps-1; i++)
    {
      depth = -linearDepthFromTexture(depthMap, P, nearFar); // get linear depth from the depth buffer

      // estimate depth of the marching ray
      rayStartZ = prevEstimateZ;
      dDepth = -rayStartZ - depth;
      rayEndZ = (dQ.z * 0.5 + Q.z)/ ((dk * 0.5 + k));
      rayDiffZ = rayEndZ- rayStartZ;
      prevEstimateZ = rayEndZ;

      if(-rayEndZ > nearFar[1] || -rayEndZ < nearFar[0] || P.y < 0.0  || P.y > 1.0 )
      {
        return vec3(P, 0.);
      }

      // If we detect a hit - return the intersection point, two conditions:
      //  - dDepth > 0.0 - sampled point depth is in front of estimated depth
      //  - if difference between dDepth and rayDiffZOld is not too large
      //  - if difference between dDepth and 0.025/abs(k) is not too large
      //  - if the sampled depth is not behind far plane or in front of near plane

      if((dDepth) < 0.025/abs(k) + abs(rayDiffZ) && dDepth > 0.0 && depth > nearFar[0] && depth < nearFar[1] && abs(P.y - projectedCoordStart.y) > invResolutionHeight)
      {
        return vec3(P, depth);
      }

      // continue with ray marching
      P += dP;
      Q.z += dQ.z;
      k += dk;
      rayDiffZOld = rayDiffZ;
    }
    return vec3(P, 0.0);
  }
  `)}let Ge=class{constructor(){this.enabled=!1,this.fadeFactor=1,this.reprojectionMatrix=N()}};function re(e){e.fragment.code.add(r`float normals2FoamIntensity(vec3 n, float waveStrength){
float normalizationFactor =  max(0.015, waveStrength);
return max((n.x + n.y)*0.3303545/normalizationFactor + 0.3303545, 0.0);
}`)}function ie(e){e.fragment.code.add(r`vec3 foamIntensity2FoamColor(float foamIntensityExternal, float foamPixelIntensity, vec3 skyZenitColor, float dayMod){
return foamIntensityExternal * (0.075 * skyZenitColor * pow(foamPixelIntensity, 4.) +  50.* pow(foamPixelIntensity, 23.0)) * dayMod;
}`)}function x(e){e.fragment.uniforms.add(new p("texWaveNormal",o=>o.waveNormal)),e.fragment.uniforms.add(new p("texWavePerturbation",o=>o.wavePertubation)),e.fragment.uniforms.add([new P("waveParams",o=>X(ne,o.waveStrength,o.waveTextureRepeat,o.flowStrength,o.flowOffset)),new R("waveDirection",o=>Q(de,o.waveDirection[0]*o.waveVelocity,o.waveDirection[1]*o.waveVelocity))]),e.include(re),e.fragment.code.add(r`const vec2  FLOW_JUMP = vec2(6.0/25.0, 5.0/24.0);
vec2 textureDenormalized2D(sampler2D _tex, vec2 _uv) {
return 2.0 * texture2D(_tex, _uv).rg - 1.0;
}
float sampleNoiseTexture(vec2 _uv) {
return texture2D(texWavePerturbation, _uv).b;
}
vec3 textureDenormalized3D(sampler2D _tex, vec2 _uv) {
return 2.0 * texture2D(_tex, _uv).rgb - 1.0;
}
float computeProgress(vec2 uv, float time) {
return fract(time);
}
float computeWeight(vec2 uv, float time) {
float progress = computeProgress(uv, time);
return 1.0 - abs(1.0 - 2.0 * progress);
}
vec3 computeUVPerturbedWeigth(sampler2D texFlow, vec2 uv, float time, float phaseOffset) {
float flowStrength = waveParams[2];
float flowOffset = waveParams[3];
vec2 flowVector = textureDenormalized2D(texFlow, uv) * flowStrength;
float progress = computeProgress(uv, time + phaseOffset);
float weight = computeWeight(uv, time + phaseOffset);
vec2 result = uv;
result -= flowVector * (progress + flowOffset);
result += phaseOffset;
result += (time - progress) * FLOW_JUMP;
return vec3(result, weight);
}
const float TIME_NOISE_TEXTURE_REPEAT = 0.3737;
const float TIME_NOISE_STRENGTH = 7.77;
vec3 getWaveLayer(sampler2D _texNormal, sampler2D _dudv, vec2 _uv, vec2 _waveDir, float time) {
float waveStrength = waveParams[0];
vec2 waveMovement = time * -_waveDir;
float timeNoise = sampleNoiseTexture(_uv * TIME_NOISE_TEXTURE_REPEAT) * TIME_NOISE_STRENGTH;
vec3 uv_A = computeUVPerturbedWeigth(_dudv, _uv + waveMovement, time + timeNoise, 0.0);
vec3 uv_B = computeUVPerturbedWeigth(_dudv, _uv + waveMovement, time + timeNoise, 0.5);
vec3 normal_A = textureDenormalized3D(_texNormal, uv_A.xy) * uv_A.z;
vec3 normal_B = textureDenormalized3D(_texNormal, uv_B.xy) * uv_B.z;
vec3 mixNormal = normalize(normal_A + normal_B);
mixNormal.xy *= waveStrength;
mixNormal.z = sqrt(1.0 - dot(mixNormal.xy, mixNormal.xy));
return mixNormal;
}
vec4 getSurfaceNormalAndFoam(vec2 _uv, float _time) {
float waveTextureRepeat = waveParams[1];
vec3 normal = getWaveLayer(texWaveNormal, texWavePerturbation, _uv * waveTextureRepeat, waveDirection, _time);
float foam  = normals2FoamIntensity(normal, waveParams[0]);
return vec4(normal, foam);
}`)}const ne=q(),de=K();function ce(e,o){e.include(z,o),e.include(ee),e.include(ie),o.hasCloudsReflections&&e.include(te,o),o.hasScreenSpaceReflections&&e.include(ae,o);const a=e.fragment;a.constants.add("fresnelSky","vec3",[.02,1,15]).add("fresnelMaterial","vec2",[.02,.1]).add("roughness","float",.015).add("foamIntensityExternal","float",1.7).add("ssrIntensity","float",.65).add("ssrHeightFadeStart","float",3e5).add("ssrHeightFadeEnd","float",5e5).add("waterDiffusion","float",.92).add("waterSeaColorMod","float",.8).add("correctionViewingPowerFactor","float",.4).add("skyZenitColor","vec3",[.52,.68,.9]).add("skyColor","vec3",[.67,.79,.9]).add("cloudFresnelModifier","vec2",[1.2,.01]),a.code.add(r`PBRShadingWater shadingInfo;
vec3 getSkyGradientColor(in float cosTheta, in vec3 horizon, in vec3 zenit) {
float exponent = pow((1.0 - cosTheta), fresnelSky[2]);
return mix(zenit, horizon, exponent);
}`),a.uniforms.add([new n("lightingSpecularStrength",(t,i)=>i.lighting.mainLight.specularStrength),new n("lightingEnvironmentStrength",(t,i)=>i.lighting.mainLight.environmentStrength)]),a.code.add(r`vec3 getSeaColor(in vec3 n, in vec3 v, in vec3 l, vec3 color, in vec3 lightIntensity, in vec3 localUp, in float shadow, float foamIntensity, vec3 viewPosition, vec3 position) {
float reflectionHit = 0.0;
float reflectionHitDiffused = 0.0;
vec3 seaWaterColor = linearizeGamma(color);
vec3 h = normalize(l + v);
shadingInfo.NdotL = clamp(dot(n, l), 0.0, 1.0);
shadingInfo.NdotV = clamp(dot(n, v), 0.001, 1.0);
shadingInfo.VdotN = clamp(dot(v, n), 0.001, 1.0);
shadingInfo.NdotH = clamp(dot(n, h), 0.0, 1.0);
shadingInfo.VdotH = clamp(dot(v, h), 0.0, 1.0);
shadingInfo.LdotH = clamp(dot(l, h), 0.0, 1.0);
float upDotV = max(dot(localUp,v), 0.0);
vec3 skyHorizon = linearizeGamma(skyColor);
vec3 skyZenit = linearizeGamma(skyZenitColor);
vec3 skyColor = getSkyGradientColor(upDotV, skyHorizon, skyZenit );
float upDotL = max(dot(localUp,l),0.0);
float daytimeMod = 0.1 + upDotL * 0.9;
skyColor *= daytimeMod;
float shadowModifier = clamp(shadow, 0.8, 1.0);
vec3 fresnelModifier = fresnelReflection(shadingInfo.VdotN, vec3(fresnelSky[0]), fresnelSky[1]);
vec3 reflSky = lightingEnvironmentStrength * fresnelModifier * skyColor * shadowModifier;
vec3 reflSea = seaWaterColor * mix(skyColor, upDotL * lightIntensity * LIGHT_NORMALIZATION, 2.0 / 3.0) * shadowModifier;
vec3 specular = vec3(0.0);
if(upDotV > 0.0 && upDotL > 0.0) {
vec3 specularSun = brdfSpecularWater(shadingInfo, roughness, vec3(fresnelMaterial[0]), fresnelMaterial[1]);
vec3 incidentLight = lightIntensity * LIGHT_NORMALIZATION * shadow;
specular = lightingSpecularStrength * shadingInfo.NdotL * incidentLight * specularSun;
}
vec3 foam = vec3(0.0);
if(upDotV > 0.0) {
foam = foamIntensity2FoamColor(foamIntensityExternal, foamIntensity, skyZenitColor, daytimeMod);
}
float correctionViewingFactor = pow(max(dot(v, localUp), 0.0), correctionViewingPowerFactor);
vec3 normalCorrectedClouds = mix(localUp, n, correctionViewingFactor);
vec3 reflectedWorld = normalize(reflect(-v, normalCorrectedClouds));`),o.hasCloudsReflections&&a.code.add(r`vec4 cloudsColor = renderClouds(reflectedWorld, position);
cloudsColor.a = 1.0 - cloudsColor.a;
cloudsColor = pow(cloudsColor, vec4(GAMMA));
cloudsColor *= clamp(fresnelModifier.y*cloudFresnelModifier[0] - cloudFresnelModifier[1], 0.0, 1.0) * clamp((1.0 - totalFadeInOut), 0.0, 1.0);`),o.hasScreenSpaceReflections?(a.uniforms.add([new s("view",(t,i)=>i.ssr.camera.viewMatrix),new p("lastFrameColorTexture",(t,i)=>i.ssr.lastFrameColorTexture),new n("fadeFactor",(t,i)=>i.ssr.fadeFactor)]),a.code.add(r`vec3 viewDir = normalize(viewPosition);
vec4 viewNormalVectorCoordinate = view *vec4(n, 0.0);
vec3 viewNormal = normalize(viewNormalVectorCoordinate.xyz);
vec4 viewUp = view * vec4(localUp, 0.0);
vec3 viewNormalCorrectedSSR = mix(viewUp.xyz, viewNormal, correctionViewingFactor);
vec3 reflected = normalize(reflect(viewDir, viewNormalCorrectedSSR));
vec3 hitCoordinate = screenSpaceIntersection(reflected, viewPosition, viewDir, viewUp.xyz);
vec3 reflectedColor = vec3(0.0);
if (hitCoordinate.z > 0.0)
{
vec2 reprojectedCoordinate = reprojectionCoordinate(hitCoordinate);
vec2 dCoords = smoothstep(0.3, 0.6, abs(vec2(0.5, 0.5) - hitCoordinate.xy));
float heightMod = smoothstep(ssrHeightFadeEnd, ssrHeightFadeStart, -viewPosition.z);
reflectionHit = clamp(1.0 - (1.3 * dCoords.y), 0.0, 1.0) * heightMod * fadeFactor;
reflectionHitDiffused = waterDiffusion * reflectionHit;
reflectedColor = linearizeGamma(texture2D(lastFrameColorTexture, reprojectedCoordinate).xyz) *
reflectionHitDiffused * fresnelModifier.y * ssrIntensity;
}
float seaColorMod =  mix(waterSeaColorMod, waterSeaColorMod * 0.5, reflectionHitDiffused);
vec3 waterRenderedColor = tonemapACES((1.0 - reflectionHitDiffused) * reflSky + reflectedColor +
reflSea * seaColorMod + specular + foam);`)):a.code.add(r`vec3 waterRenderedColor = tonemapACES(reflSky + reflSea * waterSeaColorMod + specular + foam);`),o.hasCloudsReflections?o.hasScreenSpaceReflections?a.code.add(r`return waterRenderedColor * (1.0 - (1.0 - reflectionHit) * cloudsColor.a) + (1.0 - reflectionHit) * cloudsColor.xyz;
}`):a.code.add(r`return waterRenderedColor * (1.0 - cloudsColor.a) + cloudsColor.xyz;
}`):a.code.add(r`return waterRenderedColor;
}`)}function le(e){const o=new k,{vertex:a,fragment:t}=o;U(a,e),o.include(M,e),o.attributes.add(D.POSITION,"vec3"),o.attributes.add(D.UV0,"vec2");const i=new P("waterColor",c=>c.color);if(e.output===d.Color&&e.isDraped)return o.varyings.add("vpos","vec3"),a.uniforms.add(i),a.code.add(r`
        void main(void) {
          if (waterColor.a < ${r.float(f)}) {
            // Discard this vertex
            gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
            return;
          }

          vpos = position;
          gl_Position = transformPosition(proj, view, vpos);
        }
    `),t.uniforms.add(i),t.code.add(r`void main() {
gl_FragColor = waterColor;
}`),o;switch(e.output!==d.Color&&e.output!==d.Alpha||(o.include(y,e),o.include(E,e),o.varyings.add("vuv","vec2"),o.varyings.add("vpos","vec3"),o.varyings.add("vnormal","vec3"),o.varyings.add("vtbnMatrix","mat3"),e.hasMultipassTerrain&&o.varyings.add("depth","float"),a.uniforms.add(i),a.code.add(r`
      void main(void) {
        if (waterColor.a < ${r.float(f)}) {
          // Discard this vertex
          gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
          return;
        }

        vuv = uv0;
        vpos = position;

        vnormal = getLocalUp(vpos, localOrigin);
        vtbnMatrix = getTBNMatrix(vnormal);

        ${e.hasMultipassTerrain?"depth = (view * vec4(vpos, 1.0)).z;":""}

        gl_Position = transformPosition(proj, view, vpos);
        ${e.output===d.Color?"forwardLinearDepth();":""}
      }
    `)),o.include(j,e),e.output){case d.Alpha:o.include(m,e),t.uniforms.add(i),t.code.add(r`
        void main() {
          discardBySlice(vpos);
          ${e.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}

          gl_FragColor = vec4(waterColor.a);
        }
      `);break;case d.Color:o.include(H,e),o.include(O,{pbrMode:b.Disabled,lightingSphericalHarmonicsOrder:2}),o.include(x),o.include(m,e),o.include(L,e),o.include(ce,e),t.uniforms.add([i,new n("timeElapsed",c=>c.timeElapsed),a.uniforms.get("view"),a.uniforms.get("localOrigin")]),Z(t,e),t.include(J),S(t),_(t),t.code.add(r`
      void main() {
        discardBySlice(vpos);
        ${e.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}
        vec3 localUp = vnormal;
        // the created normal is in tangent space
        vec4 tangentNormalFoam = getSurfaceNormalAndFoam(vuv, timeElapsed);

        // we rotate the normal according to the tangent-bitangent-normal-Matrix
        vec3 n = normalize(vtbnMatrix * tangentNormalFoam.xyz);
        vec3 v = -normalize(vpos - cameraPosition);
        float shadow = ${e.receiveShadows?r`1.0 - readShadowMap(vpos, linearDepth)`:"1.0"};
        vec4 vPosView = view * vec4(vpos, 1.0);
        vec4 final = vec4(getSeaColor(n, v, mainLightDirection, waterColor.rgb, mainLightIntensity, localUp, shadow, tangentNormalFoam.w, vPosView.xyz, vpos + localOrigin), waterColor.w);

        // gamma correction
        gl_FragColor = delinearizeGamma(final);
        gl_FragColor = highlightSlice(gl_FragColor, vpos);
        ${e.transparencyPassType===Y.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
      }
    `);break;case d.Normal:o.include(y,e),o.include(x,e),o.include(m,e),o.varyings.add("vpos","vec3"),o.varyings.add("vuv","vec2"),a.uniforms.add(i),a.code.add(r`
        void main(void) {
          if (waterColor.a < ${r.float(f)}) {
            // Discard this vertex
            gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
            return;
          }

          vuv = uv0;
          vpos = position;

          gl_Position = transformPosition(proj, view, vpos);
        }
    `),t.uniforms.add(new n("timeElapsed",c=>c.timeElapsed)),t.code.add(r`void main() {
discardBySlice(vpos);
vec4 tangentNormalFoam = getSurfaceNormalAndFoam(vuv, timeElapsed);
tangentNormalFoam.xyz = normalize(tangentNormalFoam.xyz);
gl_FragColor = vec4((tangentNormalFoam.xyz + vec3(1.0)) * 0.5, tangentNormalFoam.w);
}`);break;case d.Highlight:o.include(A,e),o.varyings.add("vpos","vec3"),a.uniforms.add(i),a.code.add(r`
      void main(void) {
        if (waterColor.a < ${r.float(f)}) {
          // Discard this vertex
          gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
          return;
        }

        vpos = position;
        gl_Position = transformPosition(proj, view, vpos);
      }
    `),o.include(m,e),t.code.add(r`void main() {
discardBySlice(vpos);
outputHighlight();
}`)}return o}const Ve=Object.freeze(Object.defineProperty({__proto__:null,build:le},Symbol.toStringTag,{value:"Module"}));export{v as E,h as I,le as P,be as R,Ve as _,l as a,Oe as b,Ge as c,ce as d,ee as e,Le as i,g as n,C as r,te as v};
