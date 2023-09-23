
export default class SpatialHashGrid {
    constructor(bounds, dimensions) {
        this._bounds = bounds
        this._dimensions = dimensions
        this._cells = new Map()
    }

    insertClient(client) {
        const [x, y] = client.position
        const [w, h] = client.bounds

        const i1 = this._getCellIndex([x - w / 2, y - h / 2])
        const i2 = this._getCellIndex([x + w / 2, y + h / 2])

        client.indices = [i1, i2]

        for (let x = i1[0], xn = i2[0]; x <= xn; x++) {
            for (let y = i1[1], yn = i2[1]; y <= yn; y++) {
                const key = this._key(x, y)

                if (!(this._cells.has(key))) {
                    this._cells.set(key, new Set())
                }

                this._cells.get(key).add(client)
            }
        }
    }

    _key(x, y) {
        return x + '.' + y
    }

    _getCellIndex(position) {
        const x = ((position[0] - this._bounds[0][0]) 
                    / (this._bounds[1][0] - this._bounds[0][0]))
        const y = ((position[1] - this._bounds[0][1]) 
                    / (this._bounds[1][1] - this._bounds[0][1]))

        
        const xIndex = Math.floor(x * (this._dimensions[0] - 1))
        const yIndex = Math.floor(y * (this._dimensions[1] - 1))

        return [xIndex, yIndex]
    }

    findNear(position, bounds) {
        const [x, y] = position
        const [w, h] = bounds

        const i1 = this._getCellIndex([x - w / 2, y - h / 2])
        const i2 = this._getCellIndex([x + w / 2, y + h / 2])

        const clients = new Set()

        for (let x = i1[0], xn = i2[0]; x <= xn; x++) {
            for (let y = i1[1], yn = i2[1]; y <= yn; y++) {
                const key = this._key(x, y)

                if (this._cells.has(key)) {
                    for (let client of this._cells.get(key)) {
                        clients.add(client)
                    }
                }
            }
        }

        return clients
    }

    removeClient(client) {
        const [i1, i2] = client.indices

        for (let x = i1[0], xn = i2[0]; x <= xn; x++) {
            for (let y = i1[1], yn = i2[1]; y <= yn; y++) {
                const key = this._key(x, y)

                this._cells.get(key).delete(client)
            }
        }
    }

    updateClient(client) {
        this.removeClient(client)
        this.insertClient(client)
    }
}