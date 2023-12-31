const Collections = require("./Collections");
const Entity = require("./domain/entity/models/Entity");

class Getter {
    constructor(db, collections = new Collections) {
        this.db = db;
        this.collections = collections;
        this.entity = new Entity(db, collections);
    }
    getters() {
        return {}
    }
}

module.exports = Getter;