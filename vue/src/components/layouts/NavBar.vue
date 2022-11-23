<template>
  <div>
    <nav>
      <ul>
        <li>
          <router-link to="/">
            <span>Top</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile">
            <span>Profile</span>
          </router-link>
        </li>
        <li>
          <a href="https://pjsekai.sega.jp/" target="_blank"
            ><span>prsk</span></a
          >
        </li>
        <li>
          <a href="https://genshin.hoyoverse.com/ja" target="_blank"
            ><span>Genshin</span></a
          >
        </li>
        <li>
          <a
            href="https://playvalorant.com/ja-jp/?utm_source=riotbar&utm_medium=productcard%2Bplayvalorant.com&utm_campaign=val&utm_content=ep5act1"
            target="_blank"
            ><span>Valorant</span></a
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script lang="ts">
export default {};
</script>

<style lang="scss">
@mixin sel-list($color: #000) {
  color : $color;
}

ul {
  list-style-type: none;
  text-align: right;
}
li {
  display: inline;
  font-size: 2em;
  padding-left: 2ex;
  font-family: "Comic Sans MS";
  font-style: italic;
  text-shadow: 2px 2px #302833;
}
li:nth-of-type(1) span {
  @include sel-list(#99ffff);
}
li:nth-of-type(2) span {
  @include sel-list(#99ffcc);
}
li:nth-child(3) span {
  @include sel-list(#99ff99);
}
li:nth-of-type(4) span {
  @include sel-list(#ccff99);
}
li:nth-of-type(5) span {
  @include sel-list(#ffff99)
}
a {
  text-decoration: none;
  :hover {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: #302833;
    text-decoration-thickness: .1em;
  }
}
</style>
