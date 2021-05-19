<script lang="ts">
  import Icon from "svelte-awesome";
  import {faGithub} from "@fortawesome/free-brands-svg-icons";
  import {faMap} from "@fortawesome/free-regular-svg-icons";
  import {faBars, faMapMarked} from "@fortawesome/free-solid-svg-icons";

  export let title = "";
</script>

<div class="uk-flex uk-flex-center uk-flex-middle uk-text-center uk-padding-small" uk-grid>
  <div class="uk-padding-small">
    <a href="#coasts-menu" uk-toggle uk-tooltip="title: Clickable list all Islands by Costal Region; pos: bottom">
      <div uk-tooltip="title: Index of all Islands; pos: bottom">
        <Icon data={faBars} scale="2"/>
      </div>
    </a>
  </div>
  <div class="uk-padding-small">
    <a href="/#/" uk-tooltip="title: Islands of Ireland; pos:bottom">
      <Icon data={faMap} scale="3"/>
    </a>
  </div>
  <div class="uk-child-width-1-2@s uk-card uk-card-default uk-grid-collapse" uk-grid>
    <div>
      <div class="uk-tile uk-tile-default uk-padding-small">
        <h2>{title}</h2>
      </div>
    </div>
    <div>
      <div class="uk-tile uk-tile-muted uk-padding-small">
        <div class="uk-text-small">
          An experiment in exploring <a href="http://www.oileain.org/">David Walsh's Oileain</a>. Prepared by Eamonn de
          Leastar (edeleastar@gmail.com)
        </div>
      </div>
    </div>
  </div>
  <a href="/#/navigator" uk-tooltip="title: Explore Island Maps; pos:bottom">
    <Icon data={faMapMarked} scale="3"/>
  </a> <a href="https://www.oileain.org/" target="_blank" uk-tooltip="title: Oileain Book Site; pos:bottom"> <img
    data-src="https://www.oileain.org/wp-content/uploads/2015/05/oileain_2X.png" width="70px" height="" alt="" uk-img/>
</a> <a href="https://github.com/edeleastar/oileain" target="_blank" uk-tooltip="title: Project Source; pos:bottom">
  <Icon data={faGithub} scale="3"/>
</a>
</div>
