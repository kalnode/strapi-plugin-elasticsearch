export const getTypefromStrapiID = (strapiID) => {
    // TODO: This seems really stupid, but we're doing it.

    return strapiID.split('.').slice(-1)[0]
}
