const {PlaylistDB, UserDB} = require("./sqlite/sqlite");
const {App} = require("chuijs");

class DataBases {
    constructor() {}
    static USER_DB = new UserDB(App.userDataPath())
    static PLAYLISTS_DB = new PlaylistDB(App.userDataPath())
    static send(channel) {
        let wc = App.getWebContents().getAllWebContents()
        for (let test of wc) test.send(channel)
    }
}

module.exports = {
    DataBases: DataBases
}

//
globalThis.playlists = []
globalThis.playlist = []
globalThis.player = undefined