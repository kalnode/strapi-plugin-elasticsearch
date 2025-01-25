import React, { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import  { SubNavigation } from '../../components/SubNavigation'
import { Box, Flex, Button } from '@strapi/design-system'
import axiosInstance  from '../../utils/axiosInstance'
import { Typography } from '@strapi/design-system'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'

import { apiCreateIndex, apiDeleteIndex } from '../../utils/apiUrls'

const PageIndexes = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const showNotification = useNotification()

    const requestCreateIndex = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiCreateIndex)
            .then((response) => {
                console.log("PAGE requestCreateIndex response: ", response)
                showNotification({
                    type: "success", message: "Created the index: " + response, timeout: 5000
                })
            })
            .catch((error) => {
                console.log("PAGE requestCreateIndex ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => setIsInProgress(false))
    }


    const requestDeleteIndex = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiDeleteIndex('strapi-plugin-elasticsearch-index_000049'))
        //    'strapi-plugin-elasticsearch-index_000049'
            .then((response) => {
                console.log("PAGE requestDeleteIndex response: ", response)
                showNotification({
                    type: "success", message: "Deleted the index: " + response, timeout: 5000
                })
            })
            .catch((error) => {
                console.log("PAGE requestDeleteIndex ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => setIsInProgress(false))
    }

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />

            <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                <Box>
                    <Typography variant="alpha">Indexes</Typography>
                </Box>

                <Flex direction="column" alignItems="start" gap={8} width="100%">
                    <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                        <Flex direction="column" alignItems="start" gap={8}>

                            <Typography variant="beta">Future home of indexes</Typography>

                            <Box>
                                <Flex gap={4}>
                                    <Typography variant="delta">Actions</Typography>
                                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestCreateIndex}>Create Index</Button>
                                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestDeleteIndex}>Delete Index</Button>
                                </Flex>
                            </Box>

                            This section will entail:

                            <ul>
                                <li>Table showing indexes with batch controls</li>
                                <li>Clicking an index will open child page</li>
                                <li>
                                    Index child page will have:
                                    <ul>
                                        <li>Details</li>
                                        <li>Mappings</li>
                                        <li>Actions</li>
                                    </ul>
                                </li>
                            </ul>
                        </Flex>
                    </Box>
                </Flex>

            </Flex>

        </Flex>
    )

}

export default PageIndexes
