uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection; 
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    // vec3 color = vec3(vUv, 1.0);
    vec3 color = vec3(0.0);

    // Sun orientation 
    // vec3 uSunDirection = vec3(0.0, 0.0, 1.0);
    float sunOrientation = dot(uSunDirection, normal); 
    // Meaning : dot will check if normal(of the earth) and sun direction are perfectly aligned or not or how much they are aligned 
    color = vec3(sunOrientation);

    // Day / Night color 
    // float dayMix = sunOrientation;
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb; 
    // Meaning: We pick the color from the texture at the vUv position, it will give vec4 as output but we will only get rgb which is alias of xyz
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    // color = dayColor;
    // color = nightColor;
    color = mix(nightColor, dayColor, dayMix); 
    // Note: If dayMix is 0 we will get nightColor, and if it is 1 we will get dayColor 

    // Specular clouds colors
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;
    // color = vec3(specularCloudsColor, 0.0);

    // Clouds 
    // float cloudsMix = specularCloudsColor.g;
    float cloudsMix = smoothstep(0.38, 1.0, specularCloudsColor.g);
    cloudsMix *= dayMix;
    color = mix(color, vec3(1.0), cloudsMix); 
    // Explain: The color denotes the previous texture i.e. the texture of day and night, and vec3(1.0) means white color which is added in the green channel of specularCloudsColor 

    // Fresnel 
    

    // Atmosphere 
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    // color = vec3(sunOrientation);
    // color = vec3(atmosphereDayMix);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = atmosphereColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}