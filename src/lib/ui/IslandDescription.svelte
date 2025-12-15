<script lang="ts">
  let { island } = $props();
</script>

<section class="section prose dark:prose-invert rounded-lg border">
  <div class="m-4">
    {@html island?.description}
  </div>
</section>
