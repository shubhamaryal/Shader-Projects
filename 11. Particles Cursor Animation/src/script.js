import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

import particlesVertexTestShader from './shaders/particles/vertexTest.glsl'
import particlesFragmentTestShader from './shaders/particles/fragmentTest.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor('#181818')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Displacement
 */
const displacement = {}

// 2d canvas
displacement.canvas = document.createElement('canvas')
displacement.canvas.width = 128
displacement.canvas.height = 128
displacement.canvas.style.position = 'fixed'
// displacement.canvas.style.width = '512px' 
// displacement.canvas.style.height = '512px'
displacement.canvas.style.width = '256px' 
displacement.canvas.style.height = '256px'
// Note: The height and width will change the size but not the actual amount of pixels of canvas, we are strecting the canvas so that we can see it properly, we are not increasing the pixels 
displacement.canvas.style.top = 0
displacement.canvas.style.left = 0
displacement.canvas.style.zIndex = 10
document.body.append(displacement.canvas)

// Context 
displacement.context = displacement.canvas.getContext('2d')
// displacement.context.fillStyle = 'red'
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)
// displacement.context.fillRect(20, 20, 60, 60)

// Glow image
displacement.glowImage = new Image()
displacement.glowImage.src = './glow.png'
// displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32)
// window.setTimeout(() => {
//     displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32)
// }, 1000)

// Interactive plane 
displacement.interactivePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 'red' })
    // new THREE.MeshBasicMaterial({ color: 'red' , wireframe: true})
)
displacement.interactivePlane.visible = false
scene.add(displacement.interactivePlane)

// Raycaster
displacement.raycaster = new THREE.Raycaster()

// Coordinates
// displacement.screenCursor = new THREE.Vector2()
displacement.screenCursor = new THREE.Vector2(9999, 9999)
displacement.canvasCursor = new THREE.Vector2(9999, 9999)
// displacement.canvasCursor = new THREE.Vector2()
// Explain: As we know that the cursor will be set on the center, and the particles will float on default, so we set the screenCursor to 9999 and similarly we set the canvasCursor to 9999 becuase if we don't, the cursor will draw on the canvas without any hover on the plane/particles/image. The screenCursor is for the image/particles and the canvasCursor is for drawing in the canvas

window.addEventListener('pointermove', (event) => {
    // console.log(event)
    displacement.screenCursor.x = (event.clientX/ sizes.width) * 2 - 1
    displacement.screenCursor.y = - (event.clientY/ sizes.height) * 2 + 1
    // Explaination of maths: The event.clientX will give the value from 0 to ~1000(max screen resolution) and when we divide with sizes.width then the values will go from 0 to 1, and we want the values to go from -1 to +1 so we will multiply them by 2 and subtract it with 1 i.e. "0*2-1 = -1" & "1*2-1 = +1". It is same for the y-axis too but we will use - sign because in y-axis the values will go from -1 to +1 from top to bottom and we want it to go -1 to +1 from bottom to top.

    // console.log(displacement.screenCursor.x)
    // console.log(displacement.screenCursor.y)
})

// Texture 
displacement.texture = new THREE.CanvasTexture(displacement.canvas)

/**
 * Particles
 */
// const particlesGeometry = new THREE.PlaneGeometry(10, 10, 32, 32)
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128)

const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uPictureTexture: new THREE.Uniform(textureLoader.load('./picture-1.png')),
        uDisplacementTexture: new THREE.Uniform(displacement.texture)
    }
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// const particlesMaterial = new THREE.ShaderMaterial({
//     vertexShader: particlesVertexTestShader,
//     fragmentShader: particlesFragmentTestShader,
//     uniforms: {
//         // uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
//         // uPictureTexture: new THREE.Uniform(textureLoader.load('./picture-2.png'))
//     }
// })
// // const particles = new THREE.Mesh(particlesGeometry, particlesMaterial)
// const particles = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)
 
/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update()

    /**
     * Raycaster
     */
    displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
    // Explain: It prepares a ray that starts from the camera and goes through the mouse position.
    const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane)
    // console.log(intersections)

    if(intersections.length) {
        // console.log(intersections[0])
        const uv = intersections[0].uv
        // console.log(uv)

        displacement.canvasCursor.x = uv.x * displacement.canvas.width
        // displacement.canvasCursor.y =  uv.y * displacement.canvas.height
        displacement.canvasCursor.y =  (1 - uv.y) * displacement.canvas.height
        // console.log(displacement.canvasCursor.x)
    }

    /**
     * Displacement
     */
    // Fade out 
    displacement.context.globalCompositeOperation = 'source-over'
    // displacement.context.globalAlpha = 0.1
    displacement.context.globalAlpha = 0.02
    displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

    // Draw glow 
    const glowSize = displacement.canvas.width * 0.25
    displacement.context.globalCompositeOperation = 'lighten'
    displacement.context.globalAlpha = 1
    // displacement.context.drawImage(
    //     displacement.glowImage,
    //     displacement.canvasCursor.x,
    //     displacement.canvasCursor.y,
    //     32, 
    //     32
    // )
    // displacement.context.drawImage(
    //     displacement.glowImage,
    //     displacement.canvasCursor.x,
    //     displacement.canvasCursor.y,
    //     glowSize,
    //     glowSize
    // )
    displacement.context.drawImage(
        displacement.glowImage,
        displacement.canvasCursor.x - glowSize * 0.5,
        displacement.canvasCursor.y - glowSize * 0.5,
        glowSize,
        glowSize
    )
    /* 
        drawImage(
            image object, 
            position on the canvas (x-coordinate), 
            position on the canvas (y-coordinate), 
            size of the glow (height), 
            size of the glow (width)
        ) 
    */

    // Texture 
    displacement.texture.needsUpdate = true 
    // Explain: When the texture is modified i.e. the canvas, Three.js resends the texture to the GPU

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()