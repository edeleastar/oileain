# Oileain

The application is built using [Svelte](https://svelte.dev/), [Leaflet](https://leafletjs.com/) and [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router). It is running here:

- <https://oileain.netlify.app>

It is an experiment in rendering maps of the Islands of Ireland on a Svelte single page application using Leaflet.js maps. The island details are derived from the book [Oileain](http://www.oileain.org/) by David Walsh. It relies the API hosted in [this repository](https://github.com/edeleastar/oileain-api), which is an immutable json version of David's book.

Several hundred markers are rendered on the map on the home page (one for each island), and clicking in these will switch to a detail view on the selected island. Another view (accessible from the header) explores the use of 2 maps on a single page; selecting a marker on on map will 'fly to' a zoomed in satellite view in a separate map on the same page.

## Building
```
npm install
```

To run the application, execute the following from within the project folder:

```
npm run dev
```

The application should be served on:

- <http://localhost:3000/>
