import{v as f}from"./View.glsl-03db830e.js";import{o as v}from"./FloatPassUniform-e3702139.js";import{o as m,a}from"./ShaderBuilder-7bfc11d2.js";import{O as t}from"./VertexAttribute-15d1866a.js";function R(r){const o=new m,{vertex:e,fragment:n}=o;f(e,r);const{isAttributeDriven:i,usesHalfFloat:s}=r;return o.attributes.add(t.POSITION,"vec3"),o.attributes.add(t.UV0,"vec2"),i&&(o.attributes.add(t.FEATUREATTRIBUTE,"float"),o.varyings.add("attributeValue","float")),s&&o.constants.add("compressionFactor","float",.25),o.varyings.add("unitCirclePos","vec2"),e.uniforms.add(new v("radius",({resolutionForScale:d,searchRadius:l},{camera:u,screenToWorldRatio:c})=>2*l*(d===0?1:d/c)*u.pixelRatio/u.fullViewport[2])),e.code.add(a`
    void main() {
      unitCirclePos = uv0;

      vec4 posProj = proj * (view * vec4(${t.POSITION}, 1.0));
      vec4 quadOffset = vec4(unitCirclePos * radius, 0.0, 0.0);

      ${i?a`attributeValue = ${t.FEATUREATTRIBUTE};`:""}
      gl_Position = posProj + quadOffset;
    }
  `),n.code.add(a`
    void main() {
      float radiusRatioSquared = dot(unitCirclePos, unitCirclePos);
      if (radiusRatioSquared > 1.0) {
        discard;
      }

      float oneMinusRadiusRatioSquared = 1.0 - radiusRatioSquared;
      float density = oneMinusRadiusRatioSquared * oneMinusRadiusRatioSquared ${i?a` * attributeValue`:""} ${s?a` * compressionFactor`:""};
      gl_FragColor = vec4(density);
    }
  `),o}const S=Object.freeze(Object.defineProperty({__proto__:null,build:R},Symbol.toStringTag,{value:"Module"}));export{R as a,S as s};
