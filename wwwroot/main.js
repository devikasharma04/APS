import { initViewer, loadModel } from './viewer.js';

// Initialize viewer and load model immediately on page load
initViewer(document.getElementById('preview')).then(viewer => {
    const urn = window.location.hash?.substring(1);  // Fetch the model URN from the URL hash if present
    setupModelSelection(viewer, urn);  // Populate model dropdown and load selected model
});

// Function to populate the dropdown with available models and load the selected one
async function setupModelSelection(viewer, selectedUrn) {
    const dropdown = document.getElementById('models');
    dropdown.innerHTML = '';  // Clear existing dropdown options

    try {
        const resp = await fetch('/api/models');  // Fetch the list of models from the server
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const models = await resp.json();  // Parse the JSON response
        dropdown.innerHTML = models.map(model => 
            `<option value="${model.urn}" ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`
        ).join('\n');

        dropdown.onchange = () => onModelSelected(viewer, dropdown.value);  // Change model on selection
        if (dropdown.value) {
            onModelSelected(viewer, dropdown.value);  // Load the default selected model on page load
        }
    } catch (err) {
        alert('Could not list models. See the console for more details.');
        console.error(err);
    }
}

// Function to load the selected model
async function onModelSelected(viewer, urn) {
    if (window.onModelSelectedTimeout) {
        clearTimeout(window.onModelSelectedTimeout);
        delete window.onModelSelectedTimeout;
    }
    window.location.hash = urn;  // Update the URL with the model URN

    try {
        const resp = await fetch(`/api/models/${urn}/status`);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const status = await resp.json();

        switch (status.status) {
            case 'n/a':
                showNotification('Model has not been translated.');
                break;
            case 'inprogress':
                showNotification(`Model is being translated (${status.progress})...`);
                window.onModelSelectedTimeout = setTimeout(onModelSelected, 5000, viewer, urn);
                break;
            case 'failed':
                showNotification(`Translation failed. <ul>${status.messages.map(msg => `<li>${JSON.stringify(msg)}</li>`).join('')}</ul>`);
                break;
            default:
                clearNotification();
                loadModel(viewer, urn);  // Load the model if it's ready
                break;
        }
    } catch (err) {
        alert('Could not load model. See the console for more details.');
        console.error(err);
    }
}

// Notification functions for model loading feedback
function showNotification(message) {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = `<div class="notification">${message}</div>`;
    overlay.style.display = 'flex';
}

function clearNotification() {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = '';
    overlay.style.display = 'none';
}
