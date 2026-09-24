// Package server 提供 Gateway 的 HTTP 处理器。
//
// W0 骨架：只实现方法限制和基线响应头，所有站点请求暂时返回 404。
// Host 解析、部署清单查询和对象流式读取在 W3 加入（ADR 0003）。
package server

import (
	"net/http"
)

// Sites 返回面向 *.站点域 的处理器。
func Sites() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")

		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			h.Set("Allow", "GET, HEAD")
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		h.Set("Cache-Control", "no-store")
		http.Error(w, "not found", http.StatusNotFound)
	})
}

// Health 返回健康检查处理器。它监听在单独的地址上，不挂在站点域的路径下。
func Health() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		_, _ = w.Write([]byte("ok\n"))
	})
	return mux
}
