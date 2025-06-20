const {Dialog, CustomElement, Icon, Icons, TextInput, Styles, YaApi, Button, Spinner} = require("chuijs");
const {DataBases} = require("../../../start");
let path_css = require("path").join(__dirname, "player_elements.css")

class PlayerDialog {
    #dialog = undefined
    #title = new CustomElement({
        tag: "cust_elem", id: "test_dialog_pl_list_title", pathToCSS: path_css
    })
    #button_close = new CustomElement({
        tag: "cust_elem", id: "test_close_button_one", pathToCSS: path_css
    })
    #main_block = new CustomElement({
        tag: "cust_elem", id: "test_track_list_main_block", className: "test_track_list_main_block", pathToCSS: path_css
    })
    #search_block = new CustomElement({
        tag: "cust_elem", id: "test_track_list_main_block2", className: "test_track_list_main_block2", pathToCSS: path_css
    })
    #search_input = new TextInput({
        transparentBack: true,
        width: "-webkit-fill-available",
        placeholder: "Поиск"
    })
    constructor(width = String(), height = String(), title = "Список плейлистов") {
        this.#dialog = new Dialog({ closeOutSideClick: false, width: width, height: height, transparentBack: false })
        this.#title.innerText(title)
        this.#button_close.innerHTML(new Icon(Icons.NAVIGATION.CLOSE, "18px").getHTML())
        this.#button_close.addEventListener("click", () => this.#dialog.close())

        //
        //this.#search_block.set().appendChild(this.#title.set())
        this.#search_block.set().appendChild(this.#search_input.set())
        this.#search_block.set().appendChild(this.#button_close.set())
        this.#dialog.addToHeader(this.#search_block)
        //
        this.#dialog.addToBody(this.#main_block)

        this.#search_input.addInputListener((event) => {
            event.preventDefault()
            let children = this.#main_block.set().childNodes
            if (children.length > 1) {
                for (let node of children) {
                    let text1 = node.childNodes[0].textContent.toLowerCase()
                    let text2 = event.target.value.toLowerCase()
                    if (text1.includes(text2)) {
                        node.style.display = 'flex'
                    } else {
                        node.style.display = 'none'
                    }
                }
            } else {
                for (let node of children[0].childNodes) {
                    let text1 = node.childNodes[1].textContent.toLowerCase()
                    let text2 = event.target.value.toLowerCase()
                    if (text1.includes(text2)) {
                        node.style.display = 'flex'
                    } else {
                        node.style.display = 'none'
                    }
                }
            }
        })
    }
    setTitle(name = String()) {
        this.#title.innerText(name)
    }
    addToHeader(...components) {
        for (let component of components) this.#dialog.addToHeader(component);
    }
    addToBody(...components) {
        for (let component of components) this.#dialog.addToBody(component);
    }
    openAndClose() {
        this.#search_input.setValue("")
        this.#dialog.openAndClose()
    }
    close() {
        this.#search_input.setValue("")
        this.#dialog.close()
    }
    isOpen() {
        return this.#dialog.isOpen
    }
    clear() {
        this.#main_block.set().innerHTML = ''
    }
    addToMainBlock(...components) {
        try {
            for (let component of components) this.#main_block.set().appendChild(component.set());
        } catch {
            for (let component of components) this.#main_block.set().appendChild(component);
        }
    }
    set() {
        return this.#dialog.set()
    }
}

exports.PlayerDialog = PlayerDialog

class PlayerDialogButton {
    #main_block = new CustomElement({
        tag: "cust_elem", id: "test_main_block", className: "test_main_block", pathToCSS: path_css
    })
    #title = new CustomElement({
        tag: "cust_elem", id: "test_title", className: "test_title", pathToCSS: path_css
    })
    //
    #controls = new CustomElement({
        tag: "cust_elem", id: "test_controls_block", className: "test_controls_block", pathToCSS: path_css
    })
    #download = new CustomElement({
        tag: "cust_elem", id: "test_download", className: "test_controls_button", pathToCSS: path_css
    })
    constructor(table, listener = () => {}) {
        console.log(table)
        this.#main_block.addEventListener("click", listener)
        this.#title.innerText(table.pl_title)
        this.#download.innerHTML(new Icon(Icons.FILE.DOWNLOAD, "18px").getHTML())
        //
        this.#main_block.set().appendChild(this.#title.set())
        this.#main_block.set().appendChild(this.#controls.set())
    }
    addDownloadButton() {
        this.#controls.set().appendChild(this.#download.set())
    }
    set() {
        return this.#main_block
    }
}

exports.PlayerDialogButton = PlayerDialogButton

