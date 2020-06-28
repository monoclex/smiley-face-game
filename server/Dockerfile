FROM hayd/alpine-deno:1.0.0

EXPOSE 8080

WORKDIR /app

# cache the dependencies as a layer in the build so building is faster
COPY deps.ts .
RUN deno cache deps.ts

COPY . .
RUN deno cache server.ts

CMD ["--allow-net", "server.ts"]
