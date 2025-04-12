# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Technology Stack

### Frontend
    [Svelte 5](https://svelte.dev/): Used for building the user interface, leveraging its reactive state management and component-based architecture.
    [JavaScript](https://www.javascript.com/): Replaced TypeScript in the migration from Svelte 4 to Svelte 5.
    [Leaflet.js](https://leafletjs.com/): For interactive maps and geospatial data visualization.
    [Bulma CSS](https://bulma.io/): For styling the application, including custom styles for maps and UI components.

### Backend
    [Firebase](https://firebase.google.com/): Used for:
        Authentication (user login and registration).
        [Firestore](https://firebase.google.com/docs/firestore): For storing user data, routes, and preferences.
    [Vercel Hosting](https://vercel.com/docs/git): Deploying the application.
    [SvelteKit](https://kit.svelte.dev/): For handling server-side rendering and routing.

### APIs and Data Sources
    [OpenWeatherMap API](https://openweathermap.org/api): For fetching real-time weather data to display on the map.
    [Google Maps API](https://developers.google.com/maps): For geocoding, location search, and route planning.
    [Custom EV Data Set](https://github.com/KilowattApp/open-ev-data): For retrieving electric vehicle specifications and dealer information.
    [Python](https://www.python.org/): For data processing and enhacement of EV data before database import.

### Tools and Libraries
    [Svelte Stores](https://svelte.dev/docs/svelte-store): For managing shared state across components.
    [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/): For maintaining code quality and consistent formatting.
    [Vite](https://vitejs.dev/): For fast development and build processes.

### Development and Deployment
    [GitHub](https://github.com/): For version control and collaboration.
    [Firebase Hosting](https://firebase.google.com/docs/hosting): For deploying the application to the web.

## Attribution
The EV (Electric Vehicle) data in this project was obtained from the [`Open Ev Data`](https://github.com/KilowattApp/open-ev-data) project.
