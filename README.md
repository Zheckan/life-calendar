# Life Calendar

Minimalist wallpaper generator for phones that shows your calendar progress as dot grids. Set it up once with iOS Shortcuts or Android MacroDroid and your wallpaper auto-updates every day.

> Be aware that this is 99% vibe coded. Not in a "I've never looked at the code" way, but more like "I described what I wanted, AI wrote it, I tweaked it until it looked right, repeat". The code works, the wallpapers look good, but if you're expecting clean architecture and design patterns — you've been warned.

## Features

- **5 calendar views:** Days, Months, Quarters, Life (weeks of your life), Goal (countdown to a deadline)
- **Auto-updating wallpapers** via iOS Shortcuts or Android MacroDroid
- **Custom colors** for accent, background, and inactive dots with auto-contrast
- **Multiple phone resolutions** pre-configured (iPhone, Samsung, Pixel) with support for custom sizes
- **Dark and light themes**

## Getting Started

Clone this repository:

```bash
git clone https://github.com/Zheckan/life-calendar.git
cd life-calendar
```

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Contribute

Want to add a new phone resolution? Just add a line to `src/lib/screen-resolutions.ts`. That's it.

For anything else:

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/something-cool`)
3. Make your changes
4. Make sure everything is clean: `bun run lint` and `bun run format`
5. Commit your changes (we use [Conventional Commits](https://www.conventionalcommits.org/))
6. Push to the branch and open a Pull Request

## License

### I have no idea what license to use, probably MIT (after small research). Just don't be cunts or russians, russians can go and fuck themselves.

And there is small fee for using this content. Donate to [Come Back Alive](https://savelife.in.ua/en/donate-en/). Donate anything, as one [Ukrainian TV person](https://twitter.com/max_shcherbyna) said: "Donate is like a penis, there isn't small one".

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
