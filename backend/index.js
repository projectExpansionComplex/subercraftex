//pesEcommerse server file
require('dotenv').config()
const connectDB = require('./config/db')

global.__basedir = __dirname;

//connectDB
connectDB();

const app = require('./src/server.js');

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, ()=>console.log(`pesEcomerce Server running on port http://localhost:${PORT} and on ${process.env.NODE_ENV} mode`))

//handle server crash error
process.on('unhandleRejection', (err,promise) =>{
  console.log(`Logged Error:${err}`)
  server.close(()=>process.exit(1))
})
