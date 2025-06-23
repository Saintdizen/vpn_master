const {Page, ContentBlock, Styles, FileInput, TextInput, Button, Notification, PasswordInput, Route} = require('chuijs');
const {AddConnection} = require("../src/settings");
const {ConnectPage} = require("./page_connect");

class CreateConnectPage extends Page {
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
        this.setTitle('Создание подключения');
        this.setFullHeight();
        this.setMain(false);
        this.setFullHeight()
        this.setFullWidth()

        this.#block_main.setWidth(Styles.SIZE.WEBKIT_FILL);
        this.#block_main.setHeight(Styles.SIZE.WEBKIT_FILL);

        let gate = new TextInput({title: "Шлюз", width: "480px"})
        let user_login = new TextInput({title: "Имя пользователя", width: "480px"})
        let user_password = new PasswordInput({title: "Пароль", width: "480px"})

        let cert = new FileInput({ title: "Сертификат", multiple: false })
        let cert_password = new PasswordInput({title: "Пароль от сетификата", width: "480px"})

        let create = new Button({ title: "Создать" })

        this.#block_buttons.add(create)
        this.#block_main.add(gate, user_login, user_password, cert, cert_password, this.#block_buttons);

        create.addClickListener(() => {
            new AddConnection().add(
                gate.getValue(),
                user_login.getValue(),
                user_password.getValue(),
                cert.getFile(0).path,
                cert_password.getValue()
            )

            new Notification({title: "Подключение", text: "Успешно создано"}).show(true)

            new Route().go(new ConnectPage())
        })
        this.add(this.#block_main)
    }
}

exports.CreateConnectPage = CreateConnectPage