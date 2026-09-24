// Package slug 实现站点 slug 的语法校验（不含保留词）。
// 规则见 packages/contracts/README.md；必须与 TS 实现通过同一组向量 vectors/slug.json。
package slug

import "strings"

const (
	MinLength = 3
	MaxLength = 32
)

// ValidSyntax 报告 s 是否符合 slug 语法。只接受 ASCII 小写字母、数字和连字符。
func ValidSyntax(s string) bool {
	if len(s) < MinLength || len(s) > MaxLength {
		return false
	}
	if s[0] == '-' || s[len(s)-1] == '-' || strings.Contains(s, "--") {
		return false
	}
	for i := 0; i < len(s); i++ {
		c := s[i]
		if (c < 'a' || c > 'z') && (c < '0' || c > '9') && c != '-' {
			return false
		}
	}
	return true
}
