const express = require('express')
const cors = require("cors");





const app = express()

// Allow requests from any origin (change '*' to a specific origin if needed)
app.use(cors({
  origin: "*",
  credentials: true
}));
const userRouter = require('./routes/user.routes')

const env = require('dotenv')
env.config();

const connecToDB = require('./config/db')
connecToDB();

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const {body, validationResult} = require('express-validator');
const indexRouter = require('./routes/index.routes')
const adminRoutes = require('./routes/admin.routes')


app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/admin', adminRoutes)


const productRouter = require('./routes/productRoutes')
app.use('/products', productRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});