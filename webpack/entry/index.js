import pathToRegexp from 'path-to-regexp'

const routes = [{
  path: '/info.html',
  component: function () {
      import('../assets/pages/info')
  }
}, {
  path: '/(.*)',
  component: function () {
      import('../assets/pages/default')
  }
}]

const pathname = window.location.pathname
for (const route of routes) {
  const {path, component} = route
  const re = pathToRegexp(path)
  const m = re.exec(pathname)
  if (m) {
    component()
    break
  }
}
