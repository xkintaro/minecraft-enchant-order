# Third-party sources

- Enchantment calculation logic is adapted from [iamcal/enchant-order](https://github.com/iamcal/enchant-order), MIT license, copyright Cal Henderson and contributors.
- `src/components/ui/` contains shadcn/ui components sourced from the Aether demo (`xkintaro/aether`, `demo/components/ui/`). Import paths are adapted to this project's `cn` utility. shadcn/ui is MIT licensed, copyright shadcn. Aether is MIT licensed.
- Theme styles and fonts are consumed through `@xkintaro/aether-theme`. Font licenses are included in their respective `@fontsource-variable` packages.
- Localized Minecraft item and enchantment names are extracted from Mojang's Minecraft Java 26.3 language assets. Generic equipment names and English terminology use the original project's `languages/` dictionaries. `scripts/sync-game-translations.mjs` documents the source URLs and mapping; it does not redistribute full game language files.

## shadcn/ui — MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
