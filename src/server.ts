import app from "./app";
import connectToDatabase from "./config/dbConfig";

connectToDatabase();

app.get('/', (req, res) => {
    res.send('Hello, TypeScript with Node.js!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});