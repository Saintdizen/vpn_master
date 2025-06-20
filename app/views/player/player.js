const {Page, YaAudio, Styles, path, App, ipcRenderer, Icons, Notification, DownloadProgressNotification, YaApi} = require('chuijs');
const {PlayerDialog, PlayerDialogButton, PlayerDialogSearch} = require("./elements/player_elements");
const DownloadManager = require("@electron/remote").require("electron-download-manager");
const fs= require("fs");
let {DataBases} = require("../../start")

class Player extends Page {
    #dialog = undefined
    //
    playlist_list = new PlayerDialog("80%", "60%")
    track_list = new PlayerDialog("80%", "60%", "Очередь")
    search_list = new PlayerDialogSearch("80%", "60%")
    constructor(dialog, gen = () => {}) {
        super();
        globalThis.player = new YaAudio({
            width: Styles.SIZE.WEBKIT_FILL,
            height: Styles.SIZE.WEBKIT_FILL,
            coverPath: `file://${require('path').join(__dirname, 'cover.png')}`
        })
        this.#dialog = dialog
        this.setTitle('Media Maze');
        this.setFullHeight();
        this.setMain(false);
        globalThis.player.openFolder(path.join(App.userDataPath(), "downloads"))
        this.add(globalThis.player, this.#dialog)
        this.addRouteEvent(this, async () => {
            player.restoreFX();
            await gen
        })

        ipcRenderer.on("GENPLAYLIST", () => {
            this.#generatePlayList()
            this.#dialog.close()
        })

        player.addFunctionButtonToLeft(
            YaAudio.FUNCTION_BUTTON({
                icon: Icons.AUDIO_VIDEO.PLAYLIST_PLAY,
                clickEvent: () => {
                    if (this.playlist_list.isOpen()) this.playlist_list.close()
                    if (this.search_list.isOpen()) this.search_list.close()
                    this.track_list.openAndClose()
                }
            }),
            YaAudio.FUNCTION_BUTTON({
                icon: Icons.AUDIO_VIDEO.PLAYLIST_ADD,
                clickEvent: () => {
                    if (this.search_list.isOpen()) this.search_list.close()
                    if (this.track_list.isOpen()) this.track_list.close()
                    this.playlist_list.openAndClose()
                }
            }),
            YaAudio.FUNCTION_BUTTON({
                icon: Icons.ACTIONS.SEARCH,
                clickEvent: () => {
                    if (this.playlist_list.isOpen()) this.playlist_list.close()
                    if (this.track_list.isOpen()) this.track_list.close()
                    this.search_list.openAndClose()
                }
            })
        )

        player.addFunctionButtonToRight(
            YaAudio.FUNCTION_ACTIVE_BUTTON({
                value: false,
                icon_on: Icons.AUDIO_VIDEO.SHUFFLE_ON,
                icon_off: Icons.AUDIO_VIDEO.SHUFFLE,
                activateEvent: (evt) => {
                    if (evt.target.checked) {
                        player.setPlayList(shuffle(playlist.slice()))
                        new Notification({
                            title: "Перемешать", text: evt.target.checked, showTime: 1000
                        }).show()
                    } else {
                        player.setPlayList(playlist)
                        new Notification({
                            title: "Перемешать", text: evt.target.checked, showTime: 1000
                        }).show()
                    }
                },
            })
        )

        this.#generatePlayList()
        this.add(this.playlist_list, this.track_list, this.search_list)
    }

    #generatePlayList() {
        this.playlist_list.clear()
        this.track_list.clear()
        DataBases.PLAYLISTS_DB.getPlaylists().then(async playlists => {
            for (let table of playlists) {
                const button = new PlayerDialogButton(table, async (evt) => {
                    if (evt.target.id === "test_download") {
                        DataBases.PLAYLISTS_DB.getPlaylist(table.pl_kind).then(async dpl => {
                            const notif = new DownloadProgressNotification({title: `Загрузка ${table.pl_title}`})
                            let links = []
                            for (let dtr of dpl) {
                                if (dtr.path === "") {
                                    links.push({
                                        table: table.pl_kind,
                                        pl_title: table.pl_title,
                                        track_id: dtr.track_id,
                                        savePath: table.pl_kind,
                                        filename: `${dtr.artist.replaceAll(" ", "_")}_-_${dtr.title.replaceAll(" ", "_")}.mp3`,
                                        filename_old: `${dtr.artist} - ${dtr.title}.mp3`
                                    })
                                }
                            }
                            if (links.length !== 0) {
                                notif.show()
                                for (let track of links) {
                                    notif.update(`Загрузка ${table.pl_title}`, track.filename_old, links.indexOf(track) + 1, links.length)
                                    let info = await this.save(track)
                                    await DataBases.PLAYLISTS_DB.updateTrack(track.table, track.track_id, info)
                                }
                                notif.done()
                                //await this.#generatePlayList()
                            }
                        })
                    } else {
                        //
                        new Notification({
                            title: `Чтение плейлиста`, text: table.pl_title, showTime: 2000
                        }).show()
                        playlist = []
                        let local_tracks = await DataBases.PLAYLISTS_DB.getPlaylist(table.pl_kind)
                        //
                        new YaApi().getTracks().then(tracks => {
                            for (let pl of tracks) {
                                if (pl.playlist_name === table.pl_kind) {
                                    for (let track of pl.tracks) {
                                        let loc_track = local_tracks.filter(ltrack => {
                                            return String(track.track_id) === String(ltrack.track_id)
                                        })[0]
                                        if (loc_track !== undefined) {
                                            let test_track = {
                                                track_id: loc_track.track_id,
                                                title: loc_track.title,
                                                artist: loc_track.artist,
                                                album: `https://${loc_track.album.replaceAll("%%", "800x800")}`,
                                                mimetype: loc_track.mimetype,
                                                path: loc_track.path,
                                                remove: () => {
                                                    this.remove(loc_track, table)
                                                },
                                                download: async () => {
                                                    let links = []
                                                    if (loc_track.path === "") {
                                                        links.push({
                                                            table: table.pl_kind,
                                                            pl_title: table.pl_title,
                                                            track_id: loc_track.track_id,
                                                            savePath: table.pl_kind,
                                                            filename: `${loc_track.artist.replaceAll(/\/|\s/gm, '_')}_-_${loc_track.title.replaceAll(/\/|\s/gm, "_")}.mp3`,
                                                            filename_old: `${loc_track.artist} - ${loc_track.title}.mp3`
                                                        })
                                                    }
                                                    if (links.length !== 0) {
                                                        for (let track of links) {
                                                            let info = await this.saveOne(track)
                                                            await DataBases.PLAYLISTS_DB.updateTrack(track.table, track.track_id, info)
                                                        }
                                                    }
                                                }
                                            }
                                            playlist.push(test_track)
                                        }
                                    }
                                }
                            }
                        }).finally(() => {
                            player.setPlayList(playlist)
                            this.track_list.addToMainBlock(player.getPlaylist().getPlaylist())
                            this.track_list.setTitle(table.pl_title)
                            this.track_list.openAndClose()
                        })
                        this.playlist_list.close()
                    }
                })
                DataBases.PLAYLISTS_DB.getPlaylist(table.pl_kind).then(async dpl => {
                    for (let dtr of dpl) {
                        if (dtr.path === "") {
                            button.addDownloadButton()
                            break
                        }
                    }
                    this.playlist_list.addToMainBlock(button.set())
                })

            }
        })
    }

