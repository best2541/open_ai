require('dotenv').config()
const express = require('express')
const app = express()
const OpenAI = require('openai')
const mysql = require('mysql2/promise')
let totalChat = ''
const connection = mysql.createConnection({
    host: 'dcrhg4kh56j13bnu.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'idewofktlttgg7nz',
    password: 'd1yjz40wualr5w69',
    database: 'aoe1adeab51zt65c'
})

app.use(express.json())
const openai = new OpenAI({
    apiKey: process.env.APIKEY
})
app.get('/test', async (req, res) => {
    const [users] = await (await connection).query('select * from USERS')
    const [country] = await (await connection).query('select * from COUNTRY')
    console.log(users)
    console.log(country)
    res.send('datas')
})
app.get('/start', async (req, res) => {
    const [users] = await (await connection).query('select * from USERS')
    const [country] = await (await connection).query('select * from COUNTRY')
    const datas = {
        users: users,
        country: country
    }
    if (req.query.prompt) {
        var request = req.query.prompt
    } else {
        var request = `remember this schema
table USERS {
        username varchar(100) primary key,
        age int,
        country int
    }
    table COUNTRY {
        id int primary key,
        country_name varchar(100)
    }
and if you try to select sql use this to answer without sql\n${JSON.stringify(datas)}
but if you try to update,insert,delete sql answer only query no talk then insert 'SQL:' in front of it by use schema`
    }
    const prompt = totalChat + (`\nYou: ${request}`)
    console.log('----------------------------------')
    console.log('sending', prompt)
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
            'role': 'user',
            'content': prompt
        }],
        stop: ['You:'],
        max_tokens: req.query.prompt ? 100 : 1
    })
    const answer = response.choices[0].message.content.toString()
    totalChat = prompt + `\nAI: ${answer}`
    if (answer.includes('SQL:')) {
        const a = response.choices[0].message.content.split('SQL:')
        const [result] = await (await connection).query(a[1])
        res.send(result)
    } else {
        res.send(answer)
    }
})
// app.get('/getResponse', async (req, res) => {
//     const request = 'Which country has the most users'
//     const prompt = totalChat.concat(`\nYou: ${request}\nAI:`)
//     const response = await openai.chat.completions.create({
//         model: 'gpt-3.5-turbo',
//         messages: [{
//             'role': 'user',
//             'content': prompt,
//         }],
//         max_tokens: 100
//     })
//     const answer = response.choices[0].message.content.toString()
//     totalChat = `\nYou: ${request}\nAI: ${answer}`
//     const [result, fields] = await (await connection).query(response.choices[0].message.content)
//     res.send(result)
// })

app.listen(4000, () => console.log('starting on 4000'))