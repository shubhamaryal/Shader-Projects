uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

varying vec3 vColor;

void main() {
    // Displacement
    vec3 newPosition = position;

    // Final position
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Picture 
    float pictureIntensity = texture(uPictureTexture, uv).r;
    // float pictureIntensity = texture(uDisplacementTexture, uv).r;

    // Point size
    // gl_PointSize = 0.3 * uResolution.y;
    // gl_PointSize = 0.3 * pictureIntensity * uResolution.y;
    gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings 
    // vColor = vec3(pictureIntensity);
    vColor = vec3(pow(pictureIntensity, 2.0));
}