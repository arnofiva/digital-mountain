import{n as o}from"./compilerUtils-175b9e40.js";import{a as i}from"./ShaderBuilder-7bfc11d2.js";function s(a,n){const e=a.fragment;switch(e.code.add(i`struct ShadingNormalParameters {
vec3 normalView;
vec3 viewDirection;
} shadingParams;`),n.doubleSidedMode){case r.None:e.code.add(i`vec3 shadingNormal(ShadingNormalParameters params) {
return normalize(params.normalView);
}`);break;case r.View:e.code.add(i`vec3 shadingNormal(ShadingNormalParameters params) {
return dot(params.normalView, params.viewDirection) > 0.0 ? normalize(-params.normalView) : normalize(params.normalView);
}`);break;case r.WindingOrder:e.code.add(i`vec3 shadingNormal(ShadingNormalParameters params) {
return gl_FrontFacing ? normalize(params.normalView) : normalize(-params.normalView);
}`);break;default:o(n.doubleSidedMode);case r.COUNT:}}var r;(function(a){a[a.None=0]="None",a[a.View=1]="View",a[a.WindingOrder=2]="WindingOrder",a[a.COUNT=3]="COUNT"})(r||(r={}));export{s as e,r as i};
