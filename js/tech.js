import $ from "jquery";
import * as THREE from 'three';
import * as L from 'leaflet';
import portData from '../data/port.json'
import lenis from './vendors/lenis';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import gsap from "gsap";
import Flip from "./vendors/Flip";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "./vendors/SplitText";
import { lerp, isTouchDevice, xGetter, yGetter, xSetter, ySetter, pointerCurr } from './untils';
import swiper from "./components/swiper";
import { childrenSelect } from "./common/utils/childrenSelector";

import { viewport, viewportBreak } from "./common/helpers/viewport";

gsap.registerPlugin(ScrollTrigger, Flip);

function convertToTitleCase(str) {
    if (!str) {
        return ""
    }
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

gsap.registerPlugin(ScrollTrigger, SplitText);
let typeOpts = {
    lines: { type: 'lines', linesClass: 'g-lines'},
    words: { type: 'words,lines', linesClass: 'g-lines'},
    chars: { type: 'chars,words,lines', linesClass: 'g-lines'}
};
let gOpts = {
    ease: 'power2.easeOut'
}

let map;
class techDemoWebGL {
    constructor() {
        this.container = $('.tech-demo__canvas-inner');
        this.scene = new THREE.Scene();
        this.hdri = new THREE.CubeTextureLoader()
        .load([
            new URL('../assets/map/high/px.png', import.meta.url),
            new URL('../assets/map/high/nx.png', import.meta.url),
            new URL('../assets/map/high/py.png', import.meta.url),
            new URL('../assets/map/high/ny.png', import.meta.url),
            new URL('../assets/map/high/pz.png', import.meta.url),
            new URL('../assets/map/high/nz.png', import.meta.url)
        ])
        this.waypointPos = {
            camera: [
                // Waypoint Intro (already set in setupCamera)
                {
                    x: viewportBreak({ md: 124.2853, sm: 85.63897705078125 }),
                    y: viewportBreak({ md: 35.6434, sm: 14.265151023864746 }),
                    z: viewportBreak({ md: -51.4899, sm: -68.48991394042969 })
                },
                // Waypoint 1 Kite
                {
                    x: viewportBreak({ md: 98.2853, sm: 85.63897705078125 }),
                    y: viewportBreak({ md: 35.6434, sm: 10.265151023864746 }),
                    z: viewportBreak({ md: -51.4899, sm: -68.48991394042969 })
                },
                // Waypoint 2 Hull
                {
                    x: viewportBreak({ md: 61.1701, sm: -75.3858 }),
                    y: viewportBreak({ md: 4.58209, sm: -1.16929 }),
                    z: viewportBreak({ md: 32.9954, sm: -38.9227 })
                },
                // Waypoint 3 Container
                {
                    x: viewportBreak({ md: 42.094, sm: -75.182 }),
                    y: viewportBreak({ md: 24.5614, sm: 40.6084 }),
                    z: viewportBreak({ md: 32.5401, sm: 100.1051 })
                },
                // Waypoint 4 Hydrofoils
                {
                    x: viewportBreak({ md: -42.9873, sm: -20.182 }),
                    y: viewportBreak({ md: 0.581775, sm: 15.6084 }),
                    z: viewportBreak({ md: 20.0917, sm: 10.1051 })
                },
                // Waypoint 5 Auto
                {
                    x: viewportBreak({ md: -23.4135, sm: -20.182 }),
                    y: viewportBreak({ md: 62.8855, sm: 15.6084 }),
                    z: viewportBreak({ md: -27.1162, sm: 10.1051 })
                },
                // Waypoint 6 Twin
                {
                    x: viewportBreak({ md: 58.5225, sm: -20.182 }),
                    y: viewportBreak({ md: 18.8382, sm: 15.6084 }),
                    z: viewportBreak({ md: -68.0648, sm: 10.1051 })
                },
                // Waypoint Outro
                {
                    x: viewportBreak({ md: 58.5225, sm: -20.182 }),
                    y: viewportBreak({ md: 18.8382, sm: 15.6084 }),
                    z: viewportBreak({ md: -68.0648, sm: 10.1051 })
                }
            ],
            target: [
                // lookAt Intro (already set in setupCamera)
                {
                    x: viewportBreak({ md: 89.3979, sm: 55.7516 }),
                    y: viewportBreak({ md: 44.3087, sm: 16.9304 }),
                    z: -1.35464 
                },
                // LookAt 1 Kite
                {
                    x: viewportBreak({ md: 73.3979, sm: 45.7516 }),
                    y: viewportBreak({ md: 44.3087, sm: 21.9304 }),
                    z: -1.35464 
                },
                // LookAt 2 Hull
                {
                    x: viewportBreak({ md: 21.5902, sm: -24.2134 }),
                    y: viewportBreak({ md: 6.77748, sm: 4.46543 }),
                    z: 0.392013
                },
                // LookAt 3 Container
                {
                    x: viewportBreak({ md: 12.1088, sm: 20.3448 }),
                    y: 10.0996,
                    z: -0.376612
                },
                // LookAt 4 Hydrofoils
                {
                    x: viewportBreak({ md: -19.5171, sm: 7.3448 }),
                    y: 5.83064,
                    z: 6.94174
                },
                // LookAt 5 Auto
                {
                    x: viewportBreak({ md: -3.34757, sm: 7.3448 }),
                    y: 3.08693,
                    z: 4.26576
                },
                // LookAt 6 Twin
                {
                    x: viewportBreak({ md: 0.728863, sm: 7.3448 }),
                    y: 5.99502,
                    z: 4.26576
                },
                // LookAt Outro
                {
                    x: viewportBreak({ md: 0.728863, sm: 7.3448 }),
                    y: 5.99502,
                    z: 4.26576
                }
            ]
        }
    }
    get viewport() {
        let width = this.container.width();
        let height = this.container.height();
        let aspectRatio = width / height;
        return {
            width,
            height,
            aspectRatio
        }
    }
    setupCamera() {
        //Resize
        window.addEventListener('resize', this.onWindowResize.bind(this))
        //camera
        let fov = (Math.atan(this.viewport.height / 2 / this.perspective) * 2) * 180 / Math.PI;
        fov = this.viewport.width > 767 ? 32.26880414280885 : 32.26880414280885 * 1;
        this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 0.1, 10000);

        if ($(window).width() > 767) {
            
            this.camera.position.set(
                124.2853, 
                35.6434, 
                viewportBreak({ md: -51.4899, sm:  -68.48991394042969 }) 
            )
            this.lookAtTarget = new THREE.Vector3(
                89.3979, 
                44.3087, 
                -1.35464 
            )
        } else {
            this.camera.position.set(
                85.63897705078125,
                14.265151023864746,
                -68.48991394042969
            )
            this.lookAtTarget = new THREE.Vector3(55.7516, 16.9304, -1.35464
            )
        }
        this.camera.lookAt(this.lookAtTarget)

        //renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        })
        this.renderer.setSize(this.viewport.width, this.viewport.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    createMesh() {
        let url = new URL('../assets/cargo-new-final-break.glb', import.meta.url)
        url = "" + url;
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();

        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.dracoLoader.setDecoderConfig({type: 'js'})
        this.loader.setDRACOLoader( this.dracoLoader )
        this.containerGrp = []
        this.loader.load(url,
        (glb) => {
            console.log('Model loaded, processing objects...')
            this.model = glb.scene;
            this.model.scale.set(1,1,1)
            this.scene.environment = this.hdri;
            this.matt_parachute = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#FF471D'),
                envMapIntensity: 4,
                roughness: .35,
                metalness: 0
            })
            this.matt_default = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#2B2C2F'),
                envMapIntensity: 2,
                roughness: .70,
                metalness: 1,
            })
            this.matt_propeller = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#2B2C2F'),
                envMapIntensity: 2,
                roughness: .70,
                metalness: 1,
                transparent: true,
            })
            this.matt_container = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#2B2C2F'),
                envMapIntensity: 2,
                roughness: .35,
                metalness: 0,
                transparent: true,
            })
            this.matt_tech = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#2B2C2F'),
                opacity: 0,
                envMapIntensity: 3,
                roughness: .70,
                metalness: 1,
                transparent: true
            })
            this.matt_ship = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#2B2C2F'),
                envMapIntensity: 2,
                roughness: .70,
                metalness: 1,
                transparent: true,
                opacity: 1.0,
                depthWrite: true
            })
            this.matt_ship_wire = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#2B2C2F'),
                wireframe: true,
                envMapIntensity: 2,
                roughness: .70,
                metalness: 1,
                transparent: true,
                opacity: 0.0,
                depthWrite: false
            })
            
            // Hybrid material system - objects that will have both wireframe and solid
            this.hybridObjects = []
            this.isWireframeMode = false
            this.isTransitioning = false // Prevent overlapping animations
            this.materialCache = new Map() // Cache materials for better performance
            
            this.model.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    let objName = obj.name.toLowerCase()
                    if (objName.includes('parachute'))  {
                        obj.material = this.matt_parachute;
                    } else if (objName.includes('propeller')) {
                        obj.material = this.matt_propeller;   
                    } else if (objName.includes('container')) {
                        obj.material = this.matt_container;
                        this.containerGrp.push(obj);
                    } else if (objName.includes('ship')) {
                        console.log(obj.name)
                        this.createHybridObject(obj, this.matt_ship, this.matt_ship_wire);
                    } else if (objName.includes('tech') ) {
                        obj.material = this.matt_tech;
                    }
                }

                if (obj.name === 'Ship_Wire') {
                    this.kiteBoneWire = obj
                } else if (obj.name === 'Parachute') {
                    this.kiteBoneParachute = obj
                }
                if (obj.name == 'PropellerL') {
                    this.prop1 = obj;
                } else if (obj.name == 'PropellerR') {
                    this.prop2 = obj;
                }
            })
            this.clock = new THREE.Clock()
            this.scene.add(this.model)
            
            // Debug: Log hybrid objects
            console.log(`Total hybrid objects created: ${this.hybridObjects.length}`);
            this.hybridObjects.forEach((obj, idx) => {
                console.log(`Hybrid object ${idx}:`, obj.solid.name, 'opacity:', obj.solidMaterial.opacity, 'wireframe opacity:', obj.wireframeMaterial.opacity);
            });
            
            this.animate()
            this.scrollAnimate()
        },
        (xhr) => {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        (error) => {
            console.log( error );
        })
    }
    onWindowResize() {
        this.camera.aspect = this.viewport.aspectRatio;
        this.renderer.setSize(this.viewport.width, this.viewport.height)
        this.camera.updateProjectionMatrix();
    }
    animate() {
        if ($('[data-barba-namespace="tech"]').length) {
            this.prop1.rotation.x += 0.1
            this.prop2.rotation.x += 0.1
            this.kiteBoneParachute.rotation.x = Math.sin(this.clock.getElapsedTime()) * Math.PI / 36
            this.kiteBoneParachute.rotation.y = Math.sin(this.clock.getElapsedTime() / 2) * Math.PI / 45
            this.kiteBoneParachute.rotation.z = Math.sin(this.clock.getElapsedTime()) * Math.PI / 90
            this.kiteBoneWire.rotation.x = Math.sin(this.clock.getElapsedTime()) * Math.PI / 36
            this.kiteBoneWire.rotation.y = Math.sin(this.clock.getElapsedTime() / 2) * Math.PI / 45
            this.kiteBoneWire.rotation.z = Math.sin(this.clock.getElapsedTime()) * Math.PI / 90
            this.renderer.render(this.scene, this.camera)
        } else {
        }
        requestAnimationFrame(this.animate.bind(this))
    }
    scrollAnimate() {
        if (this.viewport.width > 767) {
            let lastProgress = 0;
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.tech-demo__main',
                    start: 'top bottom',
                    end: 'bottom top+=25%',
                    scrub: true,
                    markers: true,
                    onUpdate: (self) => {
                        this.camera.lookAt( this.lookAtTarget );
                        
                        // Track scroll direction
                        const currentProgress = self.progress;
                        const isScrollingForward = currentProgress > lastProgress;
                        lastProgress = currentProgress;
                        
                        // Store scroll direction for use in waypoint cases
                        this.isScrollingForward = isScrollingForward;
                    }
                },
                defaults: {
                    ease: 'none'
                }
            });
            tl.set(this.matt_tech, {
                opacity: 0,
            })
            .set(this.matt_propeller.color, {
                r: new THREE.Color('#2B2C2F').r,
                g: new THREE.Color('#2B2C2F').g,
                b: new THREE.Color('#2B2C2F').b,
            })
            this.waypointPos.camera.forEach((waypoint, idx) => {
                if (idx !== 0 ) {
                    tl.to(this.camera.position, {
                        ...this.waypointPos.camera[idx],
                        duration: 1
                    })
                    .to(this.lookAtTarget, {
                        ...this.waypointPos.target[idx],
                        duration: 1
                    }, '<=0')
                    if ( idx !== 1 || idx !== this.waypointPos.length - 1) {
                        tl
                        .to('.tech-demo__main-inner .tech-demo__main-item', {
                            yPercent: -100 * (idx - 1) ,
                            duration: 1
                        }, '<=0')
                    }
                    switch (idx) {
                        case 3:
                            tl.fromTo(this.matt_container, {
                                opacity: 0,
                            }, {
                                opacity: 1,
                                duration: .4,
                            }, '<=.2')
                            this.containerGrp.forEach((el, idx) => {
                                let delayTime;
                                if (idx == 0) {
                                    delayTime = '<=0'
                                } else {
                                    delayTime = '<=0'
                                }
                                tl.from(el.position, {
                                    y: `${10 + 20 * (Math.random() - 0) * 1}`,
                                    duration: .4,
                                }, delayTime)
                            })
                            break;
                        case 4:
                            tl.fromTo(this.matt_propeller.color, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                            }, '<=.2')
                            this.containerGrp.forEach((el, idx) => {
                                let delayTime;
                                if (idx == 0) {
                                    delayTime = '<=0'
                                } else {
                                    delayTime = '<=0'
                                }
                                // Scale from object's center by using a custom update function
                                tl.to({}, {
                                    duration: .4,
                                    onUpdate: function() {
                                        const progress = this.progress();
                                        const scaleValue = 1 - progress; // Scale from 1 to 0
                                        el.scale.set(scaleValue, scaleValue, scaleValue);
                                    }
                                }, delayTime)
                            })
                            
                            // Add wireframe toggle for case 4 - handle scroll direction
                            tl.call(() => {
                                if (this.isScrollingForward && !this.isWireframeMode) {
                                    // Scrolling forward: switch to wireframe
                                    this.toggleWireframeMode(1.0);
                                } else if (!this.isScrollingForward && this.isWireframeMode) {
                                    // Scrolling backward: switch to solid
                                    this.toggleWireframeMode(1.0);
                                }
                            }, null, '<=0.3')
                            break;
                        case 5:
                            tl.fromTo(this.matt_tech, {
                                opacity: 0,
                            }, {
                                opacity: 1,
                                duration: .6,
                            }, '<=0')
                            
                            tl.fromTo(this.matt_tech.color, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                            }, '<=0')
                            break;
                        case 6:
                            // Handle scroll direction for case 6
                            tl.fromTo(this.matt_tech, {
                                opacity: 1,
                            }, {
                                opacity: 0,
                                duration: .6,
                            }, '<=0')
                            tl.fromTo([this.matt_propeller.color, this.matt_tech.color], {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                            }, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, '<=.2')
                            tl.call(() => {
                                if (this.isScrollingForward && this.isWireframeMode) {
                                    // Scrolling forward: switch to solid
                                    this.toggleWireframeMode(1.0);
                                } else if (!this.isScrollingForward && !this.isWireframeMode) {
                                    // Scrolling backward: switch to wireframe
                                    this.toggleWireframeMode(1.0);
                                }
                            }, null, '<=0.3')
                            break;
                        default:
                            break;
                    }
                }
            })
            
        } else {
            let pointer = [
                {
                    position: {
                        x: 85.63897705078125,
                        y: 14.265151023864746,
                        z: -68.48991394042969
                    },
                    lookAt: {
                        x: 55.7516,
                        y: 16.9304,
                        z: -1.35464
                    }
                },
                {
                    position: {
                        x: -50.3858,
                        y: 4.16929,
                        z: -30.9227,
                    },
                    lookAt: {
                        x: -11.2134,
                        y: 1.46543,
                        z: -1.014547,
                    }
                },
                {
                    position: {
                        x: -72.182,
                        y: 58.6084,
                        z: 90.1051
                    },
                    lookAt: {
                        x: 0.3448,
                        y: -4.2503,
                        z: 0.056603
                    }
                },
                {
                    position: {
                        x: -20.182,
                        y: 12.6084,
                        z: 10.1051
                    },
                    lookAt: {
                        x: 0.65,
                        y: 6.7503,
                        z: 0.056603
                    }
                }
            ]
            let activeIndex = 0;
            let prog;
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.tech-demo__main',
                    start: 'top top+=50%',
                    end: 'bottom top+=50%',
                    scrub: true,
                    snap: {
                        snapTo: [.125, .375, .625, .875],
                        duration: { min: 0.2, max: 3 },
                        delay: 0.1,
                        onComplete: (self) => {

                        }
                    },
                    onUpdate: (self) => {
                        this.camera.lookAt( this.lookAtTarget );
                        prog = self.progress.toFixed(2);
                        if (prog <= .25) {
                            activeIndex = 0
                        } else if (prog > .25 && prog <= .5) {
                            activeIndex = 1
                        } else if (prog > .5 && prog <= .75) {
                            activeIndex = 2
                        } else if (prog > .75) {
                            activeIndex = 3
                        }
                        $('.tech-demo__main-item').removeClass('active')
                        $('.tech-demo__main-item').eq(activeIndex).addClass('active')
                    },
                    onEnter: () => {
                        $('.header').addClass('force-hidden')
                    },
                    onLeave: () => {
                        $('.header').removeClass('force-hidden')
                    },
                    onEnterBack: () => {
                        $('.header').addClass('force-hidden')
                    },
                    onLeaveBack: () => {
                        $('.header').removeClass('force-hidden')
                    }
                },
                defaults: {
                    ease: 'none'
                }
            })
            tl
            //Start
            .to('.popup', { duration: .5 })
            .addLabel("demo0")
            .to(this.camera.position, {
                x: pointer[1].position.x,
                y: pointer[1].position.y,
                z: pointer[1].position.z,
                duration: 1
            })
            .to(this.lookAtTarget, {
                x: pointer[1].lookAt.x,
                y: pointer[1].lookAt.y,
                z: pointer[1].lookAt.z,
                duration: 1
            }, '<=0')
            .addLabel("demo1")
            .to(this.camera.position, {
                x: pointer[2].position.x,
                y: pointer[2].position.y,
                z: pointer[2].position.z,
                duration: 1
            })
            .to(this.lookAtTarget, {
                x: pointer[2].lookAt.x,
                y: pointer[2].lookAt.y,
                z: pointer[2].lookAt.z,
                duration: 1
            }, '<=0')
            this.containerGrp.forEach((el, idx) => {
                let delayTime;
                if (idx == 0) {
                    delayTime = '<=.4'
                } else {
                    delayTime = '<=0'
                }
                tl.to(el.position, {
                    y: `${10 + 3 * (Math.random() - .5) * 2}`,
                    duration: .6,
                }, delayTime)
                .to(el.material, {
                    opacity: 0,
                    duration: .6
                }, '<=0')
            })
            tl.addLabel("demo2")
            tl.to(this.camera.position, {
                x: pointer[3].position.x,
                y: pointer[3].position.y,
                z: pointer[3].position.z,
                duration: 1
            })
            .to(this.matt_default, {
                opacity: 0,
                duration: 1,
            }, '<=0')
            .to(this.lookAtTarget, {
                x: pointer[3].lookAt.x,
                y: pointer[3].lookAt.y,
                z: pointer[3].lookAt.z,
                duration: 1
            }, '<=0')
            .addLabel("demo3")

            //End
            .to('.popup', { duration: .5 })

            $('.tech-demo__main-item-toggle').on('click', function(e) {
                e.preventDefault()
                $('.tech-demo__popup-item').eq(activeIndex).addClass('active')
                console.log(activeIndex)
            })
            $('.tech-demo__popup-close').on('click', function(e) {
                e.preventDefault()
                $('.tech-demo__popup-item').removeClass('active')
                console.log(activeIndex)
            })

            $('.tech-demo__main-item-title').on('click', function(e) {
                e.preventDefault();
                let target = $(this).closest('.tech-demo__main-item').index();
                //console.log(target)
                lenis.scrollTo(tl.scrollTrigger.labelToScroll(`demo${target}`), {force: true})
            })

        }
    }
    init() {
        this.setupCamera()
        this.createMesh()
    }
    reset() {
        this.container.append(this.renderer.domElement);
        this.onWindowResize()
    }
    
    // Create a hybrid object that can switch between solid and wireframe
    createHybridObject(mesh, solidMaterial, wireframeMaterial) {
        // Performance: Check if materials are already cached
        const materialKey = `${solidMaterial.uuid}_${wireframeMaterial.uuid}`;
        let cachedMaterials = this.materialCache.get(materialKey);
        
        if (!cachedMaterials) {
            // Create optimized materials with proper settings
            const solidMat = solidMaterial.clone();
            const wireMat = wireframeMaterial.clone();
            
            // Optimize material properties for better performance
            this._optimizeMaterialForTransparency(solidMat);
            this._optimizeMaterialForTransparency(wireMat);
            
            cachedMaterials = { solid: solidMat, wireframe: wireMat };
            this.materialCache.set(materialKey, cachedMaterials);
        }
        
        // Clone the mesh efficiently
        const wireframeMesh = this._cloneMeshOptimized(mesh);
        
        // Set up materials with proper initial states
        mesh.material = cachedMaterials.solid.clone();
        wireframeMesh.material = cachedMaterials.wireframe.clone();
        
        // Initial visibility states - ensure proper setup
        mesh.material.opacity = 1.0;
        mesh.material.depthWrite = true;
        mesh.material.transparent = true;
        
        wireframeMesh.material.opacity = 0.0;
        wireframeMesh.material.depthWrite = false;
        wireframeMesh.material.transparent = true;
        
        // Add to scene efficiently
        mesh.parent.add(wireframeMesh);
        
        // Create optimized hybrid object
        const hybridObject = {
            id: mesh.uuid, // Unique identifier for tracking
            solid: mesh,
            wireframe: wireframeMesh,
            solidMaterial: mesh.material,
            wireframeMaterial: wireframeMesh.material,
            isAnimating: false // Track individual animation state
        };
        
        this.hybridObjects.push(hybridObject);
        return hybridObject;
    }
    
    // Helper: Optimize material for transparency performance
    _optimizeMaterialForTransparency(material) {
        material.transparent = true;
        material.alphaTest = 0.001; // Slight performance boost
        material.needsUpdate = true;
        
        // Optimize for wireframe if applicable
        if (material.wireframe) {
            material.wireframeLinewidth = 1; // Consistent line width
        }
        
        return material;
    }
    
    // Helper: Optimized mesh cloning
    _cloneMeshOptimized(mesh) {
        const cloned = mesh.clone();
        // Share geometry reference for memory efficiency (Three.js handles this well)
        cloned.geometry = mesh.geometry;
        return cloned;
    }
    
    // Toggle between wireframe and solid mode (Optimized)
    toggleWireframeMode(duration = 0.8) {
        // Prevent overlapping animations
        if (this.isTransitioning) {
            console.log('Animation in progress, skipping...');
            return;
        }
        
        this.isWireframeMode = !this.isWireframeMode;
        this.isTransitioning = true;
        
        console.log(`Toggling to ${this.isWireframeMode ? 'wireframe' : 'solid'} mode with ${this.hybridObjects.length} hybrid objects`);
        
        // Enhanced easing for smoother visual transitions
        const easing = 'power2.inOut';
        const staggerDelay = 0.02; // Slight stagger for visual appeal
        
        // Batch animations for better performance
        const animations = [];
        
        this.hybridObjects.forEach((hybridObj, index) => {
            if (hybridObj.isAnimating) return; // Skip if already animating
            
            hybridObj.isAnimating = true;
            const delay = index * staggerDelay;
            
            if (this.isWireframeMode) {
                // Animate to wireframe with optimized timing
                animations.push(
                    gsap.to(hybridObj.solidMaterial, {
                        opacity: 0,
                        duration: duration * 0.6, // Slightly faster fade out
                        delay: delay,
                        ease: easing,
                        onComplete: () => {
                            hybridObj.solidMaterial.depthWrite = false;
                            this._updateMaterialNeedsUpdate(hybridObj.solidMaterial);
                        }
                    })
                );
                
                animations.push(
                    gsap.to(hybridObj.wireframeMaterial, {
                        opacity: 1,
                        duration: duration,
                        delay: delay + duration * 0.2, // Start wireframe slightly after solid fades
                        ease: easing,
                        onStart: () => {
                            hybridObj.wireframeMaterial.depthWrite = true;
                            this._updateMaterialNeedsUpdate(hybridObj.wireframeMaterial);
                        },
                        onComplete: () => {
                            hybridObj.isAnimating = false;
                            console.log(`Completed wireframe animation for ${hybridObj.solid.name}`);
                        }
                    })
                );
            } else {
                // Animate to solid with optimized timing
                animations.push(
                    gsap.to(hybridObj.wireframeMaterial, {
                        opacity: 0,
                        duration: duration * 0.6,
                        delay: delay,
                        ease: easing,
                        onComplete: () => {
                            hybridObj.wireframeMaterial.depthWrite = false;
                            this._updateMaterialNeedsUpdate(hybridObj.wireframeMaterial);
                        }
                    })
                );
                
                animations.push(
                    gsap.to(hybridObj.solidMaterial, {
                        opacity: 1,
                        duration: duration,
                        delay: delay + duration * 0.2,
                        ease: easing,
                        onStart: () => {
                            hybridObj.solidMaterial.depthWrite = true;
                            this._updateMaterialNeedsUpdate(hybridObj.solidMaterial);
                        },
                        onComplete: () => {
                            hybridObj.isAnimating = false;
                            console.log(`Completed solid animation for ${hybridObj.solid.name}`);
                        }
                    })
                );
            }
        });
        
        // Track when all animations complete
        Promise.all(animations.map(anim => anim.then())).finally(() => {
            this.isTransitioning = false;
        });
    }
    
    // Set wireframe blend (0 = solid, 1 = wireframe) - Optimized
    setWireframeBlend(blend, duration = 0.3) {
        // Clamp blend value for safety
        blend = Math.max(0, Math.min(1, blend));
        
        const solidOpacity = 1 - blend;
        const wireframeOpacity = blend;
        const threshold = 0.01; // Optimized threshold
        
        // Batch operations for better performance
        const batchUpdates = [];
        
        this.hybridObjects.forEach((hybridObj, index) => {
            // Skip if already at target values (performance optimization)
            const currentSolidOpacity = hybridObj.solidMaterial.opacity;
            const currentWireOpacity = hybridObj.wireframeMaterial.opacity;
            
            if (Math.abs(currentSolidOpacity - solidOpacity) < 0.001 && 
                Math.abs(currentWireOpacity - wireframeOpacity) < 0.001) {
                return; // Skip unchanged objects
            }
            
            // Optimized stagger for smooth visual flow
            const delay = index * 0.01;
            
            batchUpdates.push(
                gsap.to(hybridObj.solidMaterial, {
                    opacity: solidOpacity,
                    duration: duration,
                    delay: delay,
                    ease: 'power2.out', // Smoother easing for blend
                    onUpdate: () => {
                        // Dynamic depth writing with optimized checks
                        const shouldWrite = hybridObj.solidMaterial.opacity > threshold;
                        if (hybridObj.solidMaterial.depthWrite !== shouldWrite) {
                            hybridObj.solidMaterial.depthWrite = shouldWrite;
                            this._updateMaterialNeedsUpdate(hybridObj.solidMaterial);
                        }
                    }
                })
            );
            
            batchUpdates.push(
                gsap.to(hybridObj.wireframeMaterial, {
                    opacity: wireframeOpacity,
                    duration: duration,
                    delay: delay,
                    ease: 'power2.out',
                    onUpdate: () => {
                        // Dynamic depth writing with optimized checks
                        const shouldWrite = hybridObj.wireframeMaterial.opacity > threshold;
                        if (hybridObj.wireframeMaterial.depthWrite !== shouldWrite) {
                            hybridObj.wireframeMaterial.depthWrite = shouldWrite;
                            this._updateMaterialNeedsUpdate(hybridObj.wireframeMaterial);
                        }
                    }
                })
            );
        });
        
        return batchUpdates; // Return for potential chaining
    }
    
    // Helper: Efficient material update flagging
    _updateMaterialNeedsUpdate(material) {
        if (!material.needsUpdate) {
            material.needsUpdate = true;
            // Defer the reset to avoid excessive updates
            requestAnimationFrame(() => {
                material.needsUpdate = false;
            });
        }
    }
    
    // Performance: Cleanup method for memory management
    dispose() {
        // Clear hybrid objects
        this.hybridObjects.forEach(hybridObj => {
            if (hybridObj.wireframe && hybridObj.wireframe.parent) {
                hybridObj.wireframe.parent.remove(hybridObj.wireframe);
            }
            // Dispose materials
            hybridObj.solidMaterial?.dispose();
            hybridObj.wireframeMaterial?.dispose();
        });
        
        // Clear caches
        this.hybridObjects.length = 0;
        this.materialCache.clear();
        
        console.log('Hybrid system disposed');
    }
}

