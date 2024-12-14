attribute vec2 uv1;

uniform float uTime; // time in s
uniform float totalFrames; // 10
uniform float fps; // 30
uniform sampler2D posTexture;
uniform sampler2D normalTexture;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
	vUv = uv;
	// calculate uv coordinates
	float frame = mod(uTime * fps, totalFrames) / totalFrames;

	// get the position from the texture
	vec4 texturePos = texture(posTexture, vec2(uv1.x, uv1.y - frame));
	vec4 textureNormal = texture(normalTexture, vec2(uv1.x, uv1.y - frame)) * 2.0 - 1.0;
	vNormal = textureNormal.xzy;

	// translate the position
	vec4 translated = vec4(position + texturePos.xzy, 1.0);
	gl_Position = projectionMatrix * modelViewMatrix * translated;

}