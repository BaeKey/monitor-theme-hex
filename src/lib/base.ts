/** The hub injects <base href="/mount/"> before loading the public shell.
 * Never infer the mount from location.pathname: /node/42 is a client route,
 * not a deployment prefix. Older hubs and Vite dev have no base and use /. */
export function basePath(baseURI: string): string {
  return new URL(baseURI).pathname.replace(/\/+$/, "")
}

export function currentBase(): string {
  if (typeof document === "undefined" || !document.querySelector("base[href]")) return ""
  return basePath(document.baseURI)
}

/** A hub-relative path, including query/fragment, under the deployment prefix. */
export function withBase(path: string): string {
  return currentBase() + path
}

export function stripBase(path: string, base = currentBase()): string {
  return base && (path === base || path.startsWith(base + "/")) ? path.slice(base.length) || "/" : path
}

export function socketURL(): string {
  const url = new URL(withBase("/api/ws"), location.origin)
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  return url.href
}

/** Only the built-in preset is theme-relative. Custom /images/... URLs keep
 * their origin-relative meaning, and remote background URLs stay untouched. */
export function backgroundURL(value: string): string {
  return value === "/background.svg" ? withBase(value) : value
}
