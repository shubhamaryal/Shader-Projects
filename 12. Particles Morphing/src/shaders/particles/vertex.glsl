uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;

attribute vec3 aPositionTarget;

varying float vColor;

#include ../includes/simplexNoise3d.glsl

void main() {
    // Mix position 
    float noise = simplexNoise3d(position);
    noise = smoothstep(-1.0, 1.0, noise);
    // float progress = 0.5;
    float progress = uProgress;
    vec3 mixedPosition = mix(position, aPositionTarget, progress);

    // Final position
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = uSize * uResolution.y;
    // gl_PointSize = uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings 
    vColor = noise;
}