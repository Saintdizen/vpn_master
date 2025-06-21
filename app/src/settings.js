const {store} = require('chuijs');
class AddConnection {
    #settings_gate = 'settings.connection.gate';
    #settings_user_login = 'settings.connection.user_login';
    #settings_user_password = 'settings.connection.user_password';
    #settings_user_cert = 'settings.connection.user_cert';
    #settings_cert_password = 'settings.connection.cert_password';
    constructor() {}
    add(gate, userLogin, userPassword, cert, certPassword) {
        store.set(this.#settings_gate, gate)
        store.set(this.#settings_user_login, userLogin)
        store.set(this.#settings_user_password, userPassword)
        store.set(this.#settings_user_cert, cert)
        store.set(this.#settings_cert_password, certPassword)
    }
    getGate() {
        return store.get(this.#settings_gate);
    }
    getUserLogin() {
        return store.get(this.#settings_user_login);
    }
    getUserPassword() {
        return store.get(this.#settings_user_password);
    }
    getUserCert() {
        return store.get(this.#settings_user_cert);
    }
    getCertPassword() {
        return store.get(this.#settings_cert_password);
    }
}

exports.AddConnection = AddConnection;