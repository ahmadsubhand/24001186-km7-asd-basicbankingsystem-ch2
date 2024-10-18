import express from 'express';
import userRouters from './routes/user.js'; 
import accoutRouters from './routes/account.js';
import transactionRouters from './routes/transaction.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/users', userRouters);
app.use('/api/v1/accounts', accoutRouters);
app.use('/api/v1/transactions', transactionRouters);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})