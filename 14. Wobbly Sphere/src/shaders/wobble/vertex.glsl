// varying vec2 vUv;

// void main() {
//     // csm_Position.y += 2.0;
//     // csm_Position.y += sin(csm_Position.x * 3.0) * 0.5; 

//     // Varying 
//     vUv = uv;
// }

#include ../includes/simplexNoise4d.glsl

void main() {
    // Wobble 
    float wobble = simplexNoise4d(vec4(
        csm_Position, // XYZ
        0.0           // W
    ));
    csm_Position += wobble * normal;
}