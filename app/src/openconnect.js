const { spawn, exec, execSync} = require('child_process');
const {Log, Notification, Paragraph, shell} = require("chuijs");
class OpenConnect {
    #vpnProcess = undefined
    #gate = undefined
    #user_login = undefined
    #user_password = undefined
    #user_cert = undefined
    #cert_password = undefined
    #console = undefined
    constructor(console, options = {
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
    }
    start(adminPassword) {
        let ds= `echo '${adminPassword}' | sudo -S openconnect --protocol=fortinet -u ${this.#user_login} -c ${this.#user_cert} ${this.#gate} --no-dtls`


        // this.#vpnProcess = spawn('pkexec', [
        //     'openconnect',
        //     '--protocol=fortinet',
        //     '-u', this.#user_login,
        //     '-c', this.#user_cert,
        //     this.#gate,
        //     '--no-dtls'
        // ]);

        this.#vpnProcess = spawn(ds, {
            shell: false
        });

        Log.info(this.#vpnProcess.pid)

        // Handle output and errors
        this.#vpnProcess.stdout.on('data', (data) => {
            Log.info(`OpenConnect stdout: ${data}`)
            this.#console.add(new Paragraph(data))


            if (data.includes("Using vhost-net for tun acceleration")) {
                new Notification({title: "Подключение", text: "Установлено"}).show(true)
            }

            if (data.includes("Logout successful.")) {
                new Notification({title: "Подключение", text: "Остановлено"}).show(true)
            }
        });

        this.#vpnProcess.stderr.on('data', (data) => {
            Log.error(`OpenConnect stderr: ${data}`)
            this.#console.add(new Paragraph(data))

            if (data.includes('Enter PKCS#12 pass phrase:')) {
                // this.#vpnProcess.stdin.write(`${this.#cert_password}\n`);
                this.#vpnProcess.stdin.write(`${this.#cert_password}\n`);
            }

            if (data.includes("Enter 'yes' to accept, 'no' to abort; anything else to view:")) {
                this.#vpnProcess.stdin.write(`yes\n`);
            }

            if (data.includes('Password:')) {
                this.#vpnProcess.stdin.write(`${this.#user_password}\n`);
            }
        });

        this.#vpnProcess.on('close', (code) => {
            this.#console.add(new Paragraph(`OpenConnect process exited with code ${code}`))
            Log.info(`OpenConnect process exited with code ${code}`)
        });
    }
    exit() {
        spawn('kill', [`${this.#vpnProcess.pid}`]);


        // this.#vpnProcess.kill();
    }
}

exports.OpenConnect = OpenConnect