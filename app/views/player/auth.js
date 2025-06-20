const {Page, ContentBlock, Styles, Label} = require('chuijs');

class Auth extends Page {
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    constructor(auth, dialog, gen = () => {}) {
        super();
        this.setTitle('Media Maze');
        this.setFullHeight();
        this.setMain(false);
        this.setFullHeight()
        this.setFullWidth()

        this.add(this.#block_main)
        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.add(
            new Label({
                markdownText: "**Авторизация**",
                wordBreak: Styles.WORD_BREAK.BREAK_ALL
            }),
            auth
        );
        this.add(this.#block_main, dialog)
    }
}

exports.Auth = Auth