function techHero() {
    const techHeroLabel = new SplitText('.tech-hero__label', typeOpts.chars);
    const techHeroTitle = new SplitText('.tech-hero__title', typeOpts.words);
    const techHeroSub = new SplitText('.tech-hero__sub', typeOpts.words);

    let tl = gsap.timeline({
        defaults: {
            ease: gOpts.ease
        },
        onComplete: () => {
            techHeroTitle.revert();
            new SplitText('.tech-hero__title', typeOpts.lines);
            techHeroLabel.revert();
        },
        delay: 1.2
    })
    tl
    .from(techHeroLabel.chars, {yPercent: 60, autoAlpha: 0, duration: .6, stagger: .02}, '<=.2')
    .from(techHeroTitle.words, {yPercent: 60, autoAlpha: 0, duration: .6, stagger: .03}, '<=.2')
    .from(techHeroSub.words, {yPercent: 60, autoAlpha: 0, duration: .4, stagger: .02}, '<=.2')
}
function techVideo() {
    const techVidLabel = new SplitText('.tech-vid__label', typeOpts.words);
    let tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.tech-vid__label',
            start: 'top top+=75%',
        },
        defaults: {
            ease: gOpts.ease
        },
        onComplete: () => {
            techVidLabel.revert();
            $('.tech-vid__label-item').addClass('anim')
        },
    })
    tl
    .from(techVidLabel.words, {yPercent: 60, autoAlpha: 0, duration: .8, stagger: .04})
    .from('.tech-vid__main-inner', {yPercent: 60, autoAlpha: 0, duration: .6}, '<=.2')
}
function techVideoInteraction() {
    const container = $('.tech-vid')
    const item = $('.tech-vid__main-inner');
    let offset = ($(window).height() - $('.tech-vid__holder').height())  / 2;
    if (viewport.width > 767) {
        container.addClass('end-state')
        let state = Flip.getState(item);
        container.removeClass('end-state')
        // goal value = 1 - 0.3 = 0.7
        gsap.quickSetter('.tech-vid__play-btn', 'scaleX', ``)(.7);
        gsap.quickSetter('.tech-vid__play-btn', 'scaleY', ``)(.7);
        gsap.set(item, { aspectRatio: item.width() / item.height() })
        Flip.to(state, {
            simple: true,
            scrollTrigger: {
                trigger: '.tech-vid__main',
                start: `top top+=${offset}`,
                end: `top -=${viewportBreak({ md: 150, sm: 40 })}%`,
                scrub: true,
                pin: true,
                onUpdate: (self) => {
                    // goal value = 1 - 0.3 = 0.7
                    let val = 1 - ((1 - self.progress) * .3)
                    gsap.quickSetter('.tech-vid__play-btn', 'scaleX', ``)(val);
                    gsap.quickSetter('.tech-vid__play-btn', 'scaleY', ``)(val);
                }
            }
        })
        ScrollTrigger.create({
            trigger: '.tech-vid',
            start: 'top top',
            end: 'bottom top',
            onLeave: () => {
                videoAction.pause('#vidTech')
            }
        })
    }

    const videoAction = {
        play: (video) => {
            if (!video) return;
            let el = $(video).get(0);
            el.play()

            $('.tech-vid__play-btn').addClass('playing');
            $('.tech-vid__main-vid').addClass('playing');
        },
        pause: (video) => {
            if (!video) return;
            let el = $(video).get(0);
            el.pause()
            $('.tech-vid__play-btn').removeClass('playing');
            $('.tech-vid__main-vid').removeClass('playing');
        }
    }
    let clearThumb = (wrap) => wrap.hasClass('clear-thumb') ? true : wrap.addClass('clear-thumb');
    let playBtn = '.tech-vid__play-btn'
    $(playBtn).on('click', function(e) {
        e.preventDefault();
        videoAction.play('#vidTech');

        if (!clearThumb(item)) return;
        let target;
        if ($(window).width() > 991 ) {
            target = $('.tech-vid').offset().top + $('.tech-vid').outerHeight() - $(window).height() - offset;
        } else {
            target = $('.tech-vid__holder').offset().top + $('.tech-vid__holder').outerHeight() - $(window).height() - offset;
        }
        clearThumb(item);
        lenis.scrollTo(target)
    })

    if (viewport.width > 991) {
        if (!isTouchDevice()) {
            function techVideoHandle() {
                function moveCursor() {
                    let iconsX = xGetter(playBtn);
                    let iconsY = yGetter(playBtn);
                    let vidBoundary = $('.tech-vid__main-inner').get(0);
                    let vidRect = vidBoundary.getBoundingClientRect()
                    let ctrlHeight = 65;

                    if ($('.tech-vid__main-inner').length) {
                        if ($('.tech-vid__main-inner:hover').length) {
                            xSetter(playBtn)(lerp(iconsX, pointerCurr().x - vidRect.left - vidRect.width / 2), 0.01);
                            ySetter(playBtn)(lerp(iconsY, pointerCurr().y - vidRect.top - vidRect.height / 2), 0.01);
                            if (pointerCurr().y - vidRect.top  >= vidRect.height - ctrlHeight) {
                                gsap.to(playBtn, { opacity: 0, duration: 0.3 })
                            } else {
                                gsap.to(playBtn, { opacity: 1, duration: 0.3 })
                            }
                        } else {
                            if ($(playBtn).hasClass('playing')) {
                                gsap.to(playBtn, { opacity: 0, duration: 0.3 })
                            } else {
                                gsap.to(playBtn, { opacity: 1, duration: 0.3 })
                            }

                            xSetter(playBtn)(lerp(iconsX, 0), 0.01);
                            ySetter(playBtn)(lerp(iconsY, 0), 0.01);
                        }
                    }
                }
                moveCursor();

                function checkVidPlaying() {
                    if ($('#vidTech').get(0).paused) {
                        videoAction.pause('#vidTech');
                    }
                    else {
                        videoAction.play('#vidTech');
                    }
                }
                checkVidPlaying();
                requestAnimationFrame(techVideoHandle)
            }
            requestAnimationFrame(techVideoHandle)
        }
    }
}
function removeTechMap() {
    map.remove();
}

