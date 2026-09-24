/** 站点在 Explore 中的可见性（W6） */
export const SITE_VISIBILITIES = ["public", "unlisted", "hidden"] as const;
export type SiteVisibility = (typeof SITE_VISIBILITIES)[number];

/** 站点生命周期状态；suspended 由 Admin 设置，Gateway 对其返回不可用（W7） */
export const SITE_STATUSES = ["active", "suspended", "deleted"] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

/** 部署状态；只有 READY 可以成为 current（ADR 0006） */
export const DEPLOYMENT_STATES = ["PREPARING", "READY", "FAILED"] as const;
export type DeploymentState = (typeof DEPLOYMENT_STATES)[number];

// 故意制造 lint 错误，用于验证分支保护（此 PR 不得合并）
const intentionallyUnused = 1;
