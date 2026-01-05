import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

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
    // particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
    if(particles)
        particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
camera.position.set(0, 0, 8 * 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#160920'
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
renderer.setClearColor(debugObject.clearColor)

/**
 * Particles
 */
// const particles = {}

// // Geometry
// particles.geometry = new THREE.SphereGeometry(3)
// particles.geometry.setIndex(null)

// // Material
// particles.material = new THREE.ShaderMaterial({
//     vertexShader: particlesVertexShader,
//     fragmentShader: particlesFragmentShader,
//     uniforms: {
//         uSize: new THREE.Uniform(0.4),
//         uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio))
//     },
//     blending: THREE.AdditiveBlending,
//     depthWrite: false
// })

// // Points
// particles.points = new THREE.Points(particles.geometry, particles.material)
// scene.add(particles.points)

// Load models
let particles = null

gltfLoader.load('./models.glb', (gltf) => {
    // console.log(gltf) 
    // Explaination: The models are inside one file and all the models are available inside the scene as children
    // const particles = {}
    particles = {}
    particles.index = 0

    // Position 
    // gltf.scene.children.map((child) => {
    // const positions = gltf.scene.children.map((child) => {
    //     // console.log(child)
    //     // console.log(child.geometry.attributes.position)
    //     return child.geometry.attributes.position
    // })
    // console.log(positions)

    // EXPLAINATION: The models are inside the gltf>scene>children so we will directly map through it and for the position, the position is inside children>geometry>attributes>position. We can get count and the array for position inside it.
    const positions = gltf.scene.children.map(child => child.geometry.attributes.position)
    // console.log(positions)

    particles.maxCount = 0 
    for(const position of positions) {
        if(position.count > particles.maxCount)
            particles.maxCount = position.count
    }
    // console.log(particles.maxCount)

    particles.positions = []
    for(const position of positions) {
        // console.log(position)
        const originalArray = position.array // This array is has the vertices position as Float32Array
        // console.log(originalArray)
        const newArray = new Float32Array(particles.maxCount * 3)

        for(let i = 0; i < particles.maxCount ; i++) {
            const i3 = i * 3

            if(i3 < originalArray.length) {
                newArray[i3 + 0] = originalArray[i3 + 0]
                newArray[i3 + 1] = originalArray[i3 + 1]
                newArray[i3 + 2] = originalArray[i3 + 2]
            } else {
                // const randomIndex = Math.floor(position.count * Math.random())
                const randomIndex = Math.floor(position.count * Math.random()) * 3
                // console.log(randomIndex)
                // newArray[i3 + 0] = 0
                // newArray[i3 + 1] = 0
                // newArray[i3 + 2] = 0
                newArray[i3 + 0] = originalArray[randomIndex + 0]
                newArray[i3 + 1] = originalArray[randomIndex + 1]
                newArray[i3 + 2] = originalArray[randomIndex + 2]
            }
        }
        

        particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3))
    }

    // console.log(particles.positions)

    // Geometry
    const sizesArray = new Float32Array(particles.maxCount)

    for(let i = 0; i < particles.maxCount; i++)
        sizesArray[i] = Math.random()
    
    // console.log(sizesArray)

    // particles.geometry = new THREE.SphereGeometry(3)
    particles.geometry = new THREE.BufferGeometry()
    particles.geometry.setAttribute('position', particles.positions[particles.index])
    particles.geometry.setAttribute('aPositionTarget', particles.positions[3])
    // particles.geometry.setIndex(null)
    particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))

    // Material
    particles.material = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: {
            uSize: new THREE.Uniform(0.4),
            // uSize: new THREE.Uniform(0.2),
            uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
            uProgress: new THREE.Uniform(0)
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material)
    scene.add(particles.points)

    // Methods
    // particles.morph = () => {
    particles.morph = (index) => {
        // Update attributes
        particles.geometry.attributes.position = particles.positions[particles.index]
        particles.geometry.attributes.aPositionTarget = particles.positions[index]

        // Animate uProgress
        gsap.fromTo(
            particles.material.uniforms.uProgress,
            { value: 0 }, 
            { 
                value: 1 , 
                duration: 3, 
                ease: 'linear'
            }
        )

        // Save index
        particles.index = index
    }

    particles.morph0 = () => { particles.morph(0) }
    particles.morph1 = () => { particles.morph(1) }
    particles.morph2 = () => { particles.morph(2) }
    particles.morph3 = () => { particles.morph(3) }

    // Tweaks 
    gui
        .add(particles.material.uniforms.uProgress, 'value')
        .min(0)
        .max(1)
        .step(0.001)
        .name('uProgress')
        .listen()

    gui.add(particles, 'morph0')
    gui.add(particles, 'morph1')
    gui.add(particles, 'morph2')
    gui.add(particles, 'morph3')
})

/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update()

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()