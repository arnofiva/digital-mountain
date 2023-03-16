import{a as r,i as D,b as P}from"./ShaderBuilder-c7fc4a30.js";import{e as O}from"./JSONSupport-32b5ad86.js";import{o as b,n as V}from"./vec3-015ca254.js";import{e as I,h as n}from"./Matrix3PassUniform-285be0f9.js";import{F as S,o as k,W as z,c as _,b as L,i as W}from"./ForwardLinearDepth.glsl-3606f02d.js";import{b as $,d as G,e as j,v as f}from"./View.glsl-725bf3cf.js";import{r as F,t as R}from"./ShaderTechniqueConfiguration-5b4afc58.js";import{O as u}from"./VertexAttribute-15d1866a.js";import{r as s}from"./symbolColorUtils-7c94928f.js";import{e as E,o as x}from"./PhysicallyBasedRendering.glsl-d72e2a11.js";import{m as B}from"./VisualVariablePassParameters-ded3d86d.js";import{r as H}from"./typedArrayUtil-70e1d79e.js";import{o as U}from"./mat4f64-abdda1bb.js";import{u as h}from"./Slice.glsl-e5fdd8d3.js";import{r as M}from"./Transform.glsl-e6366353.js";import{n as w}from"./compilerUtils-2eb56463.js";import{d as q}from"./ObjectAndLayerIdColor.glsl-751e40ac.js";import{e as A}from"./mat3f64-50f3b9f6.js";import{n as X}from"./vec4f64-6d0e93be.js";import{o as Y}from"./OutputDepth.glsl-ccbc6366.js";import{a as J}from"./OutputHighlight.glsl-569dde3f.js";import{s as C}from"./VisualVariables.glsl-655a358f.js";import{d as K}from"./DiscardOrAdjustAlphaBlend.glsl-27b032af.js";import{o as Q}from"./FloatPassUniform-8a52db3d.js";import{u as m}from"./basicInterfaces-7449a8bf.js";import{f as g}from"./Texture2DPassUniform-1510cbb0.js";import{e as Z}from"./TransparencyPassType-a1cb0602.js";function zo(o,e,a){for(let t=0;t<a;++t)e[2*t]=o[t],e[2*t+1]=o[t]-e[2*t]}function oo(o,e){const a=o.length;for(let t=0;t<a;++t)v[0]=o[t],e[t]=v[0];return e}function eo(o,e){const a=o.length;for(let t=0;t<a;++t)v[0]=o[t],v[1]=o[t]-v[0],e[t]=v[1];return e}const v=new Float32Array(2);function ro(o){const e=r`vec3 decodeNormal(vec2 f) {
float z = 1.0 - abs(f.x) - abs(f.y);
return vec3(f + sign(f) * min(z, 0.0), z);
}`;o.vertex.code.add(e)}function N(o,e){switch(e.normalType){case l.CompressedAttribute:o.include(ro),o.attributes.add(u.NORMALCOMPRESSED,"vec2"),o.vertex.code.add(r`vec3 normalModel() {
return decodeNormal(normalCompressed);
}`);break;case l.Attribute:o.attributes.add(u.NORMAL,"vec3"),o.vertex.code.add(r`vec3 normalModel() {
return normal;
}`);break;case l.ScreenDerivative:o.extensions.add("GL_OES_standard_derivatives"),o.fragment.code.add(r`vec3 screenDerivativeNormal(vec3 positionView) {
return normalize(cross(dFdx(positionView), dFdy(positionView)));
}`);break;default:w(e.normalType);case l.COUNT:case l.Ground:}}var l;(function(o){o[o.Attribute=0]="Attribute",o[o.CompressedAttribute=1]="CompressedAttribute",o[o.Ground=2]="Ground",o[o.ScreenDerivative=3]="ScreenDerivative",o[o.COUNT=4]="COUNT"})(l||(l={}));function ao(o,e){switch(e.normalType){case l.Attribute:case l.CompressedAttribute:o.include(N,e),o.varyings.add("vNormalWorld","vec3"),o.varyings.add("vNormalView","vec3"),o.vertex.uniforms.add([new k("transformNormalGlobalFromModel",a=>a.transformNormalGlobalFromModel),new I("transformNormalViewFromGlobal",a=>a.transformNormalViewFromGlobal)]),o.vertex.code.add(r`void forwardNormal() {
vNormalWorld = transformNormalGlobalFromModel * normalModel();
vNormalView = transformNormalViewFromGlobal * vNormalWorld;
}`);break;case l.Ground:o.include(S,e),o.varyings.add("vNormalWorld","vec3"),o.vertex.code.add(r`
        void forwardNormal() {
          vNormalWorld = ${e.spherical?r`normalize(vPositionWorldCameraRelative);`:r`vec3(0.0, 0.0, 1.0);`}
        }
        `);break;case l.ScreenDerivative:o.vertex.code.add(r`void forwardNormal() {}`);break;default:w(e.normalType);case l.COUNT:}}class _o extends _{constructor(){super(...arguments),this.transformNormalViewFromGlobal=A()}}let Lo=class extends z{constructor(){super(...arguments),this.transformNormalGlobalFromModel=A(),this.toMapSpace=X()}};function Go(o){o.vertex.code.add(r`vec4 offsetBackfacingClipPosition(vec4 posClip, vec3 posWorld, vec3 normalWorld, vec3 camPosWorld) {
vec3 camToVert = posWorld - camPosWorld;
bool isBackface = dot(camToVert, normalWorld) > 0.0;
if (isBackface) {
posClip.z += 0.0000003 * posClip.w;
}
return posClip;
}`)}class to extends R{constructor(){super(...arguments),this.instancedDoublePrecision=!1}}function jo(o,e){e.instanced&&e.instancedDoublePrecision&&(o.attributes.add(u.MODELORIGINHI,"vec3"),o.attributes.add(u.MODELORIGINLO,"vec3"),o.attributes.add(u.MODEL,"mat3"),o.attributes.add(u.MODELNORMAL,"mat3"));const a=o.vertex;e.instancedDoublePrecision&&(a.include(L,e),a.uniforms.add(new $("viewOriginHi",(t,i)=>oo(b(p,i.camera.viewInverseTransposeMatrix[3],i.camera.viewInverseTransposeMatrix[7],i.camera.viewInverseTransposeMatrix[11]),p))),a.uniforms.add(new $("viewOriginLo",(t,i)=>eo(b(p,i.camera.viewInverseTransposeMatrix[3],i.camera.viewInverseTransposeMatrix[7],i.camera.viewInverseTransposeMatrix[11]),p)))),a.code.add(r`
    vec3 calculateVPos() {
      ${e.instancedDoublePrecision?"return model * localPosition().xyz;":"return localPosition().xyz;"}
    }
    `),a.code.add(r`
    vec3 subtractOrigin(vec3 _pos) {
      ${e.instancedDoublePrecision?r`
          vec3 originDelta = dpAdd(viewOriginHi, viewOriginLo, -modelOriginHi, -modelOriginLo);
          return _pos - originDelta;`:"return vpos;"}
    }
    `),a.code.add(r`
    vec3 dpNormal(vec4 _normal) {
      ${e.instancedDoublePrecision?"return normalize(modelNormal * _normal.xyz);":"return normalize(_normal.xyz);"}
    }
    `),e.output===n.Normal&&(G(a),a.code.add(r`
    vec3 dpNormalView(vec4 _normal) {
      ${e.instancedDoublePrecision?"return normalize((viewNormal * vec4(modelNormal * _normal.xyz, 1.0)).xyz);":"return normalize((viewNormal * _normal).xyz);"}
    }
    `)),e.hasVertexTangents&&a.code.add(r`
    vec4 dpTransformVertexTangent(vec4 _tangent) {
      ${e.instancedDoublePrecision?"return vec4(modelNormal * _tangent.xyz, _tangent.w);":"return _tangent;"}

    }
    `)}O([F()],to.prototype,"instancedDoublePrecision",void 0);const p=V();function io(o){o.vertex.code.add(r`
    vec4 decodeSymbolColor(vec4 symbolColor, out int colorMixMode) {
      float symbolAlpha = 0.0;

      const float maxTint = 85.0;
      const float maxReplace = 170.0;
      const float scaleAlpha = 3.0;

      if (symbolColor.a > maxReplace) {
        colorMixMode = ${r.int(s.Multiply)};
        symbolAlpha = scaleAlpha * (symbolColor.a - maxReplace);
      } else if (symbolColor.a > maxTint) {
        colorMixMode = ${r.int(s.Replace)};
        symbolAlpha = scaleAlpha * (symbolColor.a - maxTint);
      } else if (symbolColor.a > 0.0) {
        colorMixMode = ${r.int(s.Tint)};
        symbolAlpha = scaleAlpha * symbolColor.a;
      } else {
        colorMixMode = ${r.int(s.Multiply)};
        symbolAlpha = 0.0;
      }

      return vec4(symbolColor.r, symbolColor.g, symbolColor.b, symbolAlpha);
    }
  `)}function Fo(o,e){e.hasSymbolColors?(o.include(io),o.attributes.add(u.SYMBOLCOLOR,"vec4"),o.varyings.add("colorMixMode","mediump float"),o.vertex.code.add(r`int symbolColorMixMode;
vec4 getSymbolColor() {
return decodeSymbolColor(symbolColor, symbolColorMixMode) * 0.003921568627451;
}
void forwardColorMixMode() {
colorMixMode = float(symbolColorMixMode) + 0.5;
}`)):(o.fragment.uniforms.add(new E("colorMixMode",a=>B[a.colorMixMode])),o.vertex.code.add(r`vec4 getSymbolColor() { return vec4(1.0); }
void forwardColorMixMode() {}`))}class lo extends D{constructor(e,a){super(e,"float",P.Draw,(t,i,d)=>t.setUniform1f(e,a(i,d)))}}function y(o,e){T(o,e,new Q("textureAlphaCutoff",a=>a.textureAlphaCutoff))}function Ro(o,e){T(o,e,new lo("textureAlphaCutoff",a=>a.textureAlphaCutoff))}function T(o,e,a){const t=o.fragment;switch(e.alphaDiscardMode!==m.Mask&&e.alphaDiscardMode!==m.MaskBlend||t.uniforms.add(a),e.alphaDiscardMode){case m.Blend:return o.include(K);case m.Opaque:t.code.add(r`void discardOrAdjustAlpha(inout vec4 color) {
color.a = 1.0;
}`);break;case m.Mask:t.code.add(r`#define discardOrAdjustAlpha(color) { if (color.a < textureAlphaCutoff) { discard; } else { color.a = 1.0; } }`);break;case m.MaskBlend:o.fragment.code.add(r`#define discardOrAdjustAlpha(color) { if (color.a < textureAlphaCutoff) { discard; } }`)}}function Eo(o,e){const{vertex:a,fragment:t}=o,i=e.hasModelTransformation;i&&a.uniforms.add(new j("model",c=>H(c.modelTransformation)?c.modelTransformation:U));const d=e.hasColorTexture&&e.alphaDiscardMode!==m.Opaque;switch(e.output){case n.Depth:case n.Shadow:case n.ShadowHighlight:case n.ShadowExcludeHighlight:case n.ObjectAndLayerIdColor:f(a,e),o.include(M,e),o.include(x,e),o.include(C,e),o.include(Y,e),o.include(h,e),o.include(q,e),W(o),o.varyings.add("depth","float"),d&&t.uniforms.add(new g("tex",c=>c.texture)),a.code.add(r`
          void main(void) {
            vpos = calculateVPos();
            vpos = subtractOrigin(vpos);
            vpos = addVerticalOffset(vpos, localOrigin);
            gl_Position = transformPositionWithDepth(proj, view, ${i?"model,":""} vpos, nearFar, depth);
            forwardTextureCoordinates();
            forwardObjectAndLayerIdColor();
          }
        `),o.include(y,e),t.code.add(r`
          void main(void) {
            discardBySlice(vpos);
            ${d?r`
                    vec4 texColor = texture2D(tex, ${e.hasColorTextureTransform?r`colorUV`:r`vuv0`});
                    discardOrAdjustAlpha(texColor);`:""}
            ${e.output===n.ObjectAndLayerIdColor?r`outputObjectAndLayerIdColor();`:r`outputDepth(depth);`}
          }
        `);break;case n.Normal:f(a,e),o.include(M,e),o.include(N,e),o.include(ao,e),o.include(x,e),o.include(C,e),d&&t.uniforms.add(new g("tex",c=>c.texture)),o.varyings.add("vPositionView","vec3"),a.code.add(r`
          void main(void) {
            vpos = calculateVPos();
            vpos = subtractOrigin(vpos);
            ${e.normalType===l.Attribute?r`
            vNormalWorld = dpNormalView(vvLocalNormal(normalModel()));`:""}
            vpos = addVerticalOffset(vpos, localOrigin);
            gl_Position = transformPosition(proj, view, ${i?"model,":""} vpos);
            forwardTextureCoordinates();
          }
        `),o.include(h,e),o.include(y,e),t.code.add(r`
          void main() {
            discardBySlice(vpos);
            ${d?r`
                    vec4 texColor = texture2D(tex, ${e.hasColorTextureTransform?r`colorUV`:r`vuv0`});
                    discardOrAdjustAlpha(texColor);`:""}

            ${e.normalType===l.ScreenDerivative?r`
                vec3 normal = screenDerivativeNormal(vPositionView);`:r`
                vec3 normal = normalize(vNormalWorld);
                if (gl_FrontFacing == false) normal = -normal;`}
            gl_FragColor = vec4(vec3(0.5) + 0.5 * normal, 1.0);
          }
        `);break;case n.Highlight:f(a,e),o.include(M,e),o.include(x,e),o.include(C,e),d&&t.uniforms.add(new g("tex",c=>c.texture)),a.code.add(r`
          void main(void) {
            vpos = calculateVPos();
            vpos = subtractOrigin(vpos);
            vpos = addVerticalOffset(vpos, localOrigin);
            gl_Position = transformPosition(proj, view, ${i?"model,":""} vpos);
            forwardTextureCoordinates();
          }
        `),o.include(h,e),o.include(y,e),o.include(J,e),t.code.add(r`
          void main() {
            discardBySlice(vpos);
            ${d?r`
                    vec4 texColor = texture2D(tex, ${e.hasColorTextureTransform?r`colorUV`:r`vuv0`});
                    discardOrAdjustAlpha(texColor);`:""}
            outputHighlight();
          }
        `)}}function Bo(o){o.include(Z),o.code.add(r`
    vec3 mixExternalColor(vec3 internalColor, vec3 textureColor, vec3 externalColor, int mode) {
      // workaround for artifacts in OSX using Intel Iris Pro
      // see: https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/10475
      vec3 internalMixed = internalColor * textureColor;
      vec3 allMixed = internalMixed * externalColor;

      if (mode == ${r.int(s.Multiply)}) {
        return allMixed;
      }
      if (mode == ${r.int(s.Ignore)}) {
        return internalMixed;
      }
      if (mode == ${r.int(s.Replace)}) {
        return externalColor;
      }

      // tint (or something invalid)
      float vIn = rgb2v(internalMixed);
      vec3 hsvTint = rgb2hsv(externalColor);
      vec3 hsvOut = vec3(hsvTint.x, hsvTint.y, vIn * hsvTint.z);
      return hsv2rgb(hsvOut);
    }

    float mixExternalOpacity(float internalOpacity, float textureOpacity, float externalOpacity, int mode) {
      // workaround for artifacts in OSX using Intel Iris Pro
      // see: https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/10475
      float internalMixed = internalOpacity * textureOpacity;
      float allMixed = internalMixed * externalOpacity;

      if (mode == ${r.int(s.Ignore)}) {
        return internalMixed;
      }
      if (mode == ${r.int(s.Replace)}) {
        return externalOpacity;
      }

      // multiply or tint (or something invalid)
      return allMixed;
    }
  `)}export{l as a,Bo as b,lo as c,ao as d,io as e,_o as f,zo as g,Go as h,N as i,Fo as j,Eo as k,jo as p,y as s,Ro as t,Lo as v};
