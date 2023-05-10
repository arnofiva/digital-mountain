import{i as u,t as n}from"./ForwardLinearDepth.glsl-a0929473.js";import{h as e}from"./Matrix3PassUniform-0b3b1bba.js";import{u as m}from"./Slice.glsl-7975394d.js";import{r as s}from"./Transform.glsl-7294c426.js";import{d as f}from"./ObjectAndLayerIdColor.glsl-a64028da.js";import{e as c}from"./VertexColor.glsl-79a8c465.js";import{o as h}from"./OutputDepth.glsl-f581dcdd.js";import{a as g}from"./OutputHighlight.glsl-08aacdf4.js";import{n as C}from"./MultipassTerrainTest.glsl-43f42334.js";import{t as $}from"./AlphaCutoff-96178e0d.js";import{e as y,o as O}from"./TransparencyPassType-a6b20292.js";import{v as _}from"./View.glsl-03db830e.js";import{e as b}from"./Float4PassUniform-7f3c3ce8.js";import{o as j,a as t}from"./ShaderBuilder-7bfc11d2.js";import{O as w}from"./VertexAttribute-15d1866a.js";function A(o){const r=new j,{vertex:l,fragment:a}=r,p=o.output===e.Depth,i=o.hasMultipassTerrain&&(o.output===e.Color||o.output===e.Alpha);return _(l,o),r.include(s,o),r.include(c,o),r.include(f,o),r.attributes.add(w.POSITION,"vec3"),r.varyings.add("vpos","vec3"),i&&r.varyings.add("depth","float"),p&&(r.include(h,o),u(r),n(r)),l.code.add(t`
    void main(void) {
      vpos = position;
      forwardNormalizedVertexColor();
      forwardObjectAndLayerIdColor();
      ${i?"depth = (view * vec4(vpos, 1.0)).z;":""}
      gl_Position = ${p?t`transformPositionWithDepth(proj, view, vpos, nearFar, linearDepth);`:t`transformPosition(proj, view, vpos);`}
    }
  `),r.include(m,o),i&&r.include(C,o),a.include(y),a.uniforms.add(new b("eColor",d=>d.color)),o.output===e.Highlight&&r.include(g,o),a.code.add(t`
  void main() {
    discardBySlice(vpos);
    ${i?"terrainDepthTest(gl_FragCoord, depth);":""}
    vec4 fColor = ${o.hasVertexColors?"vColor * eColor;":"eColor;"}

    ${o.output===e.ObjectAndLayerIdColor?t`fColor.a = 1.0;`:""}

    if (fColor.a < ${t.float($)}) {
      discard;
    }

    ${o.output===e.Alpha?t`gl_FragColor = vec4(fColor.a);`:""}

    ${o.output===e.Color?t`gl_FragColor = highlightSlice(fColor, vpos); ${o.transparencyPassType===O.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}`:""}
    ${o.output===e.Highlight?t`outputHighlight();`:""};
    ${o.output===e.Depth?t`outputDepth(linearDepth);`:""};
    ${o.output===e.ObjectAndLayerIdColor?t`outputObjectAndLayerIdColor();`:""}
  }
  `),r}const W=Object.freeze(Object.defineProperty({__proto__:null,build:A},Symbol.toStringTag,{value:"Module"}));export{W as f,A as v};
