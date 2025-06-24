const {Page, ContentBlock, Styles, FileInput, TextInput, Button, Notification, PasswordInput, Route} = require('chuijs');
const {AddConnection} = require("../src/settings");
const {ConnectPage} = require("./page_connect");

class EditConnectPage extends Page {
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
    constructor(page) {
        super();
        this.setTitle('Создание подключения');
        this.setFullHeight();
        this.setMain(false);
        this.setFullHeight()
        this.setFullWidth()

        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);

        let conn_data = new AddConnection()

        let gate = new TextInput({title: "Шлюз", width: "480px"})
        gate.setValue(conn_data.getGate())

        let user_login = new TextInput({title: "Имя пользователя", width: "480px"})
        user_login.setValue(conn_data.getUserLogin())
        let user_password = new PasswordInput({title: "Пароль", width: "480px"})
        user_password.setValue(conn_data.getUserPassword())

        let cert = new FileInput({ title: "Сертификат", multiple: false })
        let cert_password = new PasswordInput({title: "Пароль от сетификата", width: "480px"})
        cert_password.setValue(conn_data.getCertPassword())

        let edit = new Button({ title: "Изменить" })

        this.#block_buttons.add(edit)
        this.#block_main.add(gate, user_login, user_password, cert, cert_password, this.#block_buttons);

        edit.addClickListener(() => {
            new AddConnection().add(
                gate.getValue(),
                user_login.getValue(),
                user_password.getValue(),
                cert.getFile(0).path,
                cert_password.getValue()
            )
            new Notification({title: "Подключение", text: "Успешно изменено"}).show(true)
            new Route().go(page)
        })
        this.add(this.#block_main)
    }
}

exports.EditConnectPage = EditConnectPage