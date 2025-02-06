import { apiUpdateIndex, apiGetIndex, apiGetMapping, apiGetMappings, apiCreateMapping, apiUpdateMapping, apiDeleteMapping, apiGetContentTypes } from '../apiUrls'
import { convertEmptyStringsToNulls } from '../convertEmptyStringsToNulls'
import axiosInstance from '../axiosInstance'
export const requestUpdateIndex = async (indexId, payload) => {

    let payloadFinal = payload

    //delete payload.mappings
    delete payloadFinal.createdAt
    delete payloadFinal.updatedAt

    payloadFinal = convertEmptyStringsToNulls(payloadFinal)

    console.log("requestUpdateIndex: payload", payloadFinal)

    return await axiosInstance.post(apiUpdateIndex(indexId), {
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