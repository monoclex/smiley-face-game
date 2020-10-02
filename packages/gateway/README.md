# Go Gateway

At some point in the future, for scalability purposes, it will become necessary to move the primarily single-threaded node process into multiple.
After looking around, I have concluded that the usage of [`threads.js`](https://www.npmjs.com/package/threads) will be used to start
rooms on their own threads, and each child node process should communicate with the Go Gateway.

The nature of go lends itself to message passing and parallelism. Go also compiles to a native binary and isn't interpreted, and code
written in go is easier to understand than comparable languages, such as Elixir or Rust. Thus, it makes an excellent choice for a gateway.

The Go Gateway can offload a lot of the work of the node process, meaning that node process can focus more of its CPU time on room related
functionality, rather than housework, such as rate-limiting clients, or needing to decode the payload of the client from various supported
transport protocols into something it can handle.

On the contrary, there is severely increase complexity with having a Go Gateway. Not only must the Go Gateway be aware of the concept of
rooms, it must facilitate the communication between child node processes, the authentication node process, and be the middleware for
clients. This additional complexity wastes CPU time.

However, that is only because the current architecture is flawed. Currently, the architecture looks something like this:

- Verifier Server connects to Go Gateway
- Go Gateway begins waiting for connections from child node processes and for connections on the public websocket endpoint
- Go Gateway uses a JSON messaging scheme to transport events from public websockets to the child node processes
- Once Verifier Server dies, the Go Gateway forcibly closes everything

Whilst writing this document, the idea to not reuse the one connection from the child node process to the Go Gateway and instead have the
Go Gateway connect to the child node process per incoming websocket connection makes much more sense. It'd be much easier to support
mutliple transport protocols, ratelimit, and other necessities in this manner.

Given that this feature is not critical at the moment, this sub-project will be put on hold until it is necessary.
