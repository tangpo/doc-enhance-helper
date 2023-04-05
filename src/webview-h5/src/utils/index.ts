export function getRelativeComName(name: string) {
  const matchG = name.match(/el-[^\s]+/);
  return matchG && matchG[0] || '';
}
