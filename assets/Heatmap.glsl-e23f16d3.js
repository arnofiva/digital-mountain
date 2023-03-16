import{o as s}from"./ScreenSpacePass.glsl-28a2b6e5.js";import{d}from"./DiscardOrAdjustAlphaBlend.glsl-27b032af.js";import{o as e}from"./FloatPassUniform-8a52db3d.js";import{o as m,a as n}from"./ShaderBuilder-c7fc4a30.js";import{f as r}from"./Texture2DPassUniform-1510cbb0.js";function l(a){const o=new m;o.include(s),o.include(d);const{usesHalfFloat:i}=a;return o.fragment.uniforms.add([new r("densityMap",t=>t.densityMap),new r("tex",t=>t.colorRamp),new e("densityNormalizer",t=>1/(t.maxDensity-t.minDensity)),new e("minDensity",t=>t.minDensity)]),o.fragment.uniforms.add(new e("densityMultiplier",t=>3/(t.searchRadius*t.searchRadius*Math.PI))),i&&o.constants.add("compressionFactor","float",4),o.fragment.code.add(n`
    void main() {
      float density = texture2D(densityMap, uv).r * densityMultiplier${i?n` * compressionFactor`:""};
      float densityRatio = (density - minDensity) * densityNormalizer;

      vec4 color = texture2D(tex, vec2(clamp(densityRatio, 0.0, 1.0), 0.5));

      discardOrAdjustAlpha(color);
      gl_FragColor = color;
    }
  `),o}const g=Object.freeze(Object.defineProperty({__proto__:null,build:l},Symbol.toStringTag,{value:"Module"}));export{g as a,l as t};
