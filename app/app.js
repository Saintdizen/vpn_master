const {AppLayout, render, Route, Log} = require('chuijs');
const {CreateConnectPage} = require("./views/page_create_connect");
const {ConnectPage} = require("./views/page_connect");
const {AddConnection} = require("./src/settings");

class Apps extends AppLayout {
    constructor() {
        super();
        this.disableAppMenu()
        setTimeout(() => {
            let conn = new AddConnection()
            if (conn.getUserLogin() === undefined) {
                new Route().go(new CreateConnectPage())
            } else {
                new Route().go(new ConnectPage())
            }
        }, 250)
    }
}

render(() => new Apps()).catch(err => console.error(err))
