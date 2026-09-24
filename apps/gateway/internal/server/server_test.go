package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSitesRejectsWriteMethods(t *testing.T) {
	for _, m := range []string{http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions} {
		rec := httptest.NewRecorder()
		Sites().ServeHTTP(rec, httptest.NewRequest(m, "http://alice.sites.localhost/", nil))
		if rec.Code != http.StatusMethodNotAllowed {
			t.Errorf("%s: status = %d, want 405", m, rec.Code)
		}
		if got := rec.Header().Get("Allow"); got != "GET, HEAD" {
			t.Errorf("%s: Allow = %q", m, got)
		}
	}
}

func TestSitesGetAndHeadReturnNotFoundWithNosniff(t *testing.T) {
	for _, m := range []string{http.MethodGet, http.MethodHead} {
		rec := httptest.NewRecorder()
		Sites().ServeHTTP(rec, httptest.NewRequest(m, "http://alice.sites.localhost/index.html", nil))
		if rec.Code != http.StatusNotFound {
			t.Errorf("%s: status = %d, want 404", m, rec.Code)
		}
		if got := rec.Header().Get("X-Content-Type-Options"); got != "nosniff" {
			t.Errorf("%s: nosniff header = %q", m, got)
		}
	}
}

func TestHealth(t *testing.T) {
	rec := httptest.NewRecorder()
	Health().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/healthz", nil))
	if rec.Code != http.StatusOK || rec.Body.String() != "ok\n" {
		t.Fatalf("got %d %q", rec.Code, rec.Body.String())
	}
}
