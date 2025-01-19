import express from 'express';
import dotenv from 'dotenv';
import fetchTrends from './scrapper.js';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static('public'));



app.get('/run-script', async (req, res) => {
    try{
        const record = await fetchTrends();
        return res.json({
            message: `These are the most happening topics as on ${record.dateTime}`,
            trends: [
                record.trend1,
                record.trend2,
                record.trend3,
                record.trend4,
                record.trend5,
            ],
            ipAddress: record.ipAddress,
            jsonData: record.dateTime,
        });
    }
    catch(e){
        console.error('Error:', e);
    }
})



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
