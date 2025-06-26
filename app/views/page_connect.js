const {Page, ContentBlock, Styles, Button, Dialog, PasswordInput, Route, Console} = require('chuijs');
const {OpenConnect} = require("../src/openconnect");
const {AddConnection} = require("../src/settings");
const {EditConnectPage} = require("./page_edit_connect");

class ConnectPage extends Page {
    #block_main = new ContentBlock({
        direction: Styles.DIRECTION.COLUMN,
        wrap: Styles.WRAP.NOWRAP,
        align: Styles.ALIGN.CENTER,
        justify: Styles.JUSTIFY.CENTER
    });
    #connect = undefined
    #conn = new AddConnection()
    #console_dialog = new Dialog({width: "80%", height: "60%", closeOutSideClick: true})
    #console = new Console({width: Styles.SIZE.WEBKIT_FILL, height: Styles.SIZE.WEBKIT_FILL})
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
        let edit_conn = new Button({ title: "Изменить подключение", clickEvent: () => new Route().go(new EditConnectPage(this)) })
        let connect = new Button({ title: "Подключиться" })
        let disconnect = new Button({ title: "Отключиться" })
        let console = new Button({ title: "Консоль", clickEvent: () => this.#console_dialog.open()})

        this.#console_dialog.addToBody(this.#console)

        this.#block_main.add(edit_conn, admin_password, console)
        this.#block_main.add(connect)

        this.add(this.#block_main, this.#console_dialog)

        connect.addClickListener(() => {
            this.#connect = new OpenConnect(this.#console, {
                adminPassword: admin_password.getValue(),
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
            this.#connect.start()

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