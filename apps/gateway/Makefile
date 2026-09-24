.PHONY: build test lint run

build:
	go build -trimpath -o bin/gateway ./cmd/gateway

test:
	go test -race ./...

lint:
	@out=$$(gofmt -l .); if [ -n "$$out" ]; then echo "gofmt needed:"; echo "$$out"; exit 1; fi
	go vet ./...

run:
	go run ./cmd/gateway
