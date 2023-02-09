<script lang="ts">
  import type {Island} from "../services/oileain-types";

  export let island: Island;
</script>

<section class="section">
  <div class="description">
    {@html island.description}
  </div>
</section>
