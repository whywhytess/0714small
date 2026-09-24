package slug

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

type vectorFile struct {
	Cases []struct {
		Input string `json:"input"`
		Valid bool   `json:"valid"`
		Note  string `json:"note"`
	} `json:"cases"`
}

// 与 TS 共用 packages/contracts/vectors/slug.json（ADR 0003）。
func TestValidSyntaxSharedVectors(t *testing.T) {
	raw, err := os.ReadFile(filepath.Join("..", "..", "..", "..", "packages", "contracts", "vectors", "slug.json"))
	if err != nil {
		t.Fatalf("read vectors: %v", err)
	}
	var vf vectorFile
	if err := json.Unmarshal(raw, &vf); err != nil {
		t.Fatalf("parse vectors: %v", err)
	}
	if len(vf.Cases) == 0 {
		t.Fatal("no vectors")
	}
	for _, c := range vf.Cases {
		if got := ValidSyntax(c.Input); got != c.Valid {
			t.Errorf("ValidSyntax(%q) = %v, want %v %s", c.Input, got, c.Valid, c.Note)
		}
	}
}
