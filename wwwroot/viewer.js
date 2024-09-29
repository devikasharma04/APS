const viewerContainer = document.getElementById('viewer-container');
let scene, camera, renderer;

function initViewer() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    viewerContainer.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);
    camera.position.z = 5;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

document.getElementById('upload-button').addEventListener('click', () => {
    const fileInput = document.getElementById('house-map');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const contents = event.target.result;
            const geometry = new THREE.STLLoader().parse(contents);
            const material = new THREE.MeshNormalMaterial();
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            animate();
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please select an STL file to upload.');
    }
});

window.onload = initViewer;
