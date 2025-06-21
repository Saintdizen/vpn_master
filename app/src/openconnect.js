const { spawn} = require('child_process');
const {Log} = require("chuijs");
class OpenConnect {
    #vpnProcess = undefined
    #gate = undefined
    #user_login = undefined
    #user_password = undefined
    #user_cert = undefined
    #cert_password = undefined
    constructor(options = {
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
        this.#gate = options.gate
        this.#user_login = options.user.login
        this.#user_password = options.user.password
        this.#user_cert = options.cert.pfx
        this.#cert_password = options.cert.password
    }
    start() {
        this.#vpnProcess = spawn('sudo', [
            'openconnect',
            '--protocol=fortinet',
            '-u', this.#user_login,
            '-c', this.#user_cert,
            this.#gate,
            '--no-dtls'
        ]);


        // Handle output and errors
        this.#vpnProcess.stdout.on('data', (data) => {
            Log.info(`OpenConnect stdout: ${data}`)
        });

        this.#vpnProcess.stderr.on('data', (data) => {
            Log.error(`OpenConnect stderr: ${data}`)

            if (data.includes('Enter PKCS#12 pass phrase:')) {
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
            Log.info(`OpenConnect process exited with code ${code}`)
        });
    }
    exit() {
        this.#vpnProcess.kill();
    }
}

exports.OpenConnect = OpenConnect