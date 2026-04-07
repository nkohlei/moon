import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { lunarSites } from './lunarSites.js';
import './style.css';

// --- CONFIGURATION ---
const TEXTURE_URL = '/moon_8k_lroc.webp'; // High-fidelity LROC 8K equirectangular map
const MOON_RADIUS = 5;

// --- APP STATE ---
let scene, camera, renderer, labelRenderer, controls, moon, earth, sunLight;
let atlasMode = false;
let hudVisible = true;
let markersVisible = true;
let shadedMaterial, atlasMaterial;
const loadingOverlay = document.getElementById('loading-overlay');

const hideLoading = () => {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 1000);
};

// --- EMERGENCY STARTUP FAILSAFE ---
// Run immediately to ensure the app ALWAYS opens
window.onerror = () => hideLoading();
setTimeout(hideLoading, 4000); // 4 second hard limit from script start

// --- MISSION STATE ---
let markers = [];
let activeSite = null;
let isFlying = false;

// --- TILING STATE ---
let tiles = []; 
const TILE_ROWS = 27;
const TILE_COLS = 54;
const RADIUS = 5;



function setupUI() {
    const btn = document.getElementById('atlas-toggle');
    const statusText = document.getElementById('atlas-status');
    
    btn.addEventListener('click', () => {
        atlasMode = !atlasMode;
        btn.classList.toggle('active');
        statusText.textContent = atlasMode ? 'ON' : 'OFF';
        
        if (moon && shadedMaterial && atlasMaterial) {
            // SWAP MATERIAL for perfect Atlas visibility
            moon.material = atlasMode ? atlasMaterial : shadedMaterial;
        }
    });

    // Populate Sidebar
    const list = document.getElementById('sites-list');
    lunarSites.forEach(p => {
        const item = document.createElement('div');
        item.className = 'site-item';
        item.innerHTML = `<h4>${p.mission}</h4>`;
        item.dataset.mission = p.mission;
        item.onclick = () => showSiteInfo(p);
        list.appendChild(item);
    });
}

function toggleHUD() {
    hudVisible = !hudVisible;
    document.body.classList.toggle('hud-hidden', !hudVisible);
    
    // Dim markers if UI is hidden for total immersion
    markers.forEach(m => {
        m.visible = (hudVisible || (activeSite && m.userData.site.mission === activeSite.mission)) && markersVisible;
    });
}

function toggleMarkers() {
    markersVisible = !markersVisible;
    const btn = document.getElementById('markers-toggle');
    btn.classList.toggle('active', markersVisible);
    document.body.classList.toggle('labels-hidden', !markersVisible);
    
    markers.forEach(m => {
        m.visible = markersVisible;
    });
}

