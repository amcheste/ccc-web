// Command ccc-web serves the built CCC web UI as a static SPA, plus an
// ops listener for probes. API calls never touch this process: the
// ingress routes /api/* straight to the owning service.
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

	"github.com/amcheste/ccc-web/internal/httpserver"
	"github.com/amcheste/ccc-web/internal/webfs"
)

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	httpAddr := getenv("CCC_HTTP_ADDR", ":8080")
	opsAddr := getenv("CCC_OPS_ADDR", ":8081")

	ok := func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}
	opsMux := http.NewServeMux()
	opsMux.HandleFunc("GET /healthz", ok)
	opsMux.HandleFunc("GET /readyz", ok)

	web := &http.Server{
		Addr:              httpAddr,
		Handler:           httpserver.NewHandler(webfs.Dist()),
		ReadHeaderTimeout: 5 * time.Second,
	}
	ops := &http.Server{
		Addr:              opsAddr,
		Handler:           opsMux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	errCh := make(chan error, 2)
	go func() {
		logger.Info("web listener starting", "addr", httpAddr)
		errCh <- web.ListenAndServe()
	}()
	go func() {
		logger.Info("ops listener starting", "addr", opsAddr)
		errCh <- ops.ListenAndServe()
	}()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	select {
	case <-ctx.Done():
		logger.Info("shutdown signal received")
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("listener failed", "error", err)
			os.Exit(1)
		}
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = web.Shutdown(shutdownCtx)
	_ = ops.Shutdown(shutdownCtx)
	logger.Info("stopped")
}
