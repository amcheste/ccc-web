# syntax=docker/dockerfile:1
# Three stages: Vite build (build platform, output is arch-neutral),
# cross-compiled Go build embedding the dist, distroless runtime.

FROM --platform=$BUILDPLATFORM node:22 AS webbuild
WORKDIR /src/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
RUN npm run build

FROM --platform=$BUILDPLATFORM golang:1.26 AS gobuild
WORKDIR /src
COPY . .
COPY --from=webbuild /src/web/dist internal/webfs/dist
ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -trimpath -ldflags="-s -w" -o /out/ccc-web ./cmd/ccc-web

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=gobuild /out/ccc-web /ccc-web
EXPOSE 8080 8081
USER nonroot
ENTRYPOINT ["/ccc-web"]
