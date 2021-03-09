<template>
  <div class="post-container">
    <router-link  v-for="page in pages" :to="page.path" :key="page.path">
      <div class="post-card">
        <img class="article-image" :src="$withBase('/images/' + page.frontmatter.picture)" />
        <div class="page-detail">
          <div class="page-title">{{ page.frontmatter.title }}</div>
          <div class="page-description">{{ page.frontmatter.description }}</div>
          <div class="page-author">Author: {{ page.frontmatter.author }}</div>
        </div>
      </div>
    </router-link>
  </div>
</template>
<script>
export default {
  data() {
    return {
      pages: []
    }
  },
  mounted() {
    this.$site.pages.forEach(page => {
      if (page.frontmatter.type === 'article') {
        this.pages.push(page)
      }
    })
  }
}
</script>
<style scoped>
    .post-container {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
    }
    .post-card {
        width: 600px;
        height: 150px;
        margin: 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 10px;
        display: flex;
        align-items: center;
    }
    .article-image {
        height: 100%;
    }
    .page-detail {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }
    .page-author {
        width: 100%;
        justify-content: center;
        
    }
    .page-title {
        font-size: 20px;
        margin-bottom: 10px;
        font-weight: 700;
        line-height: 22px;
        border-bottom: 0;
        color: #000006;
    }
    .page-description {
        color: #656262;
        line-height: 20px;
        margin-bottom: 10px;
        font-weight: 500;
        font-size: 16px;
    }
</style>