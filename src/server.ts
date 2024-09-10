import app from "./app";
import connectToDatabase from "./config/dbConfig";

connectToDatabase();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});