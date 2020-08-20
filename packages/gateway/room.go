package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// RoomMap holds a map of IDs to rooms.
type RoomMap struct {
	rooms     map[*string]*MaybeRoom
	roomsLock sync.RWMutex
}

func NewRoomMap() *RoomMap {
	return &RoomMap{
		rooms:     make(map[*string]*MaybeRoom),
		roomsLock: sync.RWMutex,
	}
}

// EntryFor thread-safely obtains the MaybeRoom for a given room id.
func (roomMap *RoomMap) EntryFor(roomID *string) *MaybeRoom {
	rooms := roomMap.rooms
	roomsLock := roomMap.roomsLock

	roomsLock.RLock()
	value, exists := rooms[roomID]
	roomsLock.RUnlock()

	if !exists {
		// if the room doesn't exist, try to grab a lock on it
		roomsLock.Lock()
		// because while we were waiting for the lock, another goroutine might've created it, we need to
		// check if it exists again
		value, exists = rooms[roomID]

		if !exists {
			// still doesn't exist - we can create it
			value = &MaybeRoom{
				alive: make(chan Nothing),
				room:  nil,
			}

			rooms[roomID] = value
		}

		roomsLock.Unlock()
	}

	return value
}

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
	clients  []*websocket.Conn
	joining  chan joinRequest
	leaving  chan *websocket.Conn
	messages chan []byte
}

type client struct {
	connection *websocket.Conn
	id int
}

// JoinRoom sends a request to the room for a client to join it.
func (r *Room) JoinRoom(request *http.Request, connection *websocket.Conn) {
	r.joining <- joinRequest{request: request, connection: connection}
}

type serverJoinRequest struct {
	msgID   string
	headers http.Header
}

type clientMessage struct {
	msgID   string
	sender  string
	payload []byte
}

// OpenRoom begins running a room. It blocks until the room has completed running.
func OpenRoom(connection *websocket.Conn, maybeRoom *MaybeRoom) {
	maybeRoom.room = &Room{
		clients:  []*websocket.Conn{},
		joining:  make(chan joinRequest),
		leaving:  make(chan *websocket.Conn),
		messages: make(chan []byte),
	}
	close(maybeRoom.alive)

	room := maybeRoom.room

	select {
	case joinReq := <-room.joining:
		err := connection.WriteJSON(serverJoinRequest{msgID: "join", headers: joinReq.request.Header})
		if err != nil {
			fmt.Println("Failed to WriteJSON on join request to room:", err)
		}

	case message := <-room.messages:
		// we trust that if we receive a message, we can send it straight to the server
		// it is up to the method that puts the input into this channel to verify it
		err := connection.WriteJSON(clientMessage{ msgID: "msg", sender:  websocket.TextMessage, message)
		if err != nil {
			fmt.Println("Failed to WriteMessage on message to room:", err)
		}

	case leaving := <-room.leaving:

	}
}

// https://stackoverflow.com/a/48783449/3780113
func isValidJson(payload []byte) bool {
	dec := json.NewDecoder(bytes.NewReader(input))
	for {
		_, err := dec.Token()
		if err == io.EOF {
			return true
		}
		if err != nil {
			return false
		}
	}
}
