IMAGE := ghcr.io/amcheste/ccc-web
TAG ?= dev
PLATFORMS := linux/arm64,linux/amd64
KIND_CLUSTER := ccc
KIND_CONTEXT := kind-$(KIND_CLUSTER)

.PHONY: build test lint web-dev docker docker-multiarch kind-up kind-deploy kind-down

# Go server only; the real UI is compiled into the image by `docker`.
build:
	go build ./...

test:
	go test ./...
	cd web && npm run test

# Requires golangci-lint v2 (config is version "2"):
#   go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.12.2
lint:
	golangci-lint run
	cd web && npm run lint

# Hot-reloading UI dev server with MSW mocks (VITE_MSW=0 to proxy to
# a live backend instead, e.g. the ccc-dev kind stack).
web-dev:
	cd web && npm run dev

docker:
	docker build -t $(IMAGE):$(TAG) .

docker-multiarch:
	docker buildx build --platform $(PLATFORMS) -t $(IMAGE):$(TAG) .

# ── Local kind cluster ───────────────────────────────────────────────
kind-up:
	@kind get clusters 2>/dev/null | grep -qx '$(KIND_CLUSTER)' || \
		kind create cluster --name $(KIND_CLUSTER)
	$(MAKE) kind-deploy

kind-deploy: docker
	kind load docker-image $(IMAGE):$(TAG) --name $(KIND_CLUSTER)
	kubectl --context $(KIND_CONTEXT) apply -k deploy/kind
	kubectl --context $(KIND_CONTEXT) -n ccc rollout restart deploy/ccc-web
	kubectl --context $(KIND_CONTEXT) -n ccc rollout status deploy/ccc-web --timeout=120s

kind-down:
	kind delete cluster --name $(KIND_CLUSTER)
