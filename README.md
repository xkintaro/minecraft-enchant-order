<a href="README.md">
  <img src="https://img.shields.io/badge/Language-English-blue?style=flat-square&logo=google-translate&logoColor=white" alt="English">
</a>
<a href="README-TR.md">
  <img src="https://img.shields.io/badge/Language-Türkçe-red?style=flat-square&logo=google-translate&logoColor=white" alt="Türkçe">
</a>

  <br />
  <br />

<div align="center">
  <img src="public/minecraft-anime.png" width="120" height="120" />
  <br />
  <br />

  <p>
     A Minecraft enchantment planner that finds the anvil order that costs the fewest levels.
  </p>

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

  <p>
    <a href="#demo">Demo</a> •
    <a href="#info">Info</a> •
    <a href="#about">About</a> •
    <a href="#features">Features</a> •
    <a href="#tech">Tech</a> •
    <a href="#setup">Setup</a> •
    <a href="#license">License</a>
  </p>

  <br />
  <br />
</div>

## <a id="demo"></a> 📷 Demo

- [https://minecraft-enchant-order-six.vercel.app](https://minecraft-enchant-order-six.vercel.app)

## <a id="info"></a> 📌 Info

This site is a copy of Cal Henderson’s (iamcal) enchant-order project. All of the enchantment ordering logic and algorithms were taken from that project. [iamcal/enchant-order](https://github.com/iamcal/enchant-order)

We rebuilt this version entirely with AI to give it a better-looking, easier-to-use interface. Credit for the calculation logic belongs to the original project’s developers. Thanks to them for sharing their work.

## <a id="about"></a> 📋 About

**Minecraft Enchant Order** is an anvil planner for Minecraft Java Edition. Start with an unenchanted item that has never been worked on an anvil, then select the enchantments and levels you want to apply. The calculator works out when to combine books with each other and when to apply them to the item. You can optimize for the total number of levels spent or for the prior work penalty left on the finished item, which affects the cost of later anvil work.

The result lists what goes into each anvil slot, what comes out, and how many levels the step costs. You can follow the plan in-game one step at a time or use the total cost to plan how many levels to gather in advance. If the calculator cannot find a sequence that keeps every operation within 39 levels, it reports that no valid order was found.

## <a id="features"></a> ✨ Features

- **Enchantment selection.** Choose an item and the enchantments and levels you want to apply.
- **Two optimization targets.** Minimize the total level cost or the prior work penalty.
- **Step-by-step anvil plan.** See which items and books to combine, in what order, and how many levels each step costs.
- **Language and theme options.** Choose your interface language and switch between light and dark themes.

## <a id="tech"></a> 🛠️ Tech

`Next.js` · `TypeScript` · `Tailwind CSS` · `next-intl` · `next-themes` · `Lucide React`

## <a id="setup"></a> 🚀 Setup

### Requirements

- **Node.js**

### Step-by-Step Installation

Follow these steps to run the project locally.

1. **Clone the repository**

   ```bash
   git clone https://github.com/xkintaro/minecraft-enchant-order.git
   cd minecraft-enchant-order
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

Open the app in your browser. [http://localhost:3000](http://localhost:3000)

## <a id="license"></a> 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

#

<p align="center">
  <sub>❤️ Developed by "Mustafa TAŞAL" (kintaro)</sub>
</p>
