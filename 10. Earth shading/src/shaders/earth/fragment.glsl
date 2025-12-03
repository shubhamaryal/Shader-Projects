uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTextureuDayTexture;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    // vec3 color = vec3(vUv, 1.0);
    vec3 color = vec3(0.0);

    // Day / Night color 
    vec3 dayColor = texture(uDayTexture, vUv).rgb; // Meaning: We pick the color from the texture at the vUv position, it will give vec4 as output but we will only get rgb which is alias of xyz
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = dayColor;
    // color = nightColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}