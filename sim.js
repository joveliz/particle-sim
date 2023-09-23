import SpatialGrid from './spatial-grid/sg.js'

const canvas = document.getElementById('canvas')
const c = canvas.getContext('2d')

const WIDTH = 600
const HEIGHT = 600

canvas.width = WIDTH
canvas.height = HEIGHT

const grid = new SpatialGrid([[0, 0], [WIDTH, HEIGHT]], [WIDTH/50, HEIGHT/50])
const PARTICLES_ARRAY = []
var PARTICLE_ID = 0

var fx = 0
var fy = 0

const FORCES_MATRIX = [[-0.08, 0.1, -0.07],
                    [-0.05, -0.05, -0.05],
                    [-0.07, -0.04, 0.02],]

class Particle {
    constructor (position, id, color) {
        this.position = position
        this.velocity = [0, 0]
        this.bounds = [5, 5]
        this.indices = null
        this.id = id
        this.color = color
    }

    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position[0] - this.bounds[0]/2, this.position[1] - this.bounds[1]/2, this.bounds[0], this.bounds[1])
    }

    updatePos() {
        this.position = [this.position[0] + this.velocity[0], this.position[1] + this.velocity[1]]
        if(this.position[0] <= 0 || this.position[0] >= WIDTH){ this.velocity[0] *= -5 }
        if(this.position[1] <= 0 || this.position[1] >= HEIGHT){ this.velocity[1] *= -5 }
    }
}

function randCoord(axis) {
    return 0.1 * axis + 0.8 * axis * Math.random()
}

function newGroup(n, color) {
    for (let i=0; i<n; i++) {
        const newParticle = new Particle([randCoord(WIDTH), randCoord(HEIGHT)], PARTICLE_ID, color)
        grid.insertClient(newParticle)
        PARTICLES_ARRAY.push(newParticle)
    }
    PARTICLE_ID += 1
}

function clearCanvas() {
    c.fillStyle = 'black'
    c.fillRect(0, 0, WIDTH, HEIGHT)
}

function RAF() {
    clearCanvas()

    for (let i=0; i < PARTICLES_ARRAY.length; i++) {
        const current = PARTICLES_ARRAY[i]
        fx = 0
        fy = 0

        grid.findNear(current.position, [60, 60]).forEach((other) => {

            if (other != current) {
                const dx = current.position[0] - other.position[0]
                const dy = current.position[1] - other.position[1]
                const distance = Math.sqrt((dx * dx) + (dy * dy))

                if (distance < 50) {
                    let F = 0
                    if (distance < 10) {
                        F = 1 / distance
                    } else {
                        F = FORCES_MATRIX[current.id][other.id] * (1 / distance)
                    }
                    fx = fx + F * dx
                    fy = fy + F * dy
                }   
            }
        })
        current.velocity[0] = (current.velocity[0] + fx) / 2
        current.velocity[1] = (current.velocity[1] + fy) / 2
        current.updatePos()
        grid.updateClient(current)
        current.draw()
    }
    requestAnimationFrame(RAF)
}

newGroup(300, 'red')
newGroup(300, 'yellow')
newGroup(300, 'cyan')

requestAnimationFrame(RAF)