import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()

// Register a new user endpoint /auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body
    // do not save plain text passwords, but encrypt them using bcrypt package

    // encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8)
    // save the new user and hashed password to the database
    try {
        const insertUser = db.prepare(
            `INSERT INTO users (username, password) VALUES (?, ?)`
        )
        const result = insertUser.run(username, hashedPassword)

        // now that we have a user, I want to add their  first todo for them
        const defaultTodo = `Hello :D Add your first todo!`
        const insertTodo = db.prepare(
            `INSERT INTO todos (user_id, task) VALUES (?, ?)`
        )
        insertTodo.run(result.lastInsertRowid, defaultTodo)

        // create a token
        const token = jwt.sign(
            { id: result.lastInsertRowid },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
    res.sendStatus(201)
})

// Login a user /auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body
    // upon login, we encrypt the password in req.body, and compare it with encrypted registered password of the user
    try {
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`)
        const user = getUser.get(username)

        // if we cannot find a user associated with that username, return out from the function
        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        if (!passwordIsValid) {
            return res.status(401).send({ message: 'Invalid password' })
        }

        // then we have a successful authentication
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        })
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
    res.status(200).send({ message: `User is found` })
})

export default router
