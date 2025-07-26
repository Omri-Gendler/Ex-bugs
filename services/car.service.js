import { loggerService } from './logger.service.js'
import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

const cars = readJsonFile('./data/car.json')

export const carService = {
    query,
    getById,
    remove,
    save,
}

function query() {
    return Promise.resolve(cars)
}

function getById(carId) {
    const car = cars.find(car => car._id === carId)

    if (!car) {
        loggerService.error(`Couldnt find car ${carId} in carService`)
        return Promise.reject(`Couldnt get car`)
    }
    return Promise.resolve(car)
}

function remove(carId) {
    const idx = cars.findIndex(car => car._id === carId)

    if (idx === -1) {
        loggerService.error(`Couldnt find car ${carId} in carService`)
        return Promise.reject(`Couldnt remove car`)
    }
    
    cars.splice(idx, 1)
    return _saveCars()
}

function save(carToSave) {
    if (carToSave._id) {
        const idx = cars.findIndex(car => car._id === carToSave._id)

        if (idx === -1) {
            loggerService.error(`Couldnt find car ${carToSave._id} in carService`)
            return Promise.reject(`Couldnt save car`)
        }

        cars.splice(idx, 1, carToSave)
    } else {
        carToSave._id = makeId()
        cars.push(carToSave)
    }
    return _saveCars()
        .then(() => carToSave)
}

function _saveCars() {
    return writeJsonFile('./data/car.json', cars)
}