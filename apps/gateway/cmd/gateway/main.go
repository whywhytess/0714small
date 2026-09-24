// Command gateway 是面向用户站点域的只读静态服务（ADR 0003）。
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/whywhytess/small0714/apps/gateway/internal/server"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	sites := newServer(envOr("GATEWAY_ADDR", ":8080"), server.Sites())
	health := newServer(envOr("GATEWAY_HEALTH_ADDR", "127.0.0.1:8081"), server.Health())

	errc := make(chan error, 2)
	for _, s := range []*http.Server{sites, health} {
		go func() {
			log.Info("listening", "addr", s.Addr)
			if err := s.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
				errc <- err
			}
		}()
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	select {
	case err := <-errc:
		log.Error("server failed", "err", err)
		os.Exit(1)
	case <-ctx.Done():
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	for _, s := range []*http.Server{sites, health} {
		if err := s.Shutdown(shutdownCtx); err != nil {
			log.Error("shutdown", "addr", s.Addr, "err", err)
		}
	}
	log.Info("stopped")
}

func newServer(addr string, h http.Handler) *http.Server {
	return &http.Server{
		Addr:              addr,
		Handler:           h,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
		MaxHeaderBytes:    16 << 10,
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
