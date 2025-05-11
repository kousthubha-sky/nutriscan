# NutriScan

A MERN stack application for nutrition analysis and meal planning.

## Features

- Food nutrition analysis
- User authentication
- Responsive design

## Tech Stack

- **Frontend:**
  - React
  - Vite
  - React Router
  - Axios

- **Backend:**
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kousthubha-sky/nutriscan.git
cd nutriscan
```

2. Install dependencies:
```bash
# Install backend dependencies
cd DRIVE
npm install

# Install frontend dependencies
cd ../front
npm install
```

3. Create environment variables:
```bash
# In DRIVE folder, create .env file with:
MONGO_URI=your_mongodb_uri
PORT=5000
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

1. Start the backend server:
```bash
cd DRIVE
npm run dev
```

2. Start the frontend development server:
```bash
cd front
npm run dev
```

## Project Structure

```
nutriscan/
├── DRIVE/              # Backend
│   ├── config/        # Database configuration
│   ├── controllers/   # Route controllers
│   ├── models/       # Database models
│   └── routes/       # API routes
└── front/            # Frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── public/
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
