attribute vec2 uv1;

uniform float uTime;
uniform float totalFrames;
uniform float fps;
uniform sampler2D posTexture;

varying vec2 vUv;

void main() {
	vUv = uv;
	//calculate uv coordinates
	float frame = floor(fract((fps / (totalFrames - 0.01)) * uTime) * totalFrames);
	float timeInFrames = mod(frame, totalFrames) * (1.0 / totalFrames);

	//get position and rotation(quaternion) from textures
	vec4 texturePos = texture(posTexture, vec2(uv1.x, 1.0 - timeInFrames - (1.0 - uv1.y)));

	vec4 translated = vec4(position + texturePos.xyz, 1.0);
	gl_Position = projectionMatrix * modelViewMatrix * translated;
}