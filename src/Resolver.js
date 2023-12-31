const Collections = require("./Collections");

class Resolver {
    constructor(db, collections = new Collections) {
        this.db = db;
        this.collections = collections;
    }

    queries() {
        return {}
    }
    mutations() {
       return {}
    }
    types() {
        return {}
    }
}

module.exports = Resolver;