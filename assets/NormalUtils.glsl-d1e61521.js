import{a as r}from"./ShaderBuilder-c7fc4a30.js";function n(e,t){t.spherical?e.vertex.code.add(r`vec3 getLocalUp(in vec3 pos, in vec3 origin) {
return normalize(pos + origin);
}`):e.vertex.code.add(r`vec3 getLocalUp(in vec3 pos, in vec3 origin) {
return vec3(0.0, 0.0, 1.0);
}`),t.spherical?e.vertex.code.add(r`mat3 getTBNMatrix(in vec3 n) {
vec3 t = normalize(cross(vec3(0.0, 0.0, 1.0), n));
vec3 b = normalize(cross(n, t));
return mat3(t, b, n);
}`):e.vertex.code.add(r`mat3 getTBNMatrix(in vec3 n) {
vec3 t = vec3(1.0, 0.0, 0.0);
vec3 b = normalize(cross(n, t));
return mat3(t, b, n);
}`)}export{n as r};
