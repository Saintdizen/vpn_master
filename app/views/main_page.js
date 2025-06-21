const {Page, ContentBlock, Styles, FileInput, TextInput, Button} = require('chuijs');
const {OpenConnect} = require("../src/openconnect");

class MainPage extends Page {
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #block_buttons = new ContentBlock({
        direction: Styles.DIRECTION.ROW,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #connect = undefined
    constructor() {
        super();
        this.setTitle('FORTIGATE_Openconnect');
        this.setFullHeight();
        this.setMain(true);
        this.setFullHeight()
        this.setFullWidth()

        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);

        let gate = new TextInput({title: "Шлюз"})
        let user_login = new TextInput({title: "Имя пользователя"})
        let user_password = new TextInput({title: "Пароль"})

        let cert = new FileInput({ title: "Сертификат", multiple: false })
        let cert_password = new TextInput({title: "Пароль от сетификата"})

        let connect = new Button({ title: "Подключиться" })
        let disconnect = new Button({ title: "Отключиться" })
        let logs = new Button({ title: "Консоль" })

        this.#block_buttons.add(connect, disconnect, logs)
        this.#block_main.add(gate, user_login, user_password, cert, cert_password, this.#block_buttons);

        this.add(this.#block_main)

        connect.addClickListener(() => {
            this.#connect = new OpenConnect({
                gate: gate.getValue(),
                user: {
                    login: user_login.getValue(),
                    password: user_password.getValue()
                },
                cert: {
                    pfx: cert.getFile(0).path,
                    password: cert_password.getValue()
                },
            })
            this.#connect.start()
        })

        disconnect.addClickListener(() => {
            this.#connect.exit()
        })

    }
}

exports.MainPage = MainPage