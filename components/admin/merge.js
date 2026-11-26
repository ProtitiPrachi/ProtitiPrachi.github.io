/**
 * Three-way merge of site content, so an old tab or an old draft never erases newer work.
 *   base   = the content the edits started from
 *   mine   = base + my edits
 *   theirs = what is on GitHub now
 * Fields I did not touch take theirs; fields only I changed take mine; when both changed the
 * same field, mine wins (I am the one pressing Publish). Objects merge field by field; arrays
 * (lists, tags) are treated as one value.
 */
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function merge3(base, mine, theirs) {
  if (same(mine, base)) return theirs; // I did not touch it
  if (same(theirs, base)) return mine; // only I changed it
  if (isObj(base) && isObj(mine) && isObj(theirs)) {
    const out = {};
    for (const k of new Set([...Object.keys(theirs), ...Object.keys(mine)])) {
      const m = merge3(base[k], mine[k], theirs[k]);
      if (m !== undefined) out[k] = m;
    }
    return out;
  }
  return mine; // both changed the same field
}
