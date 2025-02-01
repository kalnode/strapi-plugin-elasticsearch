/**
 *
 * Index component
 *
 */

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Button, Typography, ToggleInput, TextInput, Flex, Textarea, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiUpdateIndex, apiGetIndex, apiGetMapping, apiGetMappings, apiCreateMapping, apiUpdateMapping, apiDeleteMapping, apiGetContentTypes } from '../../utils/apiUrls'
import axiosInstance from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Mappings } from '../../components/Mappings'

export const Index = ({ indexId, closeEvent }) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [index,setIndex] = useState(null)

    const showNotification = useNotification()

    const requestGetIndex = async () => {

        if (indexId) {
            setIsInProgress(true)
            let work = await axiosInstance.get(apiGetIndex(indexId))
                .then( (response) => {
                    console.log("get requestGetIndex 111: ", response)
                    if (response.data) {
                        return response.data
                    }
                })
                // .catch((error) => {
                //     console.log("PAGE requestGetIndex ERROR: ", error)
                //     showNotification({
                //         type: "warning", message: "An error has encountered: " + error, timeout: 5000
                //     })
                // })
                // .finally(() => {
                //     setIsInProgress(false)
                //     //getContentTypes()
                // })

            console.log("Work is: ", work)
            setIndex(work)

        }
        
    }

    const requestUpdateIndex = () => {
        

    }



    // ===============================
    // LIFECYCLE
    // ===============================

    useEffect(() => {

        if (indexId) {
            requestGetIndex()
        }

    }, [])


    return  (
        <Box>
            { index && (
                <>
                <Flex width="100%" justifyContent="space-between">
                    <Box>
                        <Box>
                            <Typography variant="alpha">{ indexId ? 'Edit Index: ' + indexId : 'Create Index'}</Typography>
                        </Box>
                    </Box>

                    indexId bbb: { indexId }

                    { indexId && (
                        <>
                        <Button onClick={() => requestUpdateIndex()} variant="tertiary">
                            Save
                        </Button>
                        </>
                    )}

                    { !indexId && (
                        <Button onClick={() => requestCreateIndex()} variant="tertiary">
                            Create Index
                        </Button>
                    )}                    

                </Flex>


                <Box>
                    <Mappings />

                </Box>
                     

                </>
                )}


        </Box>
    )
}