function techDemo() {
    let techWebGL = new techDemoWebGL();
    techWebGL.init()
    techWebGL.reset()
    techWebGL.onWindowResize()

    let techDemoItems = $('.tech-demo__main-item');

    if (viewport.width > 767) {
        requestAnimationFrame(() => {
            techDemoItems.each((idx, el) => {
                if (el.querySelectorAll('.tech-demo__main-item-title').length) {
                    const techDemoItemTitle = new SplitText(el.querySelector('.tech-demo__main-item-title'), typeOpts.words)
                    const techDemoItemSub = new SplitText(el.querySelector('.tech-demo__main-item-richtext'), typeOpts.words)
                    const techDemoItemTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: $(el).find('.tech-demo__main-item-title'),
                            start: 'top top+=75%',
                        },
                        onComplete: () => {
                            techDemoItemTitle.revert()
                            new SplitText(el.querySelector('.tech-demo__main-item-title'), typeOpts.lines)
                            techDemoItemSub.revert()
                        }
                    })
                    techDemoItemTl
                    .from(techDemoItemTitle.words, {yPercent: 60, autoAlpha: 0, duration: .6, stagger: .02}, '0')
                    .from(techDemoItemSub.words, {yPercent: 60, autoAlpha: 0, duration: .4, stagger: .02}, '<=.2')
                }
            })
        })
    }
}
function techMap() {
    function reverseLineStringCoordinates(lineString) {
        const reversedCoordinates = lineString.coordinates.map(coord => [coord[1], coord[0]]);
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: reversedCoordinates,
            },
        };
    }
    let routeLayer;

    // Plot the route on the map
    function plotRoute(map, geojsonData) {
        // Add a GeoJSON layer to the map
        const reversedGeoJson = reverseLineStringCoordinates(geojsonData.geometry);

        if (!routeLayer) {
            routeLayer = L.layerGroup().addTo(map);
        } else {
            routeLayer.clearLayers();
        }

        let strokeWidth;
        if ($(window).width() >= 767) {
            strokeWidth = 4;
        } else {
            strokeWidth = 8;
        }
        const geoJsonLayer = L.geoJSON(reversedGeoJson, {
            style: {
                color: '#0074D9',
                weight: strokeWidth,
            },
        }).addTo(routeLayer);

        // Fit the map to the route's bounding box
        const bounds = L.geoJSON(reversedGeoJson).getBounds();
        if ($(window).width() > 767) {
            map.fitBounds(bounds, {
                padding: [20, 20]
            });
        } else {
            map.fitBounds(bounds, {
                padding: [100, 100]
            });
        }

        const popup = L.popup();

        // Add mousemove event handler to the GeoJSON layer
        if ($(window).width() > 767) {
            geoJsonLayer.on('mousemove', handleMouseMove);
        } else {
            geoJsonLayer.on('click', handleMouseMove);
        }

        // Remove popup when mouse leaves the GeoJSON layer
        geoJsonLayer.on('mouseout', handleMouseOut);

        function handleMouseMove(e) {
            console.log('move')
            const { duration_hr, distance_km, average_speed_km_h } = geojsonData.properties;
            const days = Math.floor(duration_hr / 24);
            const hours = Math.floor(duration_hr % 24);
            const minutes = Math.floor(((duration_hr % 24) % 1) * 60);

            const popupContent = `
            <div class="txt txt-14 leaflet-popup-content-inner">
            <div class="route-info-item">
            Estimated Median Duration:<br>
            <span class="txt-bold">${days} days ${hours} hours ${minutes} minutes</span>
            </div>
            <div class="route-info-item">
            Estimated Median Distance:<br>
            <span class="txt-bold">${distance_km.toFixed(2)} km</span>
            </div>
            <div class="route-info-item">
            Estimated Average Speed:<br>
            <span class="txt-bold">${average_speed_km_h.toFixed(2)} km/h</span>
            </div
            </div>
            `;
            console.log(e.latlng)
            popup.setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(map);
        }

        function handleMouseOut() {
            map.closePopup();
        }
    }

    async function getRouteData(startPortId, endPortId) {
        const backendUrl = 'https://qqezpzkio3.execute-api.eu-central-1.amazonaws.com/prod/route-planner/median-route'; // Replace with your actual backend endpoint

        // Construct the URL with query parameters
        const queryParams = `?startPortId=${startPortId}&destinationPortId=${endPortId}`;
        const routeUrl = backendUrl + queryParams;

        const response = await fetch(routeUrl);

        if (response.status === 204) {
            // No route available (HTTP 204)
            alert('No route available for the selected ports yet.');
            return null;
        } else if (response.status >= 300) {
            // Something went wrong (HTTP 300+)
            alert('An error occurred while fetching the route data.');
            return null;
        } else {
            // Valid response, update the map
            const geojsonData = await response.json();
            return geojsonData;
        }
    }

    // Initialize Leaflet map
    const key = 'nr4f7CVikOUm5YaHaZtC';
    map = L.map('techMap').setView([0, 20], 2);
    map.scrollWheelZoom.disable()
    if ($(window).width() <= 767) {
        map.dragging.disable()
    }

    // Default center coordinates and zoom level
    L.tileLayer(`https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${key}`, {
        minZoom: 1,
        maxZoom: 17,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map); // Replace with your desired tile layer


    const updateButton = document.getElementById('updateRoute');

    // Event listener for the button click
    updateButton.addEventListener('click', async () => {
        // Get the start and end port IDs from the input fields
        const startPortId = document.getElementById('startPort').value;
        const endPortId = document.getElementById('endPort').value;

        // Check if both input fields are filled
        if (!startPortId || !endPortId) {
            alert('Please enter both start and end port IDs.');
            return;
        }
        $(updateButton).addClass('loading')
        const geojsonData = await getRouteData(startPortId, endPortId);

        if (geojsonData) {
            $(updateButton).removeClass('loading')
            plotRoute(map, geojsonData);
        }
    });

    function createPortItem(item, template) {
        let html = template.clone()
        html.find('.port-item-id').text(item.id)
        html.find('.port-item-name').text(convertToTitleCase(item.portName))
        return html;
    }
    function updatePortList() {
        let template = $('.port-item').eq(0).clone();
        $('.input-drop-inner').html('');
        let portList = portData.ports

        portList.forEach((el) => {
            createPortItem(el, template).appendTo('.input-drop-inner')
        })

        $('.port-item').on('click', function(e) {
            e.preventDefault();
            let name = $(this).find('.port-item-name').text();
            let id = $(this).find('.port-item-id').text();
            $(this).closest('.input-wrap').find('.input-field').val(name)
            $(this).closest('.input-wrap').find('.input-hidden').val(id)

            if ($(this).closest('.input-wrap').hasClass('input-wrap-start')) {
                $('.input-wrap-end .port-item').removeClass('hidden-dup')
                $('.input-wrap-end .port-item').each((idx, el) => {
                    if ($(el).find('.port-item-id').text() === id) {
                        $(el).addClass('hidden-dup')
                    }
                })
            } else {
                $('.input-wrap-start .port-item').removeClass('hidden-dup')
                $('.input-wrap-start .port-item').each((idx, el) => {
                    if ($(el).find('.port-item-id').text() === id) {
                        $(el).addClass('hidden-dup')
                    }
                })
            }
        })
    }
    updatePortList()

    let techMapInput = $('.tech-map .input-field');

    techMapInput.on('keyup', function(e) {
        let itemList = $(this).closest('.input-wrap').find('.port-item');
        let value = $(this).val().toLowerCase().trim();
        if (value == '') {
            itemList.removeClass('hidden-srch')
        } else {
            itemList.each((idx, el) => {
                let compVal = $(el).find('.port-item-name').text()
                if (compVal.toLowerCase().includes(value)) {
                    $(el).removeClass('hidden-srch');
                    $(el).slideDown()
                } else {
                    $(el).addClass('hidden-srch');
                    $(el).slideUp()
                }
            })
            if ($(this).closest('.input-wrap').find('.port-item:not(".hidden-srch"):not(".hidden-dup")').length == 0) {
                $(this).closest('.input-wrap').find('.port-item-empty-txt').slideDown()
            } else {
                $(this).closest('.input-wrap').find('.port-item-empty-txt').slideUp()
            }
        }
    })
    techMapInput.on('focus', function(e) {
        $(this).parent('.input-wrap').find('.input-drop').slideDown()
    })
    techMapInput.on('blur', function(e) {
        $(this).parent('.input-wrap').find('.input-drop').slideUp()
        $(this).closest('.input-wrap').find('.port-item').removeClass('hidden-srch')
    })

}
function techMapInteraction() {
    const techMapTitle = new SplitText('.tech-map__title', typeOpts.words)
    const techMapSub = new SplitText('.tech-map__sub', typeOpts.words)
    const techMapTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.tech-map__head',
            start: 'top top+=65%',
        },
        onComplete: () => {
            techMapTitle.revert()
            new SplitText('.tech-map__title', typeOpts.lines)
            techMapSub.revert()
        }
    })
    techMapTl
    .from(techMapTitle.words, {yPercent: 60, autoAlpha: 0, duration: .6, stagger: .02})
    .from(techMapSub.words, {yPercent: 60, autoAlpha: 0, duration: .4, stagger: .02}, '<=.2')
    .from('.tech-map__form > *', {yPercent: 25, autoAlpha: 0, duration: .6, stagger: .2, clearProps: 'all'}, '>=-.2')
}
function techControl() {
    const techControlTitle = new SplitText('.tech-control__title', typeOpts.words)
    const techControlSub = new SplitText('.tech-control__richtext', typeOpts.words)
    const techControlTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.tech-control__head',
            start: 'top top+=65%',
        },
        onComplete: () => {
            techControlTitle.revert()
            new SplitText('.tech-control__title', typeOpts.lines)
            techControlSub.revert()
        }
    })
    techControlTl
    .from(techControlTitle.words, {yPercent: 60, autoAlpha: 0, duration: .6, stagger: .02})
    .from(techControlSub.words, {yPercent: 60, autoAlpha: 0, duration: .4, stagger: .02}, '<=.2')

    // if (viewport.width > 767) {
        const tlScrub = gsap.timeline({
            scrollTrigger: {
                trigger: '.tech-control__img',
                start: 'top bottom',
                endTrigger: '.footer',
                end: 'bottom bottom',
                scrub: true,
            }
        })

        requestAnimationFrame(() => {
            tlScrub
            .from('.tech-control__img', {yPercent: 35, ease: 'none'})
        })
    // }
}

const techScript = {
    namespace: 'tech',
    afterEnter() {
        console.log('enter tech')
        setTimeout(() => {
            techHero()
            techVideo()
            techVideoInteraction();
            techDemo()
            techMap()
            techMapInteraction()
            techControl()


        }, 100);
    },
    beforeLeave() {
        console.log('leave tech')
        removeTechMap()
    }
}

export default techScript