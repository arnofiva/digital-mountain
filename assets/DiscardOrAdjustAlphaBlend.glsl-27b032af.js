import{t as d}from"./AlphaCutoff-96178e0d.js";import{a as o}from"./ShaderBuilder-c7fc4a30.js";function f(r){r.fragment.code.add(o`
    #define discardOrAdjustAlpha(color) { if (color.a < ${o.float(d)}) { discard; } }
  `)}export{f as d};
