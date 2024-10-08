import express from 'express';
import userRouter from './routes/userRoutes';
import accountRouter from './routes/accountRoutes';
import transactionRouter from './routes/transactionRoutes';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message :'Hello, API is working fine !' });
});
app.use("/api/user", userRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", transactionRouter);

export default app;