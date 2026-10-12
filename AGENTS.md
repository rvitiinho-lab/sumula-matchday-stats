<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Team draw logic lives in src/lib/draw.ts as a pure function with tests; why: keeps the balancing rule testable apart from the UI.
- Data access is client-side via the browser backend client with row-level security (creator-only updates); why: no server secrets needed.
