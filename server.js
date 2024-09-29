require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { PORT } = require('./config.js');

let app = express();
app.use(express.static('wwwroot'));
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Temporary file storage

// Get the access token from Autodesk Forge
async function getAccessToken() {
    const response = await axios.post('https://developer.api.autodesk.com/authentication/v1/token', null, {
        params: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'data:read data:write data:create bucket:read bucket:create',
        },
    });
    return response.data.access_token;
}

// Upload model endpoint
app.post('/api/upload', upload.single('model-file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const accessToken = await getAccessToken();

        // Upload the file to Autodesk OSS
        const bucketKey = 'your_bucket_key'; // Use your bucket key here
        await axios.put(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${file.originalname}`, file.buffer, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream',
            },
        });

        // Start translation job
        const urn = Buffer.from(file.originalname).toString('base64'); // Use base64 of the file name as URN
        const translationRequest = {
            input: {
                urn: urn,
            },
            output: {
                formats: [
                    {
                        type: 'svf',
                        views: ['2d', '3d'],
                    },
                ],
            },
        };

        await axios.post('https://developer.api.autodesk.com/model-derivative/v2/viewers/urn:your_viewer_urn/manifest', translationRequest, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        return res.json({ urn }); // Respond with the URN
    } catch (error) {
        console.error('Error uploading model:', error);
        res.status(500).send('Error uploading model.');
    }
});

app.listen(PORT, function () { 
    console.log(`Server listening on port ${PORT}...`); 
});
