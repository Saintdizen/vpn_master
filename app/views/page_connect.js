const {Page, ContentBlock, Styles, Button, Notification, Dialog, TextInput, PasswordInput, App} = require('chuijs');
const {OpenConnect} = require("../src/openconnect");
const {AddConnection} = require("../src/settings");

class ConnectPage extends Page {
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #connect = undefined
    #conn = new AddConnection()
    #console = new Dialog({width: "80%", height: "80%"})
    #block_console = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        // wrap: Styles.WRAP.NOWRAP,
        // align: Styles.ALIGN.CENTER,
        // justify: Styles.JUSTIFY.CENTER
    });
    constructor() {
        super();
        this.setTitle('Подключение к FORTIGATE');
        this.setFullHeight();
        this.setMain(false);
        this.setFullHeight()
        this.setFullWidth()

        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);

        let admin_password = new PasswordInput({title: "Пароль", width: "480px"})
        let connect = new Button({ title: "Подключиться" })
        let disconnect = new Button({ title: "Отключиться" })
        let console = new Button({ title: "Консоль", clickEvent: () => this.#console.open()})
        let console_close = new Button({ title: "Закрыть", clickEvent: () => this.#console.close()})

        this.#console.addToHeader(console_close)
        this.#console.addToBody(this.#block_console)

        this.#block_main.add(admin_password, console)
        this.#block_main.add(connect)

        this.add(this.#block_main, this.#console)

        connect.addClickListener(() => {
            this.#connect = new OpenConnect(this.#block_console, {
                gate: this.#conn.getGate(),
                user: {
                    login: this.#conn.getUserLogin(),
                    password: this.#conn.getUserPassword()
                },
                cert: {
                    pfx: this.#conn.getUserCert(),
                    password: this.#conn.getCertPassword()
                },
            })
            this.#connect.start(admin_password.getValue())

            this.#block_main.remove(connect)
            this.#block_main.add(disconnect)
        })

        disconnect.addClickListener(() => {
            this.#connect.exit()
            this.#block_main.remove(disconnect)
            this.#block_main.add(connect)
        })

    }
}

exports.ConnectPage = ConnectPage