const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();


class UserDB {
    #user_db = null
    constructor(path) {
        const filepath = path + `/USER.db`;
        if (fs.existsSync(filepath)) {
            this.#user_db = new sqlite3.Database(filepath);
        } else {
            this.#user_db = new sqlite3.Database(filepath, (error) => {
                if (error) return console.error(error.message);
            });
        }
    }
    createUserTable() {
        return new Promise((resolve, reject) => {
            this.#user_db.exec(`CREATE TABLE IF NOT EXISTS user (access_token VARCHAR(50) NOT NULL, user_id INTEGER NOT NULL);`);
            resolve("ok")
        })
    }
    addUserData(access_token, user_id) {
        return new Promise((resolve, reject) => {
            this.#user_db.run(`INSERT INTO user (access_token, user_id) VALUES (?, ?)`,
                [access_token, user_id],
                (error) => {
                    if (error) reject(error.message);
                    resolve("ok")
                }
            );
        })
    }
    updateUserData(user_id, access_token) {
        this.#user_db.run(`UPDATE user SET access_token = ? WHERE user_id = ?`,
            [access_token, user_id],
            (error) => {
                if (error) console.error(error.message);
            }
        );
    }
    selectUserData() {
        return new Promise((resolve, reject) => {
            this.#user_db.each(`SELECT * FROM user;`, (error, row) => {
                if (error) reject(error);
                resolve(row)
            });
        })
    }
    async deleteUserData(user_id) {
        this.#user_db.run(`DELETE FROM user WHERE user_id = ?`, [user_id],
            (error) => {
            if (error) return console.error(error.message);
        });
    }
}

class PlaylistDB {
    #pl_db = null
    constructor(path) {
        const filepath = path + `/PLAYLISTS.db`;
        if (fs.existsSync(filepath)) {
            this.#pl_db = new sqlite3.Database(filepath);
        } else {
            this.#pl_db = new sqlite3.Database(filepath, (error) => {
                if (error) return console.error(error.message);
            });
        }
    }
    createPlaylistDictTable() {
        this.#pl_db.exec(`
            CREATE TABLE IF NOT EXISTS pl_list (
                pl_kind TEXT PRIMARY KEY,
                pl_title TEXT NOT NULL
            );
        `);
    }
    addPlaylistData(pl_kind, pl_title) {
        return new Promise((resolve, reject) => {
            this.#pl_db.run(`INSERT OR IGNORE INTO pl_list (pl_kind, pl_title) VALUES (?, ?);`,
                [pl_kind, pl_title],
                (error) => {
                    if (error) reject(error)
                    resolve(`Inserted a row with the ID: ${pl_kind}`)
                });
        })
    }
    getPlaylists() {
        return new Promise((resolve, reject) => {
            this.#pl_db.all(`SELECT * FROM pl_list`, (error, rows) => {
                if (error) reject(error.message);
                resolve(rows)
            });
        })
    }
    createPlaylistTable(pl_kind) {
        this.#pl_db.exec(`
            CREATE TABLE IF NOT EXISTS pl_${pl_kind} (
                track_id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                artist TEXT NOT NULL,
                album TEXT NOT NULL,
                mimetype TEXT NOT NULL,
                path TEXT NOT NULL
            );
        `);
    }
    addTrack(pl_kind, track_id, title, artist, album, mimetype) {
        return new Promise((resolve, reject) => {
            this.#pl_db.run(`INSERT OR IGNORE INTO pl_${pl_kind} (track_id, title, artist, album, mimetype, path) VALUES (?, ?, ?, ?, ?, ?);`,
            [track_id, title, artist, album, mimetype, ""],
            (error) => {
                if (error) reject(error.message)
                resolve(`Inserted a row with the ID: ${track_id}`)
            });
        })
    }
    getTrack(name, track_id) {
        return new Promise((resolve, reject) => {
            this.#pl_db.all(`SELECT * FROM ${name} WHERE track_id = ?`, [track_id], (error, rows) => {
                if (error) reject(error.message);
                resolve(rows[0])
            });
        })
    }
    getPlaylist(name) {
        return new Promise((resolve, reject) => {
            this.#pl_db.all(`SELECT * FROM ${name}`, (error, rows) => {
                if (error) reject(error.message);
                resolve(rows)
            });
        })
    }
    updateTrack(t_name, track_id, path) {
        return new Promise((resolve, reject) => {
            this.#pl_db.run(`UPDATE ${t_name} SET path = ? WHERE track_id = ?`,
                [path, track_id],
                (error) => {
                    if (error) reject(error.message);
                    resolve(`Row ${track_id} has been updated`)
                });
        })
    }
    async deleteRow(tableName, track_id) {
        return new Promise((resolve, reject) => {
            this.#pl_db.run(`DELETE FROM ${tableName} WHERE track_id = ?`,
                [track_id],
                (error) => {
                    if (error) reject(error.message);
                    resolve(`Row with the ID ${track_id} has been deleted`)
                });
        })
    }
}

exports.UserDB = UserDB
exports.PlaylistDB = PlaylistDB