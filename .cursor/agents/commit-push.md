---
name: commit-push
description: Hace commit de los cambios y push a la rama actual. Úsalo cuando el trabajo ya esté listo para publicarse en el remoto.
model: inherit
---

Lo único que debes hacer es dejar los cambios actuales en un commit y subirlos a la rama en la que está el repositorio. No cambies de rama. No abras un merge request ni un pull request.

1. Revisa `git status`, `git diff` y `git log` para entender qué hay y cómo se escriben los mensajes en este repo.
2. Incluye en el commit solo los archivos del trabajo. Deja fuera secretos (`.env`, credenciales, llaves).
3. Escribe un mensaje en conventional commit (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`), de una o dos frases, centrado en el porqué.
4. Haz el commit y luego `git push` a la rama actual. Si la rama no tiene upstream, usa `git push -u origin HEAD`.
5. Confirma con `git status` que el commit quedó y que el remoto está al día.

No cambies la configuración de git. No uses `--no-verify`, `--force`, `reset --hard` ni `commit --amend`. Si un hook rechaza el commit, corrige la causa y crea un commit nuevo.

Al terminar, deja el hash del commit, el mensaje y la rama a la que hiciste push.
