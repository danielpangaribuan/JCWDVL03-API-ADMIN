// =============== IMPORT LIBRARY ===============
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const database = require('./database')

const { UrlLogger } = require('./utils')

// =============== CREATE EXPRESS APP ===============
const app = express();

// =============== SETTING : MIDDLEWARE ===============
app.use(cors());
app.use(express.json());
app.use(UrlLogger);

// =============== DB CONNECTION ===============
database.connect((error) => {
    if (error) console.log(error);

    console.log('Connected at threat id', database.threadId);
});

const routes = require('./routes')
app.use(routes.home_route)
app.use(routes.user_routes)
app.use(routes.transaction_routes)
app.use(routes.combo_routes)
app.use(routes.report_routes)
app.use(routes.product_routes)

const PORT = process.env.PORT || 2000
app.listen(PORT, () => console.log(`Server is running at port : ${PORT}`));