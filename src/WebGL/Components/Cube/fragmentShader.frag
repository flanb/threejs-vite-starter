varying vec2 vUv;
uniform float uOpacity;

void main()  {
	gl_FragColor = vec4( vUv, 1.0, uOpacity );
}
