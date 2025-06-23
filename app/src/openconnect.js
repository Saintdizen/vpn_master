const { spawn} = require('child_process');
const {Log, Notification, Paragraph, shell, path} = require("chuijs");
class OpenConnect {
    #vpnProcess = undefined
    #gate = undefined
    #user_login = undefined
    #user_password = undefined
    #user_cert = undefined
    #cert_password = undefined
    #console = undefined
    #admin_password = undefined
    #SPAWN_PID = undefined
    constructor(console, options = {
        adminPassword: undefined,
        gate: undefined,
        user: {
            login: undefined,
            password: undefined,
        },
        cert: {
            pfx: undefined,
            password: undefined,
        }
    }) {
        this.#console = console
        this.#gate = options.gate
        this.#user_login = options.user.login
        this.#user_password = options.user.password
        this.#user_cert = options.cert.pfx
        this.#cert_password = options.cert.password
        this.#admin_password = options.adminPassword
    }
    start() {
        let open_con= `cd ${path.join(__dirname)} && chmod +x ./vpn_on.sh && echo '${this.#admin_password}' | sudo -S ./vpn_on.sh '${this.#gate}' '${this.#user_login}' '${this.#user_password}' '${this.#user_cert}' '${this.#cert_password}'`
        this.#vpnProcess = spawn(open_con, { shell: true });
        Log.info(`Main PID: ${this.#vpnProcess.pid}`)

        // Handle output and errors
        this.#vpnProcess.stdout.on('data', (data) => {
            Log.info(`OpenConnect stdout: ${data}`)
            this.#console.add(new Paragraph(data))


            if (data.includes("Using vhost-net for tun acceleration")) {
                new Notification({title: "Подключение", text: "Установлено"}).show(true)
            }

            if (data.includes("Spawn PID:")) {
                const myRe = new RegExp("\\d+", "g");
                this.#SPAWN_PID = myRe.exec(data.toString());
                Log.info(`Вот так вот: ${this.#SPAWN_PID}`)
            }

            if (data.includes("Logout successful.")) {
                new Notification({title: "Подключение", text: "Остановлено"}).show(true)
            }
        });

        this.#vpnProcess.stderr.on('data', (data) => {
            Log.error(`OpenConnect stderr: ${data}`)
            this.#console.add(new Paragraph(data))
        });

        this.#vpnProcess.on('close', (code) => {
            this.#console.add(new Paragraph(`OpenConnect process exited with code ${code}`))
            Log.info(`OpenConnect process exited with code ${code}`)
            new Notification({title: "Подключение", text: "Остановлено"}).show(true)
        });
    }
    exit() {
        Log.info(`Spawn PID: ${this.#SPAWN_PID}`)
        let open_con= `echo '${this.#admin_password}' | sudo -S kill -9 ${this.#SPAWN_PID}`
        spawn(open_con, { shell: true });

        Log.info(`Main PID: ${this.#vpnProcess.pid}`)
        this.#vpnProcess.kill();
    }
}

exports.OpenConnect = OpenConnect