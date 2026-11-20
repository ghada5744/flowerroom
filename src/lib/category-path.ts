type Node = { id: string; name: string; parentId?: string | null };

/** "Signature Arrangements › Hat Boxes" */
export function categoryPath(c: Node, all: Node[]) {
  const names = [c.name];
  let parent = all.find((x) => x.id === c.parentId);
  while (parent && names.length < 10) {
    names.unshift(parent.name);
    const parentId = parent.parentId;
    parent = all.find((x) => x.id === parentId);
  }
  return names.join(" › ");
}

/** Categories as [{ id, label }] sorted by their full path */
export function categoryOptions(all: Node[]) {
  return all
    .map((c) => ({ id: c.id, label: categoryPath(c, all) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
