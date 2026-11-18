import 'dotenv/config';
import app from './app.js';
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API Project Mind na porta ${port}`));
