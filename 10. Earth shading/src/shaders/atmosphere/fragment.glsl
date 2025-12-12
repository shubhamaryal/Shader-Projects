// uniform sampler2D uDayTexture;
// uniform sampler2D uNightTexture;
// uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection; 
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

// varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation 
    float sunOrientation = dot(uSunDirection, normal); 

    // // Day / Night color 
    // float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    // vec3 dayColor = texture(uDayTexture, vUv).rgb; 
    // vec3 nightColor = texture(uNightTexture, vUv).rgb;
    // color = mix(nightColor, dayColor, dayMix); 

    // // Specular clouds colors
    // vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;

    // // Clouds 
    // float cloudsMix = smoothstep(0.38, 1.0, specularCloudsColor.g);
    // cloudsMix *= dayMix;
    // color = mix(color, vec3(1.0), cloudsMix);

    // // Fresnel 
    // float fresnel = dot(viewDirection, normal) + 1.0;
    // fresnel = pow(fresnel, 2.0);

    // Atmosphere 
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    // color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);
    // color = mix(color, atmosphereColor, atmosphereDayMix);
    color += atmosphereColor;

    // Alpha 
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);
    // color = vec3(edgeAlpha);

    // color = vec3(sunOrientation);
    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);
    // color = vec3(dayAlpha);

    float alpha = edgeAlpha * dayAlpha;

    // // Specular 
    // vec3 reflection = reflect( - uSunDirection, normal);
    // float specular = - dot(reflection, viewDirection);
    // specular = max(specular, 0.0);
    // specular = pow(specular, 32.0);
    // specular *= specularCloudsColor.r;

    // vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    // color += specular * specularColor;

    // Final color
    // gl_FragColor = vec4(color, 1.0);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}