// Assuming you want to load the sprites here
const viewerContainer = document.getElementById('forgeViewer');

async function addSprites() {
    const dataVizExtn = await viewer.loadExtension("Autodesk.DataVisualization");

    const DataVizCore = Autodesk.DataVisualization.Core;
    const viewableType = DataVizCore.ViewableType.SPRITE;
    const spriteColor = new THREE.Color(0xffffff);
    const baseURL = "http://localhost:8080/images/"; // Adjust the base URL accordingly
    const spriteIconUrl = `${baseURL}fan-00.svg`;

    const style = new DataVizCore.ViewableStyle(viewableType, spriteColor, spriteIconUrl);
    const viewableData = new DataVizCore.ViewableData();
    viewableData.spriteSize = 24; // Sprites as points of size 24 x 24 pixels

    const myDataList = [{ position: { x: 10, y: 2, z: 3 } }, { position: { x: 20, y: 22, z: 3 } }];

    myDataList.forEach((myData, index) => {
        const dbId = 10 + index;
        const position = myData.position;
        const viewable = new DataVizCore.SpriteViewable(position, style, dbId);
        viewableData.addViewable(viewable);
    });

    await viewableData.finish();
    dataVizExtn.addViewables(viewableData);
}

addSprites();
