import{n as r}from"./ForwardLinearDepth.glsl-a0929473.js";import{a as o}from"./ShaderBuilder-7bfc11d2.js";function p(e,t){if(r(e),t.hasModelTransformation)return e.vertex.code.add(o`vec4 transformPositionWithDepth(mat4 proj, mat4 view, mat4 model, vec3 pos, vec2 nearFar, out float depth) {
vec4 eye = view * (model * vec4(pos, 1.0));
depth = calculateLinearDepth(nearFar, eye.z);
return proj * eye;
}`),void e.vertex.code.add(o`vec4 transformPosition(mat4 proj, mat4 view, mat4 model, vec3 pos) {
return proj * (view * (model * vec4(pos, 1.0)));
}`);e.vertex.code.add(o`vec4 transformPositionWithDepth(mat4 proj, mat4 view, vec3 pos, vec2 nearFar, out float depth) {
vec4 eye = view * vec4(pos, 1.0);
depth = calculateLinearDepth(nearFar,eye.z);
return proj * eye;
}`),e.vertex.code.add(o`vec4 transformPosition(mat4 proj, mat4 view, vec3 pos) {
return proj * (view * vec4(pos, 1.0));
}`)}export{p as r};
