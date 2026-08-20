# Offline asset behavior

All chess and shogi artwork used by the app is referenced from local `assets/` paths. The bundling workflow fetches the CC0 source files once and commits them into this repository. The service worker then caches those repository-local files for offline use after the first successful load.
