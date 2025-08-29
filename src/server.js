import express from 'express';
import cors from "cors";
import dotenv from "dotenv"
import fetch from 'node-fetch';


dotenv.config({
    path: ".env"
})


const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true
}));

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Spam check endpoint 
app.post('/api/spamcheck', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email content is required' });
        }

        const response = await fetch('https://spamcheck.postmarkapp.com/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                email,
                options: 'short' 
            })
        });

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Postmark API error ${response.status}: ${txt}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Spam check error:', error);
        res.status(500).json({ 
            error: 'Failed to check spam score (Postmark)',
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening at port: ${PORT}`);
});