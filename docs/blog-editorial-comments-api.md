# Backend note — editorial comments (section + global)

Goal: editorial comments must work **both** anchored to a section **and** as a global (post-level)
thread. The editor shows one panel listing all notes; new notes are global by default, and become
section-anchored when written against a selected block/section.

## The gap (blocking the frontend today)

`GET /blog/posts/{postId}/comments` declares `sectionId` as a **required** query param:

```
GET /blog/posts/{postId}/comments?sectionId=<required>
```

But:

- `CreateCommentDto.sectionId` is **optional** — "omit for a post-level thread". So global comments
  can be **created** but **never listed** (there is no value of the required `sectionId` that returns
  the global thread).
- There is no way to fetch **all** comments for a post (global + every section) in one call, which is
  what the editor panel needs.

Net: the frontend can post a global note, but the list call can't return it → comments appear broken.

## Requested change

Make `sectionId` **optional** on `GET /blog/posts/{postId}/comments`:

| Query | Returns |
|-------|---------|
| _(omitted)_ | **all** comments for the post — global **and** every section — ordered by `createdAt ASC` |
| `?sectionId=<id>` | only that section's thread |
| `?global=true` (optional) | only global comments (`sectionId IS NULL`) |

The response already carries `sectionId?` per comment, so the client can split global vs. section
without extra fields. No response shape change needed — just relax the param and add the
"return everything when omitted" branch.

## Frontend plan once this lands

- Regenerate the client; call `commentControllerList({ postId })` (no `sectionId`).
- Group the returned `comments` by `sectionId` → a **Global notes** thread + per-section threads.
- New note from the panel → global (`createCommentDto` without `sectionId`).
- Section-anchored note → created with `sectionId` (+ optional `anchorStart/anchorEnd/quote`) when the
  author has a block/section selected in the document editor.
- **Add-comment entry point**: the BlockNote block drag-handle menu (the ⠿ handle, next to "delete")
  gets an **"Add comment"** item → creates a comment anchored to that block's `sectionId`. Needs the
  block's `sectionId` (custom blocks already carry it; prose blocks only after the first document save,
  which assigns section ids). The panel then shows a marker on commented blocks.

## Current frontend touchpoint

`src/routes/Blog/Editor/components/EditorialCommentsPanel.tsx` — currently calls
`commentControllerList({ postId, sectionId: '' })` as a stopgap; switch to the no-`sectionId` form
after the change above.
