import { apiUpdateIndex } from '../apiUrls'
import { convertEmptyStringsToNulls } from '../convertEmptyStringsToNulls'
import axiosInstance from '../axiosInstance'
export const requestUpdateIndex = async (indexUUID, payload) => {

    let payloadFinal = payload

    //delete payload.mappings
    delete payloadFinal.createdAt
    delete payloadFinal.updatedAt

    payloadFinal = convertEmptyStringsToNulls(payloadFinal)

    console.log("requestUpdateIndex: payload", payloadFinal)

    return await axiosInstance.post(apiUpdateIndex(indexUUID), {
        data: payloadFinal
    })
    .then( (response) => {
        console.log("requestUpdateIndex: response", response)
        if (response.data) {
            return response.data
        }
    })
    .catch((error) => {
        console.log("requestUpdateIndex ERROR: ", error)
        return error
    })

}