function createStarfield() {
    // 1. Create a circular texture for stars (Round, not square)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)'); 
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const starTexture = new THREE.CanvasTexture(canvas);

    // 2. Uniform Dense Starfield (50,000 Stars)
    const count = 50000; 
    const vertices = [];
    const colors = [];
    const minDistance = 5000; 
    const spread = 25000;

    for ( let i = 0; i < count; i ++ ) {
        const phi = Math.acos(Math.random() * 2 - 1);
        const theta = Math.random() * Math.PI * 2;
        const r = minDistance + Math.random() * (spread - minDistance);

        vertices.push( 
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );

        const brightness = 0.4 + Math.random() * 0.6; 
        colors.push(brightness, brightness, brightness);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    const material = new THREE.PointsMaterial({
        size: 4.0, 
        map: starTexture,
        transparent: true,
        blending: THREE.AdditiveBlending, 
        alphaTest: 0.001,
        sizeAttenuation: true,
        vertexColors: true 
    });

    const points = new THREE.Points( geometry, material );
    scene.add( points );
}

function createSun() {
    const sunPos = new THREE.Vector3(10000, 4000, 15000); // 60-degree offset from Earth-Moon line

    // 1. Core (The Star Object)
    const sunGeometry = new THREE.SphereGeometry(80, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(sunPos);
    scene.add(sun);

    // 2. Compact High-Intensity Starburst Texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const mid = 512;

    // --- A. Tight, Intense Gaussian Glow ---
    // Using many color stops but confining them to the center for a 'point source' feel
    const gradient = ctx.createRadialGradient(mid, mid, 0, mid, mid, 250); // Tightened radius
    const glowColor = (a) => `rgba(255, 255, 240, ${a})`;
    gradient.addColorStop(0,    glowColor(1.0));
    gradient.addColorStop(0.02, glowColor(0.8));
    gradient.addColorStop(0.05, glowColor(0.6));
    gradient.addColorStop(0.1,   glowColor(0.4));
    gradient.addColorStop(0.15,  glowColor(0.2));
    gradient.addColorStop(0.25,  glowColor(0.1));
    gradient.addColorStop(0.4,   glowColor(0.04));
    gradient.addColorStop(0.6,   glowColor(0.01));
    gradient.addColorStop(1,     glowColor(0));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // --- B. Short, Multi-Directional Sharp Rays (Starburst) ---
    const rayCount = 100;
    for (let i = 0; i < rayCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = 40 + Math.random() * 70; // MUCH SHORTER (40-110 instead of 500)
        const width = 0.5 + Math.random() * 1.2; // Sharper
        const opacity = 0.1 + Math.random() * 0.3;

        ctx.save();
        ctx.translate(mid, mid);
        ctx.rotate(angle);
        
        const lineGrad = ctx.createLinearGradient(0, 0, length, 0);
        lineGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, 0);
        ctx.stroke();
        ctx.restore();
    }

    // --- C. Subtle Horizontal Accessory Streaks ---
    const drawStreak = (w, h, op) => {
        ctx.save();
        ctx.translate(mid, mid);
        const streakGrad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
        streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${op})`);
        streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = streakGrad;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.restore();
    };
    drawStreak(600, 2, 0.4); // Compacted streaks
    drawStreak(400, 1, 0.2);

    const sunTexture = new THREE.CanvasTexture(canvas);
    const sunSpriteMat = new THREE.SpriteMaterial({ 
        map: sunTexture, 
        transparent: true, 
        blending: THREE.AdditiveBlending 
    });
    const sunSprite = new THREE.Sprite(sunSpriteMat);
    sunSprite.scale.set(9000, 9000, 1); // Enlarged further from 6500 to 9000
    sun.add(sunSprite);

    // 3. Subtle blue haze (Larger)
    const hazeCanvas = document.createElement('canvas');
    hazeCanvas.width = 128; hazeCanvas.height = 128;
    const hCtx = hazeCanvas.getContext('2d');
    const hGrad = hCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    hGrad.addColorStop(0, 'rgba(180, 230, 255, 0.1)');
    hGrad.addColorStop(1, 'rgba(180, 230, 255, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 128, 128);
    const hazeTex = new THREE.CanvasTexture(hazeCanvas);
    const hazeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: hazeTex, transparent: true, blending: THREE.AdditiveBlending }));
    hazeSprite.scale.set(11500, 11500, 1); // Scaled up haze from 8500 to 11500
    sun.add(hazeSprite);
}

function createEarth() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/earth_8k.png', (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const earthGeometry = new THREE.SphereGeometry(120, 64, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.4, // Lowered for more light reflection
            metalness: 0.1
        });
        earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.position.set(-8000, 1500, 8000); 
        earth.rotation.y = Math.PI * 0.8; 
        scene.add(earth);
    });
}

function loadMoon() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    textureLoader.load(TEXTURE_URL, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace; 
        const geometry = new THREE.SphereGeometry(MOON_RADIUS, 256, 256); 
        
        // 1. Shaded Mode (MeshStandard)
        shadedMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9,
            metalness: 0
        });

        // 2. Atlas Mode (MeshBasic - Perfect raw colors)
        atlasMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });

        // Set initial material based on current state
        moon = new THREE.Mesh(geometry, atlasMode ? atlasMaterial : shadedMaterial);
        
        // CALIBRATION: Rotate moon mesh so 0 Longitude (UV 0.5) faces the camera (+Z)
        moon.rotation.y = -Math.PI / 2;

        scene.add(moon);
        
        // Initialize High-Res Tiles (Transparent by default)
        createTiles();

        // Create Landing Site Markers
        createLandingSiteMarkers();
        
        hideLoading();
    }, undefined, (err) => {
        console.error('Texture load failed', err);
        hideLoading();
    });
}

// --- TILING LOGIC ---
function createTiles() {
    const detailGroup = new THREE.Group();
    detailGroup.name = "DetailLayer";
    
    for (let r = 0; r < TILE_ROWS; r++) {
        for (let c = 0; c < TILE_COLS; c++) {
            const uMin = c / TILE_COLS;
            const uMax = (c + 1) / TILE_COLS;
            const vMin = 1 - (r + 1) / TILE_ROWS;
            const vMax = 1 - r / TILE_ROWS;

            const geometry = new THREE.SphereGeometry(RADIUS + 0.02, 8, 8, 
                uMin * Math.PI * 2, (uMax - uMin) * Math.PI * 2,
                (1 - vMax) * Math.PI, (vMax - vMin) * Math.PI
            );

            const material = new THREE.MeshBasicMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0, 
                depthWrite: false 
            });

            const tileMesh = new THREE.Mesh(geometry, material);
            tileMesh.userData = { r, c, loaded: false };
            detailGroup.add(tileMesh);
            tiles.push(tileMesh);
        }
    }
    scene.add(detailGroup);
}

function updateTiles() {
    if (!camera) return;
    const cameraPos = camera.position.clone().normalize();
    
    tiles.forEach(tile => {
        // Tile position relative to center
        const tilePos = new THREE.Vector3();
        tile.getWorldPosition(tilePos);
        tilePos.normalize();
        
        const dot = cameraPos.dot(tilePos);
        
        // If tile is facing the camera and we're somewhat close
        if (dot > 0.6 && camera.position.length() < 12) {
            if (!tile.userData.loaded) {
                loadTile(tile);
            }
            tile.material.opacity = Math.min(tile.material.opacity + 0.05, 1.0);
        } else {
            tile.material.opacity = Math.max(tile.material.opacity - 0.05, 0.0);
        }
    });
}

function loadTile(tile) {
    if (tile.userData.loading) return;
    tile.userData.loading = true;
    
    const loader = new THREE.TextureLoader();
    const url = `/tiles/tile_${tile.userData.r}_${tile.userData.c}.webp`;
    
    loader.load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        tile.material.map = texture;
        tile.material.opacity = 0; // Start at 0 for fade in
        tile.material.needsUpdate = true;
        tile.userData.loaded = true;
        tile.userData.loading = false;
    }, undefined, () => {
        tile.userData.loading = false; // Retry later if failed
    });
}

function getVector3FromLatLng(lat, lng, radius) {
    // CALIBRATION FIX: Standard orientation (East = Right (+X), West = Left (-X))
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (90 - lng) * (Math.PI / 180); 
    
    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function createLandingSiteMarkers() {
    const markerGroup = new THREE.Group();
    
    lunarSites.forEach(p => {
        const siteGroup = new THREE.Group();
        
        // --- 1. 3D NEEDLE (PIN) MARKER ---
        const needleColor = p.type === "Crewed" ? 0xffcc00 : 0x00ffff;
        
        // Needle Shaft (Very thin cylinder)
        const shaftGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.15, 8);
        const shaftMat = new THREE.MeshBasicMaterial({ color: needleColor });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.y = 0.075; 
        siteGroup.add(shaft);

        // Needle Head (Small sphere on top)
        const headGeo = new THREE.SphereGeometry(0.012, 16, 16);
        const headMat = new THREE.MeshBasicMaterial({ color: needleColor });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.15; 
        siteGroup.add(head);

        // Needle Tip (Small cone at the bottom for sharpness)
        const tipGeo = new THREE.ConeGeometry(0.003, 0.01, 8);
        const tipMat = new THREE.MeshBasicMaterial({ color: needleColor });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.rotation.x = Math.PI; // Point down
        siteGroup.add(tip);

        // --- 2. THE LABEL ---
        const labelDiv = document.createElement('div');
        labelDiv.className = 'lunar-label';
        labelDiv.innerHTML = `<div class="label-text">${p.mission}</div>`;
        labelDiv.onclick = () => showSiteInfo(p);
        
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, 0.2, 0); // Above the pin head
        siteGroup.add(label);

        // Calculate Position on Globe
        const pos = getVector3FromLatLng(p.coordinates.lat, p.coordinates.lng, RADIUS);
        siteGroup.position.copy(pos);
        
        // Orient the needle to point straight out from the surface (Normal)
        siteGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
        
        siteGroup.userData = { site: p, labelDiv };
        markerGroup.add(siteGroup);
        markers.push(siteGroup);
    });
    
    scene.add(markerGroup);
}

function showSiteInfo(site) {
    activeSite = site;
    
    // Content Update
    document.getElementById('info-title').textContent = site.mission;
    document.getElementById('info-year').textContent = site.year;
    document.getElementById('info-operator').textContent = site.operator;
    document.getElementById('info-description').textContent = site.description;
    document.getElementById('info-details').textContent = site.details;
    document.getElementById('info-image').src = site.image;
    document.getElementById('info-image').onerror = () => {
        document.getElementById('info-image').src = "https://www.lroc.asu.edu/featured_sites/view_site/1/image";
    };
    document.getElementById('source-link').href = site.source;
    
    // Formatted Coordinates display
    const latStr = `${Math.abs(site.coordinates.lat).toFixed(2)}°${site.coordinates.lat >= 0 ? 'N' : 'S'}`;
    const lngStr = `${Math.abs(site.coordinates.lng).toFixed(2)}°${site.coordinates.lng >= 0 ? 'E' : 'W'}`;
    document.getElementById('info-coords').textContent = `${latStr} | ${lngStr}`;
    
    // UI states
    document.getElementById('info-panel').classList.add('active');
    controls.autoRotate = false;
    
    // Focus Highlight in Sidebar and Labels
    document.querySelectorAll('.site-item').forEach(el => {
        el.classList.toggle('active', el.dataset.mission === site.mission);
    });
    
    document.querySelectorAll('.lunar-label').forEach(el => {
        el.classList.toggle('active', el.textContent === site.mission);
    });

    // Label Focus (Dim others)
    markers.forEach(m => {
        const isSelf = m.userData.site.mission === site.mission;
        if (m.userData.labelDiv) {
            m.userData.labelDiv.classList.toggle('active', isSelf);
            m.userData.labelDiv.style.display = (hudVisible || isSelf) ? 'flex' : 'none';
        }
        // Needle Focus Effect (Scale up the whole group slightly)
        m.scale.setScalar(isSelf ? 2.0 : 1.0);
    });
}

function closeInfo() {
    document.getElementById('info-panel').classList.remove('active');
    activeSite = null;
    controls.autoRotate = true;
    
    // Reset Labels
    markers.forEach(m => {
        if (m.userData.labelDiv) {
            m.userData.labelDiv.classList.remove('active');
            m.userData.labelDiv.style.display = hudVisible ? 'flex' : 'none';
        }
        m.scale.setScalar(1.0);
    });
    
    document.querySelectorAll('.site-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.lunar-label').forEach(el => el.classList.remove('active'));
}

function onSiteClick(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);
    
    if (intersects.length > 0) {
        showSiteInfo(intersects[0].object.userData.site);
    }
}

function flyToSite(site) {
    if (isFlying) return;
    isFlying = true;
    
    // Camera position relative to site normal
    const normal = getVector3FromLatLng(site.coordinates.lat, site.coordinates.lng, 1);
    const targetPos = normal.clone().multiplyScalar(9); // Height of 9 units
    
    // Simple Lerp Fly-To
    const startPos = camera.position.clone();
    const duration = 1500;
    const startTime = performance.now();

    function updateCamera(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // Quartic Out

        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), ease);
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        } else {
            isFlying = false;
        }
    }
    requestAnimationFrame(updateCamera);
}

// --- INTERACTION ---
function onMouseMove(event) {
    if (!moon) return;
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(moon);
    
    if (intersects.length > 0) {
        const p = intersects[0].point;
        const lat = Math.asin(p.y / MOON_RADIUS) * (180 / Math.PI);
        const lng = 90 - (Math.atan2(p.z, p.x) * 180 / Math.PI);
        
        // Normalize lng to -180, 180
        let normLng = ((lng + 180) % 360);
        if (normLng < 0) normLng += 360;
        normLng -= 180;

        document.getElementById('lat-display').textContent = `${lat.toFixed(3)}°`;
        document.getElementById('lng-display').textContent = `${normLng.toFixed(3)}°`;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Animate Needle Pins (Subtle motion)
    if (!isFlying) {
        const time = performance.now() * 0.003;
        markers.forEach(m => {
            const isSelf = activeSite && m.userData.site.mission === activeSite.mission;
            if (!isSelf) {
                // Subtle rotation or scale pulse for the needle head
                const head = m.children[1];
                if (head) head.scale.setScalar(1 + Math.sin(time) * 0.05);
            }
        });
    }

    if (moon) {
        updateTiles();
    }
    
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function init() {
    try {
        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 30000);
        camera.position.set(0, 0, 15);

        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('lunar-canvas'),
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Label Renderer (CSS2D)
        labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none'; // Passthrough
        document.getElementById('app').appendChild(labelRenderer.domElement);

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 6;
        controls.maxDistance = 50;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.1;

        // Lighting: Sun + Ambient (Higher intensity for better Sun-facing highlights)
        sunLight = new THREE.DirectionalLight(0xffffff, 4.2); // Increased from 2.8
        sunLight.position.set(10000, 4000, 15000); 
        scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
        scene.add(ambientLight);

        // Environment
        createStarfield();
        createSun();
        createEarth();

        // UI Initialization
        setupUI();

        // Moon
        loadMoon();

        // UI Events
        document.getElementById('close-info').addEventListener('click', closeInfo);
        document.getElementById('hud-toggle').addEventListener('click', toggleHUD);
        document.getElementById('markers-toggle').addEventListener('click', toggleMarkers);
        
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'h') toggleHUD();
            if (e.key.toLowerCase() === 'm') toggleMarkers();
            if (e.key === 'Escape') closeInfo();
        });

        document.getElementById('fly-to-btn').addEventListener('click', () => {
            if (activeSite) flyToSite(activeSite);
        });

        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('mousemove', onMouseMove, false);

        animate();
    } catch (e) {
        console.error("Critical Initialization Error:", e);
        hideLoading();
    }
}

init();

// Backup for very slow networks
window.addEventListener('load', () => {
    setTimeout(hideLoading, 2000);
});
