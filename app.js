require('dotenv').config()
const express = require('express')
const app = express()
const OpenAI = require('openai')

app.use(express.json())
const openai = new OpenAI({
    apiKey: process.env.APIKEY
})

app.get('/getResponse', async (req, res) => {
    const response = await openai.chat.completions.create({
        model: 'data-analyst',
        messages: [{
            'role': 'user',
            'content': 'ดูดวง คนเกิดวันเสาร์',
        }],
        max_tokens: 100
    })
    console.log(response.choices[0])
    res.send(response.choices[0])
})

app.listen(4000, () => console.log('starting on 4000'))