    remove(track, table) {
        DataBases.USER_DB.selectUserData().then(async () => {
            await new YaApi().removeTrack(Number(table.pl_kind.replace("pl_", "")), track.track_id)
            DataBases.send("REGEN_PLAYLISTS")
        })
        DataBases.PLAYLISTS_DB.deleteRow(table.pl_kind, track.track_id).then(() => {
            document.getElementsByName(track.track_id)[0].remove()
        })
    }

    save(track) {
        return new Promise(async resolve => {
            DataBases.USER_DB.selectUserData().then(async (udt) => {
                let link = await new YaApi().getLink(track.track_id)
                DownloadManager.download({
                    url: link,
                    path: track.savePath,
                    // onProgress: (progress, item) => {
                    //     console.log(progress, item)
                    // }
                }, (error, info) => {
                    if (error) { console.error(error); return; }
                    let dl_path = require("path").join(App.userDataPath(), 'downloads')
                    let new_name = path.join(dl_path, track.savePath, track.filename)
                    fs.rename(info.filePath, new_name, (err) => {
                        if ( err ) console.error('ERROR: ' + err);
                        resolve(new_name)
                    });
                });
            })
        })
    }

    saveOne(track) {
        const notif = new DownloadProgressNotification({title: "Загрузка трека"})
        return new Promise(async resolve => {
            DataBases.USER_DB.selectUserData().then(async (udt) => {
                notif.show()
                let link = await new YaApi().getLink(track.track_id)
                DownloadManager.download({
                    url: link,
                    path: track.savePath,
                    onProgress: (progress, item) => {
                        notif.update("Загрузка трека", track.filename_old, Number(progress.progress).toFixed(), 100)
                    }
                }, (error, info) => {
                    if (error) { console.error(error); return; }
                    let dl_path = require("path").join(App.userDataPath(), 'downloads')
                    let new_name = path.join(dl_path, track.savePath, track.filename)
                    fs.rename(info.filePath, new_name, (err) => {
                        if ( err ) console.error('ERROR: ' + err);
                        notif.done()
                        resolve(new_name)
                    });
                });
            })
        })
    }
}

exports.Player = Player

const shuffle = (array) => {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}
