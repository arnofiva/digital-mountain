import{h as n}from"./Matrix3PassUniform-0b3b1bba.js";import{a as o}from"./ShaderBuilder-7bfc11d2.js";import{O as t}from"./VertexAttribute-15d1866a.js";function A(r,e){const d=e.output===n.ObjectAndLayerIdColor,a=e.objectAndLayerIdColorInstanced;d&&(r.varyings.add("objectAndLayerIdColorVarying","vec4"),a?r.attributes.add(t.OBJECTANDLAYERIDCOLOR_INSTANCED,"vec4"):r.attributes.add(t.OBJECTANDLAYERIDCOLOR,"vec4")),r.vertex.code.add(o`
     void forwardObjectAndLayerIdColor() {
      ${d?a?o`objectAndLayerIdColorVarying = objectAndLayerIdColor_instanced * 0.003921568627451;`:o`objectAndLayerIdColorVarying = objectAndLayerIdColor * 0.003921568627451;`:o``} }`),r.fragment.code.add(o`
      void outputObjectAndLayerIdColor() {
        ${d?o`gl_FragColor = objectAndLayerIdColorVarying;`:o``} }`)}export{A as d};
