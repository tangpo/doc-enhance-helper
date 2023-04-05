function hasUseComponents(tmpl: string): string[] {
  const eleRegx = /<(el[-\w]+)/g;
  const eleList = new Set<string>();
  let matchGroup = eleRegx.exec(tmpl);
  while (matchGroup) {
    eleList.add(matchGroup[1]);
    matchGroup = eleRegx.exec(tmpl);
  }
  return Array.from(eleList);
}

export {
  hasUseComponents,
};
