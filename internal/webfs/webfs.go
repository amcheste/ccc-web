// Package webfs embeds the built web UI. The committed dist/ holds a
// placeholder page only; the real Vite build is copied in during the
// Docker image build, never into the working tree. Local UI work uses
// `npm run dev` in web/, not this binary.
package webfs

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var embedded embed.FS

// Dist returns the built UI rooted at its top level.
func Dist() fs.FS {
	sub, err := fs.Sub(embedded, "dist")
	if err != nil {
		panic(err) // unreachable: dist is embedded at compile time
	}
	return sub
}
