// varying vec2 vUv;

// void main() {
//     // csm_FragColor.rgb = vec3(1.0, 0.5, 0.5);
//     // csm_DiffuseColor.rgb = vec3(1.0, 0.0, 0.0);
//     // csm_DiffuseColor.rgb = vec3(vUv, 1.0);
//     // csm_Metalness = step(0.0, sin(vUv.x * 100.0));
//     csm_Metalness = step(0.0, sin(vUv.x * 100.0 + 0.5));

//     csm_Roughness = 1.0 - csm_Metalness; 
//     // Explain: We subtracted the metalness because we only want the roughness to be 0.0 on the metalish part 
// }

uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vWobble;

void main() {
    // csm_FragColor.rgb = vec3(vWobble);
    float colorMix = smoothstep(-1.0, 1.0, vWobble);
    csm_DiffuseColor.rgb = mix(uColorA, uColorB, colorMix);

    // // Mirror step
    // csm_Metalness = step(0.25, vWobble);
    // csm_Roughness = 1.0 - csm_Metalness;

    // Shiny tip
    csm_Roughness = 1.0 - colorMix;
}