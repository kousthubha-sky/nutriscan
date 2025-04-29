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
        console.log('Starting submission flow test...');

        // 1. Login as regular user
        console.log('\n1. Logging in as regular user...');
        const userLoginResponse = await axios.post(`${API_URL}/user/login`, {
            username: 'testuser',
            password: 'testpass123'
        });
        userToken = userLoginResponse.data.token;
        console.log('✓ User logged in successfully');

        // 2. Submit a product with images
        console.log('\n2. Submitting product with images...');
        const formData = new FormData();
        formData.append('productName', 'Test Product');
        formData.append('barcodeNumber', uniqueBarcode);
        formData.append('brand', 'Test Brand');
        formData.append('category', 'snacks');
        formData.append('ingredients', 'ingredient1,ingredient2');
        formData.append('nutritionalInfo', JSON.stringify({
            servingSize: '100g',
            calories: 200,
            protein: 5,
            carbohydrates: 25,
            fat: 10,
            fiber: 2,
            sugar: 8,
            sodium: 150
        }));
        formData.append('allergens', 'milk,soy');
        formData.append('dietaryInfo', 'vegetarian');
        
        // Add test images
        formData.append('productImage', fs.createReadStream(path.join(__dirname, 'test-assets', 'test-product.jpg')));
        formData.append('barcodeImage', fs.createReadStream(path.join(__dirname, 'test-assets', 'test-barcode.jpg')));

        const submission = await axios.post(`${API_URL}/products/submit`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${userToken}`
            }
        });
        submissionId = submission.data.submission._id;
        console.log('✓ Product submitted successfully');

        // 3. Login as admin
        console.log('\n3. Logging in as admin...');
        const adminLoginResponse = await axios.post(`${API_URL}/user/login`, {
            username: 'admin',
            password: 'adminpass123'
        });
        adminToken = adminLoginResponse.data.token;
        console.log('✓ Admin logged in successfully');

        // 4. Get submission details
        console.log('\n4. Getting submission details...');
        const submissionDetails = await axios.get(
            `${API_URL}/admin/submissions/${submissionId}`,
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        
        if (!submissionDetails.data.submission) {
            throw new Error('Submission details not found');
        }
        console.log('✓ Submission details retrieved');
        console.log('Submission status:', submissionDetails.data.submission.status);

        // 5. Review and approve the submission
        console.log('\n5. Reviewing and approving submission...');
        const reviewData = {
            status: 'approved',
            adminNotes: 'Test approval',
            productName: 'Updated Test Product',
            brand: 'Updated Test Brand',
            category: 'snacks',
            ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
            nutritionalInfo: {
                servingSize: '100g',
                calories: 200,
                protein: 5,
                carbohydrates: 25,
                fat: 10,
                fiber: 2,
                sugar: 8,
                sodium: 150
            },
            allergens: ['milk', 'soy'],
            dietaryInfo: ['vegetarian']
        };

        const review = await axios.post(
            `${API_URL}/admin/submissions/${submissionId}/review`,
            reviewData,
            {
                headers: { 
                    Authorization: `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✓ Submission reviewed and approved');

        // 6. Verify product creation
        console.log('\n6. Verifying product creation...');
        const productSearch = await axios.get(
            `${API_URL}/products/search?q=${encodeURIComponent(uniqueBarcode)}`
        );
        
        if (productSearch.data.products && productSearch.data.products.length > 0) {
            const product = productSearch.data.products[0];
            console.log('✓ Product created successfully');
            console.log('Product details:', {
                name: product.name,
                brand: product.brand,
                category: product.category,
                status: product.status
            });
        } else {
            throw new Error('Product not found after approval');
        }

        console.log('\n✨ All tests passed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:');
        if (error.response?.data) {
            console.error('Server error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testSubmissionFlow();