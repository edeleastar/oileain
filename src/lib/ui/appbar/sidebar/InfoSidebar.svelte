<script lang="ts">
  import Icon from "$lib/ui/components/Icon.svelte";
  import Sidebar from "$lib/ui/components/Sidebar.svelte";
  import { marked } from "marked";

  interface Props {
    markdown?: string;
  }

  let  markdown = `
  The application is built using SvelteKit & Leaflet It is running here:

- <https://oileain.netlify.app>

It is an experiment in rendering maps of the Islands of Ireland on a Svelte single page application using Leaflet.js maps. The island details are derived from the book [Oileain](http://www.oileain.org/) by David Walsh. It relies the API hosted in [this repository](https://github.com/edeleastar/oileain-api), which is an immutable json version of David's book.

Oileain (Irish for "islands") is a web application that allows users to:

- View a comprehensive map of Irish islands
- Explore islands by coastal region
- Navigate to detailed information about specific islands
- View satellite, terrain, and contextual maps for navigation purposes
- Access coordinates and descriptive information for points of interest

The application serves as both a reference tool and an exploration platform for those interested in Irish geography and island navigation.

The detailed architecture of the application can be explored here:

- <https://deepwiki.com/wit-hdip-comp-sci-2024/oileain>
`

  let htmlContent = $derived(markdown ? marked(markdown) : "");
</script>

{#snippet menuSelector()}
  <div class="hover:preset-tonal-secondary dark:hover:preset-tonal-tertiary rounded-lg p-2">
    <Icon type="info" tip="Oileain Info" height="40" />
  </div>
{/snippet}

{#snippet sidebarContent()}
  <header class="flex justify-between">
    <h2 class="h2">Oileain</h2>
  </header>
  <article>
    <div class="prose dark:prose-invert">
      {@html htmlContent}
    </div>
  </article>
{/snippet}

<Sidebar {menuSelector} {sidebarContent} />
