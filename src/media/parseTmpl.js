function hasUseComponents (tmpl) {
  const eleRegx = /<(el[-\w]+)/g
  let matchGroup = null
  const eleList = new Set
  while(matchGroup = eleRegx.exec(tmpl)) {
    eleList.add(matchGroup[1])
  }
  return Array.from(eleList)
}

window.vsCodeWeb.hasUseComponents = hasUseComponents