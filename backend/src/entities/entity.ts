export default class Entity<T> {
    constructor(attr: Partial<T>) {
        if (attr) {
            Object.assign(this, attr)
        }
    }
}