package httpserver

import (
	"net/http/httptest"
	"testing"
	"testing/fstest"
)

func testFS() fstest.MapFS {
	return fstest.MapFS{
		"index.html":        {Data: []byte("<html>app</html>")},
		"assets/app-abc.js": {Data: []byte("js")},
	}
}

func TestServesRealFiles(t *testing.T) {
	h := NewHandler(testFS())
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/assets/app-abc.js", nil))
	if rec.Code != 200 || rec.Body.String() != "js" {
		t.Fatalf("asset: code=%d body=%q", rec.Code, rec.Body.String())
	}
	if cc := rec.Header().Get("Cache-Control"); cc == "" || cc == "no-cache" {
		t.Fatalf("assets should be cacheable, got %q", cc)
	}
}

func TestSPAFallback(t *testing.T) {
	h := NewHandler(testFS())
	for _, path := range []string{"/", "/profile", "/users/deep/link"} {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest("GET", path, nil))
		if rec.Code != 200 || rec.Body.String() != "<html>app</html>" {
			t.Fatalf("%s: code=%d body=%q", path, rec.Code, rec.Body.String())
		}
		if cc := rec.Header().Get("Cache-Control"); cc != "no-cache" {
			t.Fatalf("%s: index must not be cached, got %q", path, cc)
		}
	}
}
