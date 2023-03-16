import{h as _,t as h,r as m}from"./typedArrayUtil-70e1d79e.js";import{a as L}from"./RgbaFloatEncoding.glsl-31b2b966.js";import{c as A}from"./View.glsl-725bf3cf.js";import{a as R,u as w,r as W}from"./Texture2DPassUniform-1510cbb0.js";import{e as b}from"./Float4PassUniform-52993952.js";import{o as f}from"./FloatPassUniform-8a52db3d.js";import{n as F,a as i}from"./ShaderBuilder-c7fc4a30.js";import{o as y}from"./floatRGBA-11065dbc.js";import{P as D,G as M,D as z}from"./enums-fc527c7c.js";import{E}from"./Texture-42bd3a76.js";import{r as q}from"./vec4-c7a19f0d.js";import{l as G,n as I}from"./vec4f64-6d0e93be.js";let pe=class{constructor(e){this._rctx=e,this._cache=new Map}destroy(){this._cache.forEach(e=>_(e.stippleTexture)),this._cache.clear()}_acquire(e){if(h(e))return null;const o=this._patternId(e),r=this._cache.get(o);if(r)return r.refCount++,r;const{encodedData:n,paddedPixels:l}=N(e),a=new B(new E(this._rctx,{width:l,height:1,internalFormat:D.RGBA,pixelFormat:D.RGBA,dataType:M.UNSIGNED_BYTE,wrapMode:z.CLAMP_TO_EDGE},n));return this._cache.set(o,a),a}release(e){if(h(e))return;const o=this._patternId(e),r=this._cache.get(o);r&&(r.refCount--,r.refCount===0&&(m(r.stippleTexture)&&r.stippleTexture.dispose(),this._cache.delete(o)))}swap(e,o){const r=this._acquire(o);return this.release(e),r}_patternId(e){return`${e.pattern.join(",")}-r${e.pixelRatio}`}},B=class extends F{constructor(e){super(),this.stippleTexture=e,this.refCount=1}};function N(t){const e=S(t),o=1/t.pixelRatio,r=T(t),n=P(t),l=(Math.floor(.5*(n-1))+.5)*o,a=[];let p=1;for(const c of e){for(let u=0;u<c;u++){const $=p*(Math.min(u,c-1-u)+.5)*o/l*.5+.5;a.push($)}p=-p}const g=Math.round(e[0]/2),C=[...a.slice(g),...a.slice(0,g)],x=r+v,d=new Uint8Array(4*x);let s=4;for(const c of C)y(c,d,s),s+=4;return d.copyWithin(0,s-4,s),d.copyWithin(s,4,8),{encodedData:d,paddedPixels:x}}function S(t){return t.pattern.map(e=>Math.round(e*t.pixelRatio))}function T(t){if(h(t))return 1;const e=S(t);return Math.floor(e.reduce((o,r)=>o+r))}function P(t){return S(t).reduce((e,o)=>Math.max(e,o))}const v=2;function O(t){return h(t)?G:t.length===4?t:q(U,t[0],t[1],t[2],1)}const U=I();function de(t,e){t.constants.add("stippleAlphaColorDiscard","float",.001),t.constants.add("stippleAlphaHighlightDiscard","float",.5),e.stippleEnabled?j(t,e):k(t)}function j(t,e){const o=!(e.draped&&e.stipplePreferContinuous),{vertex:r,fragment:n}=t;n.include(L),e.draped||(A(r,e),r.uniforms.add(new f("worldToScreenPerDistanceRatio",(a,p)=>1/p.camera.perScreenPixelRatio)),r.code.add(i`float computeWorldToScreenRatio(vec3 segmentCenter) {
float segmentDistanceToCamera = length(segmentCenter - cameraPosition);
return worldToScreenPerDistanceRatio / segmentDistanceToCamera;
}`)),t.varyings.add("vStippleDistance","float"),e.stippleRequiresClamp&&t.varyings.add("vStippleDistanceLimits","vec2"),e.stippleRequiresStretchMeasure&&t.varyings.add("vStipplePatternStretch","float"),r.code.add(i`
    float discretizeWorldToScreenRatio(float worldToScreenRatio) {
      float step = ${J};

      float discreteWorldToScreenRatio = log(worldToScreenRatio);
      discreteWorldToScreenRatio = ceil(discreteWorldToScreenRatio / step) * step;
      discreteWorldToScreenRatio = exp(discreteWorldToScreenRatio);
      return discreteWorldToScreenRatio;
    }
  `),r.code.add(i`vec2 computeStippleDistanceLimits(float startPseudoScreen, float segmentLengthPseudoScreen, float segmentLengthScreen, float patternLength) {`),r.code.add(i`
    if (segmentLengthPseudoScreen >= ${o?"patternLength":"1e4"}) {
  `),r.uniforms.add(new f("pixelRatio",(a,p)=>p.camera.pixelRatio)),r.code.add(i`
        // Round the screen length to get an integer number of pattern repetitions (minimum 1).
        float repetitions = segmentLengthScreen / (patternLength * pixelRatio);
        float flooredRepetitions = max(1.0, floor(repetitions + 0.5));
        float segmentLengthScreenRounded = flooredRepetitions * patternLength;

        ${e.stippleRequiresStretchMeasure?i`
              float stretch = repetitions / flooredRepetitions;

              // We need to impose a lower bound on the stretch factor to prevent the dots from merging together when there is only 1 repetition.
              // 0.75 is the lowest possible stretch value for flooredRepetitions > 1, so it makes sense as lower bound.
              vStipplePatternStretch = max(0.75, stretch);`:""}

        return vec2(0.0, segmentLengthScreenRounded);
      }
      return vec2(startPseudoScreen, startPseudoScreen + segmentLengthPseudoScreen);
    }
  `),n.constants.add("stippleTexturePadding","float",v);const l=e.hasWebGL2Context?R.None:R.Size;n.uniforms.add(w("stipplePatternTexture",a=>a.stippleTexture,l)),n.uniforms.add([new f("stipplePatternSDFNormalizer",a=>H(a.stipplePattern)),new f("stipplePatternPixelSizeInv",a=>1/Y(a))]),n.code.add(i`
    float padStippleTexture(float u) {
      float paddedTextureSize = ${W(e,"stipplePatternTexture")}.x;
      float unpaddedTextureSize = paddedTextureSize - stippleTexturePadding;

      return (u * unpaddedTextureSize + stippleTexturePadding * 0.5) / paddedTextureSize;
    }
  `),n.code.add(i`
    float getStippleSDF(out bool isClamped) {
      ${e.stippleRequiresClamp?i`
          float stippleDistanceClamped = clamp(vStippleDistance, vStippleDistanceLimits.x, vStippleDistanceLimits.y);
          vec2 aaCorrectedLimits = vStippleDistanceLimits + vec2(1.0, -1.0) / gl_FragCoord.w;
          isClamped = vStippleDistance < aaCorrectedLimits.x || vStippleDistance > aaCorrectedLimits.y;`:i`
          float stippleDistanceClamped = vStippleDistance;
          isClamped = false;`}

      float u = stippleDistanceClamped * gl_FragCoord.w * stipplePatternPixelSizeInv;
      ${e.stippleScaleWithLineWidth?i`u *= vLineSizeInv;`:""}
      u = padStippleTexture(fract(u));

      float encodedSDF = rgba2float(texture2D(stipplePatternTexture, vec2(u, 0.5)));
      float sdf = (encodedSDF * 2.0 - 1.0) * stipplePatternSDFNormalizer;

      ${e.stippleRequiresStretchMeasure?i`return (sdf - 0.5) * vStipplePatternStretch + 0.5;`:i`return sdf;`}
    }

    float getStippleSDF() {
      bool ignored;
      return getStippleSDF(ignored);
    }

    float getStippleAlpha() {
      bool isClamped;
      float stippleSDF = getStippleSDF(isClamped);

      float antiAliasedResult = ${e.stippleScaleWithLineWidth?i`clamp(stippleSDF * vLineWidth + 0.5, 0.0, 1.0);`:i`clamp(stippleSDF + 0.5, 0.0, 1.0);`}

      return isClamped ? floor(antiAliasedResult + 0.5) : antiAliasedResult;
    }
  `),e.stippleOffColorEnabled?(n.uniforms.add(new b("stippleOffColor",a=>O(a.stippleOffColor))),n.code.add(i`#define discardByStippleAlpha(stippleAlpha, threshold) {}
#define blendStipple(color, stippleAlpha) mix(color, stippleOffColor, stippleAlpha)`)):n.code.add(i`#define discardByStippleAlpha(stippleAlpha, threshold) if (stippleAlpha < threshold) { discard; }
#define blendStipple(color, stippleAlpha) vec4(color.rgb, color.a * stippleAlpha)`)}function k(t){t.fragment.code.add(i`float getStippleAlpha() { return 1.0; }
#define discardByStippleAlpha(_stippleAlpha_, _threshold_) {}
#define blendStipple(color, _stippleAlpha_) color`)}function H(t){return m(t)?(Math.floor(.5*(P(t)-1))+.5)/t.pixelRatio:1}function Y(t){const e=t.stipplePattern;return m(e)?T(t.stipplePattern)/e.pixelRatio:1}const J=i.float(.4);export{de as a,Y as g,pe as u};
