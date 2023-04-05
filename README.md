# doc-enhance-helper

> doc-enhance-helper is a VS Code extension to enhance UI component doc to use.

Thanks to `VSCode-Element-Helper` extension, I have use some of its features。

Now just support Element-UI Doc.Element-UI is a great library. More and more projects use it. So, For helping developer write more efficient by Element-UI, doc-enhance-helper is born.

## Feature

* Document

* Autocomplete

	support vue, html and jade/pug language

## Document

### Usage

1 - Press default hot key `ctrl + cmd + z`(windows: `ctrl + win + z`) or 
    Press ⇧⌘P to bring up the Command Palette and then input `doc-enhance.showHelper`

2 - Show document view If success

3 - Enter and trigger document browser

![plugindoc](https://user-images.githubusercontent.com/1472337/147407493-a4337afc-dee7-4133-99c9-d1b3b522c973.gif)

### Version Switching

1 - Enter `Preferences` -> `setting` or shortcut `cmd` + `,`

2 - Modify version
```javascript
  "element-helper.version": "2.15.7",
```

### Search Document

1 - Press default hot key `ctrl + cmd + z`(windows: `ctrl + win + z`) or 
    Press ⇧⌘P to bring up the Command Palette and then input `doc-enhance.search`
    
2 - input the component tag name and press enter

3 - Show the document view If success

![search Document](https://user-images.githubusercontent.com/1472337/147404840-429f7365-e9a6-4448-bb2f-6ed5d20e5b78.gif)

### Auto Update Mechanism

in development

## Autocomplete (get from `VSCode-Element-Helper` plugin)

![autocomplete](https://user-images.githubusercontent.com/1659577/27990774-4b7b3662-6494-11e7-83a4-9e6ed3ef698a.gif)

* Distinguish and auto complete property and method for every Element-UI tag

* Prompt value when value is some special type like Boolean or ICON.

## LICENSE

MIT
