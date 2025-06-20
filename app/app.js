const {AppLayout, render, Icons, Route, YaApi, Notification, Dialog, ProgressBar, Styles, ipcRenderer,
    DownloadProgressNotification, Log, Button
} = require('chuijs');
const {Auth} = require("./views/player/auth");
const {Player} = require("./views/player/player");
const {DataBases} = require("./start")
let api = new YaApi()

class Apps extends AppLayout {
    #progressTracks = new ProgressBar()
    #dialog = new Dialog({
        width: "500px",
        height: Styles.SIZE.MAX_CONTENT,
        closeOutSideClick: false,
        transparentBack: true,
    })
    #auth = undefined
    #auth2 = undefined
    constructor() {
        super();
        // Настройка диалога
        this.#progressTracks.setWidth(Styles.SIZE.WEBKIT_FILL)
        this.#dialog.addToBody(this.#progressTracks)
        this.#progressTracks.setProgressCountText("Чтение плейлистов:")
        this.#progressTracks.setProgressText("")
        // Настройка диалога
        this.disableAppMenu()
        //
        this.#auth = AppLayout.BUTTON({
            title: "Войти",
            icon: Icons.AUDIO_VIDEO.QUEUE_MUSIC,
            reverse: true,
            clickEvent: async () => await this.generatePlaylist(this.#auth)
        })

        this.#auth2 = new Button({
            title: "Войти",
            icon: Icons.AUDIO_VIDEO.QUEUE_MUSIC,
            reverse: true,
            clickEvent: async () => await this.generatePlaylist(this.#auth)
        })
        //
        // this.addToHeaderRight([this.#auth])
        //
        DataBases.USER_DB.selectUserData().then(async data => {
            let ub = await this.generateUserButton(data.access_token, data.user_id)
            // this.removeToHeaderRight([this.#auth])
            this.addToHeaderRight([ub])
            new Route().go(new Player(this.#dialog, this.regeneratePlaylist()))

            // this.addToHeaderLeftBeforeTitle([
            //     AppLayout.TABS({
            //             default: -1,
            //             tabs: [
            //                 AppLayout.BUTTON({
            //                         icon: Icons.AUDIO_VIDEO.LIBRARY_MUSIC,
            //                         clickEvent: async () => {
            //                             new Route().go(new Player(this.#dialog, this.regeneratePlaylist()))
            //                         }
            //                     }
            //                 )
            //             ]
            //         }
            //     )
            // ])
        }).catch(err => {
            new Route().go(new Auth(this.#auth2, this.#dialog))
            Log.error(err.message)
            // this.removeToHeaderRight([this.#auth])
            // this.addToHeaderRight([this.#auth])
        })
        //
        ipcRenderer.on("REGEN_PLAYLISTS", async () => {
            await this.regeneratePlaylist()
        })
    }

    async regeneratePlaylist() {
        globalThis.playlists = []
        for (let test of await new YaApi().getUserPlaylists()) {
            let pl = await new YaApi().getPlaylist(test.kind)
            globalThis.playlists.push(pl)
        }
        await DataBases.USER_DB.selectUserData().then(data => {
            const up_notification = new DownloadProgressNotification({title: "Обновление библиотеки"})
            up_notification.show()
            new YaApi(data.access_token, data.user_id).getTracks().then(async playl => {
                await DataBases.PLAYLISTS_DB.createPlaylistDictTable()
                for (let playlist of playl) {
                    await DataBases.PLAYLISTS_DB.addPlaylistData(
                        playlist.playlist_name,
                        playlist.playlist_title
                    )
                    for (let track of playlist.tracks) {
                        up_notification.update(
                            "Обновление библиотеки",
                            `${playlist.playlist_title} (${playl.indexOf(playlist)+1} из ${playl.length})`,
                            playlist.tracks.indexOf(track) + 1,
                            playlist.tracks.length
                        )
                        let pname = playlist.playlist_name.replace("pl_", "")
                        await DataBases.PLAYLISTS_DB.createPlaylistTable(pname)
                        await DataBases.PLAYLISTS_DB.addTrack(
                            pname,
                            track.track_id,
                            track.title,
                            track.artist,
                            track.album,
                            track.mimetype
                        )
                    }
                    if (playl.indexOf(playlist) + 1 === playl.length) {
                        DataBases.send("GENPLAYLIST")
                    }
                }
                up_notification.done()
            }).catch((err) => {
                new Notification({
                    title: "Обновление библиотеки", text: err, showTime: 1000, style: Notification.STYLE.ERROR
                }).show()
            })
        }).catch(err => {
            console.error(err)
            DataBases.USER_DB.createUserTable()
        })
    }

    async generatePlaylist(auth) {
        this.#dialog.open()
        await DataBases.USER_DB.createUserTable()
        let udata = await api.auth()
        await DataBases.USER_DB.addUserData(udata.access_token, udata.user_id)
        // this.removeToHeaderRight([auth])
        //
        let ub = await this.generateUserButton(udata.access_token, udata.user_id)
        this.addToHeaderRight([ub])
        //
        ipcRenderer.on("SEND_PLAYLIST_DATA", (event, args) => {
            //console.log(args)
            this.#progressTracks.setProgressCountText(`Чтение плейлиста: ${args.playlistName}`)
            this.#progressTracks.setMax(args.max)
        })
        //
        ipcRenderer.on("SEND_TRACK_DATA", (event, args) => {
            //console.log(args)
            this.#progressTracks.setValue(args.index)
            this.#progressTracks.setProgressText(args.trackName)
        })
        //
        await DataBases.USER_DB.selectUserData().then(data => {
            new YaApi(data.access_token, data.user_id).getTracks().then(async playl => {
                await DataBases.PLAYLISTS_DB.createPlaylistDictTable()
                for (let playlist of playl) {
                    await DataBases.PLAYLISTS_DB.addPlaylistData(
                        playlist.playlist_name,
                        playlist.playlist_title
                    )
                    this.#progressTracks.setProgressCountText(`Формирование плейлиста: ${playlist.playlist_title}`)
                    this.#progressTracks.setMax(playlist.tracks.length)

                    for (let track of playlist.tracks) {
                        let pname = playlist.playlist_name.replace("pl_", "")
                        await DataBases.PLAYLISTS_DB.createPlaylistTable(pname)
                        await DataBases.PLAYLISTS_DB.addTrack(
                            pname,
                            track.track_id,
                            track.title,
                            track.artist,
                            track.album,
                            track.mimetype
                        )

                        this.#progressTracks.setValue(playlist.tracks.indexOf(track))
                        this.#progressTracks.setProgressText(`${track.artist} - ${track.title}`)
                    }
                    if (playl.indexOf(playlist) + 1 === playl.length) {
                        DataBases.send("GENPLAYLIST")
                    }
                }
            })
            new Route().go(new Player(this.#dialog))
        })
    }

    async generateUserButton(token, id) {
        global.access_token = token
        global.user_id = id
        let datas = await new YaApi(token, id).getUserData()
        let displayName = datas.account.displayName
        let defaultEmail = datas.defaultEmail
        return AppLayout.USER_PROFILE({
            username: `${displayName} [${defaultEmail}]`,
            image: {
                noImage: true
            },
            items: [
                AppLayout.USER_PROFILE_ITEM({
                    title: "Обновление библиотеки",
                    clickEvent: async () => await this.regeneratePlaylist()
                })
            ]
        })
    }
}

render(() => new Apps()).catch(err => console.error(err))
