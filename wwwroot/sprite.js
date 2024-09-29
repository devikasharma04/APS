// Function to create sprites for sensor data visualization
function createSprites(data) {
    data.forEach((obj, index) => {
        // Create sprite for each sensor
        const sprite = new THREE.Sprite(/* your sprite material here */);
        sprite.position.set(obj.position.x, obj.position.y, obj.position.z);
        sprite.name = "Sensor " + index; // Name for identification
        // Add the sprite to the scene
        viewer.impl.scene.add(sprite);
        viewer.impl.invalidate(true);
    });
}

// Function to generate SurfaceShadingData for planar energy map
function generateSurfaceShadingData(devices) {
    const shadingNode = new Autodesk.DataVisualization.Core.SurfaceShadingNode("Heatmap Node", 0);
    devices.forEach((device, index) => {
        const point = new Autodesk.DataVisualization.Core.SurfaceShadingPoint(`Device ${index}`, device.position, ["Energy"]);
        shadingNode.addPoint(point);
    });
    return shadingNode;
}

// Main function to set up planar energy map and sprites
async function setupEnergytmapAndSprites(devices) {
    const model = viewer.model; // Assuming viewer is already initialized

    // Create sprites for sensors
    createSprites(devices);

    // Generate shading data for energy map
    const shadingData = generateSurfaceShadingData(devices);
    await dataVizExtn.setupSurfaceShading(model, shadingData, {
        type: "PlanarEnergymap",
        slicingEnabled: false, // Set to true if slicing is required
        minOpacity: 0.0, // Minimum opacity for the energy map
        maxOpacity: 1.0, // Maximum opacity for the energy map
        placementPosition: 0.0, // Position the energy map at the lowest z coordinate
    });

    // Function that provides a [0,1] value for the planar energy map
    function getSensorValue(surfaceShadingPoint, sensorType, pointData) {
        const { x, y } = pointData; // Get x, y coordinates for the point
        const sensorValue = computeSensorValue(x, y); // Custom logic for computing sensor value
        return clamp(sensorValue, 0.0, 1.0);
    }

    // Render the surface shading (energy map)
    const floorName = "01 - Entry Level"; // Change as needed
    const sensorType = "Energy"; // Sensor type 
    dataVizExtn.renderSurfaceShading(floorName, sensorType, getSensorValue);
}

// Example devices data
const devices = [
    { position: new THREE.Vector3(6.53, 7.42) },
    { position: new THREE.Vector3(6.53, 5.34) },
    { position: new THREE.Vector3(6.53, 3.27) },
    { position: new THREE.Vector3(6.53, 1.24) },
];

// Call the setup function to initialize
setupEnergymapAndSprites(devices);
