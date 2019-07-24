
<template lang="pug">
div.ui.grid(v-if="current")
    .row
        h5.header Captain
    .row
        div.ui.cards
            .ui.card.officercard
                .image
                    img(src="https://semantic-ui.com/images/wireframe/image.png")
                .content
                    p test
    .row
        h5.header Officers
    .row
        h5.header Crew
    .row
        crew-wizard(v-bind:ship_stats="ship_stats", v-bind:crew="crew", v-bind:jobs="jobs")
        crew-table(v-bind:crew="crew" v-if="crew", v-bind:jobs="jobs")
</template>
