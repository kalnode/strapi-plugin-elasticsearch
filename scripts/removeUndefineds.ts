export const removeUndefineds = (anObject:object) => {
    Object.keys(anObject).forEach(key => anObject[key] === undefined && delete anObject[key])
}

export default removeUndefineds