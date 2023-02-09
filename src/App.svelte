<script lang="ts">
  import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import NotFound from "./pages/NotFound.svelte";
  import Home from "./pages/Home.svelte";
  import Island from "./pages/Island.svelte";
  import Navigator from "./pages/Navigator.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import {setContext} from "svelte";
  import {Oileain} from "./services/oileain-api";

  setContext("oileain", new Oileain());

  let routes = {
    "/": Home,
    "/poi/*": Island,
    "/navigator": Navigator,
    "*": NotFound,
  };
</script>

<svelte:head>
  <title>Oileain</title>
</svelte:head>

<Header title="Oileain"/>
<div class="container">
  <Router {routes}/>
</div>
<!-- <Sidebar /> -->
