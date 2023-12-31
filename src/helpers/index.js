const helpers = {

    /**
     * Conver array of key and value pairs to object
     *
     * @param arr
     * @returns {{}}
     */
    convertMetaKeyValueToObj(arr = []) {
        const obj = {};
        for (let meta of arr) {
            obj[meta.key] = meta.value;
        }
        return obj;
    }
  
};

module.exports = helpers;