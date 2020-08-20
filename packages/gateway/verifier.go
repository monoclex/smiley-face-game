package main

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// VerificationResponse represents whether a connection may or may not join a room.
type VerificationResponse struct {
	success bool
	roomID  *string
}

// Verifier will communicate with a VerifierServer to verify a connection.
type Verifier struct {
	verifierServer       *websocket.Conn
	verificationRequests chan verificationRequest
	alive                chan Nothing
}

type verificationRequest struct {
	request  *http.Request
	response chan VerificationResponse
}

type verifierConnectionRequest struct {
	headers *http.Header
}

// Wait wait until this verifier dies
func (v *Verifier) Wait() {
	<-v.alive
}

// EstablishConnection establishes a connection with a server (typically a Node process), and returns a Verifier that will communicate with
// the connected server to determine if a connection should be verified.
func EstablishConnection(address *string) *Verifier {
	// setup http server
	upgrader := websocket.Upgrader{
		CheckOrigin: func(_ *http.Request) bool { return true },
	}

	serverMux := http.NewServeMux()

	// "connected" will prevent more than one client (a.k.a. node server) from being the verification server
	connected := false

	// use a channel to pass along the connected server
	receiveConnection := make(chan *websocket.Conn)
	serverMux.HandleFunc("/", func(responseWriter http.ResponseWriter, request *http.Request) {
		connection, err := upgrader.Upgrade(responseWriter, request, nil)
		if err != nil {
			log.Println("Error upgrading websocket:", err)
			return
		}

		if connected {
			log.Println("Another verifier attempted to connect whilst verifier still in use.")
			connection.Close()
			return
		}

		connected = true
		receiveConnection <- connection
	})

	// listen for a client
	server := http.Server{
		Addr:    *verifierAddress,
		Handler: serverMux,
	}

	go func() {
		err := server.ListenAndServe()
		if err != nil {
			log.Println("Verifier server received error on ListenAndServe", err)
			return
		}
	}()

	// wait until we have one
	connection := <-receiveConnection
	close(receiveConnection) // once we have a connection, we can throw away the receive channel as we'll only be having one connection

	// setup verifier server
	verifier := Verifier{
		verifierServer:       connection,
		verificationRequests: make(chan verificationRequest),
		alive:                make(chan Nothing),
	}

	// start listening for verification requests
	go func() {
		// when this stops, shut down the server & signal that the verifier server is dead
		defer server.Shutdown(context.Background())
		defer close(verifier.alive)

		for {
			// wait for a verification request from a client
			request := <-verifier.verificationRequests

			// send the verification request to the server
			connection.WriteJSON(verifierConnectionRequest{headers: &request.request.Header})

			// get a verification response
			_, buffer, err := connection.ReadMessage()
			if err != nil {
				log.Println("[WARN] failed to ReadMessage on verifier websocket connection. exiting")
				return
			}

			if len(buffer) == 0 {
				log.Fatalln("Received 0 bytes in a buffer.")
				return
			}

			message := string(buffer)

			if message == "" {
				// empty string, verification failed
				request.response <- VerificationResponse{success: true, roomID: &message}
			} else {
				// response contains id of room, verification failed
				request.response <- VerificationResponse{success: false, roomID: nil}
			}
		}
	}()

	return &verifier
}

// Verify verifies if a connection should be allowed to connect, based upon the response of the VerifierServer.
func (v *Verifier) Verify(request *http.Request) (bool, *string, error) {

	// setup a way to receive a response from the verification server
	responseChannel := make(chan VerificationResponse, 1)
	defer close(responseChannel)

	// send the request
	v.verificationRequests <- verificationRequest{
		request:  request,
		response: responseChannel,
	}

	// wait for a response
	select {
	// verifier server responded
	case response := <-responseChannel:
		return response.success, response.roomID, nil

	// verifier server died
	case <-v.alive:
		return false, nil, errors.New("verifier server died")
	}
}
