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
        return res.status(201).json({ token })
    } catch (err) {
        console.error(err)
        if (err.message.include('UNIQUE')) {
            return res.status(409).json({ message: 'Username already exists' })
        }
        return res.status(500).json({ message: 'Server error' })
    }
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
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // then we have a successful authentication
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        })

        return res.json({ token })
    } catch (err) {
        console.error(err)
        res.sendStatus(500).json({ message: 'Server error' })
    }
})

export default router
