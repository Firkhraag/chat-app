import express from 'express'
import http from 'http'
import path from 'path'
import socketio from 'socket.io'
import { generateMessage } from './utils/messages'
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users'

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 8080
const publicDirectoryPath = path.join(__dirname, '../public')

// Templates
app.use(express.static(publicDirectoryPath))

// Connection established
io.on('connection', (socket) => {
    console.log('New connection')

    // User has joined
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser(socket.id, username, room)

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        // Send welcome message
        socket.emit('message', generateMessage('Chat Room', 'Welcome!'))
        // Send message to other users
        socket.broadcast.to(user.room).emit('message', generateMessage('Chat Room', `${user.username} has joined!`))

        // Send data about current users in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    // Message received
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        if (user) {
            // Send message to all users in the room
            io.to(user.room).emit('message', generateMessage(user.username, msg))
            callback()
        }
    })

    // Location received
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        if (user) {
            // Send location to all users in the room
            io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
            callback()
        }
    })

    // User disconnected
    socket.on('disconnect', () => {
        console.log('Connection ended')
        const user = removeUser(socket.id)
        if (user) {
            // Send message to users
            io.to(user.room).emit('message', generateMessage('Chat Room', `${user.username} has left!`))

            // Send updated users data
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(8080, () => {
    console.log(`Server is up and running ${port}`)
})
