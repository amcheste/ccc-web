// Package httpserver serves the static SPA with client-side routing
// support: real files are served as-is, every other path falls back to
// index.html so React Router owns the URL space.
package httpserver

import (
	"io/fs"
	"net/http"
	"strings"
)

// NewHandler serves dist with an index.html fallback for SPA routes.
func NewHandler(dist fs.FS) http.Handler {
	fileServer := http.FileServerFS(dist)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")

		path := strings.TrimPrefix(r.URL.Path, "/")
		if path != "" {
			if f, err := dist.Open(path); err == nil {
				_ = f.Close()
				// Hashed assets are immutable; let browsers cache hard.
				if strings.HasPrefix(path, "assets/") {
					w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
				}
				fileServer.ServeHTTP(w, r)
				return
			}
		}
		w.Header().Set("Cache-Control", "no-cache")
		http.ServeFileFS(w, r, dist, "index.html")
	})
}