class PlayerDialogSearch {
    #dialog = undefined
    #dialog_add_pl = undefined
    #button_close = new CustomElement({
        tag: "cust_elem", id: "test_close_button_one", pathToCSS: path_css
    })
    #main_block = new CustomElement({
        tag: "cust_elem", id: "test_track_list_main_block", className: "test_track_list_main_block", pathToCSS: path_css
    })
    #search_block = new CustomElement({
        tag: "cust_elem", id: "test_track_list_main_block2", className: "test_track_list_main_block2", pathToCSS: path_css
    })
    #search_input = new TextInput({
        transparentBack: true,
        width: Styles.SIZE.WEBKIT_FILL,
        placeholder: "Поиск"
    })
    #search_button = new Button({
        //reverse: Boolean(),
        title: "Поиск",
        icon: undefined,
        transparentBack: true
    })
    constructor(width = "calc(100% - 100px)", height = "calc(100% - 100px)") {
        this.#dialog = new Dialog({ closeOutSideClick: false, width: width, height: height, transparentBack: false })
        this.#dialog_add_pl = new PlayerDialog(width, height, "Добавить в плейлист")
        this.#button_close.innerHTML(new Icon(Icons.NAVIGATION.CLOSE, "18px").getHTML())
        this.#button_close.addEventListener("click", () => this.#dialog.close())
        this.#dialog.addToHeader(this.#search_block)
        this.#search_block.set().appendChild(this.#search_input.set())
        this.#search_block.set().appendChild(this.#search_button.set())
        this.#search_block.set().appendChild(this.#button_close.set())
        this.#dialog.addToBody(this.#main_block, this.#dialog_add_pl)

        this.#search_button.addClickListener(async (event) => {
            event.preventDefault()
            await this.#renderSearchResults()
        })
    }
    async #renderSearchResults() {
        globalThis.playlist = []
        let spinner_big = new Spinner(Spinner.SIZE.BIG, 'auto');
        this.addToMainBlock(spinner_big)
        this.#search_button.setDisabled(true)
        for (let i = 0; i <= 10; i++) {
            let res = await new YaApi().searchAll(this.#search_input.getValue(), i, 5000)
            try {
                if (res.tracks.results.length === 0) {
                    break;
                }
                //console.log(res)
                let res_json = {
                    q: this.#search_input.getValue(),
                    results: res.tracks.results
                }
                this.#searchResults(res_json, this.#search_input.getValue().toLowerCase())
            } catch (e) {
                break;
            }
        }
        globalThis.player.setPlayList([...new Set(globalThis.playlist)])
        this.addToMainBlock(globalThis.player.getPlaylist().getPlaylist())
        this.#search_button.setDisabled(false)
    }
    #searchResults(res_json, input_value) {
        for (let s_track of res_json.results) {
            let artist_name = []
            for (let artist of s_track.artists) artist_name.push(artist.name)
            let cover = undefined
            try {
                cover = `https://${s_track.coverUri.replaceAll("%%", "800x800")}`
            } catch (e) {
                cover = ""
            }
            let test_track = {
                track_id: s_track.id,
                title: s_track.title,
                artist: artist_name.join(", ").toString(),
                album: cover,
                mimetype: "audio/mpeg",
                path: "",
                addToPlaylist: async () => {
                    this.#dialog_add_pl.clear()
                    for (let pl of new Set([...globalThis.playlists])) {
                        let tt = pl.tracks.filter((track) => String(track.id) === String(s_track.id))
                        this.#dialog_add_pl.addToMainBlock(this.#setButtonTest(s_track, pl, tt.length > 0))
                    }
                    this.#dialog_add_pl.openAndClose()
                }
            }
            if (artist_name.join(", ").toString().toLowerCase().includes(input_value)) globalThis.playlist.push(test_track)
            if (s_track.title.toLowerCase().includes(input_value)) globalThis.playlist.push(test_track)
        }
        globalThis.playlist.sort((a) => {
            let aName = a.artist.toLowerCase();
            if (aName.includes(input_value)) { return -1 }
            return 0;
        })
        globalThis.playlist.sort((a) => {
            let aName = a.artist.toLowerCase();
            if (aName === input_value) { return -1 }
            return 0;
        })
    }
    #setButtonTest(track, pl, exists) {
        let chui_playlist = document.createElement("chui_playlist");
        let chui_playlist_cover = document.createElement("chui_playlist_cover")
        let chui_playlist_name = document.createElement("chui_playlist_name");
        let chui_playlist_exists = document.createElement("chui_playlist_exists");
        //
        chui_playlist_name.innerText = pl.title;
        // chui_playlist.style.backgroundImage = `url("https://${pl.ogImage.replaceAll("%%", "800x800")}")`
        if (exists) {
            chui_playlist_exists.innerHTML = new Icon(Icons.AUDIO_VIDEO.PLAYLIST_ADD_CHECK, "24px", 'var(--badge_success_text)').getHTML()
        } else {
            chui_playlist.addEventListener("click", async () => {
                new YaApi().addTrackToPlaylist(pl.kind, track.id, track.albums[0].id).then(async add => {
                    DataBases.send("REGEN_PLAYLISTS")
                    this.#dialog_add_pl.close()
                }).catch(err => {
                    console.error(err)
                })
            })
        }
        //
        chui_playlist.appendChild(chui_playlist_cover)
        chui_playlist.appendChild(chui_playlist_name)
        chui_playlist.appendChild(chui_playlist_exists)
        //
        return chui_playlist
    }
    addToHeader(...components) {
        for (let component of components) this.#dialog.addToHeader(component);
    }
    addToBody(...components) {
        for (let component of components) this.#dialog.addToBody(component);
    }
    openAndClose() {
        //this.#search_input.setValue("")
        this.#dialog.openAndClose()
    }
    isOpen() {
        return this.#dialog.isOpen
    }
    close() {
        //this.#search_input.setValue("")
        this.#dialog.close()
    }
    clear() {
        this.#main_block.set().innerHTML = ''
    }
    addToMainBlock(...components) {
        this.clear()
        try {
            for (let component of components) this.#main_block.set().appendChild(component.set());
        } catch {
            for (let component of components) this.#main_block.set().appendChild(component);
        }
    }
    set() {
        return this.#dialog.set()
    }
}

exports.PlayerDialogSearch = PlayerDialogSearch