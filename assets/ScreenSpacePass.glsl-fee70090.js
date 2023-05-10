import{a as t}from"./ShaderBuilder-7bfc11d2.js";import{O as v}from"./VertexAttribute-15d1866a.js";function e(o,i=!0){o.attributes.add(v.POSITION,"vec2"),i&&o.varyings.add("uv","vec2"),o.vertex.code.add(t`
    void main(void) {
      gl_Position = vec4(position, 0.0, 1.0);
      ${i?t`uv = position * 0.5 + vec2(0.5);`:""}
    }
  `)}export{e as o};
