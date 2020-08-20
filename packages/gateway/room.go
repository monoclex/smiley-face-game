package main

import (
	"net/http"

	"github.com/gorilla/websocket"
)

// MaybeRoom represents the possibility of a room existing, and if not, a channel that will trigger when the room exists.
type MaybeRoom struct {
	alive chan Nothing
	room  *Room
}

// Room waits until the room is alive, and then returns the room.
func (maybeRoom *MaybeRoom) Room() *Room {
	<-maybeRoom.alive
	return maybeRoom.room
}

type joinRequest struct {
	connection *websocket.Conn
	request    *http.Request
}

// Room holds all the clients, and other necessary information to facilitate transporting messages from the server to the clients, and vice versa.
type Room struct {
	clients []*websocket.Conn
	joining chan joinRequest
}
