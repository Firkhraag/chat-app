const socket = io()

// Elements
const $messageForm = document.querySelector('#msg-form')
const $messageFormInput = document.querySelector('#msg-input')
const $messageFormButton = document.querySelector('#msg-submit')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// Scroll to the bottom
const autoScroll = () => {
    $messages.scrollTop = $messages.scrollHeight
}

// Location message received
socket.on('locationMessage', (msg) => {
    const html = Mustache.render(locationTemplate, {
        location: msg.text,
        date: moment(msg.createdAt).format('h:mm a'),
        username: msg.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Message received
socket.on('message', (msg) => {
    const html = Mustache.render(messageTemplate, {
        message: msg.text,
        date: moment(msg.createdAt).format('h:mm a'),
        username: msg.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Send message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!$messageFormInput.value) {
        return
    }
    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', $messageFormInput.value, () => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('Message delivered')
    })
})

// Send location
$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

// Join the server
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
    }
})

// Get the data about users in the room
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    document.querySelector('#sidebar').innerHTML = html
})
