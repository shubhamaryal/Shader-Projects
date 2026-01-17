uniform float uTime;
uniform sampler2D uBase;

#include ../includes/simplexNoise4d.glsl

void main() {
    float time = uTime * 0.2; 
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    // particle.y += 0.01;
    // particle.x += 0.01;
    // particle.x *= 1.01;
    vec4 base = texture(uBase, uv);

    // Dead 
    if (particle.a >= 1.0) {
        particle.a = 0.0;
        particle.xyz = base.xyz;
    } 

    // Alive
    else {
        // Flow field
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz + 0.0, time)),
            simplexNoise4d(vec4(particle.xyz + 1.0, time)),
            simplexNoise4d(vec4(particle.xyz + 2.0, time))
        );
        flowField = normalize(flowField);
        particle.xyz += flowField * 0.01;

        // Decay 
        particle.a += 0.01;
    }

    // // Flow Field
    // // vec3 flowField = vec3(
    // //     simplexNoise4d(vec4()),
    // //     simplexNoise4d(vec4()),
    // //     simplexNoise4d(vec4())
    // // );
    // // vec3 flowField = vec3(
    // //     simplexNoise4d(vec4(particle.xyz, 0.0)),
    // //     simplexNoise4d(vec4(particle.xyz, 0.0)),
    // //     simplexNoise4d(vec4(particle.xyz, 0.0))
    // // );
    // // vec3 flowField = vec3(
    // //     simplexNoise4d(vec4(particle.xyz + 0.0, 0.0)),
    // //     simplexNoise4d(vec4(particle.xyz + 1.0, 0.0)),
    // //     simplexNoise4d(vec4(particle.xyz + 2.0, 0.0))
    // // );
    // vec3 flowField = vec3(
    //     simplexNoise4d(vec4(particle.xyz + 0.0, time)),
    //     simplexNoise4d(vec4(particle.xyz + 1.0, time)),
    //     simplexNoise4d(vec4(particle.xyz + 2.0, time))
    // );
    // flowField = normalize(flowField);
    // // particle.xyz += flowField;
    // particle.xyz += flowField * 0.01;

    // // Decay 
    // particle.a += 0.01;

    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(gl_FragCoord.xy, 1.0, 1.0);
    // gl_FragColor = vec4(gl_FragCoord.xy / resolution.xy , 1.0, 1.0);
    // gl_FragColor = vec4(uv , 1.0, 1.0);
    gl_FragColor = particle;
}