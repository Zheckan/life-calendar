# Life Calendar

Minimalist wallpaper generator for phones that shows your calendar progress as dot grids. Set it up once with iOS Shortcuts or Android MacroDroid and your wallpaper auto-updates every day.

## Vibe Code Alert

This project was 99% vibe coded as a fun hack after work. I just wanted a life calendar wallpaper with Monday as the start of the week, and [thelifecalendar.com](https://thelifecalendar.com/) didn't have that option and that pissed me off. So here we are.

You can use my hosted version at [life-on-the-grid.vercel.app](https://life-on-the-grid.vercel.app/) - but it's on free tier of Vercel and I'm not responsible for it working correctly. If you want it to work 100%, fix the vibes that AI created and host it yourself. It's easy.

## Features

- **5 calendar views:** Days, Months (yes, it has option to start from Monday), Quarters, Life (weeks of your life), Goal (countdown to a deadline)
- **Auto-updating wallpapers** via iOS Shortcuts or Android MacroDroid
- **Custom colors** for accent, background, and inactive dots with auto-contrast
- **Multiple phone resolutions** pre-configured (iPhone, Samsung, Pixel) with support for custom sizes (I do not have all phones that exist, so no guarantees that it will work for your phone, not working -> submit a PR)
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

Want to add a new phone resolution? Just add a line to `src/lib/screen-resolutions.ts`. That's it. Just submit a PR, so we can all benefit from your work.

For anything else:

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/something-cool`)
3. Make your changes
4. Make sure everything is clean: `bun run fix`
5. Commit your changes (we use [Conventional Commits](https://www.conventionalcommits.org/))
6. Push to the branch and open a Pull Request

## License

### I have no idea what license to use, probably MIT (after small research). Just don't be cunts or russians, russians can go and fuck themselves.

And there is small fee for using this content. Donate to [Come Back Alive](https://savelife.in.ua/en/donate-en/). Donate anything, as one [Ukrainian TV person](https://twitter.com/max_shcherbyna) said: "Donate is like a penis, there isn't small one".

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
