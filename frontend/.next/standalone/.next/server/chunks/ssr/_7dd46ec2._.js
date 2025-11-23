module.exports=[36114,a=>{"use strict";a.s(["useFrame",()=>b.D]);var b=a.i(78956)},47742,a=>{"use strict";a.s(["default",()=>j]);var b=a.i(11755),c=a.i(27239),d=a.i(80150),e=a.i(54816),f=a.i(36114);let g=`
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vPosition = position;
    vNormal = normal;
    
    vec3 pos = position;
    // Smooth wave effect based on time and position
    float wave = sin(pos.x * 0.5 + uTime) * 0.1 + 
                 cos(pos.y * 0.5 + uTime * 0.8) * 0.1;
    pos.z += wave;
    
    // Subtle mouse interaction effect
    float mouseInfluence = length(uMouse - vec2(pos.x, pos.y)) * 0.01;
    pos.z += mouseInfluence * 0.2;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,h=`
  uniform float uTime;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Color based on position and normal to create depth
    vec3 color1 = vec3(0.0, 0.8, 1.0); // cyan
    vec3 color2 = vec3(0.2, 0.4, 1.0); // blue
    vec3 color3 = vec3(0.5, 0.3, 1.0); // purple
    
    float mixFactor = (vNormal.y + 1.0) * 0.5;
    vec3 color = mix(color1, mix(color2, color3, 0.5), mixFactor);
    
    // Very low opacity to maintain minimalism
    float alpha = 0.08;
    
    // Subtle glow effect based on position
    float glow = sin(vPosition.x * 0.5 + uTime) * 0.5 + 0.5;
    alpha *= glow * 0.5 + 0.5;
    
    gl_FragColor = vec4(color, alpha);
  }
`;function i({mouse:a,windowSize:e}){let i=(0,d.useRef)(null),j=(0,d.useRef)(null);(0,f.useFrame)(({clock:b})=>{j.current&&(j.current.uniforms.uTime.value=b.getElapsedTime(),j.current.uniforms.uMouse.value=[a.x/e.width*10-5,-(10*(a.y/e.height))+5])});let k=(0,d.useMemo)(()=>({uTime:{value:0},uMouse:{value:[0,0]}}),[]);return(0,b.jsxs)("mesh",{ref:i,rotation:[0,0,0],position:[0,0,-5],children:[(0,b.jsx)("planeGeometry",{args:[20,20,50,50]}),(0,b.jsx)("shaderMaterial",{ref:j,vertexShader:g,fragmentShader:h,uniforms:k,transparent:!0,side:c.DoubleSide})]})}function j({mouse:a,windowSize:c}){return(0,b.jsx)("div",{className:"fixed inset-0 pointer-events-none z-0",children:(0,b.jsx)(e.Canvas,{camera:{position:[0,0,5],fov:75},gl:{alpha:!0,antialias:!0},style:{width:"100%",height:"100%"},children:(0,b.jsx)(i,{mouse:a,windowSize:c})})})}}];

//# sourceMappingURL=_7dd46ec2._.js.map