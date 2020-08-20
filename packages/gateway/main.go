package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// The address for public clients to connect to. This is the port that nginx should expose to the public for callers to connect to.
var publicAddress = flag.String("pub-addr", "0.0.0.0:8000", "public websocket gateway address")

// The address for the node server's web workers to connect to. This is the port that should NOT be exposed, and should be purely internal.
var privateAddress = flag.String("priv-addr", "0.0.0.0:8001", "private websocket gateway address")

// The address for the node verifier service to connect to. Once connected, this will start up the public and private gateways, and stop
// said gateways once the connection is lost, waiting for another.
var verifierAddress = flag.String("verify-addr", "0.0.0.0:8002", "verifier websockt address")

// Nothing is the equivalent of "empty tuple" in rust, suppose to be a 0-byte type where its value doesn't matter
type Nothing bool

func main() {
	flag.Parse()

	for {
		verifier := EstablishConnection(verifierAddress)
		rooms := make(map[*string]*MaybeRoom)
		roomsLock := new(sync.Mutex)

		go func() {
			server := createGateway(publicAddress, func(request *http.Request, connection *websocket.Conn) {
				allow, roomID, err := verifier.Verify(request)
				if err != nil {
					fmt.Println("Couldn't verify client", err)
					return
				}

				if !allow {
					connection.Close()
					return
				}

				// TODO: support gateway transport types through the query, such as supporting messagepack or a custom
				// protocol overload

				roomsLock.Lock()
				value, exists := rooms[roomID]
				if !exists {
					value = &MaybeRoom{
						alive: make(chan Nothing),
						room:  nil,
					}

					rooms[roomID] = value
				}
				roomsLock.Unlock()

				<-value.alive

				value.room.clientsLock.Lock()
				value.room.clients = append(value.room.clients, connection)
				value.room.clientsLock.Unlock()

			}, func(_ *http.Request) bool { return true })
			defer server.Shutdown(context.Background())

			verifier.Wait()
		}()

		go func() {
			server := createGateway(privateAddress, func(request *http.Request, connection *websocket.Conn) {
			}, nil)
			defer server.Shutdown(context.Background())

			verifier.Wait()
		}()

		verifier.Wait()
	}
}

// A goroutine-blocking function, which will create a webserver on the specified port and pass over connected websocket connections.
func createGateway(
	address *string,
	handler func(request *http.Request, connection *websocket.Conn),
	checkOrigin func(request *http.Request) bool,
) *http.Server {
	upgrader := websocket.Upgrader{
		CheckOrigin: checkOrigin,
	}

	serverMux := http.NewServeMux()

	serverMux.HandleFunc("/", func(responseWriter http.ResponseWriter, request *http.Request) {
		connection, err := upgrader.Upgrade(responseWriter, request, nil)
		if err != nil {
			log.Println("Error upgrading websocket:", err)
			return
		}

		defer connection.Close()

		handler(request, connection)
	})

	server := http.Server{
		Addr:    *address,
		Handler: serverMux,
	}

	go func() {
		err := server.ListenAndServe()
		if err != nil {
			log.Fatal("Couldn't ListenAndServe: ", err)
		}
	}()

	return &server
}
