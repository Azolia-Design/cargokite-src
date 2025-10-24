import $ from "jquery";
import * as THREE from 'three';
import * as L from 'leaflet';
import portLookup from '../data/ports_lookup.json';
import adjacencyData from '../data/adjacency_by_port.json';
import lenis from './vendors/lenis';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

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
        this.scene.background = new THREE.Color('#212121');
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
                    x: viewportBreak({ md: 124.2853, sm: 124.2853, xs: 124.2853}),
                    y: viewportBreak({ md: 35.6434, sm: 35.6434, xs: 35.6434}),
                    z: viewportBreak({ md: -51.4899, sm: -51.4899, xs: -51.4899}),
                },
                // Waypoint 1 Kite
                {
                    x: viewportBreak({ md: 98.2853, sm: 98.2853, xs: 98.2853}),
                    y: viewportBreak({ md: 35.6434, sm: 35.6434, xs: 35.6434}),
                    z: viewportBreak({ md: -51.4899, sm: -51.4899, xs: -51.4899}),
                },
                // Waypoint 2 Hull
                {
                    x: viewportBreak({ md: 61.1701, sm: 61.1701, xs: 61.1701}),
                    y: viewportBreak({ md: 4.58209, sm: 4.58209, xs: 4.58209}),
                    z: viewportBreak({ md: 32.9954, sm: 32.9954, xs: 32.9954}),
                },
                // Waypoint 3 Container
                {
                    x: viewportBreak({ md: 42.094, sm: 42.094, xs: 42.094}),
                    y: viewportBreak({ md: 24.5614, sm: 24.5614, xs: 24.5614}),
                    z: viewportBreak({ md: 32.5401, sm: 32.5401, xs: 32.5401}),
                },
                // Waypoint 4 Hydrofoils
                {
                    x: viewportBreak({ md: -42.9873, sm: -42.9873, xs: -42.9873}),
                    y: viewportBreak({ md: 0.581775, sm: 0.581775, xs: 0.581775}),
                    z: viewportBreak({ md: 20.0917, sm: 20.0917, xs: 20.0917}),
                },
                // Waypoint 5 Auto
                {
                    x: viewportBreak({ md: -23.4135, sm: -23.4135, xs: -23.4135}),
                    y: viewportBreak({ md: 62.8855, sm: 62.8855, xs: 62.8855}),
                    z: viewportBreak({ md: -27.1162, sm: -27.1162, xs: -27.1162}),
                },
                // Waypoint 6 Twin
                {
                    x: viewportBreak({ md: 2.14813, sm: 2.14813, xs: 2.14813}),
                    y: viewportBreak({ md: 9.41323, sm: 9.41323, xs: 9.41323}),
                    z: viewportBreak({ md: -79.4959, sm: -79.4959, xs: -79.4959}),
                },
                // Waypoint Outro
                {
                    x: viewportBreak({ md: 2.14813, sm: 2.14813, xs: 2.14813}),
                    y: viewportBreak({ md: 9.41323, sm: 9.41323, xs: 9.41323}),
                    z: viewportBreak({ md: -79.4959, sm: -79.4959, xs: -79.4959}),
                }
            ],
            target: [
                // lookAt Intro (already set in setupCamera)
                {
                    x: viewportBreak({ md: 89.3979, sm: 89.3979, xs: 89.3979}),
                    y: viewportBreak({ md: 44.3087, sm: 44.3087, xs: 44.3087}),
                    z: viewportBreak({md: -1.35464, sm: -1.35464, xs: -1.35464}),
                },
                // LookAt 1 Kite
                {
                    x: viewportBreak({ md: 73.3979, sm: 73.3979, xs: 73.3979}),
                    y: viewportBreak({ md: 44.3087, sm: 44.3087, xs: 44.3087}),
                    z: viewportBreak({md: -1.35464, sm: -1.35464, xs: -1.35464}),
                },
                // LookAt 2 Hull
                {
                    x: viewportBreak({ md: 21.5902, sm: 21.5902, xs: 21.5902}),
                    y: viewportBreak({ md: 6.77748, sm: 6.77748, xs: 6.77748}),
                    z: viewportBreak({ md: 0.392013, sm: 0.392013, xs: 0.392013}),
                },
                // LookAt 3 Container
                {
                    x: viewportBreak({ md: 12.1088, sm: 12.1088, xs: 12.1088}),
                    y: viewportBreak({ md: 10.0996, sm: 10.0996, xs: 10.0996}),
                    z: viewportBreak({ md: -0.376612, sm: -0.376612, xs: -0.376612}),
                },
                // LookAt 4 Hydrofoils
                {
                    x: viewportBreak({ md: -19.5171, sm: -19.5171, xs: -19.5171}),
                    y: viewportBreak({ md: 5.83064, sm: 5.83064, xs: 5.83064}),
                    z: viewportBreak({ md: 6.94174, sm: 6.94174, xs: 6.94174}),
                },
                // LookAt 5 Auto
                {
                    x: viewportBreak({ md: -3.34757, sm: -3.34757, xs: 0.34757}),
                    y: viewportBreak({ md: 3.08693, sm: 3.08693, xs: 3.08693}),
                    z: viewportBreak({ md: 4.26576, sm: 4.26576, xs: 0.26576}),
                },
                // LookAt 6 Twin
                {
                    x: viewportBreak({ md: 2.14813, sm: 2.14813, xs: 2.14813}),
                    y: viewportBreak({ md: 9.41323, sm: 9.41323, xs: 9.41323}),
                    z: viewportBreak({ md: 0, sm: 0, xs: 0}),
                },
                // LookAt Outro
                {
                    x: viewportBreak({ md: 2.14813, sm: 2.14813, xs: 2.14813}),
                    y: viewportBreak({ md: 9.41323, sm: 9.41323, xs: 9.41323}),
                    z: viewportBreak({ md: 0, sm: 0, xs: 0}),
                }
            ]
        }
        this.containerPos = {
            big: [
                {x: -17.340879440307617, y: 8.71361255645752, z: 6.250551223754883},
                {x: -17.343441009521484, y: 8.713434219360352, z: -6.136998653411865},
                {x: -17.343441009521484, y: 8.713434219360352, z: -4.365642547607422},
                {x: -17.343441009521484, y: 8.713434219360352, z: -2.5943846702575684},
                {x: -17.343441009521484, y: 8.713434219360352, z: -0.8231337070465088},
                {x: -17.343441009521484, y: 8.713434219360352, z: 0.9481694102287292},
                {x: -17.343441009521484, y: 8.713434219360352, z: 2.7193949222564697},
                {x: -17.343441009521484, y: 8.713434219360352, z: 4.4906158447265625},
                {x: -17.340879440307617, y: 10.237847328186035, z: 6.250551223754883},
                {x: -17.343441009521484, y: 10.237668991088867, z: -6.136998653411865},
                {x: -17.343441009521484, y: 10.237668991088867, z: -4.365642547607422},
                {x: -17.343441009521484, y: 10.237668991088867, z: -2.5943846702575684},
                {x: -17.343441009521484, y: 10.237668991088867, z: -0.8231337070465088},
                {x: -17.343441009521484, y: 10.237668991088867, z: 0.9481694102287292},
                {x: -17.343441009521484, y: 10.237668991088867, z: 2.7193949222564697},
                {x: -17.343441009521484, y: 10.237668991088867, z: 4.4906158447265625},
                {x: -17.340879440307617, y: 11.762081146240234, z: 6.250551223754883},
                {x: -17.343441009521484, y: 11.761903762817383, z: -6.136998653411865},
                {x: -17.343441009521484, y: 11.761903762817383, z: -4.365642547607422},
                {x: -17.343441009521484, y: 11.761903762817383, z: -2.5943846702575684},
                {x: -17.343441009521484, y: 11.761903762817383, z: -0.8231337070465088},
                {x: -17.343441009521484, y: 11.761903762817383, z: 0.9481694102287292},
                {x: -17.343441009521484, y: 11.761903762817383, z: 2.7193949222564697},
                {x: -17.343441009521484, y: 11.761903762817383, z: 4.4906158447265625},
                {x: -9.594785690307617, y: 8.71361255645752, z: 6.250551223754883},
                {x: -9.597347259521484, y: 8.713434219360352, z: -6.136998653411865},
                {x: -9.597347259521484, y: 8.713434219360352, z: -4.365642547607422},
                {x: -9.597347259521484, y: 8.713434219360352, z: -2.5943846702575684},
                {x: -9.597347259521484, y: 8.713434219360352, z: -0.8231337070465088},
                {x: -9.597347259521484, y: 8.713434219360352, z: 0.9481694102287292},
                {x: -9.597347259521484, y: 8.713434219360352, z: 2.7193949222564697},
                {x: -9.597347259521484, y: 8.713434219360352, z: 4.4906158447265625},
                {x: -9.594785690307617, y: 10.237847328186035, z: 6.250551223754883},
                {x: -9.597347259521484, y: 10.237668991088867, z: -6.136998653411865},
                {x: -9.597347259521484, y: 10.237668991088867, z: -4.365642547607422},
                {x: -9.597347259521484, y: 10.237668991088867, z: -2.5943846702575684},
                {x: -9.597347259521484, y: 10.237668991088867, z: -0.8231337070465088},
                {x: -9.597347259521484, y: 10.237668991088867, z: 0.9481694102287292},
                {x: -9.597347259521484, y: 10.237668991088867, z: 2.7193949222564697},
                {x: -9.597347259521484, y: 10.237668991088867, z: 4.4906158447265625},
                {x: -9.594785690307617, y: 11.762081146240234, z: 6.250551223754883},
                {x: -9.597347259521484, y: 11.761903762817383, z: -6.136998653411865},
                {x: -9.597347259521484, y: 11.761903762817383, z: -4.365642547607422},
                {x: -9.597347259521484, y: 11.761903762817383, z: -2.5943846702575684},
                {x: -9.597347259521484, y: 11.761903762817383, z: -0.8231337070465088},
                {x: -9.597347259521484, y: 11.761903762817383, z: 0.9481694102287292},
                {x: -9.597347259521484, y: 11.761903762817383, z: 2.7193949222564697},
                {x: -9.597347259521484, y: 11.761903762817383, z: 4.4906158447265625},
                {x: 10.053949356079102, y: 8.713508605957031, z: 6.25051736831665},
                {x: 10.051405906677246, y: 8.713330268859863, z: -6.136936187744141},
                {x: 10.051405906677246, y: 8.713330268859863, z: -4.365665435791016},
                {x: 10.051405906677246, y: 8.713330268859863, z: -2.5943942070007324},
                {x: 10.051405906677246, y: 8.713330268859863, z: -0.8231255412101746},
                {x: 10.051405906677246, y: 8.713330268859863, z: 0.9481428861618042},
                {x: 10.051405906677246, y: 8.713330268859863, z: 2.7194151878356934},
                {x: 10.051405906677246, y: 8.713330268859863, z: 4.4906816482543945},
                {x: 10.053949356079102, y: 10.237743377685547, z: 6.25051736831665},
                {x: 10.051405906677246, y: 10.237565040588379, z: -6.136936187744141},
                {x: 10.051405906677246, y: 10.237565040588379, z: -4.365665435791016},
                {x: 10.051405906677246, y: 10.237565040588379, z: -2.5943942070007324},
                {x: 10.051405906677246, y: 10.237565040588379, z: -0.8231255412101746},
                {x: 10.051405906677246, y: 10.237565040588379, z: 0.9481428861618042},
                {x: 10.051405906677246, y: 10.237565040588379, z: 2.7194151878356934},
                {x: 10.051405906677246, y: 10.237565040588379, z: 4.4906816482543945},
                {x: 10.053949356079102, y: 11.761977195739746, z: 6.25051736831665},
                {x: 10.051405906677246, y: 11.761799812316895, z: -6.136936187744141},
                {x: 10.051405906677246, y: 11.761799812316895, z: -4.365665435791016},
                {x: 10.051405906677246, y: 11.761799812316895, z: -2.5943942070007324},
                {x: 10.051405906677246, y: 11.761799812316895, z: -0.8231255412101746},
                {x: 10.051405906677246, y: 11.761799812316895, z: 0.9481428861618042},
                {x: 10.051405906677246, y: 11.761799812316895, z: 2.7194151878356934},
                {x: 10.051405906677246, y: 11.761799812316895, z: 4.4906816482543945},
                {x: 17.8000431060791, y: 8.713508605957031, z: 6.25051736831665},
                {x: 17.797500610351562, y: 8.713330268859863, z: -6.136936187744141},
                {x: 17.797500610351562, y: 8.713330268859863, z: -4.365665435791016},
                {x: 17.797500610351562, y: 8.713330268859863, z: -2.5943942070007324},
                {x: 17.797500610351562, y: 8.713330268859863, z: -0.8231255412101746},
                {x: 17.797500610351562, y: 8.713330268859863, z: 0.9481428861618042},
                {x: 17.797500610351562, y: 8.713330268859863, z: 2.7194151878356934},
                {x: 17.797500610351562, y: 8.713330268859863, z: 4.4906816482543945},
                {x: 17.8000431060791, y: 10.237743377685547, z: 6.25051736831665},
                {x: 17.797500610351562, y: 10.237565040588379, z: -6.136936187744141},
                {x: 17.797500610351562, y: 10.237565040588379, z: -4.365665435791016},
                {x: 17.797500610351562, y: 10.237565040588379, z: -2.5943942070007324},
                {x: 17.797500610351562, y: 10.237565040588379, z: -0.8231255412101746},
                {x: 17.797500610351562, y: 10.237565040588379, z: 0.9481428861618042},
                {x: 17.797500610351562, y: 10.237565040588379, z: 2.7194151878356934},
                {x: 17.797500610351562, y: 10.237565040588379, z: 4.4906816482543945},
                {x: 17.8000431060791, y: 11.761977195739746, z: 6.25051736831665},
                {x: 17.797500610351562, y: 11.761799812316895, z: -6.136936187744141},
                {x: 17.797500610351562, y: 11.761799812316895, z: -4.365665435791016},
                {x: 17.797500610351562, y: 11.761799812316895, z: -2.5943942070007324},
                {x: 17.797500610351562, y: 11.761799812316895, z: -0.8231255412101746},
                {x: 17.797500610351562, y: 11.761799812316895, z: 0.9481428861618042},
                {x: 17.797500610351562, y: 11.761799812316895, z: 2.7194151878356934},
                {x: 17.797500610351562, y: 11.761799812316895, z: 4.4906816482543945}
            ],
            small: [
                {x: -0.9320406913757324, y: 8.713940620422363, z: 6.214669227600098},
                {x: -4.922352313995361, y: 8.713022232055664, z: 6.173358917236328},
                {x: -4.908895015716553, y: 8.714495658874512, z: -6.179901599884033},
                {x: -4.908895015716553, y: 8.714495658874512, z: -4.408578872680664},
                {x: -4.908895015716553, y: 8.714495658874512, z: -2.6373260021209717},
                {x: -4.908895015716553, y: 8.714495658874512, z: -0.8660440444946289},
                {x: -4.908895015716553, y: 8.714495658874512, z: 0.9052312970161438},
                {x: -4.908895015716553, y: 8.714495658874512, z: 2.6764540672302246},
                {x: -4.908895015716553, y: 8.714495658874512, z: 4.447768211364746},
                {x: -4.922352313995361, y: 10.237255096435547, z: 6.173358917236328},
                {x: -4.908895015716553, y: 10.238728523254395, z: -6.179901599884033},
                {x: -4.908895015716553, y: 10.238728523254395, z: -4.408578872680664},
                {x: -4.908895015716553, y: 10.238728523254395, z: -2.6373260021209717},
                {x: -4.908895015716553, y: 10.238728523254395, z: -0.8660440444946289},
                {x: -4.908895015716553, y: 10.238728523254395, z: 0.9052312970161438},
                {x: -4.908895015716553, y: 10.238728523254395, z: 2.6764540672302246},
                {x: -4.908895015716553, y: 10.238728523254395, z: 4.447768211364746},
                {x: -4.922352313995361, y: 11.761488914489746, z: 6.173358917236328},
                {x: -4.908895015716553, y: 11.762962341308594, z: -6.179901599884033},
                {x: -4.908895015716553, y: 11.762962341308594, z: -4.408578872680664},
                {x: -4.908895015716553, y: 11.762962341308594, z: -2.6373260021209717},
                {x: -4.908895015716553, y: 11.762962341308594, z: -0.8660440444946289},
                {x: -4.908895015716553, y: 11.762962341308594, z: 0.9052312970161438},
                {x: -4.908895015716553, y: 11.762962341308594, z: 2.6764540672302246},
                {x: -4.908895015716553, y: 11.762962341308594, z: 4.447768211364746},
                {x: -0.9269681572914124, y: 8.714495658874512, z: 3.0063652992248535},
                {x: -0.9269681572914124, y: 8.714495658874512, z: 4.612671375274658},
                {x: 3.059438943862915, y: 8.713940620422363, z: 6.214669227600098},
                {x: 3.06451153755188, y: 8.714495658874512, z: 3.0063652992248535},
                {x: 3.06451153755188, y: 8.714495658874512, z: 4.612671375274658},
                {x: -0.9320406913757324, y: 10.238174438476562, z: 6.214669227600098},
                {x: -0.9269681572914124, y: 10.238729476928711, z: 3.0063652992248535},
                {x: -0.9269681572914124, y: 10.238729476928711, z: 4.612671375274658},
                {x: 3.059438943862915, y: 10.238174438476562, z: 6.214669227600098},
                {x: 3.06451153755188, y: 10.238729476928711, z: 3.0063652992248535},
                {x: 3.06451153755188, y: 10.238729476928711, z: 4.612671375274658},
                {x: -0.9320406913757324, y: 11.762408256530762, z: 6.214669227600098},
                {x: -0.9269681572914124, y: 11.76296329498291, z: 3.0063652992248535},
                {x: -0.9269681572914124, y: 11.76296329498291, z: 4.612671375274658},
                {x: 3.059438943862915, y: 11.762408256530762, z: 6.214669227600098},
                {x: 3.06451153755188, y: 11.76296329498291, z: 3.0063652992248535},
                {x: 3.06451153755188, y: 11.76296329498291, z: 4.612671375274658},
                {x: -0.9320406913757324, y: 8.713940620422363, z: -2.971550464630127},
                {x: -0.9269681572914124, y: 8.714495658874512, z: -6.179854393005371},
                {x: -0.9269681572914124, y: 8.714495658874512, z: -4.573548316955566},
                {x: 3.059438943862915, y: 8.713940620422363, z: -2.971550464630127},
                {x: 3.06451153755188, y: 8.714495658874512, z: -6.179854393005371},
                {x: 3.06451153755188, y: 8.714495658874512, z: -4.573548316955566},
                {x: -0.9320406913757324, y: 10.238174438476562, z: -2.971550464630127},
                {x: -0.9269681572914124, y: 10.238729476928711, z: -6.179854393005371},
                {x: -0.9269681572914124, y: 10.238729476928711, z: -4.573548316955566},
                {x: 3.059438943862915, y: 10.238174438476562, z: -2.971550464630127},
                {x: 3.06451153755188, y: 10.238729476928711, z: -6.179854393005371},
                {x: 3.06451153755188, y: 10.238729476928711, z: -4.573548316955566},
                {x: -0.9320406913757324, y: 11.762408256530762, z: -2.971550464630127},
                {x: -0.9269681572914124, y: 11.76296329498291, z: -6.179854393005371},
                {x: -0.9269681572914124, y: 11.76296329498291, z: -4.573548316955566},
                {x: 3.059438943862915, y: 11.762408256530762, z: -2.971550464630127},
                {x: 3.06451153755188, y: 11.76296329498291, z: -6.179854393005371},
                {x: 3.06451153755188, y: 11.76296329498291, z: -4.573548316955566}
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
        fov = viewportBreak({ md: 32.26880414280885, sm: 32.26880414280885, xs: 62.26880414280885 });
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
            preserveDrawingBuffer: false, logarithmicDepthBuffer: true
        })
        this.renderer.setSize(this.viewport.width, this.viewport.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Setup post-processing for bloom effect
        this.setupPostProcessing();
    }

    setupPostProcessing() {
        // Create effect composer
        this.composer = new EffectComposer(this.renderer);

        // Add render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Add bloom pass
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.viewport.width, this.viewport.height),
            1.5,    // strength
            0,    // radius
            1    // threshold
        );
        this.composer.addPass(this.bloomPass);

        // Enable bloom for glowing materials
        this.bloomPass.threshold = 1; // Lower threshold for more bloom
        this.bloomPass.strength = 1.5;  // Higher strength for more glow
        this.bloomPass.radius = 0;    // Bloom radius
    }

    createMesh() {
        let url = new URL('../assets/cargo-new-pipe-dense.glb', import.meta.url)
        url = "" + url;
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();

        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        this.dracoLoader.setDecoderConfig({type: 'js'})
        this.loader.setDRACOLoader( this.dracoLoader )
        this.containerGrp = []
        this.bigContainerBaseModel = null
        this.smallContainerBaseModel = null
        this.propellerSpeed = {value: 1}
        this.glowPipe = {value: 0}
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
                metalness: 0,
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

            this.matt_pipeTec = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#00E5FF'),
                emissive: new THREE.Color('#00E5FF'),
                emissiveIntensity: 0,
                toneMapped: false,
                envMapIntensity: 3,
                roughness: 0.1,
                metalness: 0.9,
                transparent: true,
                opacity: 0,
            })
            this.matt_pipeProp = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#FF471D'),
                emissive: new THREE.Color('#FF471D'),
                emissiveIntensity: 0,
                toneMapped: false,
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
                opacity: 0,
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
            this.matt_ship_wire = new THREE.LineBasicMaterial({
                color: new THREE.Color('#313235'),
                transparent: true,
                opacity: 0.0,
                depthWrite: false
            })

            // Hybrid material system - objects that will have both wireframe and solid
            this.hybridObjects = []
            this.isWireframeMode = false
            this.isTransitioning = false // Prevent overlapping animations
            this.materialCache = new Map() // Cache materials for better performance
            this.armRight = []
            this.armLeft = []
            this.arm2Right = []
            this.arm2Left = []
            this.model.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    let objName = obj.name.toLowerCase()
                    if (objName.includes('parachute'))  {
                        obj.material = this.matt_parachute;
                    } else if (objName.includes('propeller')) {
                        obj.material = this.matt_propeller;
                    } else if (objName.includes('container')) {
                        if (objName.includes('large')) {
                            if (!this.bigContainerBaseModel) {
                                obj.material = this.matt_container;
                                this.bigContainerBaseModel = obj.clone();
                                this.containerGrp.push(obj)
                                console.log(obj.userData.position)
                            }
                        } else if (objName.includes('small')) {
                            if (!this.smallContainerBaseModel) {
                                obj.material = this.matt_container;
                                this.smallContainerBaseModel = obj.clone();
                                this.containerGrp.push(obj)
                            }
                        }
                    } else if (objName.includes('ship')) {
                        console.log(obj.name)
                        // obj.material = this.matt_ship;
                        this.createHybridObject(obj, this.matt_ship, this.matt_ship_wire);
                    } else if (objName.includes('tech') ) {
                        obj.material = this.matt_tech;
                    } else if (objName.includes('pipeprop')) {
                        obj.material = this.matt_pipeProp;
                    } else if (objName.includes('pipete')) {
                        obj.material = this.matt_pipeTec;
                    }

                    if (obj.name === 'Ship_Wire') {
                        this.kiteBoneWire = obj
                    } else if (obj.name === 'Parachute') {
                        this.kiteBoneParachute = obj
                    } else if (obj.name === 'Ship_Anten_Arm_R') {
                        this.armRight.push(obj)
                    } else if (obj.name === 'Ship_Anten_Arm_L') {
                        this.armLeft.push(obj)
                    } else if (obj.name === 'Ship_Anten_Arm_2_R') {
                        this.arm2Right.push(obj)
                    } else if (obj.name === 'Ship_Anten_Arm_2_L') {
                        this.arm2Left.push(obj)
                    } else if (obj.name == 'PropellerL') {
                        this.prop1 = obj;
                    } else if (obj.name == 'PropellerR') {
                        this.prop2 = obj;
                    }
                }
            })
            this.clock = new THREE.Clock()

            // Remove duplicate antenna arm objects
            // this.model.traverse((obj) => {
            //     if (obj.name === 'Ship_Anten_Arm_2_R' && !this.arm2Right.includes(obj)) {
            //         console.log('Removing duplicate arm2Right')
            //         obj.parent.remove(obj)
            //     }
            //     if (obj.name === 'Ship_Anten_Arm_2_L' && !this.arm2Left.includes(obj)) {
            //         console.log('Removing duplicate arm2Left')
            //         obj.parent.remove(obj)
            //     }
            // })
            this.scene.add(this.model)

            // Create container instances using predefined positions
            this.createContainerInstancesFromPositions();

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

        // Update composer size
        if (this.composer) {
            this.composer.setSize(this.viewport.width, this.viewport.height);
        }
    }
    animate() {
        if ($('[data-barba-namespace="tech"]').length) {
            this.prop1.rotation.x += 0.1 * this.propellerSpeed.value
            this.prop2.rotation.x += 0.1 * this.propellerSpeed.value

            if (this.kiteBoneWire && this.kiteBoneParachute) {
                this.kiteBoneParachute.rotation.x = Math.sin(this.clock.getElapsedTime()) * Math.PI / 36
                this.kiteBoneParachute.rotation.y = Math.sin(this.clock.getElapsedTime() / 2) * Math.PI / 45
                this.kiteBoneParachute.rotation.z = Math.sin(this.clock.getElapsedTime()) * Math.PI / 90
                this.kiteBoneWire.rotation.x = Math.sin(this.clock.getElapsedTime()) * Math.PI / 36
                this.kiteBoneWire.rotation.y = Math.sin(this.clock.getElapsedTime() / 2) * Math.PI / 45
                this.kiteBoneWire.rotation.z = Math.sin(this.clock.getElapsedTime()) * Math.PI / 90
            }

            // Sync wireframe transformations with solid meshes
            this.hybridObjects.forEach(hybridObj => {
                hybridObj.syncTransformations();
            });

            // Animate pipe glow effects
            this.animatePipeGlow();

            this.composer.render()
        } else {
        }
        requestAnimationFrame(this.animate.bind(this))
    }

    animatePipeGlow() {
        if (this.matt_pipeTec && this.matt_pipeProp) {
            const time = this.clock.getElapsedTime();

            // Animate tech pipe glow (cyan)
            this.matt_pipeTec.emissiveIntensity = (.75 + Math.sin(time * 3) * .25) * this.glowPipe.value;

            // Animate prop pipe glow (orange) with different timing
            this.matt_pipeProp.emissiveIntensity = (2.75 + Math.sin(time * 3) * .25) * this.glowPipe.value;
        }
    }

    scrollAnimate() {
        if (this.viewport.width > 767) {
            let lastProgress = 0;
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.tech-demo__main',
                    start: 'top bottom',
                    end: `bottom-=${$(window).height() * .5} top+=125%`,
                    scrub: true,
                    onUpdate: (self) => {
                        this.camera.lookAt( this.lookAtTarget );

                        // Track scroll direction
                        const currentProgress = self.progress;
                        const isScrollingForward = currentProgress > lastProgress;
                        lastProgress = currentProgress;

                        // Store scroll direction for use in waypoint cases
                        this.isScrollingForward = isScrollingForward;
                        if (this.matt_container.opacity > 0.01) {
                            this.matt_container.visible = true
                        } else {
                            this.matt_container.visible = false
                        }
                    }
                },
                defaults: {
                    ease: 'none'
                }
            });
            tl.set([this.matt_tech, this.matt_container, this.matt_pipeTec], {
                opacity: 0,
            })
            .set([this.matt_propeller.color, this.matt_pipeProp.color, this.matt_pipeProp.emissive, this.matt_pipeTec.color, this.matt_pipeTec.emissive], {
                r: new THREE.Color('#2B2C2F').r,
                g: new THREE.Color('#2B2C2F').g,
                b: new THREE.Color('#2B2C2F').b,
            })
            .set(this.matt_pipeProp, {
                envMapIntensity: 2,
                roughness: .7,
                metalness: 1,
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
                        case 2: //parachute
                            tl.fromTo(this.matt_parachute.color, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                            }, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                                duration: .6
                            }, '<=0')
                            .fromTo(this.matt_parachute, {
                                envMapIntensity: 4,
                                roughness: .35,
                                metalness: 0
                            }, {
                                envMapIntensity: 2,
                                roughness: .70,
                                metalness: 1,
                                duration: .6
                            }, '<=0')
                            break
                        case 3: //container
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
                                // Use original y position to calculate offset and avoid overlapping
                                const originalY = el.userData.originalPosition ? el.userData.originalPosition.y : 0;
                                const randomOffset = 10 * Math.random();
                                const baseOffset = 20;
                                const yMultiplier = originalY > 0 ? originalY * 0.5 : 0;
                                const offsetY = originalY + baseOffset + yMultiplier + randomOffset;
                                tl.from(el.position, {
                                    y: `${offsetY}`,
                                    duration: .4,
                                }, delayTime)
                            })
                            this.armRight.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                    x: (Math.PI / 180) * 95,
                                    duration: .4,
                                }, idx == 0 ? '<=.2' : '<=0')
                            })

                            this.armLeft.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                x: (Math.PI / 180) * -95,
                                duration: .4,
                            }, '<=0')
                            })
                            this.arm2Right.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                x: (Math.PI / 180) * 166,
                                duration: .4,
                            }, idx == 0 ? '<=.2' : '<=0')
                            })
                            this.arm2Left.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                    x: (Math.PI / 180) * 166,
                                    duration: .4,
                                }, '<=0')
                            })
                            break;
                        case 4: //propeller
                            tl.fromTo(this.matt_propeller.color, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                                duration: .6
                            }, '<=.2')
                            .fromTo(this.propellerSpeed, {value: 1}, {value: 2, duration: .6}, '<=.2')
                            this.containerGrp.forEach((el, idx) => {
                                let delayTime;
                                if (idx == 0) {
                                    delayTime = '<=0'
                                } else {
                                    delayTime = '<=0'
                                }
                                tl.fromTo(this.matt_container, {
                                    opacity: 1,
                                }, {
                                    opacity: 0,
                                    duration: .4,
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
                        case 5: //tech
                            tl.fromTo([this.matt_tech, this.matt_pipeTec], {
                                opacity: 0,
                            }, {
                                opacity: 1,
                                duration: .6,
                            }, '<=0')
                            .fromTo(this.matt_pipeProp, {
                                envMapIntensity: 2,
                                roughness: .7,
                                metalness: 1,
                            }, {
                                envMapIntensity: 3,
                                roughness: 0.1,
                                metalness: 0.9,
                                duration: .6,
                            }, '<=0')

                            tl.fromTo([this.matt_tech.color, this.matt_pipeProp.color, this.matt_pipeProp.emissive], {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                                duration: .6,
                            }, '<=0')
                            .fromTo([this.matt_pipeTec.color, this.matt_pipeTec.emissive], {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#00E5FF').r,
                                g: new THREE.Color('#00E5FF').g,
                                b: new THREE.Color('#00E5FF').b,
                                duration: .6,
                            }, '<=0')
                            .fromTo(this.glowPipe, {
                                value: 0,
                            }, {
                                value: 1,
                                duration: .6,
                            }, '<=0')
                            break;
                        case 6: //end
                            // Handle scroll direction for case 6
                            tl.fromTo([this.matt_propeller.color, this.matt_pipeProp.color, this.matt_pipeProp.emissive], {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                            }, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                                duration: .6,
                            }, '<=.4')
                            .fromTo([this.matt_pipeTec.color, this.matt_pipeTec.emissive], {
                                r: new THREE.Color('#00E5FF').r,
                                g: new THREE.Color('#00E5FF').g,
                                b: new THREE.Color('#00E5FF').b,
                            }, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                                duration: .6,
                            }, '<=0')
                            .fromTo([this.matt_tech, this.matt_pipeTec, this.matt_pipeProp], {
                                opacity: 1
                            }, {
                                opacity: 0,
                                duration: .6,
                            }, '<=0')
                            .fromTo(this.matt_pipeProp, {
                                envMapIntensity: 3,
                                roughness: 0.1,
                                metalness: 0.9,
                            }, {
                                envMapIntensity: 2,
                                roughness: .7,
                                metalness: 1,
                                duration: .6,
                            }, '<=0')
                            break;
                        default:
                            break;
                    }
                }
            })
            let tlDashboard = gsap.timeline({
                scrollTrigger: {
                    trigger: '.tech-demo__main',
                    start: 'bottom bottom+=200%',
                    end: `bottom bottom+=125%`,
                    scrub: true,
                },
                defaults: {
                    ease: 'none'
                }
            })
            tlDashboard
            .fromTo('.tech-demo__canvas', {
                y: 0,
            }, {
                y: $(window).height() * .18,
                duration: 1
            }, '<=0')
            .fromTo('.tech-demo__dash-upper-item.fullitem', {
                y: $(window).height() * -.18,
            }, {
                y: 0,
                duration: 1
            }, '<=0')
            .fromTo('.tech-demo__canvas', {
                opacity: 1,
            }, {
                opacity: 0,
                duration: .4
            }, '<=.3')
            .fromTo('.tech-demo__dash-upper-item.fullitem', {
                opacity: 0,
            }, {
                opacity: 1,
                duration: .4
            }, '<=0')
            .fromTo('.tech-demo__dash-upper-item:not(.fullitem)', {
                opacity: 0,
                y: $(window).height() * .09,
            }, {
                opacity: 1,
                y: 0,
                duration: .4,
            }, '<=.6')
        } else {
            let pointer = [
                {
                    position: {
                        x: this.waypointPos.camera[1].x,
                        y: this.waypointPos.camera[1].y,
                        z: this.waypointPos.camera[1].z
                    },
                    lookAt: {
                        x: this.waypointPos.target[1].x,
                        y: this.waypointPos.target[1].y,
                        z: this.waypointPos.target[1].z
                    }
                },
                {
                    position: {
                        x: this.waypointPos.camera[2].x,
                        y: this.waypointPos.camera[2].y,
                        z: this.waypointPos.camera[2].z
                    },
                    lookAt: {
                        x: this.waypointPos.target[2].x,
                        y: this.waypointPos.target[2].y,
                        z: this.waypointPos.target[2].z
                    }
                },
                {
                    position: {
                        x: this.waypointPos.camera[3].x,
                        y: this.waypointPos.camera[3].y,
                        z: this.waypointPos.camera[3].z
                    },
                    lookAt: {
                        x: this.waypointPos.target[3].x,
                        y: this.waypointPos.target[3].y,
                        z: this.waypointPos.target[3].z
                    }
                },
                {
                    position: {
                        x: this.waypointPos.camera[4].x,
                        y: this.waypointPos.camera[4].y,
                        z: this.waypointPos.camera[4].z
                    },
                    lookAt: {
                        x: this.waypointPos.target[4].x,
                        y: this.waypointPos.target[4].y,
                        z: this.waypointPos.target[4].z
                    }
                },
                {
                    position: {
                        x: this.waypointPos.camera[5].x,
                        y: this.waypointPos.camera[5].y,
                        z: this.waypointPos.camera[5].z
                    },
                    lookAt: {
                        x: this.waypointPos.target[5].x,
                        y: this.waypointPos.target[5].y,
                        z: this.waypointPos.target[5].z
                    }
                },
                {
                    position: {
                        x: this.waypointPos.camera[6].x,
                        y: this.waypointPos.camera[6].y,
                        z: this.waypointPos.camera[6].z
                    },
                    lookAt: {
                        x: this.waypointPos.target[6].x,
                        y: this.waypointPos.target[6].y,
                        z: this.waypointPos.target[6].z
                    }
                },
            ]
            let lastProgress = 0;
            let numItems = pointer.length;
            let activeIndex = 0;
            let prog;
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.tech-demo__main',
                    start: 'top top+=50%',
                    end: 'bottom top+=50%',
                    scrub: true,
                    snap: {
                        snapTo: Array.from({length: numItems}, (_, i) => (i + 0.5) / numItems),
                        duration: { min: 0.2, max: 3 },
                        delay: 0.1,
                    },
                    onUpdate: (self) => {
                        this.camera.lookAt( this.lookAtTarget );
                        // Track scroll direction
                        const currentProgress = self.progress;
                        const isScrollingForward = currentProgress > lastProgress;
                        lastProgress = currentProgress;

                        // Store scroll direction for use in waypoint cases
                        this.isScrollingForward = isScrollingForward;
                        if (this.matt_container.opacity > 0.01) {
                            this.matt_container.visible = true
                        } else {
                            this.matt_container.visible = false
                        }

                        prog = self.progress.toFixed(2);
                        let step = 1 / numItems;
                        activeIndex = Math.min(
                            Math.floor(prog / step),
                            numItems - 1
                        );
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

            tl.set([this.matt_tech, this.matt_container, this.matt_pipeTec], {
                opacity: 0,
            })
            .set([this.matt_propeller.color, this.matt_pipeProp.color, this.matt_pipeProp.emissive, this.matt_pipeTec.color, this.matt_pipeTec.emissive], {
                r: new THREE.Color('#2B2C2F').r,
                g: new THREE.Color('#2B2C2F').g,
                b: new THREE.Color('#2B2C2F').b,
            })
            .set(this.matt_pipeProp, {
                envMapIntensity: 2,
                roughness: .7,
                metalness: 1,
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
                    // if ( idx !== 1 || idx !== this.waypointPos.length - 1) {
                    //     tl
                    //     .addLabel(`demo${idx - 1}`)
                    // }
                    switch (idx) {
                        case 2: //parachute
                            tl.fromTo(this.matt_parachute.color, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                            }, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                                duration: .6
                            }, '<=0')
                            .fromTo(this.matt_parachute, {
                                envMapIntensity: 4,
                                roughness: .35,
                                metalness: 0
                            }, {
                                envMapIntensity: 2,
                                roughness: .70,
                                metalness: 1,
                                duration: .6
                            }, '<=0')
                            break
                        case 3: //container
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
                                // Use original y position to calculate offset and avoid overlapping
                                const originalY = el.userData.originalPosition ? el.userData.originalPosition.y : 0;
                                const randomOffset = 10 * Math.random();
                                const baseOffset = 20;
                                const yMultiplier = originalY > 0 ? originalY * 0.5 : 0;
                                const offsetY = originalY + baseOffset + yMultiplier + randomOffset;
                                tl.from(el.position, {
                                    y: `${offsetY}`,
                                    duration: .4,
                                }, delayTime)
                            })
                            this.armRight.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                    x: (Math.PI / 180) * 95,
                                    duration: .4,
                                }, idx == 0 ? '<=.2' : '<=0')
                            })

                            this.armLeft.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                x: (Math.PI / 180) * -95,
                                duration: .4,
                            }, '<=0')
                            })
                            this.arm2Right.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                x: (Math.PI / 180) * 166,
                                duration: .4,
                            }, idx == 0 ? '<=.2' : '<=0')
                            })
                            this.arm2Left.forEach((el, idx) => {
                                tl.to(el.rotation, {
                                    x: (Math.PI / 180) * 166,
                                    duration: .4,
                                }, '<=0')
                            })
                            break;
                        case 4: //propeller
                            tl.fromTo(this.matt_propeller.color, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                                duration: .6
                            }, '<=.2')
                            .fromTo(this.propellerSpeed, {value: 1}, {value: 2, duration: .6}, '<=.2')
                            this.containerGrp.forEach((el, idx) => {
                                let delayTime;
                                if (idx == 0) {
                                    delayTime = '<=0'
                                } else {
                                    delayTime = '<=0'
                                }
                                tl.fromTo(this.matt_container, {
                                    opacity: 1,
                                }, {
                                    opacity: 0,
                                    duration: .4,
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
                        case 5: //tech
                            tl.fromTo([this.matt_tech, this.matt_pipeTec], {
                                opacity: 0,
                            }, {
                                opacity: 1,
                                duration: .6,
                            }, '<=0')
                            .fromTo(this.matt_pipeProp, {
                                envMapIntensity: 2,
                                roughness: .7,
                                metalness: 1,
                            }, {
                                envMapIntensity: 3,
                                roughness: 0.1,
                                metalness: 0.9,
                                duration: .6,
                            }, '<=0')

                            tl.fromTo([this.matt_tech.color, this.matt_pipeProp.color, this.matt_pipeProp.emissive], {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                                duration: .6,
                            }, '<=0')
                            .fromTo([this.matt_pipeTec.color, this.matt_pipeTec.emissive], {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                            }, {
                                r: new THREE.Color('#00E5FF').r,
                                g: new THREE.Color('#00E5FF').g,
                                b: new THREE.Color('#00E5FF').b,
                                duration: .6,
                            }, '<=0')
                            .fromTo(this.glowPipe, {
                                value: 0,
                            }, {
                                value: 1,
                                duration: .6,
                            }, '<=0')
                            break;
                        case 6: //end

                            // Handle scroll direction for case 6
                            tl.fromTo([this.matt_propeller.color, this.matt_pipeProp.color, this.matt_pipeProp.emissive], {
                                r: new THREE.Color('#FF471D').r,
                                g: new THREE.Color('#FF471D').g,
                                b: new THREE.Color('#FF471D').b,
                            }, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                                duration: .6,
                            }, '<=.4')
                            .fromTo([this.matt_pipeTec.color, this.matt_pipeTec.emissive], {
                                r: new THREE.Color('#00E5FF').r,
                                g: new THREE.Color('#00E5FF').g,
                                b: new THREE.Color('#00E5FF').b,
                            }, {
                                r: new THREE.Color('#2B2C2F').r,
                                g: new THREE.Color('#2B2C2F').g,
                                b: new THREE.Color('#2B2C2F').b,
                                duration: .6,
                            }, '<=0')
                            .fromTo([this.matt_tech, this.matt_pipeTec, this.matt_pipeProp], {
                                opacity: 1
                            }, {
                                opacity: 0,
                                duration: .6,
                            }, '<=0')
                            .fromTo('.tech-demo__canvas', {
                                opacity: 1,
                                y: 0,
                            }, {
                                y: $(window).width() > 767 ? $(window).height() * -.25 : $(window).height() * .18,
                                opacity: 0,
                                duration: .6
                            }, '<=.3')
                            .fromTo('.tech-demo__dash-upper-item', {
                                opacity: 0,
                            }, {
                                opacity: 1,
                                duration: .6
                            }, '<=0')
                            .fromTo(this.matt_pipeProp, {
                                envMapIntensity: 3,
                                roughness: 0.1,
                                metalness: 0.9,
                            }, {
                                envMapIntensity: 2,
                                roughness: .7,
                                metalness: 1,
                                duration: .6,
                            }, '<=0')

                            break;
                        default:
                            break;
                    }
                }
            })

            // tl
            // //Start
            // .to('.popup', { duration: .5 })
            // .addLabel("demo0")
            // .to(this.camera.position, {
            //     x: pointer[1].position.x,
            //     y: pointer[1].position.y,
            //     z: pointer[1].position.z,
            //     duration: 1
            // })
            // .to(this.lookAtTarget, {
            //     x: pointer[1].lookAt.x,
            //     y: pointer[1].lookAt.y,
            //     z: pointer[1].lookAt.z,
            //     duration: 1
            // }, '<=0')
            // .addLabel("demo1")
            // .to(this.camera.position, {
            //     x: pointer[2].position.x,
            //     y: pointer[2].position.y,
            //     z: pointer[2].position.z,
            //     duration: 1
            // })
            // .to(this.lookAtTarget, {
            //     x: pointer[2].lookAt.x,
            //     y: pointer[2].lookAt.y,
            //     z: pointer[2].lookAt.z,
            //     duration: 1
            // }, '<=0')
            // this.containerGrp.forEach((el, idx) => {
            //     let delayTime;
            //     if (idx == 0) {
            //         delayTime = '<=.4'
            //     } else {
            //         delayTime = '<=0'
            //     }
            //     // Use original y position to calculate offset and avoid overlapping
            //     const originalY = el.userData.originalPosition ? el.userData.originalPosition.y : 0;
            //     const randomOffset = 3 * (Math.random() - 0.5) * 2;
            //     const baseOffset = 10;
            //     const yMultiplier = originalY > 0 ? originalY * 0.3 : 0;
            //     const offsetY = originalY + baseOffset + yMultiplier + randomOffset;
            //     tl.to(el.position, {
            //         y: `${offsetY}`,
            //         duration: .6,
            //     }, delayTime)
            //     .to(el.material, {
            //         opacity: 0,
            //         duration: .6
            //     }, '<=0')
            // })
            // tl.addLabel("demo2")
            // tl.to(this.camera.position, {
            //     x: pointer[3].position.x,
            //     y: pointer[3].position.y,
            //     z: pointer[3].position.z,
            //     duration: 1
            // })
            // .to(this.matt_default, {
            //     opacity: 0,
            //     duration: 1,
            // }, '<=0')
            // .to(this.lookAtTarget, {
            //     x: pointer[3].lookAt.x,
            //     y: pointer[3].lookAt.y,
            //     z: pointer[3].lookAt.z,
            //     duration: 1
            // }, '<=0')
            // .addLabel("demo3")
            // .to(this.camera.position, {
            //     x: pointer[4].position.x,
            //     y: pointer[4].position.y,
            //     z: pointer[4].position.z,
            //     duration: 1
            // })
            // .to(this.lookAtTarget, {
            //     x: pointer[4].lookAt.x,
            //     y: pointer[4].lookAt.y,
            //     z: pointer[4].lookAt.z,
            //     duration: 1
            // }, '<=0')
            // .addLabel("demo4")
            // .to(this.camera.position, {
            //     x: pointer[5].position.x,
            //     y: pointer[5].position.y,
            //     z: pointer[5].position.z,
            //     duration: 1
            // })
            // .to(this.lookAtTarget, {
            //     x: pointer[5].lookAt.x,
            //     y: pointer[5].lookAt.y,
            //     z: pointer[5].lookAt.z,
            //     duration: 1
            // }, '<=0')
            // .addLabel("demo5")

            // //End
            // .to('.popup', { duration: .5 })

            $('.tech-demo__main-item-toggle').on('click', function(e) {
                e.preventDefault()
                let currentIdx = $('.tech-demo__main-item').index($(this).closest('.tech-demo__main-item'));
                console.log(currentIdx)
                $('.tech-demo__popup-item').eq(currentIdx).addClass('active')
                console.log(currentIdx)
            })
            $('.tech-demo__popup-close').on('click', function(e) {
                e.preventDefault()
                $('.tech-demo__popup-item').removeClass('active')
                console.log(activeIndex)
            })

            // $('.tech-demo__main-item-title').on('click', function(e) {
            //     e.preventDefault();
            //     let target = $(this).closest('.tech-demo__main-item').index();
            //     //console.log(target)
            //     lenis.scrollTo(tl.scrollTrigger.labelToScroll(`demo${target}`), {force: true})
            // })
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

    // Create container instances from predefined positions
    createContainerInstancesFromPositions() {
        // Create big container instances
        if (this.bigContainerBaseModel && this.containerPos.big) {
            this.containerPos.big.forEach((position, index) => {
                if (!this.bigContainerBaseModel.position.equals(position)) {
                    const instance = this.bigContainerBaseModel.clone();
                    instance.position.set(position.x, position.y, position.z);
                    instance.visible = true;
                    instance.userData.originalPosition = { x: position.x, y: position.y, z: position.z };
                    instance.userData.isInstance = true;
                    instance.userData.instanceIndex = index;
                    instance.userData.containerType = 'big';

                    // Add to scene
                    this.scene.add(instance);
                    this.containerGrp.push(instance);
                }
            });
        }

        // Create small container instances
        if (this.smallContainerBaseModel && this.containerPos.small) {
            this.containerPos.small.forEach((position, index) => {
                if (!this.smallContainerBaseModel.position.equals(position)) {
                    const instance = this.smallContainerBaseModel.clone();
                    instance.position.set(position.x, position.y, position.z);
                    instance.visible = true;
                    instance.userData.originalPosition = { x: position.x, y: position.y, z: position.z };
                    instance.userData.isInstance = true;
                    instance.userData.instanceIndex = index;
                    instance.userData.containerType = 'small';

                    // Add to scene
                    this.scene.add(instance);
                    this.containerGrp.push(instance);
                }
            });
        }
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

        // Create wireframe mesh using EdgesGeometry
        const wireframeMesh = new THREE.LineSegments(
            new THREE.EdgesGeometry(mesh.geometry),
            cachedMaterials.wireframe.clone()
        );

        // Copy position, rotation, and scale from original mesh
        wireframeMesh.position.copy(mesh.position);
        wireframeMesh.rotation.copy(mesh.rotation);
        wireframeMesh.scale.copy(mesh.scale);

        // Set up materials with proper initial states
        mesh.material = cachedMaterials.solid.clone();

        // Initial visibility states - ensure proper setup
        mesh.material.opacity = 1.0;
        mesh.material.depthWrite = true;
        mesh.material.depthTest = true;
        mesh.material.transparent = true;
        mesh.renderOrder = 0; // Render solid first

        wireframeMesh.material.opacity = 0.0;
        wireframeMesh.material.depthWrite = false;
        wireframeMesh.material.depthTest = true;
        wireframeMesh.material.transparent = true;
        wireframeMesh.renderOrder = 1; // Render wireframe after solid
        wireframeMesh.visible = false; // Start hidden to prevent flickering

        // Add to scene efficiently
        mesh.parent.add(wireframeMesh);
        // Create optimized hybrid object
        const hybridObject = {
            id: mesh.uuid, // Unique identifier for tracking
            solid: mesh,
            wireframe: wireframeMesh,
            solidMaterial: mesh.material,
            wireframeMaterial: wireframeMesh.material,
            isAnimating: false, // Track individual animation state
            syncTransformations: () => {
                // Sync wireframe transformations with solid mesh
                wireframeMesh.position.copy(mesh.position);
                wireframeMesh.rotation.copy(mesh.rotation);
                wireframeMesh.scale.copy(mesh.scale);
            }
        };

        this.hybridObjects.push(hybridObject);
        return hybridObject;
    }

    // Helper: Optimize material for transparency performance
    _optimizeMaterialForTransparency(material) {
        material.transparent = true;
        material.alphaTest = 0.001; // Slight performance boost
        material.needsUpdate = true;

        // Optimize for line segments (EdgesGeometry)
        if (material.isLineBasicMaterial || material.isLineDashedMaterial) {
            material.linewidth = 1; // Consistent line width
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

    // Toggle between wireframe and solid mode with smooth crossfade
    toggleWireframeMode(duration = 1.2) {
        // Prevent overlapping animations
        if (this.isTransitioning) {
            console.log('Animation in progress, skipping...');
            return;
        }

        this.isWireframeMode = !this.isWireframeMode;
        this.isTransitioning = true;

        console.log(`Toggling to ${this.isWireframeMode ? 'wireframe' : 'solid'} mode with ${this.hybridObjects.length} hybrid objects`);

        // Smoother easing curves for better visual quality
        const easing = 'power3.inOut';
        const staggerDelay = 0.015; // Refined stagger for smooth wave effect

        // Batch animations for better performance
        const animations = [];

        this.hybridObjects.forEach((hybridObj, index) => {
            if (hybridObj.isAnimating) return; // Skip if already animating

            hybridObj.isAnimating = true;
            const delay = index * staggerDelay;

            if (this.isWireframeMode) {
                // Crossfade to wireframe with simultaneous animations
                // Fade out solid
                animations.push(
                    gsap.to(hybridObj.solidMaterial, {
                        opacity: 0,
                        duration: duration * 0.7,
                        delay: delay,
                        ease: easing,
                        onStart: () => {
                            // Enable wireframe visibility and proper rendering at start
                            hybridObj.wireframe.visible = true;
                            hybridObj.wireframe.renderOrder = 1; // Restore render order
                            hybridObj.wireframeMaterial.depthTest = true;
                        },
                        onComplete: () => {
                            // Disable solid mesh completely to prevent flickering
                            hybridObj.solidMaterial.depthWrite = false;
                            hybridObj.solidMaterial.depthTest = false;
                            hybridObj.solid.visible = false;
                            hybridObj.solid.renderOrder = -1; // Push behind everything
                            this._updateMaterialNeedsUpdate(hybridObj.solidMaterial);
                        }
                    })
                );

                // Fade in wireframe with overlap
                animations.push(
                    gsap.to(hybridObj.wireframeMaterial, {
                        opacity: 1,
                        duration: duration * 0.8,
                        delay: delay + duration * 0.1, // Small overlap for smooth crossfade
                        ease: easing,
                        onStart: () => {
                            hybridObj.wireframeMaterial.depthWrite = false; // Lines don't need depth write
                            this._updateMaterialNeedsUpdate(hybridObj.wireframeMaterial);
                        },
                        onComplete: () => {
                            hybridObj.isAnimating = false;
                            console.log(`Completed wireframe animation for ${hybridObj.solid.name}`);
                        }
                    })
                );
            } else {
                // Crossfade to solid with simultaneous animations
                // Fade out wireframe
                animations.push(
                    gsap.to(hybridObj.wireframeMaterial, {
                        opacity: 0,
                        duration: duration * 0.7,
                        delay: delay,
                        ease: easing,
                        onStart: () => {
                            // Enable solid visibility and proper rendering at start
                            hybridObj.solid.visible = true;
                            hybridObj.solid.renderOrder = 0; // Restore render order
                            hybridObj.solidMaterial.depthTest = true;
                        },
                        onComplete: () => {
                            // Disable wireframe mesh completely to prevent flickering
                            hybridObj.wireframeMaterial.depthWrite = false;
                            hybridObj.wireframeMaterial.depthTest = false;
                            hybridObj.wireframe.visible = false;
                            hybridObj.wireframe.renderOrder = -1; // Push behind everything
                            this._updateMaterialNeedsUpdate(hybridObj.wireframeMaterial);
                        }
                    })
                );

                // Fade in solid with overlap
                animations.push(
                    gsap.to(hybridObj.solidMaterial, {
                        opacity: 1,
                        duration: duration * 0.8,
                        delay: delay + duration * 0.1, // Small overlap for smooth crossfade
                        ease: easing,
                        onStart: () => {
                            hybridObj.solidMaterial.depthWrite = true;
                            hybridObj.solidMaterial.depthTest = true;
                            hybridObj.solid.renderOrder = 0;
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

    // Set wireframe blend (0 = solid, 1 = wireframe) with smooth crossfade
    setWireframeBlend(blend, duration = 0.5) {
        // Clamp blend value for safety
        blend = Math.max(0, Math.min(1, blend));

        const solidOpacity = 1 - blend;
        const wireframeOpacity = blend;

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

            // Refined stagger for smooth wave effect
            const delay = index * 0.008;

            // Control visibility for better performance
            const onBlendStart = () => {
                if (blend > 0.01) hybridObj.wireframe.visible = true;
                if (blend < 0.99) hybridObj.solid.visible = true;
            };

            const onBlendComplete = () => {
                if (blend < 0.01) hybridObj.wireframe.visible = false;
                if (blend > 0.99) hybridObj.solid.visible = false;
            };

            batchUpdates.push(
                gsap.to(hybridObj.solidMaterial, {
                    opacity: solidOpacity,
                    duration: duration,
                    delay: delay,
                    ease: 'power3.inOut', // Smoother easing curve
                    onStart: onBlendStart,
                    onUpdate: () => {
                        // Solid needs depth write when visible
                        const shouldWrite = hybridObj.solidMaterial.opacity > 0.1;
                        if (hybridObj.solidMaterial.depthWrite !== shouldWrite) {
                            hybridObj.solidMaterial.depthWrite = shouldWrite;
                            this._updateMaterialNeedsUpdate(hybridObj.solidMaterial);
                        }
                    },
                    onComplete: onBlendComplete
                })
            );

            batchUpdates.push(
                gsap.to(hybridObj.wireframeMaterial, {
                    opacity: wireframeOpacity,
                    duration: duration,
                    delay: delay,
                    ease: 'power3.inOut', // Match solid easing
                    onUpdate: () => {
                        // Lines generally don't need depth write
                        if (hybridObj.wireframeMaterial.depthWrite !== false) {
                            hybridObj.wireframeMaterial.depthWrite = false;
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

        // Clear container instances
        this.containerGrp.forEach(instance => {
            if (instance.parent) {
                instance.parent.remove(instance);
            }
        });

        // Clear caches
        this.hybridObjects.length = 0;
        this.containerGrp.length = 0;
        this.materialCache.clear();

        console.log('Hybrid system and container instances disposed');
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
function techIntro() {
    $('.tech-intro__main').each((_, el) => {
        const techIntroTitle = new SplitText($(el).find('.tech-intro__title'), typeOpts.words)
        const techIntroSub = new SplitText($(el).find('.tech-intro__sub'), typeOpts.words)
        const techIntroTlText = gsap.timeline({
            scrollTrigger: {
                trigger: $(el).find('.tech-intro__title'),
                start: 'top top+=75%'
            },
            onComplete: () => {
                techIntroTitle.revert()
                new SplitText($(el).find('.tech-intro__title'), typeOpts.lines)
                techIntroSub.revert()
            }
        })
        const techIntroTlImg = gsap.timeline({
            scrollTrigger: {
                trigger: $(el).find('.tech-intro__main-img'),
                start: 'top top+=75%'
            }
        })
        gsap.set($(el).find('.tech-intro__main-img'), {clipPath: 'inset(10%)'})
        gsap.set($(el).find('.tech-intro__main-img img'), { scale: 1.4, autoAlpha: 0 })
        techIntroTlImg
            .to($(el).find('.tech-intro__main-img'), { clipPath: 'inset(0%)', duration: 1, ease: 'expo.out'}, '0')
            .to($(el).find('.tech-intro__main-img img'), { scale: 1, duration: 1, autoAlpha: 1, ease: 'expo.out', clearProps: 'transform' }, '<=0')

        techIntroTlText
            .from(techIntroTitle.words, { yPercent: 60, autoAlpha: 0, duration: .6, stagger: .02 }, '<=0')
            .from(techIntroSub.words, {yPercent: 60, autoAlpha: 0, duration: .4, stagger: .02}, '<=.2')
    })
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
            strokeWidth = 3;
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
            <span class="txt-bold">${distance_km?.toFixed(2)} km</span>
            </div>
            <div class="route-info-item">
            Estimated Average Speed:<br>
            <span class="txt-bold">${average_speed_km_h?.toFixed(2)} km/h</span>
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
            console.log(geojsonData)
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
            $(updateButton).removeClass('loading');
            if (!$('.tech-intro__map-main').hasClass('active')) {
                $('.tech-intro__map-chart').slideDown(400, function() {
                    map.invalidateSize();
                    plotRoute(map, geojsonData);
                });
                $('.tech-intro__map-main').addClass('active');
            }
            else {
                plotRoute(map, geojsonData);
            }
            // createChart('cumulative-duration', geojsonData.properties.cumulative_segment_durations_hr, 'cumulative', 50, 5);
            createChart('kite-usage', geojsonData.properties.kite_usage, 'kite', 0.2, 5);
        }
    });
    function createChart(svgId, dataY, color, yStep, xStep) {
        const svg = document.querySelector(`.tech-intro__map-chart[data-chart="${svgId}"] svg`);
        const width = 780;
        const height = 230;
        const padding = { top: 20, right: 20, bottom: 25, left: 35 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Tính toán maxY dựa trên yStep
        const maxDataY = Math.max(...dataY);
        const ceiledMaxY = Math.ceil(maxDataY / yStep) * yStep;
        // Chỉ thêm 1 bước nếu giá trị max đúng bằng điểm chia
        const maxY = (maxDataY === ceiledMaxY) ? ceiledMaxY + yStep : ceiledMaxY;
        const ySteps = Math.round(maxY / yStep);

        // Tính toán maxX dựa trên xStep
        const maxDataX = dataY.length - 1;
        const ceiledMaxX = Math.ceil(maxDataX / xStep) * xStep;
        // Chỉ thêm 1 bước nếu giá trị max đúng bằng điểm chia
        const maxX = (maxDataX === ceiledMaxX) ? ceiledMaxX + xStep : ceiledMaxX;
        const xSteps = Math.round(maxX / xStep);

        // Tính toán scale
        const scaleX = chartWidth / maxX;
        const scaleY = chartHeight / maxY;

        // Vẽ Y grid lines và labels
        for (let i = 0; i <= ySteps; i++) {
            const y = padding.top + (chartHeight / ySteps) * i;

            // Chỉ vẽ grid line nếu không phải đường biên trên cùng hoặc dưới cùng
            if (i > 0 && i < ySteps) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', padding.left);
                line.setAttribute('y1', y);
                line.setAttribute('x2', padding.left + chartWidth);
                line.setAttribute('y2', y);
                line.classList.add('grid-line');
                svg.appendChild(line);
            }

            // Y axis labels
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const value = maxY - (yStep * i);
            text.setAttribute('x', padding.left - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.classList.add('axis-text');
            // Sửa vấn đề số thập phân bằng cách làm tròn đúng
            text.textContent = Math.round(value * 10) / 10;
            svg.appendChild(text);
        }

        // Vẽ X grid lines và labels
        for (let i = 0; i <= xSteps; i++) {
            const x = padding.left + (chartWidth / xSteps) * i;

            // Chỉ vẽ grid line nếu không phải đường biên trái hoặc phải
            if (i > 0 && i < xSteps) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x);
                line.setAttribute('y1', padding.top);
                line.setAttribute('x2', x);
                line.setAttribute('y2', padding.top + chartHeight);
                line.classList.add('grid-line');
                svg.appendChild(line);
            }

            // X axis labels
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const value = xStep * i;
            text.setAttribute('x', x);
            text.setAttribute('y', padding.top + chartHeight + 20);
            text.setAttribute('text-anchor', 'middle');
            text.classList.add('axis-text');
            text.textContent = value;
            svg.appendChild(text);
        }

        // Vẽ đường biên trục X (dưới)
        const axisBottom = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axisBottom.setAttribute('x1', padding.left);
        axisBottom.setAttribute('y1', padding.top + chartHeight);
        axisBottom.setAttribute('x2', padding.left + chartWidth);
        axisBottom.setAttribute('y2', padding.top + chartHeight);
        axisBottom.classList.add('axis-border');
        svg.appendChild(axisBottom);

        // Vẽ đường biên trục Y (trái)
        const axisLeft = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axisLeft.setAttribute('x1', padding.left);
        axisLeft.setAttribute('y1', padding.top);
        axisLeft.setAttribute('x2', padding.left);
        axisLeft.setAttribute('y2', padding.top + chartHeight);
        axisLeft.classList.add('axis-border');
        svg.appendChild(axisLeft);

        // Vẽ polyline từ các points
        const points = dataY.map((value, index) => {
            const x = padding.left + index * scaleX;
            const y = padding.top + chartHeight - value * scaleY;
            return `${x},${y}`;
        }).join(' ');

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', points);
        polyline.classList.add('data-line', `${color}-line`);
        svg.appendChild(polyline);

        // Vẽ các điểm
        dataY.forEach((value, index) => {
            const x = padding.left + index * scaleX;
            const y = padding.top + chartHeight - value * scaleY;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.classList.add('data-point', `${color}-point`);
            svg.appendChild(circle);
        });
    }
    function createPortItem(id, template) {
        let html = template.clone()
        html.find('.port-item-id').text(id)
        html.find('.port-item-name').text(convertToTitleCase(portLookup[id].port_name))
        html.on('click', function(e) {
            e.preventDefault();
            let name = $(this).find('.port-item-name').text();
            let id = $(this).find('.port-item-id').text();

            $(this).closest('.input-wrap').find('.input-field').val(name)
            $(this).closest('.input-wrap').find('.input-hidden').val(id)
            const clickedStart = $(this).closest('.input-wrap').hasClass('input-wrap-start');

            if (clickedStart) {
                $('.input-wrap-end .input-drop-inner').empty();
                $('.input-wrap-end .port-item').removeClass('hidden-dup');
                adjacencyData[id]?.forEach((adjId) => {
                    createPortItem(adjId, template).appendTo('.input-wrap-end .input-drop-inner')
                })
                $('.input-wrap-end .input-field').attr('disabled', !adjacencyData[id]);
                $('.tech-intro__map-submit').addClass('disable');
                $('.tech-intro__map-submit').attr('disabled', true)
                $('.input-wrap-end .input-field').val('');
                $('.input-wrap-end .input-hidden').val('');
            } else {
                $('.input-wrap-start .port-item').removeClass('hidden-dup')
                $('.input-wrap-start .port-item').each((idx, el) => {
                    if ($(el).find('.port-item-id').text() === id) {
                        $(el).addClass('hidden-dup')
                    }
                })
                $('.tech-intro__map-submit').removeClass('disable');
                $('.tech-intro__map-submit').attr('disabled', false)
            }
        })
        return html;
    }

    function updatePortList() {
        let template = $('.port-item').eq(0).clone();
        $('.input-drop-inner').empty();

        $('.tech-intro__map-submit').addClass('disable');
        $('.tech-intro__map-submit').attr('disabled', true);
        $('.input-wrap-end .input-field').attr('disabled', true);

        let portData = Object.keys(portLookup).filter(data => adjacencyData[data]);
        portData.forEach((id) => {
            createPortItem(id, template).appendTo('.input-wrap-start .input-drop-inner')
        })
    }
    updatePortList()
    $('.tech-intro__map-chart').slideUp();
    let techMapInput = $('.tech-intro .input-field');

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
    const techMapTitle = new SplitText('.tech-intro__map-title', typeOpts.words)
    const techMapSub = new SplitText('.tech-intro__map-sub', typeOpts.words)
    const techMapTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.tech-intro__map-head',
            start: 'top top+=65%'
        },
        onComplete: () => {
            techMapTitle.revert()
            new SplitText('.tech-intro__map-title', typeOpts.lines)
            techMapSub.revert()
        }
    })
    gsap.set('.tech-intro__map-main', {clipPath: 'inset(10%)'})
    gsap.set('.tech-intro__map-main-inner', {scale: 1.4, autoAlpha: 0 })
    techMapTl
        .to('.tech-intro__map-main', { clipPath: 'inset(0%)', duration: 1, ease: 'expo.out'}, '0')
        .to('.tech-intro__map-main-inner', { scale: 1, duration: 1, autoAlpha: 1, ease: 'expo.out', clearProps: 'transform, opacity'}, '<=0')
        .from(techMapTitle.words, {yPercent: 60, autoAlpha: 0, duration: .6, stagger: .02}, "<=0")
        .from(techMapSub.words, {yPercent: 60, autoAlpha: 0, duration: .4, stagger: .02}, '<=.2')
        .from('.tech-intro__map-form > *', {yPercent: 25, autoAlpha: 0, duration: .6, stagger: .2, clearProps: 'all'}, '>=-.2')
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
            techIntro();
        }, 100);
    },
    beforeLeave() {
        console.log('leave tech')
        removeTechMap()
    }
}

export default techScript