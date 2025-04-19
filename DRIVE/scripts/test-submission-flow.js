const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';
let userToken = '';
let adminToken = '';
let submissionId = '';

async function testSubmissionFlow() {
    try {
        // Generate a unique barcode number using timestamp
        const uniqueBarcode = `TEST${Date.now()}`;
        console.log('Starting submission flow test...\n');

        // 1. Login as regular user
        console.log('1. Logging in as regular user...');
        const userLoginResponse = await axios.post(`${API_URL}/user/login`, {
            username: 'testuser',
            password: 'testpass123'
        });
        userToken = userLoginResponse.data.token;
        console.log('✓ User logged in successfully\n');

        // 2. Submit a product with images
        console.log('2. Submitting product with images...');
        const formData = new FormData();
        formData.append('productName', 'Test Product');
        formData.append('barcodeNumber', uniqueBarcode);
        formData.append('additionalInfo', 'Test product submission');
        
        // Add test images with correct paths
        formData.append('productImage', fs.createReadStream(path.join(__dirname, 'test-assets', 'test-product.jpg')));
        formData.append('barcodeImage', fs.createReadStream(path.join(__dirname, 'test-assets', 'test-barcode.jpg')));

        const submission = await axios.post(`${API_URL}/products/submit`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${userToken}`
            }
        });
        submissionId = submission.data.submission._id;
        console.log('✓ Product submitted successfully\n');

        // 3. Login as admin
        console.log('3. Logging in as admin...');
        const adminLoginResponse = await axios.post(`${API_URL}/user/login`, {
            username: 'admin',
            password: 'adminpass123'
        });
        adminToken = adminLoginResponse.data.token;
        console.log('✓ Admin logged in successfully\n');

        // 4. Get submission details
        console.log('4. Getting submission details...');
        const submissionDetails = await axios.get(
            `${API_URL}/admin/submissions/${submissionId}`,
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log('✓ Submission details retrieved\n');
        console.log('Submission status:', submissionDetails.data.submission.status);

        // 5. Approve the submission
        console.log('5. Approving submission...');
        const approval = await axios.patch(
            `${API_URL}/admin/submissions/${submissionId}/status`,
            { status: 'approved' },
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log('✓ Submission approved\n');

        // 6. Verify product creation
        console.log('6. Verifying product creation...');
        const product = await axios.get(
            `${API_URL}/products/search?q=${encodeURIComponent(uniqueBarcode)}`
        );
        
        if (product.data.products.length > 0) {
            console.log('✓ Product created successfully');
            console.log('Product details:', {
                name: product.data.products[0].name,
                barcode: product.data.products[0].barcode,
                productImage: product.data.products[0].productImage,
                barcodeImage: product.data.products[0].barcodeImage
            });
        } else {
            throw new Error('Product not found after approval');
        }

        console.log('\nAll tests passed successfully! ✨');
    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error('Error:', error.response?.data || error.message);
        if (error.response?.data?.stack) {
            console.error('Stack trace:', error.response.data.stack);
        }
    }
}

testSubmissionFlow();