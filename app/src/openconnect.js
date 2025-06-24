const { spawn} = require('child_process');
const {Log, Notification, Paragraph, path, App, fs} = require("chuijs");
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
    createFileSH() {
        let test = `#!/usr/bin/expect -f

set timeout -1
set gate [lindex $argv 0];
set user [lindex $argv 1];
set password [lindex $argv 2];
set pfx [lindex $argv 3];
set pass_phrase [lindex $argv 4];

spawn sudo openconnect --protocol=fortinet -u $user -c $pfx $gate --no-dtls
set bash_pid [exp_pid]
puts "Spawn PID: $bash_pid"

expect "Enter PKCS#12 pass phrase:"
send -- "$pass_phrase\\r"

expect "Enter 'yes' to accept, 'no' to abort; anything else to view: "
send -- "yes\\r"

expect "Password: "
send -- "$password\\r"

expect eof`

        let path_scripts = path.join(App.userDataPath(), "scripts")
        let path_script = path.join(path_scripts, "spawn_openconnect.sh")
        if (!fs.existsSync(path_scripts)) {
            fs.mkdirSync(path_scripts, { recursive: true });
            fs.writeFileSync(path_script, test, "utf-8");
            let set_permission= `cd '${path_scripts}' && chmod +x spawn_openconnect.sh`
            spawn(set_permission, { shell: true });
            Log.info(`Файл '${path_script}' успешно создан`)
        } else {
            Log.info(`Файл '${path_script}' уже существует`)
        }
        return path_scripts
    }

    start() {
        let pathz = this.createFileSH()

        Log.info(this.#admin_password)

        let open_con= `cd '${pathz}' && echo '${this.#admin_password}' | sudo -S ./spawn_openconnect.sh '${this.#gate}' '${this.#user_login}' '${this.#user_password}' '${this.#user_cert}' '${this.#cert_password}'`
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