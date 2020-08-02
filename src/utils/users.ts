interface User {
    id: string
    username: string
    room: string
}

const users: Array<User> = []

export const addUser = (id: string, username: string, room: string) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the date
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is already used!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

export const removeUser = (id: string) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

export const getUser = (id: string) => {
    return users.find((user) => user.id === id)
}

export const getUsersInRoom = (room: string) => {
    return users.filter((user) => user.room === room)
}
