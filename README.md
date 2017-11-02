# Webpack Multipage Boilerplate

A simple basiclly webpack + pug + postcss boilerplate.

## Structure

```
build/
src/
|- images/
|- postcss/
|  |- pages/
|  |- partials/
|  |- setup/
|  |- style.css
|- pug/
|  |- partials/
|  |  |- head.pug
|  |  |- layout.pug
|  |  |- header.pug
|  |  |- footer.pug
|  |- pages
|  |  |- index.pug
|  |  |- index.js
|  |  |- subpage/             
|  |  |  |- index.pug
|  |  |  |- index.js

```

## Usege

### Install
```
npm install ( or yarn install )
```

### Start in dev mode
```
npm run dev
```

### Build for production
```
npm run build
```


------------------
參考自 [webpack2-multipage-boilerplate](https://github.com/romamilkovic/webpack2-multipage-boilerplate)