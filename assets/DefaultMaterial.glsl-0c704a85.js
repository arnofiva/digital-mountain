import{r as l}from"./typedArrayUtil-70e1d79e.js";import{o as N}from"./mat4f64-abdda1bb.js";import{a as V,d as S}from"./ForwardLinearDepth.glsl-3606f02d.js";import{p as _,i as A,a as m,h as E,d as F,j as P,s as f,b as T,k as U}from"./MixExternalColor.glsl-96fc9ef8.js";import{e as d,h as u}from"./Matrix3PassUniform-285be0f9.js";import{u as g}from"./Slice.glsl-e5fdd8d3.js";import{r as z}from"./Transform.glsl-e6366353.js";import{d as L,f as R,o as B,h as D,v as j,x as G,g as W,c as I,b as x}from"./PhysicallyBasedRendering.glsl-d72e2a11.js";import{e as k}from"./VertexColor.glsl-e2eb2da5.js";import{a as H}from"./VerticalOffset.glsl-2b654767.js";import{i as X,e as q}from"./Normals.glsl-81bc0899.js";import{a as p,u as Y,r as Z,f as h}from"./Texture2DPassUniform-1510cbb0.js";import{a,b as J,o as K}from"./ShaderBuilder-c7fc4a30.js";import{u as Q}from"./Texture2DDrawUniform-d1eaa0d6.js";import{O as w}from"./VertexAttribute-15d1866a.js";import{p as ee,d as oe,f as ae,u as re}from"./EvaluateSceneLighting.glsl-ed7fcdc2.js";import{n as y}from"./MultipassTerrainTest.glsl-029ffa3f.js";import{s as te}from"./VisualVariables.glsl-655a358f.js";import{t as ne}from"./AlphaCutoff-96178e0d.js";import{v as ie,c as $,e as se,a as C}from"./View.glsl-725bf3cf.js";import{e as le}from"./Float4PassUniform-52993952.js";import{o as v}from"./FloatPassUniform-8a52db3d.js";import{o as ce}from"./TransparencyPassType-a1cb0602.js";function de(e,o){const n=e.fragment;if(o.hasVertexTangents?(e.attributes.add(w.TANGENT,"vec4"),e.varyings.add("vTangent","vec4"),o.doubleSidedMode===X.WindingOrder?n.code.add(a`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = gl_FrontFacing ? vTangent.w : -vTangent.w;
vec3 tangent = normalize(gl_FrontFacing ? vTangent.xyz : -vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`):n.code.add(a`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = vTangent.w;
vec3 tangent = normalize(vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`)):(e.extensions.add("GL_OES_standard_derivatives"),n.code.add(a`mat3 computeTangentSpace(vec3 normal, vec3 pos, vec2 st) {
vec3 Q1 = dFdx(pos);
vec3 Q2 = dFdy(pos);
vec2 stx = dFdx(st);
vec2 sty = dFdy(st);
float det = stx.t * sty.s - sty.t * stx.s;
vec3 T = stx.t * Q2 - sty.t * Q1;
T = T - normal * dot(normal, T);
T *= inversesqrt(max(dot(T,T), 1.e-10));
vec3 B = sign(det) * cross(normal, T);
return mat3(T, B, normal);
}`)),o.textureCoordinateType!==L.None){e.include(R,o);const t=o.supportsTextureAtlas?o.hasWebGL2Context?p.None:p.Size:p.None;n.uniforms.add(o.pbrTextureBindType===J.Pass?Y("normalTexture",i=>i.textureNormal,t):Q("normalTexture",i=>i.textureNormal,t)),n.code.add(a`
    vec3 computeTextureNormal(mat3 tangentSpace, vec2 uv) {
      vtc.uv = uv;
      ${o.supportsTextureAtlas?a`vtc.size = ${Z(o,"normalTexture")};`:""}
      vec3 rawNormal = textureLookup(normalTexture, vtc).rgb * 2.0 - 1.0;
      return tangentSpace * rawNormal;
    }
  `)}}function c(){const e=new Float32Array(9);return e[0]=1,e[4]=1,e[8]=1,e}function me(e){const o=new Float32Array(9);return o[0]=e[0],o[1]=e[1],o[2]=e[2],o[3]=e[3],o[4]=e[4],o[5]=e[5],o[6]=e[6],o[7]=e[7],o[8]=e[8],o}function ue(e,o,n,t,i,r,b,M,O){const s=new Float32Array(9);return s[0]=e,s[1]=o,s[2]=n,s[3]=t,s[4]=i,s[5]=r,s[6]=b,s[7]=M,s[8]=O,s}function ve(e,o){return new Float32Array(e,o,9)}Object.freeze(Object.defineProperty({__proto__:null,clone:me,create:c,createView:ve,fromValues:ue},Symbol.toStringTag,{value:"Module"}));function xe(e){e.vertex.uniforms.add(new d("colorTextureTransformMatrix",o=>l(o.colorTextureTransformMatrix)?o.colorTextureTransformMatrix:c())),e.varyings.add("colorUV","vec2"),e.vertex.code.add(a`void forwardColorUV(){
colorUV = (colorTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)}function pe(e){e.vertex.uniforms.add(new d("normalTextureTransformMatrix",o=>l(o.normalTextureTransformMatrix)?o.normalTextureTransformMatrix:c())),e.varyings.add("normalUV","vec2"),e.vertex.code.add(a`void forwardNormalUV(){
normalUV = (normalTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)}function fe(e){e.vertex.uniforms.add(new d("emissiveTextureTransformMatrix",o=>l(o.emissiveTextureTransformMatrix)?o.emissiveTextureTransformMatrix:c())),e.varyings.add("emissiveUV","vec2"),e.vertex.code.add(a`void forwardEmissiveUV(){
emissiveUV = (emissiveTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)}function Te(e){e.vertex.uniforms.add(new d("occlusionTextureTransformMatrix",o=>l(o.occlusionTextureTransformMatrix)?o.occlusionTextureTransformMatrix:c())),e.varyings.add("occlusionUV","vec2"),e.vertex.code.add(a`void forwardOcclusionUV(){
occlusionUV = (occlusionTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)}function ge(e){e.vertex.uniforms.add(new d("metallicRoughnessTextureTransformMatrix",o=>l(o.metallicRoughnessTextureTransformMatrix)?o.metallicRoughnessTextureTransformMatrix:c())),e.varyings.add("metallicRoughnessUV","vec2"),e.vertex.code.add(a`void forwardMetallicRoughnessUV(){
metallicRoughnessUV = (metallicRoughnessTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)}function he(e){const o=new K,{vertex:n,fragment:t,varyings:i}=o;return ie(n,e),o.include(V),i.add("vpos","vec3"),o.include(te,e),o.include(_,e),o.include(H,e),e.hasColorTextureTransform&&o.include(xe),e.output!==u.Color&&e.output!==u.Alpha||(e.hasNormalTextureTransform&&o.include(pe),e.hasEmissionTextureTransform&&o.include(fe),e.hasOcclusionTextureTransform&&o.include(Te),e.hasMetallicRoughnessTextureTransform&&o.include(ge),$(n,e),o.include(A,e),o.include(z,e),e.normalType===m.Attribute&&e.offsetBackfaces&&o.include(E),o.include(de,e),o.include(F,e),e.instancedColor&&o.attributes.add(w.INSTANCECOLOR,"vec4"),i.add("localvpos","vec3"),o.include(B,e),o.include(S,e),o.include(P,e),o.include(k,e),n.uniforms.add(new le("externalColor",r=>r.externalColor)),i.add("vcolorExt","vec4"),e.hasMultipassTerrain&&i.add("depth","float"),e.hasModelTransformation&&n.uniforms.add(new se("model",r=>l(r.modelTransformation)?r.modelTransformation:N)),n.code.add(a`
      void main(void) {
        forwardNormalizedVertexColor();
        vcolorExt = externalColor;
        ${e.instancedColor?"vcolorExt *= instanceColor;":""}
        vcolorExt *= vvColor();
        vcolorExt *= getSymbolColor();
        forwardColorMixMode();

        if (vcolorExt.a < ${a.float(ne)}) {
          gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
        } else {
          vpos = calculateVPos();
          localvpos = vpos - view[3].xyz;
          vpos = subtractOrigin(vpos);
          ${e.normalType===m.Attribute?a`vNormalWorld = dpNormal(vvLocalNormal(normalModel()));`:""}
          vpos = addVerticalOffset(vpos, localOrigin);
          ${e.hasVertexTangents?"vTangent = dpTransformVertexTangent(tangent);":""}
          gl_Position = transformPosition(proj, view, ${e.hasModelTransformation?"model,":""} vpos);
          ${e.normalType===m.Attribute&&e.offsetBackfaces?"gl_Position = offsetBackfacingClipPosition(gl_Position, vpos, vNormalWorld, cameraPosition);":""}
        }

        ${e.hasMultipassTerrain?"depth = (view * vec4(vpos, 1.0)).z;":""}
        forwardLinearDepth();
        forwardTextureCoordinates();
        ${e.hasColorTextureTransform?a`forwardColorUV();`:""}
        ${e.hasNormalTextureTransform?a`forwardNormalUV();`:""}
        ${e.hasEmissionTextureTransform?a`forwardEmissiveUV();`:""}
        ${e.hasOcclusionTextureTransform?a`forwardOcclusionUV();`:""}
        ${e.hasMetallicRoughnessTextureTransform?a`forwardMetallicRoughnessUV();`:""}
      }
    `)),e.output===u.Alpha&&(o.include(g,e),o.include(f,e),o.include(y,e),t.uniforms.add([new v("opacity",r=>r.opacity),new v("layerOpacity",r=>r.layerOpacity)]),e.hasColorTexture&&t.uniforms.add(new h("tex",r=>r.texture)),t.include(T),t.code.add(a`
      void main() {
        discardBySlice(vpos);
        ${e.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}
        ${e.hasColorTexture?a`
                vec4 texColor = texture2D(tex, ${e.hasColorTextureTransform?a`colorUV`:a`vuv0`});
                ${e.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
                discardOrAdjustAlpha(texColor);`:a`vec4 texColor = vec4(1.0);`}
        ${e.hasVertexColors?a`float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:a`float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));`}
        gl_FragColor = vec4(opacity_);
      }
    `)),e.output===u.Color&&(o.include(g,e),o.include(ee,e),o.include(oe,e),o.include(f,e),o.include(e.instancedDoublePrecision?D:j,e),o.include(y,e),$(t,e),t.uniforms.add([n.uniforms.get("localOrigin"),new C("ambient",r=>r.ambient),new C("diffuse",r=>r.diffuse),new v("opacity",r=>r.opacity),new v("layerOpacity",r=>r.layerOpacity)]),e.hasColorTexture&&t.uniforms.add(new h("tex",r=>r.texture)),o.include(G,e),o.include(W,e),t.include(T),o.include(q,e),ae(t),re(t),I(t),t.code.add(a`
      void main() {
        discardBySlice(vpos);
        ${e.hasMultipassTerrain?"terrainDepthTest(gl_FragCoord, depth);":""}
        ${e.hasColorTexture?a`
                vec4 texColor = texture2D(tex, ${e.hasColorTextureTransform?a`colorUV`:a`vuv0`});
                ${e.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
                discardOrAdjustAlpha(texColor);`:a`vec4 texColor = vec4(1.0);`}
        shadingParams.viewDirection = normalize(vpos - cameraPosition);
        ${e.normalType===m.ScreenDerivative?a`
                vec3 normal = screenDerivativeNormal(localvpos);`:a`
                shadingParams.normalView = vNormalWorld;
                vec3 normal = shadingNormal(shadingParams);`}
        ${e.pbrMode===x.Normal?"applyPBRFactors();":""}
        float ssao = evaluateAmbientOcclusionInverse();
        ssao *= getBakedOcclusion();

        vec3 posWorld = vpos + localOrigin;

        float additionalAmbientScale = additionalDirectedAmbientLight(posWorld);
        float shadow = ${e.receiveShadows?"readShadowMap(vpos, linearDepth)":e.spherical?"lightingGlobalFactor * (1.0 - additionalAmbientScale)":"0.0"};

        vec3 matColor = max(ambient, diffuse);
        ${e.hasVertexColors?a`
                vec3 albedo = mixExternalColor(vColor.rgb * matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
                float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:a`
                vec3 albedo = mixExternalColor(matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
                float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));`}
        ${e.hasNormalTexture?a`
                mat3 tangentSpace = ${e.hasVertexTangents?"computeTangentSpace(normal);":"computeTangentSpace(normal, vpos, vuv0);"}
                vec3 shadingNormal = computeTextureNormal(tangentSpace, vuv0);`:a`vec3 shadingNormal = normal;`}
        vec3 normalGround = ${e.spherical?a`normalize(posWorld);`:a`vec3(0.0, 0.0, 1.0);`}

        ${e.snowCover?a`
                float snow = smoothstep(0.5, 0.55, dot(normal, normalGround));
                albedo = mix(albedo, vec3(1), snow);
                shadingNormal = mix(shadingNormal, normal, snow);
                ssao = mix(ssao, 1.0, snow);`:""}

        vec3 additionalLight = ssao * mainLightIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;

        ${e.pbrMode===x.Normal||e.pbrMode===x.Schematic?a`
                float additionalAmbientIrradiance = additionalAmbientIrradianceFactor * mainLightIntensity[2];
                ${e.snowCover?a`
                        mrr = mix(mrr, vec3(0.0, 1.0, 0.04), snow);
                        emission = mix(emission, vec3(0.0), snow);`:""}

                vec3 shadedColor = evaluateSceneLightingPBR(shadingNormal, albedo, shadow, 1.0 - ssao, additionalLight, shadingParams.viewDirection, normalGround, mrr, emission, additionalAmbientIrradiance);`:a`vec3 shadedColor = evaluateSceneLighting(shadingNormal, albedo, shadow, 1.0 - ssao, additionalLight);`}
        gl_FragColor = highlightSlice(vec4(shadedColor, opacity_), vpos);
        ${e.transparencyPassType===ce.Color?a`gl_FragColor = premultiplyAlpha(gl_FragColor);`:""}
      }
    `)),o.include(U,e),o}const We=Object.freeze(Object.defineProperty({__proto__:null,build:he},Symbol.toStringTag,{value:"Module"}));export{he as Q,We as X,de as c,c as e,me as r,ue as t};
