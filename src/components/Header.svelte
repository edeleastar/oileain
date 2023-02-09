<script lang="ts">
  import Icon from "svelte-awesome";
  import {faGithub} from "@fortawesome/free-brands-svg-icons";
  import {faMap} from "@fortawesome/free-regular-svg-icons";
  import {faBars, faMapMarked} from "@fortawesome/free-solid-svg-icons";

  export let title = "";
</script>

<div class="columns is-vcentered">
	<div class="column is-two-thirds">
    <div class="box has-text-centered columns m-2">
      <div class="column">
        <img src="/favicon.png" width="60" alt="img" />
      </div>
      <div class="column">
        <div class="title is-5">Oileain</div>
        <div class="subtitle is-5">islands of Ireand</div>
      </div>
      <div class="column">
        <i class="fas fa-donate fa-3x" style="color:rgb(95, 96, 173)" />
      </div>
    </div>
	</div>
	<div class="column">
    <div class="box has-text-centered columns m-2 is-2">
      <a href="/#/" class="column">
        <Icon data={faMap} scale={4}/>
      </a>
      <a href="/#/navigator" class="column">
        <Icon data={faMapMarked} scale={4}/>
      </a>
    </div>
	</div>
</div>
