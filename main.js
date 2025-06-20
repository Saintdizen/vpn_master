const {Main, MenuItem, path, App} = require('chuijs');
const json = require("./package.json");
const DownloadManager = require("electron-download-manager");
const dl_path = require("path").join(App.userDataPath(), 'downloads')
DownloadManager.register({downloadFolder: dl_path});
//
const main = new Main({
    name: `${json.productName} (${json.version})`,
    sizes: {
        minWidth: 960,
        width: 960,
        minHeight: 540,
        height: 540
    },
    minHeight: 540,
    minWidth: 960,
    icon: `${__dirname}/resources/icons/app/icon.png`,
    render: `${__dirname}/app/app.js`,
    devTools: false,
    resizable: true,
    paths: {
        downloadPath: path.join(App.userDataPath(), "downloads")
    }
});

let menu = [
    new MenuItem().help(`Версия: ${json.version}`),
    new MenuItem().button('Консоль', () => main.toggleDevTools()),
    new MenuItem().quit('Выход')
]

main.start({
    hideOnClose: true,
    tray: menu,
    globalMenu: menu
});

// App.get().on('session-created', (session) => {
//     session.on('will-download', (e, item, contents) => {
//         console.log(item.getFilename())
//         main.sendDownload("Загрузка трека", item.getFilename())
//         item.setSavePath(path.join(path.join(App.userDataPath(), "downloads"), item.getFilename()))
//         item.on('updated', (event, state) => {
//             if (state === 'interrupted') {
//                 console.log('Download is interrupted but can be resumed')
//             } else if (state === 'progressing') {
//                 if (item.isPaused()) {
//                     console.log('Download is paused')
//                 } else {
//                     //main.sendDownloadUpdate("Загрузка", `${item.getFilename()} ${formatBytes(item.getReceivedBytes())} - ${formatBytes(item.getTotalBytes())}`)
//                     console.log(`Received bytes: ${formatBytes(item.getReceivedBytes())} - ${formatBytes(item.getTotalBytes())}`)
//                 }
//             }
//         })
//         item.on('done', (event, state) => {
//             if (state === 'completed') {
//                 console.log('Download successfully')
//                 main.sendDownloadComplete()
//             } else {
//                 console.log(`Download failed: ${state}`)
//                 main.sendDownloadError()
//             }
//         })
//     });
// });

main.enableAutoUpdateApp(2000)