Themes are a new feature as of v8.0.0.

They allow you to have the site switch to a different selection of assets, including backgrounds, sidebar graphic, website title, color scheme (CSS) and most of all, sound clips.

There is currently no way to add these via interface, you will have to do so manually. This does not require a server restart, as themes are saved locally.

## Adding themes

To add a theme, open the [extras.js](https://github.com/robflop/megumin.love/blob/master/src/resources/js/extras.js) file in the `/src/resources/js` folder.

Then, navigate to the themes array (`const themes = [...]`) and add a new theme object.

This object should look like the other ones, so for example a new theme object could be:

```js
{
    name: 'vanir', stylesheet: 'vanir', sidebar: 'vanir_sidebar', title: 'Vanir',
    backgrounds: [
        { filename: 'vanir_shrewd_businessman', displayname: 'Shrewd Businessman' },
        { filename: 'vanir_second_background', displayname: 'Second background' }
    ]
},
```

The `name` property describes which name the theme will be saved under, and which theme name you need to assign sounds that should show up when a background of this theme is selected.

The `stylesheet` property describes the filename of the stylesheet that specifies the theme's own styling (i.e. color scheme etc). This stylesheet must be placed inside the [css](https://github.com/robflop/megumin.love/tree/master/src/resources/css) folder in the `/resources` folder.

The `sidebar` property describes the filename of the sidebar graphic (SVG) that should be displayed instead of the default one. This vector graphic must be placed inside the [vectors](https://github.com/robflop/megumin.love/tree/master/src/resources/images/vectors) folder inside the `/resources/images` folder.

The `title` property describes the name which will show up in the tab's title (e.g. In this case it will show "Vanir is love!").

The `backgrounds` property contains all of the backgrounds that belong to this theme, so whenever a background that is part of this theme is selected, all of the above properties will take action. These must be placed inside the [backgrounds](https://github.com/robflop/megumin.love/tree/master/src/resources/images/backgrounds) folder inside the `/resources/images` folder.

For backgrounds, the `filename` property must be prefixed by the theme name. The `displayname` property describes the name under which the background should show up in the background selection.

If your website utilizes caching, you will need to refresh to make the new theme show up.

## Removing themes

To remove a theme, simply delete its object from the themes array in the [extras.js](https://github.com/robflop/megumin.love/blob/master/src/resources/js/extras.js) file in the `/src/resources/js` folder.

If your website utilizes caching, you will need to refresh to make the new theme show up.
