import express from 'express';
import userRouters from './routes/user.js'; 
import accoutRouters from './routes/account.js';
import transactionRouters from './routes/transaction.js';
import { readFileSync } from "fs";
const swaggerJSON = JSON.parse(readFileSync("./docs/swagger-api-v1.json"));
// import swaggerJSON from './docs/swagger-api-v1.json' assert { type: 'json' };
// import swaggerJSON2 from './swagger-output.json' assert { type: 'json' };
import swaggerUI from 'swagger-ui-express';
import mediaRouter from './routes/media.js';

const app = express();
const port = 3000;

import dotenv from 'dotenv';
dotenv.config()

app.use('/images', express.static('public/images'));
app.use('/files', express.static('public/files'));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/users', userRouters);
app.use('/api/v1/accounts', accoutRouters);
app.use('/api/v1/transactions', transactionRouters);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON))
app.use('/api/v1/images', mediaRouter);
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON2))

app.listen(port, () => {
  console.log(`Server is running on http://localhost:3000`);
  console.log(`Swagger docs is available at http://localhost:3000/api-docs`);
})